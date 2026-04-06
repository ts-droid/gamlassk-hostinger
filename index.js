var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  banners: () => banners,
  boardMembers: () => boardMembers,
  contentHistory: () => contentHistory,
  documentVersions: () => documentVersions,
  documents: () => documents,
  eventRegistrations: () => eventRegistrations,
  events: () => events,
  galleryPhotos: () => galleryPhotos,
  implementationTasks: () => implementationTasks,
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
var users, roles, news, membershipApplications, galleryPhotos, events, eventRegistrations, paymentConfirmations, pageContent, siteSettings, boardMembers, contentHistory, documents, documentVersions, passwordResetTokens, banners, implementationTasks;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      /**
       * Surrogate primary key. Auto-incremented numeric value managed by the database.
       * Use this for relations between tables.
       */
      id: int("id").autoincrement().primaryKey(),
      /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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
    documentVersions = mysqlTable("document_versions", {
      id: int("id").autoincrement().primaryKey(),
      documentId: int("documentId").notNull().references(() => documents.id, { onDelete: "cascade" }),
      versionNumber: int("versionNumber").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      fileUrl: text("fileUrl").notNull(),
      fileSize: int("fileSize"),
      category: varchar("category", { length: 100 }).notNull(),
      accessLevel: varchar("accessLevel", { length: 50 }).notNull(),
      updatedBy: int("updatedBy").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull()
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
    banners = mysqlTable("banners", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      type: mysqlEnum("type", ["info", "warning", "success", "event", "announcement"]).default("info").notNull(),
      style: varchar("style", { length: 50 }).default("default").notNull(),
      // color scheme
      position: mysqlEnum("position", ["top", "hero", "sidebar"]).default("top").notNull(),
      active: int("active").default(1).notNull(),
      // 1 = active, 0 = inactive
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      order: int("order").default(0).notNull(),
      // Display order (lower = higher priority)
      linkUrl: text("linkUrl"),
      // Optional link
      linkText: varchar("linkText", { length: 100 }),
      // Link button text
      createdBy: int("createdBy").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    implementationTasks = mysqlTable("implementation_tasks", {
      id: int("id").autoincrement().primaryKey(),
      phase: varchar("phase", { length: 100 }).notNull(),
      // "Fas 1", "Fas 2", etc.
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      estimatedHours: int("estimatedHours"),
      priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium").notNull(),
      status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
      order: int("order").notNull().default(0),
      completedAt: timestamp("completedAt"),
      completedBy: int("completedBy").references(() => users.id),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      resendApiKey: process.env.RESEND_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createDocument: () => createDocument,
  deleteDocument: () => deleteDocument,
  generateMemberNumber: () => generateMemberNumber,
  getAllDocuments: () => getAllDocuments,
  getAllImplementationTasks: () => getAllImplementationTasks,
  getDb: () => getDb,
  getDocumentById: () => getDocumentById,
  getDocumentsByCategory: () => getDocumentsByCategory,
  getEventWithRegistrations: () => getEventWithRegistrations,
  getImplementationTasksByPhase: () => getImplementationTasksByPhase,
  getMemberById: () => getMemberById,
  getMembers: () => getMembers,
  getMembersForDirectory: () => getMembersForDirectory,
  getUpcomingEvents: () => getUpcomingEvents,
  getUserByEmail: () => getUserByEmail,
  getUserByOpenId: () => getUserByOpenId,
  getUserEventRegistration: () => getUserEventRegistration,
  getUserRegisteredEvents: () => getUserRegisteredEvents,
  getUserRole: () => getUserRole,
  linkUserToMember: () => linkUserToMember,
  updateImplementationTaskStatus: () => updateImplementationTaskStatus,
  updateMember: () => updateMember,
  upsertUser: () => upsertUser,
  userHasPermission: () => userHasPermission,
  verifyMemberStatus: () => verifyMemberStatus
});
import { eq, and, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
    if (user.password !== void 0) {
      values.password = user.password ?? null;
      updateSet.password = user.password ?? null;
    }
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
    } else if (user.openId === ENV.ownerOpenId) {
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
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
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
  const { eq: eq7 } = await import("drizzle-orm");
  const event = await db.select().from(events2).where(eq7(events2.id, eventId)).limit(1);
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
  }).from(eventRegistrations2).leftJoin(users2, eq7(eventRegistrations2.userId, users2.id)).where(eq7(eventRegistrations2.eventId, eventId)).orderBy(eventRegistrations2.registeredAt);
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
  const { eq: eq7, and: and4 } = await import("drizzle-orm");
  const result = await db.select().from(eventRegistrations2).where(and4(eq7(eventRegistrations2.eventId, eventId), eq7(eventRegistrations2.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getUserRegisteredEvents(userId) {
  const db = await getDb();
  if (!db) return [];
  const { events: events2, eventRegistrations: eventRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq7, and: and4, ne } = await import("drizzle-orm");
  return await db.select({
    event: events2,
    registration: eventRegistrations2
  }).from(eventRegistrations2).leftJoin(events2, eq7(eventRegistrations2.eventId, events2.id)).where(and4(eq7(eventRegistrations2.userId, userId), ne(eventRegistrations2.status, "cancelled"))).orderBy(events2.eventDate);
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
async function getAllImplementationTasks() {
  const db = await getDb();
  if (!db) return [];
  const { implementationTasks: implementationTasks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return await db.select().from(implementationTasks2).orderBy(implementationTasks2.phase, implementationTasks2.order);
}
async function getImplementationTasksByPhase(phase) {
  const db = await getDb();
  if (!db) return [];
  const { implementationTasks: implementationTasks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq7 } = await import("drizzle-orm");
  return await db.select().from(implementationTasks2).where(eq7(implementationTasks2.phase, phase)).orderBy(implementationTasks2.order);
}
async function updateImplementationTaskStatus(taskId, status, userId) {
  const db = await getDb();
  if (!db) return null;
  const { implementationTasks: implementationTasks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq7 } = await import("drizzle-orm");
  const updateData = { status };
  if (status === "completed") {
    updateData.completedAt = /* @__PURE__ */ new Date();
    if (userId) updateData.completedBy = userId;
  } else {
    updateData.completedAt = null;
    updateData.completedBy = null;
  }
  await db.update(implementationTasks2).set(updateData).where(eq7(implementationTasks2.id, taskId));
  return await db.select().from(implementationTasks2).where(eq7(implementationTasks2.id, taskId)).limit(1).then((rows) => rows[0]);
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
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
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString, EXCHANGE_TOKEN_PATH, GET_USER_INFO_PATH, GET_USER_INFO_WITH_JWT_PATH, OAuthService, createOAuthHttpClient, SDKServer, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
    init_db();
    init_env();
    isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
    EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
    GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
    GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
    OAuthService = class {
      constructor(client) {
        this.client = client;
        console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
        if (!ENV.oAuthServerUrl) {
          console.error(
            "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
          );
        }
      }
      decodeState(state) {
        const redirectUri = atob(state);
        return redirectUri;
      }
      async getTokenByCode(code, state) {
        const payload = {
          clientId: ENV.appId,
          grantType: "authorization_code",
          code,
          redirectUri: this.decodeState(state)
        };
        const { data } = await this.client.post(
          EXCHANGE_TOKEN_PATH,
          payload
        );
        return data;
      }
      async getUserInfoByToken(token) {
        const { data } = await this.client.post(
          GET_USER_INFO_PATH,
          {
            accessToken: token.accessToken
          }
        );
        return data;
      }
    };
    createOAuthHttpClient = () => axios.create({
      baseURL: ENV.oAuthServerUrl,
      timeout: AXIOS_TIMEOUT_MS
    });
    SDKServer = class {
      client;
      oauthService;
      constructor(client = createOAuthHttpClient()) {
        this.client = client;
        this.oauthService = new OAuthService(this.client);
      }
      deriveLoginMethod(platforms, fallback) {
        if (fallback && fallback.length > 0) return fallback;
        if (!Array.isArray(platforms) || platforms.length === 0) return null;
        const set = new Set(
          platforms.filter((p) => typeof p === "string")
        );
        if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
        if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
        if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
        if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
          return "microsoft";
        if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
        const first = Array.from(set)[0];
        return first ? first.toLowerCase() : null;
      }
      /**
       * Exchange OAuth authorization code for access token
       * @example
       * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
       */
      async exchangeCodeForToken(code, state) {
        return this.oauthService.getTokenByCode(code, state);
      }
      /**
       * Get user information using access token
       * @example
       * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
       */
      async getUserInfo(accessToken) {
        const data = await this.oauthService.getUserInfoByToken({
          accessToken
        });
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      getSessionSecret() {
        const secret = ENV.cookieSecret;
        return new TextEncoder().encode(secret);
      }
      /**
       * Create a session token for a Manus user openId
       * @example
       * const sessionToken = await sdk.createSessionToken(userInfo.openId);
       */
      async createSessionToken(openId, options = {}) {
        return this.signSession(
          {
            openId,
            appId: ENV.appId,
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
          appId: payload.appId,
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
          const { openId, appId, name } = payload;
          if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
            console.warn("[Auth] Session payload missing required fields");
            return null;
          }
          return {
            openId,
            appId,
            name
          };
        } catch (error) {
          console.warn("[Auth] Session verification failed", String(error));
          return null;
        }
      }
      async getUserInfoWithJwt(jwtToken) {
        const payload = {
          jwtToken,
          projectId: ENV.appId
        };
        const { data } = await this.client.post(
          GET_USER_INFO_WITH_JWT_PATH,
          payload
        );
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
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
          try {
            const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
            await upsertUser({
              openId: userInfo.openId,
              name: userInfo.name || null,
              email: userInfo.email ?? null,
              loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
              lastSignedIn: signedInAt
            });
            user = await getUserByOpenId(userInfo.openId);
          } catch (error) {
            console.error("[Auth] Failed to sync user from OAuth:", error);
            throw ForbiddenError("Failed to sync user info");
          }
        }
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
    sdk = new SDKServer();
  }
});

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

// server/_core/notification.ts
var notification_exports = {};
__export(notification_exports, {
  notifyOwner: () => notifyOwner
});
import { TRPCError } from "@trpc/server";
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
var TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH, trimValue, isNonEmptyString2, buildEndpointUrl, validatePayload;
var init_notification = __esm({
  "server/_core/notification.ts"() {
    "use strict";
    init_env();
    TITLE_MAX_LENGTH = 1200;
    CONTENT_MAX_LENGTH = 2e4;
    trimValue = (value) => value.trim();
    isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
    buildEndpointUrl = (baseUrl) => {
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      return new URL(
        "webdevtoken.v1.WebDevService/SendNotification",
        normalizedBase
      ).toString();
    };
    validatePayload = (input) => {
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
  generatePasswordResetToken: () => generatePasswordResetToken,
  hashPassword: () => hashPassword,
  resetPassword: () => resetPassword,
  setUserPassword: () => setUserPassword,
  verifyPassword: () => verifyPassword,
  verifyPasswordResetToken: () => verifyPasswordResetToken
});
import bcrypt2 from "bcryptjs";
import crypto from "crypto";
import { eq as eq3, and as and2, gt } from "drizzle-orm";
async function hashPassword(password) {
  return bcrypt2.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt2.compare(password, hash);
}
async function authenticateWithPassword(email, password) {
  const db = await getDb();
  if (!db) {
    console.error("[PasswordAuth] Database not available");
    return null;
  }
  try {
    const result = await db.select().from(users).where(eq3(users.email, email)).limit(1);
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
    const result = await db.select().from(users).where(eq3(users.email, email)).limit(1);
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
        eq3(passwordResetTokens.token, token),
        eq3(passwordResetTokens.used, 0),
        gt(passwordResetTokens.expiresAt, now)
      )
    ).limit(1);
    if (result.length === 0) {
      console.log("[PasswordAuth] Invalid or expired token");
      return null;
    }
    const resetToken = result[0];
    await db.update(passwordResetTokens).set({ used: 1 }).where(eq3(passwordResetTokens.id, resetToken.id));
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
    }).where(eq3(users.id, userId));
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
var SALT_ROUNDS, RESET_TOKEN_EXPIRY_HOURS;
var init_passwordAuth = __esm({
  "server/passwordAuth.ts"() {
    "use strict";
    init_db();
    init_schema();
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

// server/_core/email.ts
var email_exports = {};
__export(email_exports, {
  sendEventInvitation: () => sendEventInvitation
});
async function sendEventInvitation(params) {
  if (!ENV.resendApiKey) {
    console.warn("[Email] Resend API key not configured, skipping email send");
    return false;
  }
  const { to, recipientName, eventTitle, eventDate, eventLocation, eventDescription, rsvpUrl } = params;
  const formattedDate = new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(eventDate);
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inbjudan till ${eventTitle}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #003366 0%, #0066cc 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Inbjudan till evenemang</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hej ${recipientName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Du \xE4r inbjuden till f\xF6ljande evenemang:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0066cc;">
      <h2 style="margin: 0 0 15px 0; color: #003366; font-size: 20px;">${eventTitle}</h2>
      
      <p style="margin: 10px 0; font-size: 15px;">
        <strong>\u{1F4C5} Datum:</strong> ${formattedDate}
      </p>
      
      ${eventLocation ? `
      <p style="margin: 10px 0; font-size: 15px;">
        <strong>\u{1F4CD} Plats:</strong> ${eventLocation}
      </p>
      ` : ""}
      
      ${eventDescription ? `
      <p style="margin: 15px 0 0 0; font-size: 15px; color: #666;">
        ${eventDescription}
      </p>
      ` : ""}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${rsvpUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Anm\xE4l dig h\xE4r
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      Med v\xE4nliga h\xE4lsningar,<br>
      <strong>F\xF6reningen Gamla SSK-are</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p>Detta \xE4r ett automatiskt meddelande fr\xE5n F\xF6reningen Gamla SSK-are.</p>
  </div>
</body>
</html>
  `;
  const textContent = `
Hej ${recipientName},

Du \xE4r inbjuden till f\xF6ljande evenemang:

${eventTitle}
Datum: ${formattedDate}
${eventLocation ? `Plats: ${eventLocation}` : ""}

${eventDescription || ""}

Anm\xE4l dig h\xE4r: ${rsvpUrl}

Med v\xE4nliga h\xE4lsningar,
F\xF6reningen Gamla SSK-are
  `.trim();
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "F\xF6reningen Gamla SSK-are <noreply@notifications.manus.im>",
        to: [to],
        subject: `Inbjudan: ${eventTitle}`,
        html: htmlContent,
        text: textContent
      })
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Failed to send invitation:", error);
      return false;
    }
    const result = await response.json();
    console.log("[Email] Invitation sent successfully:", result);
    return true;
  } catch (error) {
    console.error("[Email] Error sending invitation:", error);
    return false;
  }
}
var init_email = __esm({
  "server/_core/email.ts"() {
    "use strict";
    init_env();
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
import { eq as eq4 } from "drizzle-orm";
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
          const existing = await db.select().from(users).where(eq4(users.personnummer, row.personnummer)).limit(1);
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
          const existing = await db.select().from(users).where(eq4(users.email, row.email)).limit(1);
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
  const members = await db.select().from(users).where(eq4(users.membershipStatus, "active"));
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
import { eq as eq6, and as and3, gte as gte2, desc as desc4, sql as sql4 } from "drizzle-orm";
async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(events).where(eq6(events.status, "published")).orderBy(events.eventDate);
  return result;
}
async function getUpcomingEvents2(limit) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  let query = db.select().from(events).where(
    and3(
      eq6(events.status, "published"),
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
  const result = await db.select().from(events).where(eq6(events.id, eventId)).limit(1);
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
  await db.update(events).set(updates).where(eq6(events.id, eventId));
  const updated = await getEventById(eventId);
  if (!updated) throw new Error("Failed to retrieve updated event");
  return updated;
}
async function deleteEvent(eventId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq6(events.id, eventId));
}
async function getEventRegistrations(eventId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(eventRegistrations).where(eq6(eventRegistrations.eventId, eventId)).orderBy(desc4(eventRegistrations.registeredAt));
  return result;
}
async function getEventRegistrationCount(eventId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql4`count(*)` }).from(eventRegistrations).where(
    and3(
      eq6(eventRegistrations.eventId, eventId),
      eq6(eventRegistrations.status, "registered")
    )
  );
  return result[0]?.count || 0;
}
async function isUserRegistered(eventId, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(eventRegistrations).where(
    and3(
      eq6(eventRegistrations.eventId, eventId),
      eq6(eventRegistrations.userId, userId),
      eq6(eventRegistrations.status, "registered")
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
        const registration2 = await db.select().from(eventRegistrations).where(eq6(eventRegistrations.id, Number(insertedId2))).limit(1);
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
  const registration = await db.select().from(eventRegistrations).where(eq6(eventRegistrations.id, Number(insertedId))).limit(1);
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
      eq6(eventRegistrations.eventId, eventId),
      eq6(eventRegistrations.userId, userId)
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
  }).from(events).innerJoin(eventRegistrations, eq6(events.id, eventRegistrations.eventId)).where(
    and3(
      eq6(eventRegistrations.userId, userId),
      eq6(eventRegistrations.status, "registered")
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
import "dotenv/config";
import express2 from "express";
import cookieParser from "cookie-parser";
import passport2 from "passport";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/oauth.ts
init_const();
init_db();

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

// server/_core/oauth.ts
init_sdk();
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/passwordAuth.ts
init_const();
init_db();
import bcrypt from "bcryptjs";
import { SignJWT as SignJWT2, jwtVerify as jwtVerify2 } from "jose";
init_env();
var SUPERADMIN_EMAIL = "thomas.soderberg@gmail.com";
function getSessionSecret() {
  return new TextEncoder().encode(ENV.cookieSecret);
}
async function createSessionToken(openId, name) {
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1e3);
  return new SignJWT2({ openId, appId: ENV.appId || "gamla-ssk", name }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(getSessionSecret());
}
async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify2(token, getSessionSecret(), {
      algorithms: ["HS256"]
    });
    const { openId, appId, name } = payload;
    if (typeof openId !== "string" || typeof appId !== "string" || typeof name !== "string")
      return null;
    return { openId, appId, name };
  } catch {
    return null;
  }
}
function registerPasswordAuthRoutes(app) {
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "E-post och l\xF6senord kr\xE4vs" });
      return;
    }
    try {
      const user = await getUserByEmail(email.toLowerCase().trim());
      if (!user || !user.password) {
        res.status(401).json({ error: "Felaktig e-post eller l\xF6senord" });
        return;
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ error: "Felaktig e-post eller l\xF6senord" });
        return;
      }
      const token = await createSessionToken(
        user.openId,
        user.name || user.email || ""
      );
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      await upsertUser({ openId: user.openId, lastSignedIn: /* @__PURE__ */ new Date() });
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Inloggning misslyckades" });
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Namn, e-post och l\xF6senord kr\xE4vs" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "L\xF6senordet m\xE5ste vara minst 8 tecken" });
      return;
    }
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const existing = await getUserByEmail(normalizedEmail);
      if (existing) {
        res.status(409).json({ error: "E-postadressen \xE4r redan registrerad" });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const openId = `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const role = normalizedEmail === SUPERADMIN_EMAIL ? "admin" : "user";
      await upsertUser({
        openId,
        email: normalizedEmail,
        name,
        password: hashedPassword,
        loginMethod: "email",
        role,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const user = await getUserByEmail(normalizedEmail);
      if (!user) throw new Error("User creation failed");
      const token = await createSessionToken(openId, name);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registrering misslyckades" });
    }
  });
  app.post("/api/auth/change-password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { parse: parseCookies } = await import("cookie");
    const cookies = parseCookies(req.headers.cookie || "");
    const session = await verifySessionToken(cookies[COOKIE_NAME]);
    if (!session) {
      res.status(401).json({ error: "Inte inloggad" });
      return;
    }
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Nuvarande och nytt l\xF6senord kr\xE4vs" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "Nytt l\xF6senord m\xE5ste vara minst 8 tecken" });
      return;
    }
    try {
      const user = await getUserByOpenId(session.openId);
      if (!user || !user.password) {
        res.status(404).json({ error: "Anv\xE4ndare hittades inte" });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        res.status(401).json({ error: "Felaktigt nuvarande l\xF6senord" });
        return;
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await upsertUser({ openId: user.openId, password: hashedPassword });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Change password failed", error);
      res.status(500).json({ error: "L\xF6senordsbyte misslyckades" });
    }
  });
}
async function authenticateRequest(req) {
  const { parse: parseCookies } = await import("cookie");
  const cookies = parseCookies(req.headers.cookie || "");
  const session = await verifySessionToken(cookies[COOKIE_NAME]);
  if (!session) return null;
  const user = await getUserByOpenId(session.openId);
  return user ?? null;
}

// server/_core/index.ts
init_googleAuth();

// server/routers.ts
init_const();

// server/_core/systemRouter.ts
init_notification();
import { z } from "zod";

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
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/routers/implementationTasks.ts
import { z as z2 } from "zod";
init_db();
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";
var implementationTasksRouter = router({
  // Get all tasks
  list: publicProcedure.query(async () => {
    return await getAllImplementationTasks();
  }),
  // Get tasks by phase
  listByPhase: publicProcedure.input(z2.object({ phase: z2.string() })).query(async ({ input }) => {
    return await getImplementationTasksByPhase(input.phase);
  }),
  // Get task statistics
  stats: publicProcedure.query(async () => {
    const tasks = await getAllImplementationTasks();
    const total = tasks.length;
    const completed = tasks.filter((t2) => t2.status === "completed").length;
    const inProgress = tasks.filter((t2) => t2.status === "in_progress").length;
    const pending = tasks.filter((t2) => t2.status === "pending").length;
    const phases = Array.from(new Set(tasks.map((t2) => t2.phase)));
    const phaseStats = phases.map((phase) => {
      const phaseTasks = tasks.filter((t2) => t2.phase === phase);
      return {
        phase,
        total: phaseTasks.length,
        completed: phaseTasks.filter((t2) => t2.status === "completed").length,
        inProgress: phaseTasks.filter((t2) => t2.status === "in_progress").length,
        pending: phaseTasks.filter((t2) => t2.status === "pending").length,
        progress: Math.round(phaseTasks.filter((t2) => t2.status === "completed").length / phaseTasks.length * 100)
      };
    });
    return {
      total,
      completed,
      inProgress,
      pending,
      progress: total > 0 ? Math.round(completed / total * 100) : 0,
      phases: phaseStats
    };
  }),
  // Toggle task status (admin only)
  toggleStatus: adminProcedure.input(z2.object({
    taskId: z2.number(),
    status: z2.enum(["pending", "in_progress", "completed"])
  })).mutation(async ({ input, ctx }) => {
    return await updateImplementationTaskStatus(input.taskId, input.status, ctx.user?.id);
  }),
  // Bulk create tasks (admin only, for initial setup)
  bulkCreate: adminProcedure.input(z2.array(z2.object({
    phase: z2.string(),
    title: z2.string(),
    description: z2.string().optional(),
    estimatedHours: z2.number().optional(),
    priority: z2.enum(["high", "medium", "low"]).default("medium"),
    order: z2.number().default(0)
  }))).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const results = await db.insert(implementationTasks).values(input);
    return { success: true, count: input.length };
  }),
  // Delete task (admin only)
  delete: adminProcedure.input(z2.object({ taskId: z2.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(implementationTasks).where(eq2(implementationTasks.id, input.taskId));
    return { success: true };
  })
});

// server/routers.ts
init_schema();
init_storage();
import { z as z3 } from "zod";
import { desc as desc3, eq as eq5, isNotNull, gte, sql as sql3 } from "drizzle-orm";
import crypto3 from "crypto";
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  implementationTasks: implementationTasksRouter,
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
        password: true,
        // Password-based login for registered members
        manus: true
      };
    }),
    // Password-based login
    loginWithPassword: publicProcedure.input(z3.object({
      email: z3.string().email(),
      password: z3.string().min(6)
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
    requestPasswordReset: publicProcedure.input(z3.object({
      email: z3.string().email()
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
    resetPassword: publicProcedure.input(z3.object({
      token: z3.string(),
      newPassword: z3.string().min(8)
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
    setPassword: protectedProcedure.input(z3.object({
      password: z3.string().min(8)
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
      z3.object({
        title: z3.string().min(1),
        content: z3.string().min(1),
        imageUrl: z3.string().optional(),
        publishedAt: z3.date().optional()
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
      z3.object({
        id: z3.number(),
        title: z3.string().min(1).optional(),
        content: z3.string().min(1).optional(),
        imageUrl: z3.string().optional(),
        publishedAt: z3.date().optional()
      })
    ).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(news).set(data).where(eq5(news.id, id));
      return { success: true };
    }),
    delete: manageNewsProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(news).where(eq5(news.id, input.id));
      return { success: true };
    })
  }),
  membership: router({
    submit: publicProcedure.input(
      z3.object({
        name: z3.string().min(1),
        email: z3.string().email(),
        phone: z3.string().optional(),
        message: z3.string().optional()
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
      z3.object({
        id: z3.number(),
        status: z3.enum(["pending", "approved", "rejected"])
      })
    ).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(membershipApplications).set({ status: input.status }).where(eq5(membershipApplications.id, input.id));
      return { success: true };
    })
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => {
      return ctx.user;
    }),
    update: protectedProcedure.input(
      z3.object({
        name: z3.string().optional(),
        email: z3.string().email().optional(),
        phone: z3.string().optional(),
        streetAddress: z3.string().optional(),
        postalCode: z3.string().optional(),
        city: z3.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(users).set(input).where(eq5(users.id, ctx.user.id));
      return { success: true };
    })
  }),
  roles: router({
    // Get all roles
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      return await db.select().from(roles);
    }),
    // Create new role (huvudadmin only)
    create: protectedProcedure.input(z3.object({
      name: z3.string().min(1),
      description: z3.string().optional(),
      permissions: z3.array(z3.string())
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq5(roles.id, user[0].roleId)).limit(1);
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
    update: protectedProcedure.input(z3.object({
      id: z3.number(),
      name: z3.string().optional(),
      description: z3.string().optional(),
      permissions: z3.array(z3.string()).optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq5(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can update roles" });
      }
      const updateData = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== void 0) updateData.description = input.description;
      if (input.permissions) updateData.permissions = input.permissions;
      await db.update(roles).set(updateData).where(eq5(roles.id, input.id));
      return { success: true };
    }),
    // Delete role (huvudadmin only, cannot delete system roles)
    delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq5(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can delete roles" });
      }
      const roleToDelete = await db.select().from(roles).where(eq5(roles.id, input.id)).limit(1);
      if (roleToDelete[0] && roleToDelete[0].isCustom === 0) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Cannot delete system roles" });
      }
      await db.delete(roles).where(eq5(roles.id, input.id));
      return { success: true };
    })
  }),
  userManagement: router({
    // List all users (huvudadmin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq5(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can view all users" });
      }
      return await db.select().from(users);
    }),
    // Assign role to user (huvudadmin only)
    assignRole: protectedProcedure.input(z3.object({
      userId: z3.number(),
      roleId: z3.number()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const userRole = await db.select().from(roles).where(eq5(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== "huvudadmin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Only huvudadmin can assign roles" });
      }
      await db.update(users).set({ roleId: input.roleId }).where(eq5(users.id, input.userId));
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
    byCategory: publicProcedure.input(z3.object({ category: z3.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(galleryPhotos).where(eq5(galleryPhotos.category, input.category)).orderBy(desc3(galleryPhotos.createdAt));
    }),
    // Upload photo with automatic compression (admin only)
    upload: protectedProcedure.input(z3.object({
      title: z3.string().min(1),
      description: z3.string().optional(),
      category: z3.string().optional(),
      imageBase64: z3.string()
      // Base64 encoded image
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
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
    create: protectedProcedure.input(z3.object({
      title: z3.string().min(1),
      description: z3.string().optional(),
      imageUrl: z3.string().url(),
      category: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
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
    update: protectedProcedure.input(z3.object({
      id: z3.number(),
      title: z3.string().optional(),
      description: z3.string().optional(),
      category: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const { id, ...updateData } = input;
      await db.update(galleryPhotos).set(updateData).where(eq5(galleryPhotos.id, id));
      return { success: true };
    }),
    // Delete photo (admin only)
    delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      await db.delete(galleryPhotos).where(eq5(galleryPhotos.id, input.id));
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
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      return await db.select().from(events).orderBy(desc3(events.eventDate));
    }),
    // Create event (admin only)
    create: protectedProcedure.input(z3.object({
      title: z3.string().min(1),
      description: z3.string().optional(),
      eventDate: z3.date(),
      eventTime: z3.string().optional(),
      location: z3.string().optional(),
      type: z3.string().optional(),
      maxParticipants: z3.number().optional(),
      registrationDeadline: z3.date().optional(),
      status: z3.enum(["draft", "published", "cancelled", "completed"]).optional(),
      allowWaitlist: z3.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
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
    update: protectedProcedure.input(z3.object({
      id: z3.number(),
      title: z3.string().optional(),
      description: z3.string().optional(),
      eventDate: z3.date().optional(),
      eventTime: z3.string().optional(),
      location: z3.string().optional(),
      type: z3.string().optional(),
      maxParticipants: z3.number().optional(),
      registrationDeadline: z3.date().optional(),
      status: z3.enum(["draft", "published", "cancelled", "completed"]).optional(),
      allowWaitlist: z3.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const { id, allowWaitlist, ...updateData } = input;
      await db.update(events).set({
        ...updateData,
        ...allowWaitlist !== void 0 ? { allowWaitlist: allowWaitlist ? 1 : 0 } : {}
      }).where(eq5(events.id, id));
      return { success: true };
    }),
    // Delete event (admin only)
    delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      await db.delete(events).where(eq5(events.id, input.id));
      return { success: true };
    }),
    // Get event with registrations (admin only)
    getWithRegistrations: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      return await getEventWithRegistrations(input.id);
    }),
    // Register for event (authenticated users)
    register: protectedProcedure.input(z3.object({
      eventId: z3.number(),
      notes: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { eventRegistrations: eventRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const event = await db.select().from(events).where(eq5(events.id, input.eventId)).limit(1);
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
        await db.update(eventRegistrations2).set({ status, notes: input.notes, registeredAt: /* @__PURE__ */ new Date(), cancelledAt: null }).where(eq5(eventRegistrations2.id, existing.id));
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
    cancelRegistration: protectedProcedure.input(z3.object({ eventId: z3.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { eventRegistrations: eventRegistrations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const registration = await getUserEventRegistration(input.eventId, ctx.user.id);
      if (!registration) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Ingen anm\xE4lan hittades" });
      }
      await db.update(eventRegistrations2).set({ status: "cancelled", cancelledAt: /* @__PURE__ */ new Date() }).where(eq5(eventRegistrations2.id, registration.id));
      return { success: true };
    }),
    // Get user's registered events
    myEvents: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRegisteredEvents(ctx.user.id);
    }),
    // Get user's registration status for an event
    myRegistration: protectedProcedure.input(z3.object({ eventId: z3.number() })).query(async ({ ctx, input }) => {
      return await getUserEventRegistration(input.eventId, ctx.user.id);
    }),
    // Send event invitations (admin only)
    sendInvitations: protectedProcedure.input(z3.object({
      eventId: z3.number(),
      recipientGroups: z3.array(z3.string())
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const user = await db.select().from(users).where(eq5(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      let recipients = [];
      for (const group of input.recipientGroups) {
        if (group === "all_active") {
          const allActive = await db.select().from(users).where(isNotNull(users.email));
          recipients.push(...allActive);
        } else if (group === "board") {
          const boardMembers2 = await db.select().from(users).where(eq5(users.role, "admin"));
          recipients.push(...boardMembers2);
        } else if (group === "paid_current_year") {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          const paidMembers = await db.select().from(users).where(isNotNull(users.email));
          recipients.push(...paidMembers);
        } else if (group === "not_paid") {
          const notPaidMembers = await db.select().from(users).where(isNotNull(users.email));
          recipients.push(...notPaidMembers);
        }
      }
      const uniqueRecipients = Array.from(new Set(recipients.map((r) => r.id))).map((id) => recipients.find((r) => r.id === id));
      const event = await db.select().from(events).where(eq5(events.id, input.eventId)).limit(1);
      if (event.length === 0) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Evenemang hittades inte" });
      }
      const eventData = event[0];
      const { sendEventInvitation: sendEventInvitation2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      let sentCount = 0;
      let failedCount = 0;
      for (const recipient of uniqueRecipients) {
        if (!recipient?.email) continue;
        const rsvpUrl = `${process.env.VITE_OAUTH_PORTAL_URL || "https://3000-ipo4eocgiqzv8iuvjeh1f-a13ca33c.us2.manus.computer"}/calendar?event=${eventData.id}`;
        const success = await sendEventInvitation2({
          to: recipient.email,
          recipientName: recipient.name || "Medlem",
          eventTitle: eventData.title,
          eventDate: new Date(eventData.eventDate),
          eventLocation: eventData.location || void 0,
          eventDescription: eventData.description || void 0,
          rsvpUrl
        });
        if (success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }
      return { success: true, sentCount, failedCount };
    })
  }),
  cms: router({
    // Get all content for a specific page (public)
    getPageContent: publicProcedure.input(z3.object({ page: z3.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(pageContent).where(eq5(pageContent.page, input.page)).orderBy(pageContent.order);
    }),
    // Get all page content (admin)
    getAllContent: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(pageContent).orderBy(pageContent.page, pageContent.order);
    }),
    // Update page content (admin)
    updateContent: adminProcedure.input(z3.object({
      id: z3.number(),
      content: z3.string().optional(),
      order: z3.number().optional(),
      published: z3.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { id, ...updateData } = input;
      await db.update(pageContent).set({ ...updateData, updatedBy: ctx.user.id }).where(eq5(pageContent.id, id));
      return { success: true };
    }),
    // Create new content section (admin)
    createContent: adminProcedure.input(z3.object({
      page: z3.string(),
      sectionKey: z3.string(),
      type: z3.string(),
      content: z3.string(),
      order: z3.number().default(0)
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(pageContent).values({
        ...input,
        updatedBy: ctx.user.id
      });
      return { success: true };
    }),
    updatePageContent: protectedProcedure.input(z3.object({ id: z3.number(), content: z3.string().nullable() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [current] = await db.select().from(pageContent).where(eq5(pageContent.id, input.id)).limit(1);
      if (current) {
        await db.insert(contentHistory).values({
          contentId: input.id,
          content: current.content,
          updatedBy: ctx.user.id
        });
      }
      await db.update(pageContent).set({ content: input.content }).where(eq5(pageContent.id, input.id));
      return { success: true };
    }),
    getContentHistory: protectedProcedure.input(z3.object({ contentId: z3.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const history = await db.select({
        id: contentHistory.id,
        content: contentHistory.content,
        createdAt: contentHistory.createdAt,
        updatedBy: contentHistory.updatedBy,
        userName: users.name
      }).from(contentHistory).leftJoin(users, eq5(contentHistory.updatedBy, users.id)).where(eq5(contentHistory.contentId, input.contentId)).orderBy(desc3(contentHistory.createdAt)).limit(20);
      return history;
    }),
    restoreContentVersion: protectedProcedure.input(z3.object({ contentId: z3.number(), historyId: z3.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [history] = await db.select().from(contentHistory).where(eq5(contentHistory.id, input.historyId)).limit(1);
      if (!history) throw new TRPCError3({ code: "NOT_FOUND", message: "History not found" });
      const [current] = await db.select().from(pageContent).where(eq5(pageContent.id, input.contentId)).limit(1);
      if (current) {
        await db.insert(contentHistory).values({
          contentId: input.contentId,
          content: current.content,
          updatedBy: ctx.user.id
        });
      }
      await db.update(pageContent).set({ content: history.content }).where(eq5(pageContent.id, input.contentId));
      return { success: true };
    }),
    // Delete content section (admin)
    deleteContent: adminProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.delete(pageContent).where(eq5(pageContent.id, input.id));
      return { success: true };
    }),
    // Get site settings (public)
    getSettings: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(siteSettings);
    }),
    // Update site setting (admin)
    updateSetting: adminProcedure.input(z3.object({
      key: z3.string(),
      value: z3.string(),
      type: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const existing = await db.select().from(siteSettings).where(eq5(siteSettings.key, input.key)).limit(1);
      if (existing.length > 0) {
        await db.update(siteSettings).set({ value: input.value, type: input.type, updatedBy: ctx.user.id }).where(eq5(siteSettings.key, input.key));
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
      return await db.select().from(boardMembers).where(eq5(boardMembers.active, 1)).orderBy(boardMembers.order);
    }),
    getAllBoardMembers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      return await db.select().from(boardMembers).orderBy(boardMembers.order);
    }),
    createBoardMember: adminProcedure.input(z3.object({
      name: z3.string(),
      role: z3.string(),
      phone: z3.string().optional(),
      email: z3.string().optional(),
      photo: z3.string().optional(),
      order: z3.number().default(0)
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(boardMembers).values(input);
      return { success: true };
    }),
    updateBoardMember: adminProcedure.input(z3.object({
      id: z3.number(),
      name: z3.string().optional(),
      role: z3.string().optional(),
      phone: z3.string().optional(),
      email: z3.string().optional(),
      photo: z3.string().optional(),
      order: z3.number().optional(),
      active: z3.number().optional()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { id, ...updateData } = input;
      await db.update(boardMembers).set(updateData).where(eq5(boardMembers.id, id));
      return { success: true };
    }),
    deleteBoardMember: adminProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.delete(boardMembers).where(eq5(boardMembers.id, input.id));
      return { success: true };
    })
  }),
  upload: router({
    image: publicProcedure.input(z3.object({
      filename: z3.string(),
      contentType: z3.string(),
      data: z3.string()
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
    list: manageUsersProcedure.input(z3.object({
      status: z3.enum(["pending", "active", "inactive"]).optional(),
      memberType: z3.enum(["ordinarie", "hedersmedlem", "stodmedlem"]).optional(),
      paymentStatus: z3.enum(["paid", "unpaid", "exempt"]).optional(),
      search: z3.string().optional()
    }).optional()).query(async ({ input }) => {
      const { getMembers: getMembers2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return await getMembers2(input);
    }),
    // Get member by ID (admin only)
    getById: manageUsersProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
      const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const member = await getMemberById2(input.id);
      if (!member) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Member not found" });
      }
      return member;
    }),
    // Update member (admin only)
    update: manageUsersProcedure.input(z3.object({
      id: z3.number(),
      name: z3.string().optional(),
      email: z3.string().email().optional(),
      phone: z3.string().optional(),
      personnummer: z3.string().optional(),
      streetAddress: z3.string().optional(),
      postalCode: z3.string().optional(),
      city: z3.string().optional(),
      membershipStatus: z3.enum(["pending", "active", "inactive"]).optional(),
      membershipNumber: z3.string().optional(),
      joinYear: z3.number().optional(),
      memberType: z3.enum(["ordinarie", "hedersmedlem", "stodmedlem"]).optional(),
      paymentStatus: z3.enum(["paid", "unpaid", "exempt"]).optional(),
      paymentYear: z3.number().optional(),
      showInDirectory: z3.number().optional()
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
    importCSV: manageUsersProcedure.input(z3.object({ csvData: z3.string() })).mutation(async ({ input }) => {
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
    sendPaymentReminder: manageUsersProcedure.input(z3.object({ memberId: z3.number() })).mutation(async ({ input }) => {
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
    }),
    // Set password for member (admin only)
    setPassword: manageUsersProcedure.input(z3.object({
      memberId: z3.number(),
      password: z3.string().min(6)
    })).mutation(async ({ input }) => {
      const { setUserPassword: setUserPassword2 } = await Promise.resolve().then(() => (init_passwordAuth(), passwordAuth_exports));
      const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const member = await getMemberById2(input.memberId);
      if (!member) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Member not found" });
      }
      await setUserPassword2(input.memberId, input.password);
      return { success: true, message: "L\xF6senord skapat" };
    }),
    // Reset password for member (admin only) - generates temporary password
    resetPassword: manageUsersProcedure.input(z3.object({ memberId: z3.number() })).mutation(async ({ input }) => {
      const { setUserPassword: setUserPassword2 } = await Promise.resolve().then(() => (init_passwordAuth(), passwordAuth_exports));
      const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const member = await getMemberById2(input.memberId);
      if (!member) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Member not found" });
      }
      const tempPassword = crypto3.randomBytes(8).toString("hex");
      await setUserPassword2(input.memberId, tempPassword);
      return {
        success: true,
        tempPassword,
        message: "L\xF6senord \xE5terst\xE4llt. Tempor\xE4rt l\xF6senord genererat."
      };
    })
  }),
  // Documents router for PDF upload and sharing
  documents: router({
    // List all documents (with access control)
    list: publicProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (!ctx.user) {
        return db.select().from(documents).where(eq5(documents.accessLevel, "public")).orderBy(desc3(documents.createdAt));
      } else if (ctx.user.role !== "admin") {
        return db.select().from(documents).where(sql3`${documents.accessLevel} IN ('public', 'members_only')`).orderBy(desc3(documents.createdAt));
      }
      return db.select().from(documents).orderBy(desc3(documents.createdAt));
    }),
    // Get documents by category
    byCategory: publicProcedure.input(z3.object({ category: z3.string() })).query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (!ctx.user) {
        return db.select().from(documents).where(sql3`${documents.category} = ${input.category} AND ${documents.accessLevel} = 'public'`).orderBy(desc3(documents.createdAt));
      } else if (ctx.user.role !== "admin") {
        return db.select().from(documents).where(sql3`${documents.category} = ${input.category} AND ${documents.accessLevel} IN ('public', 'members_only')`).orderBy(desc3(documents.createdAt));
      }
      return db.select().from(documents).where(eq5(documents.category, input.category)).orderBy(desc3(documents.createdAt));
    }),
    // Upload document (admin only)
    upload: adminProcedure.input(z3.object({
      title: z3.string(),
      description: z3.string().optional(),
      fileData: z3.string(),
      // Base64 encoded PDF
      fileName: z3.string(),
      fileSize: z3.number(),
      category: z3.enum(["stadgar", "protokoll", "informationsblad", "arsmoten", "ovrigt"]),
      accessLevel: z3.enum(["public", "members_only", "admin_only"])
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
    // Update document metadata (admin only)
    update: adminProcedure.input(z3.object({
      id: z3.number(),
      title: z3.string(),
      description: z3.string().optional(),
      category: z3.enum(["stadgar", "protokoll", "informationsblad", "arsmoten", "ovrigt"]),
      accessLevel: z3.enum(["public", "members_only", "admin_only"])
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Databas inte tillg\xE4nglig" });
      const currentDoc = await db.select().from(documents).where(eq5(documents.id, input.id)).limit(1);
      if (currentDoc.length === 0) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Dokument hittades inte" });
      }
      const doc = currentDoc[0];
      const { documentVersions: documentVersions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const versions = await db.select().from(documentVersions2).where(eq5(documentVersions2.documentId, input.id)).orderBy(desc3(documentVersions2.versionNumber));
      const nextVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;
      await db.insert(documentVersions2).values({
        documentId: input.id,
        versionNumber: nextVersionNumber,
        title: doc.title,
        description: doc.description,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        category: doc.category,
        accessLevel: doc.accessLevel,
        updatedBy: ctx.user.id
      });
      await db.update(documents).set({
        title: input.title,
        description: input.description,
        category: input.category,
        accessLevel: input.accessLevel
      }).where(eq5(documents.id, input.id));
      return { success: true, versionNumber: nextVersionNumber };
    }),
    // Delete document (admin only)
    delete: adminProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Databas inte tillg\xE4nglig" });
      await db.delete(documents).where(eq5(documents.id, input.id));
      return { success: true };
    })
  }),
  // Payment confirmations router
  payments: router({
    // Get Swish number from settings
    getSwishNumber: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const setting = await db.select().from(siteSettings).where(eq5(siteSettings.key, "swish_number")).limit(1);
      return setting[0]?.value || "123 XXX XXXX";
    }),
    // Submit payment confirmation (authenticated users)
    submitConfirmation: protectedProcedure.input(z3.object({
      amount: z3.string(),
      paymentYear: z3.number(),
      receiptBase64: z3.string().optional(),
      notes: z3.string().optional()
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
      return await db.select().from(paymentConfirmations).where(eq5(paymentConfirmations.userId, ctx.user.id)).orderBy(desc3(paymentConfirmations.createdAt));
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
      }).from(paymentConfirmations).leftJoin(users, eq5(paymentConfirmations.userId, users.id)).orderBy(desc3(paymentConfirmations.createdAt));
      return payments;
    }),
    // Admin: Verify payment
    verify: adminProcedure.input(z3.object({
      id: z3.number(),
      status: z3.enum(["verified", "rejected"])
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.update(paymentConfirmations).set({
        status: input.status,
        verifiedBy: ctx.user.id,
        verifiedAt: /* @__PURE__ */ new Date()
      }).where(eq5(paymentConfirmations.id, input.id));
      if (input.status === "verified") {
        const payment = await db.select().from(paymentConfirmations).where(eq5(paymentConfirmations.id, input.id)).limit(1);
        if (payment[0]) {
          await db.update(users).set({
            paymentStatus: "paid",
            paymentYear: payment[0].paymentYear
          }).where(eq5(users.id, payment[0].userId));
        }
      }
      return { success: true };
    })
  }),
  // Contact form
  contact: router({
    submit: publicProcedure.input(z3.object({
      name: z3.string().min(1, "Namn kr\xE4vs"),
      email: z3.string().email("Ogiltig e-postadress"),
      subject: z3.string().optional(),
      message: z3.string().min(1, "Meddelande kr\xE4vs")
    })).mutation(async ({ input }) => {
      const { notifyOwner: notifyOwner2 } = await Promise.resolve().then(() => (init_notification(), notification_exports));
      const title = `Nytt kontaktformul\xE4r: ${input.subject || "Inget \xE4mne"}`;
      const content = `
Fr\xE5n: ${input.name} (${input.email})
\xC4mne: ${input.subject || "Inget \xE4mne"}

Meddelande:
${input.message}
`;
      await notifyOwner2({ title, content });
      return { success: true };
    })
  }),
  // Banner management
  banners: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const now = /* @__PURE__ */ new Date();
      const allBanners = await db.select().from(banners).orderBy(banners.order, banners.createdAt);
      return allBanners.filter((banner) => {
        if (!banner.active) return false;
        if (banner.startDate && new Date(banner.startDate) > now) return false;
        if (banner.endDate && new Date(banner.endDate) < now) return false;
        return true;
      });
    }),
    listAll: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(banners).orderBy(banners.order, desc3(banners.createdAt));
    }),
    create: adminProcedure.input(z3.object({
      title: z3.string().min(1),
      content: z3.string().min(1),
      type: z3.enum(["info", "warning", "success", "event", "announcement"]),
      position: z3.enum(["top", "hero", "sidebar"]),
      linkUrl: z3.string().optional(),
      linkText: z3.string().optional(),
      startDate: z3.date().optional(),
      endDate: z3.date().optional(),
      order: z3.number().default(0)
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.insert(banners).values({
        ...input,
        createdBy: ctx.user.id,
        active: 1
      });
      return { success: true };
    }),
    update: adminProcedure.input(z3.object({
      id: z3.number(),
      title: z3.string().min(1),
      content: z3.string().min(1),
      type: z3.enum(["info", "warning", "success", "event", "announcement"]),
      position: z3.enum(["top", "hero", "sidebar"]),
      linkUrl: z3.string().optional(),
      linkText: z3.string().optional(),
      startDate: z3.date().optional(),
      endDate: z3.date().optional(),
      order: z3.number()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { id, ...data } = input;
      await db.update(banners).set(data).where(eq5(banners.id, id));
      return { success: true };
    }),
    delete: adminProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.delete(banners).where(eq5(banners.id, input.id));
      return { success: true };
    }),
    toggleActive: adminProcedure.input(z3.object({ id: z3.number(), active: z3.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.update(banners).set({ active: input.active }).where(eq5(banners.id, input.id));
      return { success: true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
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
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
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
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use(passport2.initialize());
  try {
    configureGoogleAuth();
  } catch (e) {
  }
  registerOAuthRoutes(app);
  registerPasswordAuthRoutes(app);
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
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
