var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/googleAuth.ts
var googleAuth_exports = {};
__export(googleAuth_exports, {
  configureGoogleAuth: () => configureGoogleAuth,
  isGoogleAuthEnabled: () => isGoogleAuthEnabled
});
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
function configureGoogleAuth() {
  if (googleStrategyConfigured) return;
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;
  if (!clientID || !clientSecret || !callbackURL) {
    console.warn("[Google Auth] Missing configuration. Google Sign-In will be disabled.");
    return;
  }
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }
          return done(null, {
            provider: "google",
            providerId: googleId,
            email,
            name,
            loginMethod: "google"
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  googleStrategyConfigured = true;
  console.log("[Google Auth] Strategy configured");
}
function isGoogleAuthEnabled() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL);
}
var googleStrategyConfigured;
var init_googleAuth = __esm({
  "server/googleAuth.ts"() {
    "use strict";
    googleStrategyConfigured = false;
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  boardMembers: () => boardMembers,
  contentHistory: () => contentHistory,
  documents: () => documents,
  eventRegistrations: () => eventRegistrations,
  events: () => events,
  galleryPhotos: () => galleryPhotos,
  membershipApplications: () => membershipApplications,
  news: () => news,
  pageContent: () => pageContent,
  passwordResetTokens: () => passwordResetTokens,
  paymentConfirmations: () => paymentConfirmations,
  roles: () => roles,
  siteSettings: () => siteSettings,
  users: () => users
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
var users, roles, news, membershipApplications, galleryPhotos, events, eventRegistrations, paymentConfirmations, pageContent, siteSettings, boardMembers, contentHistory, documents, passwordResetTokens;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      /**
       * Surrogate primary key. Auto-incremented numeric value managed by the database.
       * Use this for relations between tables.
       */
      id: int("id").autoincrement().primaryKey(),
      /** Unique login identifier for the account. */
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      password: varchar("password", { length: 255 }),
      // Hashed password for email/password login
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin", "member"]).default("user").notNull(),
      roleId: int("roleId").references(() => roles.id),
      // Member profile fields
      phone: varchar("phone", { length: 20 }),
      personnummer: varchar("personnummer", { length: 13 }).unique(),
      // Format: YYYYMMDD-XXXX
      streetAddress: text("streetAddress"),
      postalCode: varchar("postalCode", { length: 10 }),
      city: varchar("city", { length: 100 }),
      membershipStatus: mysqlEnum("membershipStatus", ["pending", "active", "inactive"]).default("pending"),
      membershipNumber: varchar("membershipNumber", { length: 50 }).unique(),
      joinYear: int("joinYear"),
      memberType: mysqlEnum("memberType", ["ordinarie", "hedersmedlem", "stodmedlem"]).default("ordinarie"),
      paymentStatus: mysqlEnum("paymentStatus", ["paid", "unpaid", "exempt"]).default("unpaid"),
      paymentYear: int("paymentYear"),
      showInDirectory: int("showInDirectory").notNull().default(1),
      // 1 = visible, 0 = hidden
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    roles = mysqlTable("roles", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 50 }).notNull().unique(),
      description: text("description"),
      permissions: json("permissions").$type().notNull(),
      isCustom: int("isCustom").notNull().default(1),
      // 1 for custom, 0 for system roles
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    news = mysqlTable("news", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      imageUrl: text("imageUrl"),
      authorId: int("authorId").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      publishedAt: timestamp("publishedAt")
    });
    membershipApplications = mysqlTable("membership_applications", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 320 }).notNull(),
      phone: varchar("phone", { length: 20 }),
      message: text("message"),
      status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    galleryPhotos = mysqlTable("gallery_photos", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      imageUrl: text("imageUrl").notNull(),
      // Legacy field, kept for backwards compatibility
      thumbnailUrl: text("thumbnailUrl"),
      // 300x300px thumbnail
      mediumUrl: text("mediumUrl"),
      // 800px width medium size
      originalUrl: text("originalUrl"),
      // Original full-size image
      category: varchar("category", { length: 100 }),
      uploadedBy: int("uploadedBy").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    events = mysqlTable("events", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      eventDate: timestamp("eventDate").notNull(),
      eventTime: varchar("eventTime", { length: 10 }),
      // e.g., "18:00"
      location: varchar("location", { length: 255 }),
      type: varchar("type", { length: 100 }),
      // e.g., "Vårfest", "Bingo", "Match"
      maxParticipants: int("maxParticipants"),
      // null = unlimited
      registrationDeadline: timestamp("registrationDeadline"),
      status: mysqlEnum("status", ["draft", "published", "cancelled", "completed"]).default("published").notNull(),
      allowWaitlist: int("allowWaitlist").default(0).notNull(),
      // 1 = allow, 0 = don't allow
      createdBy: int("createdBy").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    eventRegistrations = mysqlTable("event_registrations", {
      id: int("id").autoincrement().primaryKey(),
      eventId: int("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      status: mysqlEnum("status", ["registered", "waitlist", "cancelled"]).default("registered").notNull(),
      notes: text("notes"),
      // Optional notes from participant
      registeredAt: timestamp("registeredAt").defaultNow().notNull(),
      cancelledAt: timestamp("cancelledAt")
    });
    paymentConfirmations = mysqlTable("payment_confirmations", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      amount: varchar("amount", { length: 20 }).notNull(),
      // Store as string to avoid decimal issues
      paymentType: varchar("paymentType", { length: 50 }).notNull().default("membership_fee"),
      paymentYear: int("paymentYear").notNull(),
      receiptUrl: text("receiptUrl"),
      status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
      notes: text("notes"),
      verifiedBy: int("verifiedBy").references(() => users.id, { onDelete: "set null" }),
      verifiedAt: timestamp("verifiedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    pageContent = mysqlTable("page_content", {
      id: int("id").autoincrement().primaryKey(),
      page: varchar("page", { length: 100 }).notNull(),
      // e.g., "home", "statutes"
      sectionKey: varchar("sectionKey", { length: 100 }).notNull(),
      // e.g., "hero", "about", "news"
      type: varchar("type", { length: 50 }).notNull(),
      // e.g., "text", "image", "html"
      content: text("content"),
      // The actual content
      order: int("order").default(0).notNull(),
      published: int("published").default(1).notNull(),
      // 1 = published, 0 = draft
      updatedBy: int("updatedBy").references(() => users.id),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    siteSettings = mysqlTable("site_settings", {
      id: int("id").autoincrement().primaryKey(),
      key: varchar("key", { length: 100 }).notNull().unique(),
      // e.g., "site_logo", "contact_email"
      value: text("value").notNull(),
      type: varchar("type", { length: 50 }).default("text").notNull(),
      // "text", "image", "json"
      updatedBy: int("updatedBy").references(() => users.id),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    boardMembers = mysqlTable("board_members", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      role: varchar("role", { length: 255 }).notNull(),
      // e.g., "Ordförande", "Sekreterare"
      phone: varchar("phone", { length: 50 }),
      email: varchar("email", { length: 320 }),
      photo: text("photo"),
      // URL to photo
      order: int("order").default(0).notNull(),
      active: int("active").default(1).notNull(),
      // 1 = active, 0 = inactive
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    contentHistory = mysqlTable("content_history", {
      id: int("id").autoincrement().primaryKey(),
      contentId: int("contentId").notNull().references(() => pageContent.id, { onDelete: "cascade" }),
      content: text("content"),
      updatedBy: int("updatedBy").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    documents = mysqlTable("documents", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      fileUrl: text("fileUrl").notNull(),
      fileSize: int("fileSize"),
      // Size in bytes
      category: mysqlEnum("category", ["stadgar", "protokoll", "informationsblad", "arsmoten", "ovrigt"]).notNull(),
      accessLevel: mysqlEnum("accessLevel", ["public", "members_only", "admin_only"]).default("members_only").notNull(),
      uploadedBy: int("uploadedBy").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    passwordResetTokens = mysqlTable("password_reset_tokens", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: varchar("token", { length: 255 }).notNull().unique(),
      expiresAt: timestamp("expiresAt").notNull(),
      used: int("used").notNull().default(0),
      // 0 = not used, 1 = used
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      ownerEmail: (process.env.OWNER_EMAIL ?? "").trim().toLowerCase(),
      adminPassword: process.env.ADMIN_PASSWORD ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createDocument: () => createDocument,
  deleteDocument: () => deleteDocument,
  ensureSchemaCompatibility: () => ensureSchemaCompatibility,
  generateMemberNumber: () => generateMemberNumber,
  getAllDocuments: () => getAllDocuments,
  getDb: () => getDb,
  getDocumentById: () => getDocumentById,
  getDocumentsByCategory: () => getDocumentsByCategory,
  getEventWithRegistrations: () => getEventWithRegistrations,
  getMemberById: () => getMemberById,
  getMembers: () => getMembers,
  getMembersForDirectory: () => getMembersForDirectory,
  getUpcomingEvents: () => getUpcomingEvents,
  getUserByOpenId: () => getUserByOpenId,
  getUserEventRegistration: () => getUserEventRegistration,
  getUserRegisteredEvents: () => getUserRegisteredEvents,
  getUserRole: () => getUserRole,
  linkUserToMember: () => linkUserToMember,
  updateMember: () => updateMember,
  upsertUser: () => upsertUser,
  userHasPermission: () => userHasPermission,
  verifyMemberStatus: () => verifyMemberStatus
});
import { eq, and, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
function parseDatabaseUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "")
  };
}
async function ensureSchemaCompatibility() {
  if (!ENV.databaseUrl) {
    console.warn("[Database] Skipping schema compatibility check: DATABASE_URL missing");
    return;
  }
  let connection = null;
  try {
    connection = await mysql.createConnection(parseDatabaseUrl(ENV.databaseUrl));
    const [userColumnsRows] = await connection.query("SHOW COLUMNS FROM `users`");
    const existingUserColumns = new Set(
      Array.isArray(userColumnsRows) ? userColumnsRows.map((row) => String(row.Field)) : []
    );
    for (const [columnName, statement] of USER_SCHEMA_PATCHES) {
      if (existingUserColumns.has(columnName)) {
        continue;
      }
      console.log(`[Database] Adding missing users column: ${columnName}`);
      await connection.query(`ALTER TABLE \`users\` ${statement}`);
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
    console.log("[Database] Schema compatibility check complete");
  } catch (error) {
    console.error("[Database] Schema compatibility check failed:", error);
  } finally {
    await connection?.end();
  }
}
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.email && ENV.ownerEmail && String(user.email).trim().toLowerCase() === ENV.ownerEmail) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function userHasPermission(userId, permission) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check permission: database not available");
    return false;
  }
  try {
    const { users: users2, roles: roles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const userResult = await db.select({
      user: users2,
      role: roles2
    }).from(users2).leftJoin(roles2, eq(users2.roleId, roles2.id)).where(eq(users2.id, userId)).limit(1);
    if (userResult.length === 0 || !userResult[0].role) {
      return false;
    }
    const role = userResult[0].role;
    if (role.permissions.includes("manage_all")) {
      return true;
    }
    return role.permissions.includes(permission);
  } catch (error) {
    console.error("[Database] Failed to check permission:", error);
    return false;
  }
}
async function getUserRole(userId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user role: database not available");
    return null;
  }
  try {
    const { users: users2, roles: roles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.select({
      role: roles2
    }).from(users2).leftJoin(roles2, eq(users2.roleId, roles2.id)).where(eq(users2.id, userId)).limit(1);
    return result.length > 0 ? result[0].role : null;
  } catch (error) {
    console.error("[Database] Failed to get user role:", error);
    return null;
  }
}
async function generateMemberNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const prefix = `SSK-${currentYear}-`;
  const searchPattern = `${prefix}%`;
  const members = await db.select({ membershipNumber: users.membershipNumber }).from(users).where(sql`${users.membershipNumber} LIKE ${searchPattern}`).orderBy(desc(users.membershipNumber)).limit(1);
  if (members.length === 0) {
    return `${prefix}0001`;
  }
  const lastNumber = members[0].membershipNumber;
  if (!lastNumber) return `${prefix}0001`;
  const numberPart = parseInt(lastNumber.split("-")[2] || "0");
  const nextNumber = (numberPart + 1).toString().padStart(4, "0");
  return `${prefix}${nextNumber}`;
}
async function getMembers(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(users);
  if (filters?.status) {
    query = query.where(eq(users.membershipStatus, filters.status));
  }
  if (filters?.memberType) {
    query = query.where(eq(users.memberType, filters.memberType));
  }
  if (filters?.paymentStatus) {
    query = query.where(eq(users.paymentStatus, filters.paymentStatus));
  }
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.where(
      sql`${users.name} LIKE ${searchTerm} OR ${users.email} LIKE ${searchTerm} OR ${users.membershipNumber} LIKE ${searchTerm}`
    );
  }
  return await query;
}
async function getMemberById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateMember(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
  return { success: true };
}
async function getMembersForDirectory() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone,
    membershipNumber: users.membershipNumber,
    memberType: users.memberType
  }).from(users).where(
    sql`${users.membershipStatus} = 'active' AND ${users.showInDirectory} = 1`
  );
}
async function verifyMemberStatus(userId) {
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
    const isMember = userRecord.membershipStatus === "active";
    return {
      isMember,
      memberInfo: isMember ? userRecord : null
    };
  } catch (error) {
    console.error("[Database] Failed to verify member status:", error);
    return { isMember: false, memberInfo: null };
  }
}
async function linkUserToMember(openId, email, personnummer) {
  const db = await getDb();
  if (!db) {
    return false;
  }
  try {
    let existingMember = null;
    if (email) {
      const result = await db.select().from(users).where(and(
        eq(users.email, email),
        eq(users.membershipStatus, "active")
      )).limit(1);
      existingMember = result[0];
    }
    if (!existingMember && personnummer) {
      const result = await db.select().from(users).where(and(
        eq(users.personnummer, personnummer),
        eq(users.membershipStatus, "active")
      )).limit(1);
      existingMember = result[0];
    }
    if (existingMember) {
      await db.update(users).set({ openId, lastSignedIn: /* @__PURE__ */ new Date() }).where(eq(users.id, existingMember.id));
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Database] Failed to link user to member:", error);
    return false;
  }
}
async function getUpcomingEvents(limit) {
  const db = await getDb();
  if (!db) return [];
  const { events: events2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { gte: gte3 } = await import("drizzle-orm");
  const query = db.select().from(events2).where(gte3(events2.eventDate, /* @__PURE__ */ new Date())).orderBy(events2.eventDate);
  if (limit) {
    return await query.limit(limit);
  }
  return await query;
}
async function getEventWithRegistrations(eventId) {
  const db = await getDb();
  if (!db) return null;
  const { events: events2, eventRegistrations: eventRegistrations2, users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq6 } = await import("drizzle-orm");
  const event = await db.select().from(events2).where(eq6(events2.id, eventId)).limit(1);
  if (event.length === 0) return null;
  const registrations = await db.select({
    id: eventRegistrations2.id,
    status: eventRegistrations2.status,
    notes: eventRegistrations2.notes,
    registeredAt: eventRegistrations2.registeredAt,
    user: {
      id: users2.id,
      name: users2.name,
      email: users2.email,
      phone: users2.phone
    }
  }).from(eventRegistrations2).leftJoin(users2, eq6(eventRegistrations2.userId, users2.id)).where(eq6(eventRegistrations2.eventId, eventId)).orderBy(eventRegistrations2.registeredAt);
  return {
    ...event[0],
    registrations,
    registeredCount: registrations.filter((r) => r.status === "registered").length,
    waitlistCount: registrations.filter((r) => r.status === "waitlist").length
  };
}
async function getUserEventRegistration(eventId, userId) {
  const db = await getDb();
  if (!db) return null;
  const { eventRegistrations: eventRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq6, and: and4 } = await import("drizzle-orm");
  const result = await db.select().from(eventRegistrations2).where(and4(eq6(eventRegistrations2.eventId, eventId), eq6(eventRegistrations2.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getUserRegisteredEvents(userId) {
  const db = await getDb();
  if (!db) return [];
  const { events: events2, eventRegistrations: eventRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq6, and: and4, ne } = await import("drizzle-orm");
  return await db.select({
    event: events2,
    registration: eventRegistrations2
  }).from(eventRegistrations2).leftJoin(events2, eq6(eventRegistrations2.eventId, events2.id)).where(and4(eq6(eventRegistrations2.userId, userId), ne(eventRegistrations2.status, "cancelled"))).orderBy(events2.eventDate);
}
async function getAllDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}
async function getDocumentsByCategory(category) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.category, category)).orderBy(desc(documents.createdAt));
}
async function getDocumentById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createDocument(doc) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(documents).values(doc);
}
async function deleteDocument(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}
var _db, USER_SCHEMA_PATCHES;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
    USER_SCHEMA_PATCHES = [
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
      ["showInDirectory", "ADD COLUMN `showInDirectory` int NOT NULL DEFAULT 1"]
    ];
  }
});

// shared/const.ts
var const_exports = {};
__export(const_exports, {
  AXIOS_TIMEOUT_MS: () => AXIOS_TIMEOUT_MS,
  COOKIE_NAME: () => COOKIE_NAME,
  NOT_ADMIN_ERR_MSG: () => NOT_ADMIN_ERR_MSG,
  ONE_YEAR_MS: () => ONE_YEAR_MS,
  UNAUTHED_ERR_MSG: () => UNAUTHED_ERR_MSG
});
var COOKIE_NAME, ONE_YEAR_MS, AXIOS_TIMEOUT_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG;
var init_const = __esm({
  "shared/const.ts"() {
    "use strict";
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    AXIOS_TIMEOUT_MS = 3e4;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
  }
});

// shared/_core/errors.ts
var HttpError, ForbiddenError;
var init_errors = __esm({
  "shared/_core/errors.ts"() {
    "use strict";
    HttpError = class extends Error {
      constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
      }
    };
    ForbiddenError = (msg) => new HttpError(403, msg);
  }
});

// server/_core/sdk.ts
var sdk_exports = {};
__export(sdk_exports, {
  sdk: () => sdk
});
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString, SessionService, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
    init_db();
    init_env();
    isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
    SessionService = class {
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      getSessionSecret() {
        if (!ENV.cookieSecret) {
          throw new Error("JWT_SECRET is not configured");
        }
        return new TextEncoder().encode(ENV.cookieSecret);
      }
      async createSessionToken(openId, options = {}) {
        return this.signSession(
          {
            openId,
            name: options.name || ""
          },
          options
        );
      }
      async signSession(payload, options = {}) {
        const issuedAt = Date.now();
        const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
        const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
        const secretKey = this.getSessionSecret();
        return new SignJWT({
          openId: payload.openId,
          name: payload.name
        }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
      }
      async verifySession(cookieValue) {
        if (!cookieValue) {
          console.warn("[Auth] Missing session cookie");
          return null;
        }
        try {
          const secretKey = this.getSessionSecret();
          const { payload } = await jwtVerify(cookieValue, secretKey, {
            algorithms: ["HS256"]
          });
          const { openId, name } = payload;
          if (!isNonEmptyString(openId) || !isNonEmptyString(name)) {
            console.warn("[Auth] Session payload missing required fields");
            return null;
          }
          return {
            openId,
            name
          };
        } catch (error) {
          console.warn("[Auth] Session verification failed", String(error));
          return null;
        }
      }
      async authenticateRequest(req) {
        const cookies = this.parseCookies(req.headers.cookie);
        const sessionCookie = cookies.get(COOKIE_NAME);
        const session = await this.verifySession(sessionCookie);
        if (!session) {
          throw ForbiddenError("Invalid session cookie");
        }
        const sessionUserId = session.openId;
        const signedInAt = /* @__PURE__ */ new Date();
        let user = await getUserByOpenId(sessionUserId);
        if (!user) {
          throw ForbiddenError("User not found");
        }
        await upsertUser({
          openId: user.openId,
          lastSignedIn: signedInAt
        });
        return user;
      }
    };
    sdk = new SessionService();
  }
});

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// server/passwordAuth.ts
var passwordAuth_exports = {};
__export(passwordAuth_exports, {
  authenticateWithPassword: () => authenticateWithPassword,
  bootstrapOwnerPassword: () => bootstrapOwnerPassword,
  generatePasswordResetToken: () => generatePasswordResetToken,
  hashPassword: () => hashPassword,
  resetPassword: () => resetPassword,
  setUserPassword: () => setUserPassword,
  verifyPassword: () => verifyPassword,
  verifyPasswordResetToken: () => verifyPasswordResetToken
});
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq as eq2, and as and2, gt } from "drizzle-orm";
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function authenticateWithPassword(email, password) {
  const db = await getDb();
  if (!db) {
    console.error("[PasswordAuth] Database not available");
    return null;
  }
  try {
    const result = await db.select().from(users).where(eq2(users.email, email)).limit(1);
    if (result.length === 0) {
      console.log("[PasswordAuth] User not found:", email);
      return null;
    }
    const user = result[0];
    if (!user.password) {
      console.log("[PasswordAuth] User has no password set:", email);
      return null;
    }
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      console.log("[PasswordAuth] Invalid password for:", email);
      return null;
    }
    console.log("[PasswordAuth] Authentication successful:", email);
    return user;
  } catch (error) {
    console.error("[PasswordAuth] Authentication error:", error);
    return null;
  }
}
async function generatePasswordResetToken(email) {
  const db = await getDb();
  if (!db) {
    console.error("[PasswordAuth] Database not available");
    return null;
  }
  try {
    const result = await db.select().from(users).where(eq2(users.email, email)).limit(1);
    if (result.length === 0) {
      console.log("[PasswordAuth] User not found for reset:", email);
      return null;
    }
    const user = result[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      used: 0
    });
    console.log("[PasswordAuth] Reset token generated for:", email);
    return token;
  } catch (error) {
    console.error("[PasswordAuth] Error generating reset token:", error);
    return null;
  }
}
async function verifyPasswordResetToken(token) {
  const db = await getDb();
  if (!db) {
    console.error("[PasswordAuth] Database not available");
    return null;
  }
  try {
    const now = /* @__PURE__ */ new Date();
    const result = await db.select().from(passwordResetTokens).where(
      and2(
        eq2(passwordResetTokens.token, token),
        eq2(passwordResetTokens.used, 0),
        gt(passwordResetTokens.expiresAt, now)
      )
    ).limit(1);
    if (result.length === 0) {
      console.log("[PasswordAuth] Invalid or expired token");
      return null;
    }
    const resetToken = result[0];
    await db.update(passwordResetTokens).set({ used: 1 }).where(eq2(passwordResetTokens.id, resetToken.id));
    console.log("[PasswordAuth] Reset token verified for user:", resetToken.userId);
    return resetToken.userId;
  } catch (error) {
    console.error("[PasswordAuth] Error verifying reset token:", error);
    return null;
  }
}
async function resetPassword(userId, newPassword) {
  const db = await getDb();
  if (!db) {
    console.error("[PasswordAuth] Database not available");
    return false;
  }
  try {
    const hashedPassword = await hashPassword(newPassword);
    await db.update(users).set({
      password: hashedPassword,
      loginMethod: "password",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(users.id, userId));
    console.log("[PasswordAuth] Password reset successful for user:", userId);
    return true;
  } catch (error) {
    console.error("[PasswordAuth] Error resetting password:", error);
    return false;
  }
}
async function setUserPassword(userId, password) {
  return resetPassword(userId, password);
}
async function bootstrapOwnerPassword(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return false;
  }
  const db = await getDb();
  if (!db) {
    console.error("[PasswordAuth] Database not available for owner bootstrap");
    return false;
  }
  try {
    let result = await db.select().from(users).where(eq2(users.email, normalizedEmail)).limit(1);
    if (result.length === 0) {
      await upsertUser({
        openId: `email:${normalizedEmail}`,
        email: normalizedEmail,
        name: normalizedEmail,
        loginMethod: "password"
      });
      result = await db.select().from(users).where(eq2(users.email, normalizedEmail)).limit(1);
    }
    if (result.length === 0) {
      console.error("[PasswordAuth] Failed to create owner account for bootstrap:", normalizedEmail);
      return false;
    }
    const owner = result[0];
    const hashedPassword = await hashPassword(password);
    await db.update(users).set({
      password: hashedPassword,
      loginMethod: "password",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(users.id, owner.id));
    console.log("[PasswordAuth] Owner password bootstrap complete for:", normalizedEmail);
    return true;
  } catch (error) {
    console.error("[PasswordAuth] Error bootstrapping owner password:", error);
    return false;
  }
}
var SALT_ROUNDS, RESET_TOKEN_EXPIRY_HOURS;
var init_passwordAuth = __esm({
  "server/passwordAuth.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_db();
    SALT_ROUNDS = 10;
    RESET_TOKEN_EXPIRY_HOURS = 24;
  }
});

// server/emailService.ts
var emailService_exports = {};
__export(emailService_exports, {
  isEmailServiceConfigured: () => isEmailServiceConfigured,
  sendEmail: () => sendEmail,
  sendPasswordResetEmail: () => sendPasswordResetEmail,
  sendWelcomeEmail: () => sendWelcomeEmail
});
import { Resend } from "resend";
function isEmailServiceConfigured() {
  return resend !== null && !!process.env.RESEND_API_KEY;
}
function getSenderEmail() {
  const customEmail = process.env.EMAIL_FROM;
  if (customEmail) {
    return customEmail;
  }
  return DEFAULT_FROM_EMAIL;
}
async function sendEmail(options) {
  if (!resend) {
    console.error("[Email] Resend not configured - RESEND_API_KEY missing");
    return {
      success: false,
      error: "Email service not configured"
    };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || getSenderEmail(),
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    if (error) {
      console.error("[Email] Failed to send email:", error);
      return { success: false, error: error.message };
    }
    console.log("[Email] Email sent successfully:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Exception while sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function sendPasswordResetEmail(to, resetToken, userName) {
  if (!resend) {
    console.error("[Email] Resend not configured - RESEND_API_KEY missing");
    return {
      success: false,
      error: "Email service not configured"
    };
  }
  try {
    const resetUrl = `${process.env.VITE_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    const fromEmail = getSenderEmail();
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "\xC5terst\xE4ll ditt l\xF6senord - Gamla SSK-are",
      html: generatePasswordResetEmailHTML(resetUrl, userName)
    });
    if (error) {
      console.error("[Email] Failed to send password reset email:", error);
      return {
        success: false,
        error: error.message || "Failed to send email"
      };
    }
    console.log("[Email] Password reset email sent successfully:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function sendWelcomeEmail(to, userName, membershipNumber) {
  if (!resend) {
    console.error("[Email] Resend not configured - RESEND_API_KEY missing");
    return {
      success: false,
      error: "Email service not configured"
    };
  }
  try {
    const fromEmail = getSenderEmail();
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "V\xE4lkommen till F\xF6reningen Gamla SSK-are!",
      html: generateWelcomeEmailHTML(userName, membershipNumber)
    });
    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return {
        success: false,
        error: error.message || "Failed to send email"
      };
    }
    console.log("[Email] Welcome email sent successfully:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function generatePasswordResetEmailHTML(resetUrl, userName) {
  const greeting = userName ? `Hej ${userName}` : "Hej";
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\xC5terst\xE4ll ditt l\xF6senord</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #003366; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">F\xF6reningen Gamla SSK-are</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #003366; margin-top: 0; font-size: 20px;">${greeting},</h2>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Vi har f\xE5tt en beg\xE4ran om att \xE5terst\xE4lla l\xF6senordet f\xF6r ditt konto hos F\xF6reningen Gamla SSK-are.
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Klicka p\xE5 knappen nedan f\xF6r att v\xE4lja ett nytt l\xF6senord:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #E8A317; color: #003366; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                      \xC5terst\xE4ll l\xF6senord
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0; font-size: 14px;">
                Om knappen inte fungerar kan du kopiera och klistra in denna l\xE4nk i din webbl\xE4sare:
              </p>
              
              <p style="color: #0066cc; line-height: 1.6; margin: 10px 0; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 13px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                <strong>Observera:</strong> Denna l\xE4nk \xE4r giltig i 24 timmar. Om du inte beg\xE4rde en l\xF6senords\xE5terst\xE4llning kan du ignorera detta meddelande.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; margin: 0; font-size: 12px;">
                \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} F\xF6reningen Gamla SSK-are<br>
                Sveriges \xE4ldsta st\xF6df\xF6rening - Sedan 1937
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
function generateWelcomeEmailHTML(userName, membershipNumber) {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V\xE4lkommen till Gamla SSK-are</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #003366; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">V\xE4lkommen till Gamla SSK-are!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #003366; margin-top: 0; font-size: 20px;">Hej ${userName}!</h2>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                V\xE4lkommen som medlem i F\xF6reningen Gamla SSK-are - Sveriges \xE4ldsta st\xF6df\xF6rening f\xF6r S\xF6dert\xE4lje SK!
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Ditt medlemsnummer \xE4r: <strong style="color: #E8A317; font-size: 18px;">${membershipNumber}</strong>
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Som medlem f\xE5r du:
              </p>
              
              <ul style="color: #333333; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
                <li>Tillg\xE5ng till medlemssidor och dokument</li>
                <li>Information om kommande evenemang</li>
                <li>M\xF6jlighet att delta i f\xF6reningens aktiviteter</li>
                <li>St\xF6d SSK genom din \xE5rsavgift</li>
              </ul>
              
              <p style="color: #333333; line-height: 1.6; margin: 20px 0;">
                Vi ser fram emot att ha dig med oss!
              </p>
              
              <p style="color: #333333; line-height: 1.6; margin: 30px 0 10px 0;">
                Med v\xE4nliga h\xE4lsningar,<br>
                <strong>Styrelsen f\xF6r F\xF6reningen Gamla SSK-are</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; margin: 0; font-size: 12px;">
                \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} F\xF6reningen Gamla SSK-are<br>
                Sveriges \xE4ldsta st\xF6df\xF6rening - Sedan 1937
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
var resend, DEFAULT_FROM_EMAIL;
var init_emailService = __esm({
  "server/emailService.ts"() {
    "use strict";
    resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    DEFAULT_FROM_EMAIL = "onboarding@resend.dev";
  }
});

// server/imageProcessor.ts
var imageProcessor_exports = {};
__export(imageProcessor_exports, {
  getImageDimensions: () => getImageDimensions,
  processAndUploadImage: () => processAndUploadImage,
  processMultipleImages: () => processMultipleImages,
  validateImage: () => validateImage
});
import sharp from "sharp";
import crypto2 from "crypto";
async function processAndUploadImage(buffer, filename, category = "gallery") {
  const imageId = crypto2.randomBytes(16).toString("hex");
  const timestamp2 = Date.now();
  const baseName = `${category}/${timestamp2}-${imageId}`;
  try {
    const metadata = await sharp(buffer).metadata();
    const originalWebP = await sharp(buffer).webp({ quality: 90 }).toBuffer();
    const originalKey = `${baseName}-original.webp`;
    const original = await storagePut(originalKey, originalWebP, "image/webp");
    const mediumBuffer = await sharp(buffer).resize(800, null, {
      fit: "inside",
      withoutEnlargement: true
    }).webp({ quality: 85 }).toBuffer();
    const mediumKey = `${baseName}-medium.webp`;
    const medium = await storagePut(mediumKey, mediumBuffer, "image/webp");
    const thumbnailBuffer = await sharp(buffer).resize(300, 300, {
      fit: "cover",
      position: "center"
    }).webp({ quality: 80 }).toBuffer();
    const thumbnailKey = `${baseName}-thumbnail.webp`;
    const thumbnail = await storagePut(thumbnailKey, thumbnailBuffer, "image/webp");
    return {
      original,
      medium,
      thumbnail
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}
async function processMultipleImages(images, category = "gallery") {
  return Promise.all(
    images.map(
      ({ buffer, filename }) => processAndUploadImage(buffer, filename, category)
    )
  );
}
function validateImage(buffer) {
  return sharp(buffer).metadata().then((metadata) => {
    if (!metadata.format) return false;
    const supportedFormats = ["jpeg", "jpg", "png", "webp", "gif", "tiff"];
    if (!supportedFormats.includes(metadata.format)) return false;
    if (metadata.width && metadata.width > 1e4) return false;
    if (metadata.height && metadata.height > 1e4) return false;
    return true;
  }).catch(() => false);
}
async function getImageDimensions(buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0
  };
}
var init_imageProcessor = __esm({
  "server/imageProcessor.ts"() {
    "use strict";
    init_storage();
  }
});

// server/memberImportExport.ts
var memberImportExport_exports = {};
__export(memberImportExport_exports, {
  exportMembersToExcel: () => exportMembersToExcel,
  importMembersFromCSV: () => importMembersFromCSV
});
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { eq as eq3 } from "drizzle-orm";
function validatePersonnummer(personnummer) {
  if (!personnummer) return false;
  const cleaned = personnummer.replace(/[-\s]/g, "");
  if (cleaned.length < 8) return false;
  const year = parseInt(cleaned.substring(0, 4));
  const month = parseInt(cleaned.substring(4, 6));
  const day = parseInt(cleaned.substring(6, 8));
  if (year < 1900 || year > (/* @__PURE__ */ new Date()).getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
}
async function importMembersFromCSV(csvData) {
  const result = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: []
  };
  try {
    let cleanedData = csvData;
    const lines = csvData.split("\n");
    if (lines.length > 0 && (lines[0].toLowerCase().includes("tabell") || lines[0].startsWith(";;"))) {
      cleanedData = lines.slice(1).join("\n");
    }
    const firstLine = cleanedData.split("\n")[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";
    const parsed = Papa.parse(cleanedData, {
      header: true,
      skipEmptyLines: true,
      delimiter,
      transformHeader: (header) => header.trim()
    });
    if (parsed.errors.length > 0) {
      result.success = false;
      result.errors.push({
        row: 0,
        error: "CSV parsing error: " + parsed.errors[0].message
      });
      return result;
    }
    const db = await getDb();
    if (!db) {
      result.success = false;
      result.errors.push({ row: 0, error: "Database not available" });
      return result;
    }
    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      const rowNumber = i + 2;
      try {
        if (!row.name || row.name.trim() === "") {
          result.errors.push({
            row: rowNumber,
            error: "Missing required field: name",
            data: row
          });
          result.skipped++;
          continue;
        }
        if (row.personnummer && !validatePersonnummer(row.personnummer)) {
          result.errors.push({
            row: rowNumber,
            error: "Invalid personnummer format",
            data: row
          });
          result.skipped++;
          continue;
        }
        if (row.personnummer) {
          const existing = await db.select().from(users).where(eq3(users.personnummer, row.personnummer)).limit(1);
          if (existing.length > 0) {
            result.errors.push({
              row: rowNumber,
              error: "Member with this personnummer already exists",
              data: row
            });
            result.skipped++;
            continue;
          }
        } else if (row.email) {
          const existing = await db.select().from(users).where(eq3(users.email, row.email)).limit(1);
          if (existing.length > 0) {
            result.errors.push({
              row: rowNumber,
              error: "Member with this email already exists",
              data: row
            });
            result.skipped++;
            continue;
          }
        }
        const { generateMemberNumber: generateMemberNumber2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const memberNumber = await generateMemberNumber2();
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        const openId = row.personnummer ? `import:${row.personnummer}` : `import:${memberNumber}:${Date.now()}`;
        let memberType = "ordinarie";
        if (row.memberType) {
          const typeStr = row.memberType.toLowerCase().trim();
          if (typeStr === "hedersmedlem" || typeStr === "heder") {
            memberType = "hedersmedlem";
          } else if (typeStr === "stodmedlem" || typeStr === "st\xF6d" || typeStr === "stod") {
            memberType = "stodmedlem";
          }
        }
        await db.insert(users).values({
          openId,
          name: row.name.trim(),
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          personnummer: row.personnummer?.trim() || null,
          streetAddress: row.streetAddress?.trim() || null,
          postalCode: row.postalCode?.trim() || null,
          city: row.city?.trim() || null,
          membershipNumber: memberNumber,
          membershipStatus: "active",
          memberType,
          joinYear: row.joinYear || currentYear,
          paymentStatus: "unpaid",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
        result.imported++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : "Unknown error",
          data: row
        });
        result.skipped++;
      }
    }
    if (result.errors.length > 0) {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push({
      row: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
  return result;
}
async function exportMembersToExcel() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const members = await db.select().from(users).where(eq3(users.membershipStatus, "active"));
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Medlemmar");
  worksheet.columns = [
    { header: "Medlemsnummer", key: "membershipNumber", width: 20 },
    { header: "Namn", key: "name", width: 30 },
    { header: "E-post", key: "email", width: 30 },
    { header: "Telefon", key: "phone", width: 15 },
    { header: "Personnummer", key: "personnummer", width: 15 },
    { header: "Gatuadress", key: "streetAddress", width: 30 },
    { header: "Postnummer", key: "postalCode", width: 10 },
    { header: "Stad", key: "city", width: 20 },
    { header: "Medlemstyp", key: "memberType", width: 15 },
    { header: "Intr\xE4des\xE5r", key: "joinYear", width: 12 },
    { header: "Betalningsstatus", key: "paymentStatus", width: 18 }
  ];
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" }
  };
  members.forEach((member) => {
    worksheet.addRow({
      membershipNumber: member.membershipNumber,
      name: member.name,
      email: member.email,
      phone: member.phone,
      personnummer: member.personnummer,
      streetAddress: member.streetAddress,
      postalCode: member.postalCode,
      city: member.city,
      memberType: member.memberType,
      joinYear: member.joinYear,
      paymentStatus: member.paymentStatus
    });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
var init_memberImportExport = __esm({
  "server/memberImportExport.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/eventDb.ts
var eventDb_exports = {};
__export(eventDb_exports, {
  cancelEventRegistration: () => cancelEventRegistration,
  createEvent: () => createEvent,
  deleteEvent: () => deleteEvent,
  getAllEvents: () => getAllEvents,
  getEventById: () => getEventById,
  getEventRegistrationCount: () => getEventRegistrationCount,
  getEventRegistrations: () => getEventRegistrations,
  getUpcomingEvents: () => getUpcomingEvents2,
  getUserEvents: () => getUserEvents,
  isUserRegistered: () => isUserRegistered,
  registerForEvent: () => registerForEvent,
  updateEvent: () => updateEvent
});
import { eq as eq5, and as and3, gte as gte2, desc as desc4, sql as sql4 } from "drizzle-orm";
async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(events).where(eq5(events.status, "published")).orderBy(events.eventDate);
  return result;
}
async function getUpcomingEvents2(limit) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  let query = db.select().from(events).where(
    and3(
      eq5(events.status, "published"),
      gte2(events.eventDate, now)
    )
  ).orderBy(events.eventDate);
  if (limit) {
    query = query.limit(limit);
  }
  const result = await query;
  return result;
}
async function getEventById(eventId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(events).where(eq5(events.id, eventId)).limit(1);
  return result[0];
}
async function createEvent(event) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(event);
  const insertedId = result[0].insertId;
  const newEvent = await getEventById(Number(insertedId));
  if (!newEvent) throw new Error("Failed to retrieve created event");
  return newEvent;
}
async function updateEvent(eventId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(updates).where(eq5(events.id, eventId));
  const updated = await getEventById(eventId);
  if (!updated) throw new Error("Failed to retrieve updated event");
  return updated;
}
async function deleteEvent(eventId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq5(events.id, eventId));
}
async function getEventRegistrations(eventId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(eventRegistrations).where(eq5(eventRegistrations.eventId, eventId)).orderBy(desc4(eventRegistrations.registeredAt));
  return result;
}
async function getEventRegistrationCount(eventId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql4`count(*)` }).from(eventRegistrations).where(
    and3(
      eq5(eventRegistrations.eventId, eventId),
      eq5(eventRegistrations.status, "registered")
    )
  );
  return result[0]?.count || 0;
}
async function isUserRegistered(eventId, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(eventRegistrations).where(
    and3(
      eq5(eventRegistrations.eventId, eventId),
      eq5(eventRegistrations.userId, userId),
      eq5(eventRegistrations.status, "registered")
    )
  ).limit(1);
  return result.length > 0;
}
async function registerForEvent(eventId, userId, notes) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const event = await getEventById(eventId);
  if (!event) throw new Error("Event not found");
  if (event.status !== "published") throw new Error("Event is not available for registration");
  const alreadyRegistered = await isUserRegistered(eventId, userId);
  if (alreadyRegistered) throw new Error("Already registered for this event");
  if (event.maxParticipants) {
    const currentCount = await getEventRegistrationCount(eventId);
    if (currentCount >= event.maxParticipants) {
      if (event.allowWaitlist) {
        const result2 = await db.insert(eventRegistrations).values({
          eventId,
          userId,
          status: "waitlist",
          notes
        });
        const insertedId2 = result2[0].insertId;
        const registration2 = await db.select().from(eventRegistrations).where(eq5(eventRegistrations.id, Number(insertedId2))).limit(1);
        return registration2[0];
      } else {
        throw new Error("Event is full and waitlist is not allowed");
      }
    }
  }
  const result = await db.insert(eventRegistrations).values({
    eventId,
    userId,
    status: "registered",
    notes
  });
  const insertedId = result[0].insertId;
  const registration = await db.select().from(eventRegistrations).where(eq5(eventRegistrations.id, Number(insertedId))).limit(1);
  return registration[0];
}
async function cancelEventRegistration(eventId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventRegistrations).set({
    status: "cancelled",
    cancelledAt: /* @__PURE__ */ new Date()
  }).where(
    and3(
      eq5(eventRegistrations.eventId, eventId),
      eq5(eventRegistrations.userId, userId)
    )
  );
}
async function getUserEvents(userId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: events.id,
    title: events.title,
    description: events.description,
    eventDate: events.eventDate,
    eventTime: events.eventTime,
    location: events.location,
    type: events.type,
    maxParticipants: events.maxParticipants,
    registrationDeadline: events.registrationDeadline,
    status: events.status,
    allowWaitlist: events.allowWaitlist,
    createdBy: events.createdBy,
    createdAt: events.createdAt,
    updatedAt: events.updatedAt
  }).from(events).innerJoin(eventRegistrations, eq5(events.id, eventRegistrations.eventId)).where(
    and3(
      eq5(eventRegistrations.userId, userId),
      eq5(eventRegistrations.status, "registered")
    )
  ).orderBy(events.eventDate);
  return result;
}
var init_eventDb = __esm({
  "server/eventDb.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/icalGenerator.ts
var icalGenerator_exports = {};
__export(icalGenerator_exports, {
  generateGoogleCalendarUrl: () => generateGoogleCalendarUrl,
  generateICalFeed: () => generateICalFeed,
  generateOutlookCalendarUrl: () => generateOutlookCalendarUrl,
  generateSingleEventICal: () => generateSingleEventICal
});
import ical from "ical-generator";
function generateICalFeed(events2, baseUrl) {
  const calendar = ical({
    name: "F\xF6reningen Gamla SSK-are Evenemang",
    description: "Kalender f\xF6r alla evenemang fr\xE5n F\xF6reningen Gamla SSK-are",
    timezone: "Europe/Stockholm",
    url: `${baseUrl}/api/calendar/feed.ics`,
    ttl: 3600
    // Refresh every hour
  });
  events2.forEach((event) => {
    const startDate = new Date(event.eventDate);
    if (event.eventTime) {
      const [hours, minutes] = event.eventTime.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);
    calendar.createEvent({
      start: startDate,
      end: endDate,
      summary: event.title,
      description: event.description || "",
      location: event.location || "",
      url: `${baseUrl}/evenemang/${event.id}`
    });
  });
  return calendar.toString();
}
function generateSingleEventICal(event, baseUrl) {
  const calendar = ical({
    name: event.title,
    timezone: "Europe/Stockholm"
  });
  const startDate = new Date(event.eventDate);
  if (event.eventTime) {
    const [hours, minutes] = event.eventTime.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);
  calendar.createEvent({
    start: startDate,
    end: endDate,
    summary: event.title,
    description: event.description || "",
    location: event.location || "",
    url: `${baseUrl}/evenemang/${event.id}`
  });
  return calendar.toString();
}
function generateGoogleCalendarUrl(event) {
  const startDate = new Date(event.eventDate);
  if (event.eventTime) {
    const [hours, minutes] = event.eventTime.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || "",
    location: event.location || ""
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function generateOutlookCalendarUrl(event, baseUrl) {
  const startDate = new Date(event.eventDate);
  if (event.eventTime) {
    const [hours, minutes] = event.eventTime.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2);
  const formatDate = (date) => {
    return date.toISOString().split(".")[0];
  };
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    body: event.description || "",
    location: event.location || "",
    startdt: formatDate(startDate),
    enddt: formatDate(endDate)
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
var init_icalGenerator = __esm({
  "server/icalGenerator.ts"() {
    "use strict";
  }
});

// server/_core/index.ts
init_googleAuth();
import "dotenv/config";
import express2 from "express";
import cookieParser from "cookie-parser";
import passport3 from "passport";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/googleAuthRoutes.ts
init_db();
init_const();
import { Router } from "express";
import passport2 from "passport";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/googleAuthRoutes.ts
init_sdk();
function createGoogleAuthRoutes() {
  const router2 = Router();
  router2.get(
    "/auth/google",
    passport2.authenticate("google", {
      scope: ["profile", "email"],
      session: false
    })
  );
  router2.get(
    "/auth/google/callback",
    passport2.authenticate("google", { session: false, failureRedirect: "/?error=google_auth_failed" }),
    async (req, res) => {
      try {
        const user = req.user;
        if (!user || !user.email) {
          return res.redirect("/?error=no_email");
        }
        const openId = `google:${user.providerId}`;
        await upsertUser({
          openId,
          name: user.name,
          email: user.email,
          loginMethod: "google",
          lastSignedIn: /* @__PURE__ */ new Date()
        });
        const token = await sdk.createSessionToken(openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.redirect("/");
      } catch (error) {
        console.error("[Google Auth] Callback error:", error);
        res.redirect("/?error=auth_failed");
      }
    }
  );
  return router2;
}

// server/routers.ts
init_const();

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
init_const();
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);
var requirePermission = (permission) => {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user) {
      throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }
    const { userHasPermission: userHasPermission2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const hasPermission = await userHasPermission2(ctx.user.id, permission);
    if (!hasPermission) {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: `Du saknar beh\xF6righet: ${permission}`
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  });
};
var manageNewsProcedure = protectedProcedure.use(requirePermission("manage_news"));
var manageMembersProcedure = protectedProcedure.use(requirePermission("manage_members"));
var manageRolesProcedure = protectedProcedure.use(requirePermission("manage_roles"));
var manageUsersProcedure = protectedProcedure.use(requirePermission("manage_users"));
var manageCMSProcedure = protectedProcedure.use(requirePermission("manage_cms"));

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();
init_schema();
init_storage();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";
import { desc as desc3, eq as eq4, isNotNull, gte, sql as sql3 } from "drizzle-orm";
import crypto3 from "crypto";
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    providers: publicProcedure.query(async () => {
      const { isGoogleAuthEnabled: isGoogleAuthEnabled2 } = await Promise.resolve().then(() => (init_googleAuth(), googleAuth_exports));
      return {
        google: isGoogleAuthEnabled2(),
        password: true
        // Password-based login for registered members
      };
    }),
    // Password-based login
    loginWithPassword: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string().min(6)
    })).mutation(async ({ input, ctx }) => {
      const { authenticateWithPassword: authenticateWithPassword2 } = await Promise.resolve().then(() => (init_passwordAuth(), passwordAuth_exports));
      const user = await authenticateWithPassword2(input.email, input.password);
      if (!user) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "Felaktig e-postadress eller l\xF6senord"
        });
      }
      const { upsertUser: upsertUser2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await upsertUser2({
        openId: user.openId,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const { sdk: sdk2 } = await Promise.resolve().then(() => (init_sdk(), sdk_exports));
      const { ONE_YEAR_MS: ONE_YEAR_MS2 } = await Promise.resolve().then(() => (init_const(), const_exports));
      const sessionToken = await sdk2.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS2
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS2 });
      return { success: true, user };
    }),
    // Request password reset
    requestPasswordReset: publicProcedure.input(z2.object({
      email: z2.string().email()
    })).mutation(async ({ input }) => {
      const { generatePasswordResetToken: generatePasswordResetToken2 } = await Promise.resolve().then(() => (init_passwordAuth(), passwordAuth_exports));
      const token = await generatePasswordResetToken2(input.email);
      if (!token) {
        return { success: true, message: "Om e-postadressen finns i systemet kommer du att f\xE5 ett \xE5terst\xE4llningsmail" };
      }
      const { sendPasswordResetEmail: sendPasswordResetEmail2 } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
      const emailResult = await sendPasswordResetEmail2(input.email, token);
      if (!emailResult.success) {
        console.error("[PasswordReset] Failed to send email:", emailResult.error);
        console.log("[PasswordReset] Token for", input.email, ":", token);
        console.log("[PasswordReset] Reset link:", `${process.env.VITE_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`);
      }
      return { success: true, message: "Om e-postadressen finns i systemet kommer du att f\xE5 ett \xE5terst\xE4llningsmail" };
    }),
    // Reset password with token
    resetPassword: publicProcedure.input(z2.object({
      token: z2.string(),
      newPassword: z2.string().min(8)
    })).mutation(async ({ input }) => {
      const { verifyPasswordResetToken: verifyPasswordResetToken2, resetPassword: resetPassword2 } = await Promise.resolve().then(() => (init_passwordAuth(), passwordAuth_exports));
      const userId = await verifyPasswordResetToken2(input.token);
      if (!userId) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Ogiltig eller utg\xE5ngen \xE5terst\xE4llningsl\xE4nk"
        });
      }
      const success = await resetPassword2(userId, input.newPassword);
      if (!success) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kunde inte \xE5terst\xE4lla l\xF6senord"
        });
      }
      return { success: true, message: "L\xF6senordet har \xE5terst\xE4llts" };
    }),
    // Set password for first-time users
    setPassword: protectedProcedure.input(z2.object({
      password: z2.string().min(8)
    })).mutation(async ({ input, ctx }) => {
      const { setUserPassword: setUserPassword2 } = await Promise.resolve().then(() => (init_passwordAuth(), passwordAuth_exports));
      const success = await setUserPassword2(ctx.user.id, input.password);
      if (!success) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kunde inte s\xE4tta l\xF6senord"
        });
      }
      return { success: true, message: "L\xF6senordet har satts" };
    })
  }),
  news: router({
    latest: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(news).where(isNotNull(news.publishedAt)).orderBy(desc3(news.publishedAt)).limit(3);
    }),
    list: manageNewsProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(news).orderBy(desc3(news.createdAt));
    }),
    create: manageNewsProcedure.input(
      z2.object({
        title: z2.string().min(1),
        content: z2.string().min(1),
        imageUrl: z2.string().optional(),
        publishedAt: z2.date().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(news).values({
        ...input,
        authorId: ctx.user.id
      });
      return result;
    }),
    update: manageNewsProcedure.input(
      z2.object({
        id: z2.number(),
        title: z2.string().min(1).optional(),
        content: z2.string().min(1).optional(),
        imageUrl: z2.string().optional(),
        publishedAt: z2.date().optional()
      })
    ).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(news).set(data).where(eq4(news.id, id));
      return { success: true };
    }),
    delete: manageNewsProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(news).where(eq4(news.id, input.id));
      return { success: true };
    })
  }),
  membership: router({
    submit: publicProcedure.input(
      z2.object({
        name: z2.string().min(1),
        email: z2.string().email(),
        phone: z2.string().optional(),
        message: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(membershipApplications).values(input);
      return { success: true };
    }),
    list: manageMembersProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(membershipApplications).orderBy(desc3(membershipApplications.createdAt));
    }),
    updateStatus: manageMembersProcedure.input(
      z2.object({
        id: z2.number(),
        status: z2.enum(["pending", "approved", "rejected"])
      })
    ).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(membershipApplications).set({ status: input.status }).where(eq4(membershipApplications.id, input.id));
      return { success: true };
    })
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => {
      return ctx.user;
    }),
    update: protectedProcedure.input(
      z2.object({
        name: z2.string().optional(),
        email: z2.string().email().optional(),
        phone: z2.string().optional(),
        streetAddress: z2.string().optional(),
        postalCode: z2.string().optional(),
        city: z2.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(users).set(input).where(eq4(users.id, ctx.user.id));
      return { success: true };
    })
  }),
  roles: router({
    // Get all roles
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      return await db.select().from(roles);
    }),
    // Create new role (huvudadmin only)
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      description: z2.string().optional(),
      permissions: z2.array(z2.string())
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq4(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can create roles" });
      }
      await db.insert(roles).values({
        name: input.name,
        description: input.description,
        permissions: input.permissions,
        isCustom: 1
      });
      return { success: true };
    }),
    // Update role (huvudadmin only)
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      description: z2.string().optional(),
      permissions: z2.array(z2.string()).optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq4(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can update roles" });
      }
      const updateData = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== void 0) updateData.description = input.description;
      if (input.permissions) updateData.permissions = input.permissions;
      await db.update(roles).set(updateData).where(eq4(roles.id, input.id));
      return { success: true };
    }),
    // Delete role (huvudadmin only, cannot delete system roles)
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq4(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can delete roles" });
      }
      const roleToDelete = await db.select().from(roles).where(eq4(roles.id, input.id)).limit(1);
      if (roleToDelete[0] && roleToDelete[0].isCustom === 0) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Cannot delete system roles" });
      }
      await db.delete(roles).where(eq4(roles.id, input.id));
      return { success: true };
    })
  }),
  userManagement: router({
    // List all users (huvudadmin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq4(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can view all users" });
      }
      return await db.select().from(users);
    }),
    // Assign role to user (huvudadmin only)
    assignRole: protectedProcedure.input(z2.object({
      userId: z2.number(),
      roleId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq4(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can assign roles" });
      }
      await db.update(users).set({ roleId: input.roleId }).where(eq4(users.id, input.userId));
      return { success: true };
    })
  }),
  gallery: router({
    // Get all photos (public)
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(galleryPhotos).orderBy(desc3(galleryPhotos.createdAt));
    }),
    // Get photos by category (public)
    byCategory: publicProcedure.input(z2.object({ category: z2.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(galleryPhotos).where(eq4(galleryPhotos.category, input.category)).orderBy(desc3(galleryPhotos.createdAt));
    }),
    // Upload photo with automatic compression (admin only)
    upload: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      category: z2.string().optional(),
      imageBase64: z2.string()
      // Base64 encoded image
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const imageBuffer = Buffer.from(input.imageBase64, "base64");
      const { processAndUploadImage: processAndUploadImage2 } = await Promise.resolve().then(() => (init_imageProcessor(), imageProcessor_exports));
      const processedImages = await processAndUploadImage2(imageBuffer, input.title, "gallery");
      await db.insert(galleryPhotos).values({
        title: input.title,
        description: input.description,
        imageUrl: processedImages.medium.url,
        // Legacy field
        thumbnailUrl: processedImages.thumbnail.url,
        mediumUrl: processedImages.medium.url,
        originalUrl: processedImages.original.url,
        category: input.category,
        uploadedBy: ctx.user.id
      });
      return { success: true, images: processedImages };
    }),
    // Create photo (admin only) - Legacy method
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      imageUrl: z2.string().url(),
      category: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      await db.insert(galleryPhotos).values({
        ...input,
        uploadedBy: ctx.user.id
      });
      return { success: true };
    }),
    // Update photo (admin only)
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      category: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const { id, ...updateData } = input;
      await db.update(galleryPhotos).set(updateData).where(eq4(galleryPhotos.id, id));
      return { success: true };
    }),
    // Delete photo (admin only)
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      await db.delete(galleryPhotos).where(eq4(galleryPhotos.id, input.id));
      return { success: true };
    })
  }),
  events: router({
    // Get all upcoming events (public)
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(events).where(gte(events.eventDate, /* @__PURE__ */ new Date())).orderBy(events.eventDate);
    }),
    // Get all events (admin)
    listAll: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      return await db.select().from(events).orderBy(desc3(events.eventDate));
    }),
    // Create event (admin only)
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      eventDate: z2.date(),
      eventTime: z2.string().optional(),
      location: z2.string().optional(),
      type: z2.string().optional(),
      maxParticipants: z2.number().optional(),
      registrationDeadline: z2.date().optional(),
      status: z2.enum(["draft", "published", "cancelled", "completed"]).optional(),
      allowWaitlist: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      await db.insert(events).values({
        ...input,
        allowWaitlist: input.allowWaitlist ? 1 : 0,
        createdBy: ctx.user.id
      });
      return { success: true };
    }),
    // Update event (admin only)
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      eventDate: z2.date().optional(),
      eventTime: z2.string().optional(),
      location: z2.string().optional(),
      type: z2.string().optional(),
      maxParticipants: z2.number().optional(),
      registrationDeadline: z2.date().optional(),
      status: z2.enum(["draft", "published", "cancelled", "completed"]).optional(),
      allowWaitlist: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const { id, allowWaitlist, ...updateData } = input;
      await db.update(events).set({
        ...updateData,
        ...allowWaitlist !== void 0 ? { allowWaitlist: allowWaitlist ? 1 : 0 } : {}
      }).where(eq4(events.id, id));
      return { success: true };
    }),
    // Delete event (admin only)
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      await db.delete(events).where(eq4(events.id, input.id));
      return { success: true };
    }),
    // Get event with registrations (admin only)
    getWithRegistrations: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq4(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      return await getEventWithRegistrations(input.id);
    }),
    // Register for event (authenticated users)
    register: protectedProcedure.input(z2.object({
      eventId: z2.number(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { eventRegistrations: eventRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const event = await db.select().from(events).where(eq4(events.id, input.eventId)).limit(1);
      if (event.length === 0) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Evenemang hittades inte" });
      }
      if (event[0].registrationDeadline && /* @__PURE__ */ new Date() > new Date(event[0].registrationDeadline)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Anm\xE4lningstiden har g\xE5tt ut" });
      }
      const existing = await getUserEventRegistration(input.eventId, ctx.user.id);
      if (existing && existing.status !== "cancelled") {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Du \xE4r redan anm\xE4ld till detta evenemang" });
      }
      const eventWithRegs = await getEventWithRegistrations(input.eventId);
      if (!eventWithRegs) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Evenemang hittades inte" });
      }
      let status = "registered";
      if (event[0].maxParticipants && eventWithRegs.registeredCount >= event[0].maxParticipants) {
        if (event[0].allowWaitlist) {
          status = "waitlist";
        } else {
          throw new TRPCError3({ code: "BAD_REQUEST", message: "Evenemanget \xE4r fullt" });
        }
      }
      if (existing) {
        await db.update(eventRegistrations2).set({ status, notes: input.notes, registeredAt: /* @__PURE__ */ new Date(), cancelledAt: null }).where(eq4(eventRegistrations2.id, existing.id));
      } else {
        await db.insert(eventRegistrations2).values({
          eventId: input.eventId,
          userId: ctx.user.id,
          status,
          notes: input.notes
        });
      }
      return { success: true, status };
    }),
    // Cancel event registration
    cancelRegistration: protectedProcedure.input(z2.object({ eventId: z2.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { eventRegistrations: eventRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const registration = await getUserEventRegistration(input.eventId, ctx.user.id);
      if (!registration) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Ingen anm\xE4lan hittades" });
      }
      await db.update(eventRegistrations2).set({ status: "cancelled", cancelledAt: /* @__PURE__ */ new Date() }).where(eq4(eventRegistrations2.id, registration.id));
      return { success: true };
    }),
    // Get user's registered events
    myEvents: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRegisteredEvents(ctx.user.id);
    }),
    // Get user's registration status for an event
    myRegistration: protectedProcedure.input(z2.object({ eventId: z2.number() })).query(async ({ ctx, input }) => {
      return await getUserEventRegistration(input.eventId, ctx.user.id);
      return { success: true };
    })
  }),
  cms: router({
    // Get all content for a specific page (public)
    getPageContent: publicProcedure.input(z2.object({ page: z2.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(pageContent).where(eq4(pageContent.page, input.page)).orderBy(pageContent.order);
    }),
    // Get all page content (admin)
    getAllContent: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(pageContent).orderBy(pageContent.page, pageContent.order);
    }),
    // Update page content (admin)
    updateContent: adminProcedure.input(z2.object({
      id: z2.number(),
      content: z2.string().optional(),
      order: z2.number().optional(),
      published: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { id, ...updateData } = input;
      await db.update(pageContent).set({ ...updateData, updatedBy: ctx.user.id }).where(eq4(pageContent.id, id));
      return { success: true };
    }),
    // Create new content section (admin)
    createContent: adminProcedure.input(z2.object({
      page: z2.string(),
      sectionKey: z2.string(),
      type: z2.string(),
      content: z2.string(),
      order: z2.number().default(0)
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(pageContent).values({
        ...input,
        updatedBy: ctx.user.id
      });
      return { success: true };
    }),
    updatePageContent: protectedProcedure.input(z2.object({ id: z2.number(), content: z2.string().nullable() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [current] = await db.select().from(pageContent).where(eq4(pageContent.id, input.id)).limit(1);
      if (current) {
        await db.insert(contentHistory).values({
          contentId: input.id,
          content: current.content,
          updatedBy: ctx.user.id
        });
      }
      await db.update(pageContent).set({ content: input.content }).where(eq4(pageContent.id, input.id));
      return { success: true };
    }),
    getContentHistory: protectedProcedure.input(z2.object({ contentId: z2.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const history = await db.select({
        id: contentHistory.id,
        content: contentHistory.content,
        createdAt: contentHistory.createdAt,
        updatedBy: contentHistory.updatedBy,
        userName: users.name
      }).from(contentHistory).leftJoin(users, eq4(contentHistory.updatedBy, users.id)).where(eq4(contentHistory.contentId, input.contentId)).orderBy(desc3(contentHistory.createdAt)).limit(20);
      return history;
    }),
    restoreContentVersion: protectedProcedure.input(z2.object({ contentId: z2.number(), historyId: z2.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [history] = await db.select().from(contentHistory).where(eq4(contentHistory.id, input.historyId)).limit(1);
      if (!history) throw new TRPCError3({ code: "NOT_FOUND", message: "History not found" });
      const [current] = await db.select().from(pageContent).where(eq4(pageContent.id, input.contentId)).limit(1);
      if (current) {
        await db.insert(contentHistory).values({
          contentId: input.contentId,
          content: current.content,
          updatedBy: ctx.user.id
        });
      }
      await db.update(pageContent).set({ content: history.content }).where(eq4(pageContent.id, input.contentId));
      return { success: true };
    }),
    // Delete content section (admin)
    deleteContent: adminProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.delete(pageContent).where(eq4(pageContent.id, input.id));
      return { success: true };
    }),
    // Get site settings (public)
    getSettings: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(siteSettings);
    }),
    // Update site setting (admin)
    updateSetting: adminProcedure.input(z2.object({
      key: z2.string(),
      value: z2.string(),
      type: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const existing = await db.select().from(siteSettings).where(eq4(siteSettings.key, input.key)).limit(1);
      if (existing.length > 0) {
        await db.update(siteSettings).set({ value: input.value, type: input.type, updatedBy: ctx.user.id }).where(eq4(siteSettings.key, input.key));
      } else {
        await db.insert(siteSettings).values({
          key: input.key,
          value: input.value,
          type: input.type || "text",
          updatedBy: ctx.user.id
        });
      }
      return { success: true };
    }),
    // Board members management
    getBoardMembers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(boardMembers).where(eq4(boardMembers.active, 1)).orderBy(boardMembers.order);
    }),
    getAllBoardMembers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(boardMembers).orderBy(boardMembers.order);
    }),
    createBoardMember: adminProcedure.input(z2.object({
      name: z2.string(),
      role: z2.string(),
      phone: z2.string().optional(),
      email: z2.string().optional(),
      photo: z2.string().optional(),
      order: z2.number().default(0)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(boardMembers).values(input);
      return { success: true };
    }),
    updateBoardMember: adminProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      role: z2.string().optional(),
      phone: z2.string().optional(),
      email: z2.string().optional(),
      photo: z2.string().optional(),
      order: z2.number().optional(),
      active: z2.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { id, ...updateData } = input;
      await db.update(boardMembers).set(updateData).where(eq4(boardMembers.id, id));
      return { success: true };
    }),
    deleteBoardMember: adminProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.delete(boardMembers).where(eq4(boardMembers.id, input.id));
      return { success: true };
    })
  }),
  upload: router({
    image: publicProcedure.input(z2.object({
      filename: z2.string(),
      contentType: z2.string(),
      data: z2.string()
      // base64 encoded
    })).mutation(async ({ input }) => {
      try {
        const ext = input.filename.split(".").pop();
        const randomSuffix = crypto3.randomBytes(8).toString("hex");
        const fileKey = `news-images/${randomSuffix}.${ext}`;
        const buffer = Buffer.from(input.data, "base64");
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        return { url };
      } catch (error) {
        console.error("Image upload error:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image"
        });
      }
    })
  }),
  // Member Registry
  members: router({
    // Verify current user's member status
    verifyStatus: protectedProcedure.query(async ({ ctx }) => {
      const { verifyMemberStatus: verifyMemberStatus2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await verifyMemberStatus2(ctx.user.id);
    }),
    // Get all members (admin only)
    list: manageUsersProcedure.input(z2.object({
      status: z2.enum(["pending", "active", "inactive"]).optional(),
      memberType: z2.enum(["ordinarie", "hedersmedlem", "stodmedlem"]).optional(),
      paymentStatus: z2.enum(["paid", "unpaid", "exempt"]).optional(),
      search: z2.string().optional()
    }).optional()).query(async ({ input }) => {
      const { getMembers: getMembers2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await getMembers2(input);
    }),
    // Get member by ID (admin only)
    getById: manageUsersProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const member = await getMemberById2(input.id);
      if (!member) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Member not found" });
      }
      return member;
    }),
    // Update member (admin only)
    update: manageUsersProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      personnummer: z2.string().optional(),
      streetAddress: z2.string().optional(),
      postalCode: z2.string().optional(),
      city: z2.string().optional(),
      membershipStatus: z2.enum(["pending", "active", "inactive"]).optional(),
      membershipNumber: z2.string().optional(),
      joinYear: z2.number().optional(),
      memberType: z2.enum(["ordinarie", "hedersmedlem", "stodmedlem"]).optional(),
      paymentStatus: z2.enum(["paid", "unpaid", "exempt"]).optional(),
      paymentYear: z2.number().optional(),
      showInDirectory: z2.number().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      const { updateMember: updateMember2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await updateMember2(id, data);
    }),
    // Generate member number
    generateMemberNumber: manageUsersProcedure.mutation(async () => {
      const { generateMemberNumber: generateMemberNumber2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return { memberNumber: await generateMemberNumber2() };
    }),
    // Get members for directory (logged-in members only)
    directory: protectedProcedure.query(async () => {
      const { getMembersForDirectory: getMembersForDirectory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await getMembersForDirectory2();
    }),
    // Import members from CSV (admin only)
    importCSV: manageUsersProcedure.input(z2.object({ csvData: z2.string() })).mutation(async ({ input }) => {
      const { importMembersFromCSV: importMembersFromCSV2 } = await Promise.resolve().then(() => (init_memberImportExport(), memberImportExport_exports));
      return await importMembersFromCSV2(input.csvData);
    }),
    // Export members to Excel (admin only)
    exportExcel: manageUsersProcedure.mutation(async ({ ctx }) => {
      const { exportMembersToExcel: exportMembersToExcel2 } = await Promise.resolve().then(() => (init_memberImportExport(), memberImportExport_exports));
      const buffer = await exportMembersToExcel2();
      return {
        data: buffer.toString("base64"),
        filename: `medlemmar_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`
      };
    }),
    // Send payment reminder (admin only)
    sendPaymentReminder: manageUsersProcedure.input(z2.object({ memberId: z2.number() })).mutation(async ({ input }) => {
      const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const member = await getMemberById2(input.memberId);
      if (!member) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Member not found" });
      }
      if (!member.email) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Member has no email address" });
      }
      console.log(`[Payment Reminder] Would send to ${member.email} (${member.name})`);
      return { success: true, message: "Payment reminder sent" };
    })
  }),
  // Documents router for PDF upload and sharing
  documents: router({
    // List all documents (with access control)
    list: publicProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (!ctx.user) {
        return db.select().from(documents).where(eq4(documents.accessLevel, "public")).orderBy(desc3(documents.createdAt));
      } else if (ctx.user.role !== "admin") {
        return db.select().from(documents).where(sql3`${documents.accessLevel} IN ('public', 'members_only')`).orderBy(desc3(documents.createdAt));
      }
      return db.select().from(documents).orderBy(desc3(documents.createdAt));
    }),
    // Get documents by category
    byCategory: publicProcedure.input(z2.object({ category: z2.string() })).query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (!ctx.user) {
        return db.select().from(documents).where(sql3`${documents.category} = ${input.category} AND ${documents.accessLevel} = 'public'`).orderBy(desc3(documents.createdAt));
      } else if (ctx.user.role !== "admin") {
        return db.select().from(documents).where(sql3`${documents.category} = ${input.category} AND ${documents.accessLevel} IN ('public', 'members_only')`).orderBy(desc3(documents.createdAt));
      }
      return db.select().from(documents).where(eq4(documents.category, input.category)).orderBy(desc3(documents.createdAt));
    }),
    // Upload document (admin only)
    upload: adminProcedure.input(z2.object({
      title: z2.string(),
      description: z2.string().optional(),
      fileData: z2.string(),
      // Base64 encoded PDF
      fileName: z2.string(),
      fileSize: z2.number(),
      category: z2.enum(["stadgar", "protokoll", "informationsblad", "arsmoten", "ovrigt"]),
      accessLevel: z2.enum(["public", "members_only", "admin_only"])
    })).mutation(async ({ input, ctx }) => {
      if (input.fileSize > 10 * 1024 * 1024) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Filen \xE4r f\xF6r stor (max 10MB)" });
      }
      if (!input.fileName.toLowerCase().endsWith(".pdf")) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Endast PDF-filer \xE4r till\xE5tna" });
      }
      const buffer = Buffer.from(input.fileData, "base64");
      const fileKey = `documents/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, "application/pdf");
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Databas inte tillg\xE4nglig" });
      await db.insert(documents).values({
        title: input.title,
        description: input.description,
        fileUrl: url,
        fileSize: input.fileSize,
        category: input.category,
        accessLevel: input.accessLevel,
        uploadedBy: ctx.user.id
      });
      return { success: true, url };
    }),
    // Delete document (admin only)
    delete: adminProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Databas inte tillg\xE4nglig" });
      await db.delete(documents).where(eq4(documents.id, input.id));
      return { success: true };
    })
  }),
  // Payment confirmations router
  payments: router({
    // Get Swish number from settings
    getSwishNumber: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const setting = await db.select().from(siteSettings).where(eq4(siteSettings.key, "swish_number")).limit(1);
      return setting[0]?.value || "123 XXX XXXX";
    }),
    // Submit payment confirmation (authenticated users)
    submitConfirmation: protectedProcedure.input(z2.object({
      amount: z2.string(),
      paymentYear: z2.number(),
      receiptBase64: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      let receiptUrl;
      if (input.receiptBase64) {
        const receiptBuffer = Buffer.from(input.receiptBase64, "base64");
        const filename = `payment-receipt-${ctx.user.id}-${Date.now()}.pdf`;
        const { url } = await storagePut(`receipts/${filename}`, receiptBuffer, "application/pdf");
        receiptUrl = url;
      }
      await db.insert(paymentConfirmations).values({
        userId: ctx.user.id,
        amount: input.amount,
        paymentYear: input.paymentYear,
        receiptUrl,
        notes: input.notes,
        status: "pending"
      });
      return { success: true };
    }),
    // Get user's payment confirmations
    myPayments: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(paymentConfirmations).where(eq4(paymentConfirmations.userId, ctx.user.id)).orderBy(desc3(paymentConfirmations.createdAt));
    }),
    // Admin: Get all payment confirmations
    listAll: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const payments = await db.select({
        id: paymentConfirmations.id,
        amount: paymentConfirmations.amount,
        paymentYear: paymentConfirmations.paymentYear,
        status: paymentConfirmations.status,
        receiptUrl: paymentConfirmations.receiptUrl,
        notes: paymentConfirmations.notes,
        createdAt: paymentConfirmations.createdAt,
        verifiedAt: paymentConfirmations.verifiedAt,
        userName: users.name,
        userEmail: users.email
      }).from(paymentConfirmations).leftJoin(users, eq4(paymentConfirmations.userId, users.id)).orderBy(desc3(paymentConfirmations.createdAt));
      return payments;
    }),
    // Admin: Verify payment
    verify: adminProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["verified", "rejected"])
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.update(paymentConfirmations).set({
        status: input.status,
        verifiedBy: ctx.user.id,
        verifiedAt: /* @__PURE__ */ new Date()
      }).where(eq4(paymentConfirmations.id, input.id));
      if (input.status === "verified") {
        const payment = await db.select().from(paymentConfirmations).where(eq4(paymentConfirmations.id, input.id)).limit(1);
        if (payment[0]) {
          await db.update(users).set({
            paymentStatus: "paid",
            paymentYear: payment[0].paymentYear
          }).where(eq4(users.id, payment[0].userId));
        }
      }
      return { success: true };
    })
  })
});

// server/_core/context.ts
init_sdk();
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/index.ts
init_env();

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
async function setupVite(app, server) {
  const { createServer: createViteServer } = await import("vite");
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    configFile: path.resolve(import.meta.dirname, "../..", "vite.config.ts"),
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path.resolve(import.meta.dirname, "../..", "dist", "public") : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
init_db();
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  const preferredPort = parseInt(process.env.PORT || "3000");
  console.log("[Startup] Booting Gamla SSK server");
  console.log(`[Startup] NODE_ENV=${process.env.NODE_ENV || "undefined"}`);
  console.log(`[Startup] PORT=${preferredPort}`);
  console.log(`[Startup] Database configured=${process.env.DATABASE_URL ? "yes" : "no"}`);
  console.log(`[Startup] OWNER_EMAIL configured=${ENV.ownerEmail ? "yes" : "no"}`);
  console.log(`[Startup] ADMIN_PASSWORD configured=${ENV.adminPassword ? "yes" : "no"}`);
  if (ENV.ownerEmail) {
    console.log(`[Startup] OWNER_EMAIL value=${ENV.ownerEmail}`);
  }
  if (process.env.DATABASE_URL) {
    await ensureSchemaCompatibility();
  }
  if (ENV.ownerEmail && ENV.adminPassword) {
    const { bootstrapOwnerPassword: bootstrapOwnerPassword2 } = await Promise.resolve().then(() => (init_passwordAuth(), passwordAuth_exports));
    const bootstrapped = await bootstrapOwnerPassword2(ENV.ownerEmail, ENV.adminPassword);
    console.log(`[Startup] Owner password bootstrap=${bootstrapped ? "ok" : "skipped"}`);
  }
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use(passport3.initialize());
  configureGoogleAuth();
  app.use(createGoogleAuthRoutes());
  app.get("/api/calendar/feed.ics", async (req, res) => {
    const { getAllEvents: getAllEvents2 } = await Promise.resolve().then(() => (init_eventDb(), eventDb_exports));
    const { generateICalFeed: generateICalFeed2 } = await Promise.resolve().then(() => (init_icalGenerator(), icalGenerator_exports));
    const events2 = await getAllEvents2();
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const icalFeed = generateICalFeed2(events2, baseUrl);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="gamla-ssk-events.ics"');
    res.send(icalFeed);
  });
  app.get("/api/calendar/event/:id.ics", async (req, res) => {
    const { getEventById: getEventById2 } = await Promise.resolve().then(() => (init_eventDb(), eventDb_exports));
    const { generateSingleEventICal: generateSingleEventICal2 } = await Promise.resolve().then(() => (init_icalGenerator(), icalGenerator_exports));
    const eventId = parseInt(req.params.id);
    const event = await getEventById2(eventId);
    if (!event) {
      res.status(404).send("Event not found");
      return;
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const icalEvent = generateSingleEventICal2(event, baseUrl);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics"`);
    res.send(icalEvent);
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  console.log("[Cron] Automatic payment reminders DISABLED - use manual reminders in admin panel");
  const port = process.env.NODE_ENV === "production" ? preferredPort : await findAvailablePort(preferredPort);
  if (process.env.NODE_ENV !== "production" && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.on("error", (error) => {
    console.error("[Startup] Server failed to listen:", error);
  });
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}
startServer().catch(console.error);
