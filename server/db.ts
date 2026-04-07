import { eq, and, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, documents, InsertDocument } from "../drizzle/schema";
import { ENV } from './_core/env';
import mysql from "mysql2/promise";

let _db: ReturnType<typeof drizzle> | null = null;

function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

const USER_SCHEMA_PATCHES = [
  ["password", "ADD COLUMN `password` varchar(255)"],
  ["roleId", "ADD COLUMN `roleId` int"],
  ["personnummer", "ADD COLUMN `personnummer` varchar(13)"],
  ["streetAddress", "ADD COLUMN `streetAddress` text"],
  ["postalCode", "ADD COLUMN `postalCode` varchar(10)"],
  ["city", "ADD COLUMN `city` varchar(100)"],
  ["joinYear", "ADD COLUMN `joinYear` int"],
  ["memberType", "ADD COLUMN `memberType` enum('ordinarie','hedersmedlem','stodmedlem') DEFAULT 'ordinarie'"],
  ["paymentStatus", "ADD COLUMN `paymentStatus` enum('paid','unpaid','exempt') DEFAULT 'unpaid'"],
  ["paymentYear", "ADD COLUMN `paymentYear` int"],
  ["showInDirectory", "ADD COLUMN `showInDirectory` int NOT NULL DEFAULT 1"],
] as const;

const GALLERY_SCHEMA_PATCHES = [
  ["tags", "ADD COLUMN `tags` json"],
] as const;

const EVENT_SCHEMA_PATCHES = [
  ["feeAmount", "ADD COLUMN `feeAmount` varchar(20)"],
  ["paymentInstructions", "ADD COLUMN `paymentInstructions` text"],
  ["registrationNotice", "ADD COLUMN `registrationNotice` text"],
] as const;

const SYSTEM_ROLE_SEEDS = [
  {
    name: "huvudadmin",
    description: "Huvudadministratör med full åtkomst",
    permissions: JSON.stringify([
      "manage_all",
      "manage_roles",
      "manage_users",
      "manage_news",
      "manage_members",
      "view_members",
      "manage_events",
      "manage_gallery",
      "manage_cms",
    ]),
    isCustom: 0,
  },
  {
    name: "nyhetsadmin",
    description: "Administratör för nyheter, evenemang och galleri",
    permissions: JSON.stringify([
      "manage_news",
      "manage_events",
      "manage_gallery",
    ]),
    isCustom: 0,
  },
  {
    name: "medlemsadmin",
    description: "Administratör för medlemshantering",
    permissions: JSON.stringify([
      "manage_members",
      "view_members",
    ]),
    isCustom: 0,
  },
] as const;

function parseDatabaseUrl(databaseUrl: string) {
  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
  };
}

export async function ensureSchemaCompatibility() {
  if (!ENV.databaseUrl) {
    console.warn("[Database] Skipping schema compatibility check: DATABASE_URL missing");
    return;
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(parseDatabaseUrl(ENV.databaseUrl));

    const [userColumnsRows] = await connection.query("SHOW COLUMNS FROM `users`");
    const existingUserColumns = new Set(
      Array.isArray(userColumnsRows)
        ? userColumnsRows.map((row: any) => String(row.Field))
        : []
    );

    for (const [columnName, statement] of USER_SCHEMA_PATCHES) {
      if (existingUserColumns.has(columnName)) {
        continue;
      }

      console.log(`[Database] Adding missing users column: ${columnName}`);
      await connection.query(`ALTER TABLE \`users\` ${statement}`);
    }

    const [galleryColumnsRows] = await connection.query("SHOW COLUMNS FROM `gallery_photos`");
    const existingGalleryColumns = new Set(
      Array.isArray(galleryColumnsRows)
        ? galleryColumnsRows.map((row: any) => String(row.Field))
        : []
    );

    for (const [columnName, statement] of GALLERY_SCHEMA_PATCHES) {
      if (existingGalleryColumns.has(columnName)) {
        continue;
      }

      console.log(`[Database] Adding missing gallery_photos column: ${columnName}`);
      await connection.query(`ALTER TABLE \`gallery_photos\` ${statement}`);
    }

    const [eventColumnsRows] = await connection.query("SHOW COLUMNS FROM `events`");
    const existingEventColumns = new Set(
      Array.isArray(eventColumnsRows)
        ? eventColumnsRows.map((row: any) => String(row.Field))
        : []
    );

    for (const [columnName, statement] of EVENT_SCHEMA_PATCHES) {
      if (existingEventColumns.has(columnName)) {
        continue;
      }

      console.log(`[Database] Adding missing events column: ${columnName}`);
      await connection.query(`ALTER TABLE \`events\` ${statement}`);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`password_reset_tokens\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`token\` varchar(255) NOT NULL,
        \`expiresAt\` timestamp NOT NULL,
        \`used\` int NOT NULL DEFAULT 0,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        PRIMARY KEY (\`id\`)
      )
    `);

    for (const roleSeed of SYSTEM_ROLE_SEEDS) {
      await connection.query(
        `
          INSERT INTO \`roles\` (\`name\`, \`description\`, \`permissions\`, \`isCustom\`)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            \`description\` = VALUES(\`description\`),
            \`permissions\` = VALUES(\`permissions\`),
            \`isCustom\` = VALUES(\`isCustom\`)
        `,
        [roleSeed.name, roleSeed.description, roleSeed.permissions, roleSeed.isCustom]
      );
    }

    console.log("[Database] Schema compatibility check complete");
  } catch (error) {
    console.error("[Database] Schema compatibility check failed:", error);
  } finally {
    await connection?.end();
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (
      user.email &&
      ENV.ownerEmail &&
      String(user.email).trim().toLowerCase() === ENV.ownerEmail
    ) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

/**
 * Check if a user has a specific permission
 * @param userId - The user's ID
 * @param permission - The permission to check (e.g., 'manage_news', 'manage_members')
 * @returns true if user has the permission, false otherwise
 */
export async function userHasPermission(userId: number, permission: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check permission: database not available");
    return false;
  }

  try {
    const { users, roles } = await import("../drizzle/schema");
    
    // Get user with their role
    const userResult = await db
      .select({
        user: users,
        role: roles,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0 || !userResult[0].role) {
      return false;
    }

    const role = userResult[0].role;
    const permissions = normalizePermissions(role.permissions);
    
    // Check if role has manage_all permission (huvudadmin)
    if (permissions.includes('manage_all')) {
      return true;
    }
    
    // Check if role has the specific permission
    return permissions.includes(permission);
  } catch (error) {
    console.error("[Database] Failed to check permission:", error);
    return false;
  }
}

/**
 * Get user's role with permissions
 * @param userId - The user's ID
 * @returns User's role object or null
 */
export async function getUserRole(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user role: database not available");
    return null;
  }

  try {
    const { users, roles } = await import("../drizzle/schema");
    
    const result = await db
      .select({
        role: roles,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    return result.length > 0 ? result[0].role : null;
  } catch (error) {
    console.error("[Database] Failed to get user role:", error);
    return null;
  }
}


/**
 * Generate unique member number in format SSK-YYYY-XXXX
 */
export async function generateMemberNumber(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const currentYear = new Date().getFullYear();
  const prefix = `SSK-${currentYear}-`;
  
  // Find the highest member number for this year
  const searchPattern = `${prefix}%`;
  const members = await db
    .select({ membershipNumber: users.membershipNumber })
    .from(users)
    .where(sql`${users.membershipNumber} LIKE ${searchPattern}`)
    .orderBy(desc(users.membershipNumber))
    .limit(1);
  
  if (members.length === 0) {
    return `${prefix}0001`;
  }
  
  // Extract the number part and increment
  const lastNumber = members[0].membershipNumber;
  if (!lastNumber) return `${prefix}0001`;
  
  const numberPart = parseInt(lastNumber.split('-')[2] || '0');
  const nextNumber = (numberPart + 1).toString().padStart(4, '0');
  
  return `${prefix}${nextNumber}`;
}

/**
 * Get all members with optional filtering
 */
export async function getMembers(filters?: {
  status?: 'pending' | 'active' | 'inactive';
  memberType?: 'ordinarie' | 'hedersmedlem' | 'stodmedlem';
  paymentStatus?: 'paid' | 'unpaid' | 'exempt';
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(users);
  
  if (filters?.status) {
    query = query.where(eq(users.membershipStatus, filters.status)) as any;
  }
  
  if (filters?.memberType) {
    query = query.where(eq(users.memberType, filters.memberType)) as any;
  }
  
  if (filters?.paymentStatus) {
    query = query.where(eq(users.paymentStatus, filters.paymentStatus)) as any;
  }
  
  // Search by name, email, or member number
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.where(
      sql`${users.name} LIKE ${searchTerm} OR ${users.email} LIKE ${searchTerm} OR ${users.membershipNumber} LIKE ${searchTerm}`
    ) as any;
  }
  
  return await query;
}

/**
 * Get member by ID with full details
 */
export async function getMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Update member information (admin only)
 */
export async function updateMember(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set(data).where(eq(users.id, id));
  return { success: true };
}

/**
 * Get members for directory (limited info, only visible members)
 */
export async function getMembersForDirectory() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      membershipNumber: users.membershipNumber,
      memberType: users.memberType,
    })
    .from(users)
    .where(
      sql`${users.membershipStatus} = 'active' AND ${users.showInDirectory} = 1`
    );
}


/**
 * Check if a user is verified as a member based on email or personnummer
 */
export async function verifyMemberStatus(userId: number): Promise<{
  isMember: boolean;
  memberInfo: typeof users.$inferSelect | null;
}> {
  const db = await getDb();
  if (!db) {
    return { isMember: false, memberInfo: null };
  }

  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user || user.length === 0) {
      return { isMember: false, memberInfo: null };
    }

    const userRecord = user[0];
    
    // Check if user has member status
    const isMember = userRecord.membershipStatus === 'active';
    
    return {
      isMember,
      memberInfo: isMember ? userRecord : null,
    };
  } catch (error) {
    console.error('[Database] Failed to verify member status:', error);
    return { isMember: false, memberInfo: null };
  }
}

/**
 * Link a user account to member record by email or personnummer
 */
export async function linkUserToMember(openId: string, email?: string, personnummer?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    // Find existing member by email or personnummer
    let existingMember = null;
    
    if (email) {
      const result = await db.select().from(users)
        .where(and(
          eq(users.email, email),
          eq(users.membershipStatus, 'active')
        ))
        .limit(1);
      existingMember = result[0];
    }
    
    if (!existingMember && personnummer) {
      const result = await db.select().from(users)
        .where(and(
          eq(users.personnummer, personnummer),
          eq(users.membershipStatus, 'active')
        ))
        .limit(1);
      existingMember = result[0];
    }

    if (existingMember) {
      // Update existing member with new openId
      await db.update(users)
        .set({ openId, lastSignedIn: new Date() })
        .where(eq(users.id, existingMember.id));
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Database] Failed to link user to member:', error);
    return false;
  }
}


// Event management helpers
export async function getUpcomingEvents(limit?: number) {
  const db = await getDb();
  if (!db) return [];

  const { events } = await import('../drizzle/schema');
  const { gte } = await import('drizzle-orm');

  const query = db
    .select()
    .from(events)
    .where(gte(events.eventDate, new Date()))
    .orderBy(events.eventDate);

  if (limit) {
    return await query.limit(limit);
  }

  return await query;
}

export async function getEventWithRegistrations(eventId: number) {
  const db = await getDb();
  if (!db) return null;

  const { events, eventRegistrations, users } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');

  const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (event.length === 0) return null;

  const registrations = await db
    .select({
      id: eventRegistrations.id,
      status: eventRegistrations.status,
      notes: eventRegistrations.notes,
      registeredAt: eventRegistrations.registeredAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      },
    })
    .from(eventRegistrations)
    .leftJoin(users, eq(eventRegistrations.userId, users.id))
    .where(eq(eventRegistrations.eventId, eventId))
    .orderBy(eventRegistrations.registeredAt);

  return {
    ...event[0],
    registrations,
    registeredCount: registrations.filter(r => r.status === 'registered').length,
    waitlistCount: registrations.filter(r => r.status === 'waitlist').length,
  };
}

export async function getUserEventRegistration(eventId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { eventRegistrations } = await import('../drizzle/schema');
  const { eq, and } = await import('drizzle-orm');

  const result = await db
    .select()
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserRegisteredEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const { events, eventRegistrations } = await import('../drizzle/schema');
  const { eq, and, ne } = await import('drizzle-orm');

  return await db
    .select({
      event: events,
      registration: eventRegistrations,
    })
    .from(eventRegistrations)
    .leftJoin(events, eq(eventRegistrations.eventId, events.id))
    .where(and(eq(eventRegistrations.userId, userId), ne(eventRegistrations.status, 'cancelled')))
    .orderBy(events.eventDate);
}


// Document management helpers
export async function getAllDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByCategory(category: any) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.category, category as any)).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(documents).values(doc);
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}
