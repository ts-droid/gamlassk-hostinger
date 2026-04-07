import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Unique login identifier for the account. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }), // Hashed password for email/password login
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "member"]).default("user").notNull(),
  roleId: int("roleId").references(() => roles.id),
  // Member profile fields
  phone: varchar("phone", { length: 20 }),
  personnummer: varchar("personnummer", { length: 13 }).unique(), // Format: YYYYMMDD-XXXX
  streetAddress: text("streetAddress"),
  postalCode: varchar("postalCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  membershipStatus: mysqlEnum("membershipStatus", ["pending", "active", "inactive"]).default("pending"),
  membershipNumber: varchar("membershipNumber", { length: 50 }).unique(),
  joinYear: int("joinYear"),
  memberType: mysqlEnum("memberType", ["ordinarie", "hedersmedlem", "stodmedlem"]).default("ordinarie"),
  paymentStatus: mysqlEnum("paymentStatus", ["paid", "unpaid", "exempt"]).default("unpaid"),
  paymentYear: int("paymentYear"),
  showInDirectory: int("showInDirectory").notNull().default(1), // 1 = visible, 0 = hidden
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Roles table for role-based access control
 */
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  permissions: json("permissions").$type<string[]>().notNull(),
  isCustom: int("isCustom").notNull().default(1), // 1 for custom, 0 for system roles
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

/**
 * News articles table for managing news posts
 */
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  authorId: int("authorId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

/**
 * Membership applications table
 */
export const membershipApplications = mysqlTable("membership_applications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembershipApplication = typeof membershipApplications.$inferSelect;
export type InsertMembershipApplication = typeof membershipApplications.$inferInsert;

/**
 * Gallery photos table for photo gallery
 */
export const galleryPhotos = mysqlTable("gallery_photos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(), // Legacy field, kept for backwards compatibility
  thumbnailUrl: text("thumbnailUrl"), // 300x300px thumbnail
  mediumUrl: text("mediumUrl"), // 800px width medium size
  originalUrl: text("originalUrl"), // Original full-size image
  category: varchar("category", { length: 100 }),
  tags: json("tags").$type<string[]>(),
  uploadedBy: int("uploadedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = typeof galleryPhotos.$inferInsert;

/**
 * Events table for calendar/events page with registration support
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  eventTime: varchar("eventTime", { length: 10 }), // e.g., "18:00"
  location: varchar("location", { length: 255 }),
  type: varchar("type", { length: 100 }), // e.g., "Vårfest", "Bingo", "Match"
  maxParticipants: int("maxParticipants"), // null = unlimited
  registrationDeadline: timestamp("registrationDeadline"),
  status: mysqlEnum("status", ["draft", "published", "cancelled", "completed"]).default("published").notNull(),
  allowWaitlist: int("allowWaitlist").default(0).notNull(), // 1 = allow, 0 = don't allow
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event registrations table for tracking participant sign-ups
 */
export const eventRegistrations = mysqlTable("event_registrations", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: mysqlEnum("status", ["registered", "waitlist", "cancelled"]).default("registered").notNull(),
  notes: text("notes"), // Optional notes from participant
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
});

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

/**
 * Payment confirmations table for tracking member payments
 */
export const paymentConfirmations = mysqlTable("payment_confirmations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: varchar("amount", { length: 20 }).notNull(), // Store as string to avoid decimal issues
  paymentType: varchar("paymentType", { length: 50 }).notNull().default("membership_fee"),
  paymentYear: int("paymentYear").notNull(),
  receiptUrl: text("receiptUrl"),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  notes: text("notes"),
  verifiedBy: int("verifiedBy").references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentConfirmation = typeof paymentConfirmations.$inferSelect;
export type InsertPaymentConfirmation = typeof paymentConfirmations.$inferInsert;

/**
 * Page content table for CMS - stores editable content for each page section
 */
export const pageContent = mysqlTable("page_content", {
  id: int("id").autoincrement().primaryKey(),
  page: varchar("page", { length: 100 }).notNull(), // e.g., "home", "statutes"
  sectionKey: varchar("sectionKey", { length: 100 }).notNull(), // e.g., "hero", "about", "news"
  type: varchar("type", { length: 50 }).notNull(), // e.g., "text", "image", "html"
  content: text("content"), // The actual content
  order: int("order").default(0).notNull(),
  published: int("published").default(1).notNull(), // 1 = published, 0 = draft
  updatedBy: int("updatedBy").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageContent = typeof pageContent.$inferSelect;
export type InsertPageContent = typeof pageContent.$inferInsert;

/**
 * Site settings table for global configuration (logo, contact info, etc.)
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., "site_logo", "contact_email"
  value: text("value").notNull(),
  type: varchar("type", { length: 50 }).default("text").notNull(), // "text", "image", "json"
  updatedBy: int("updatedBy").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/**
 * Board members table for managing styrelse information
 */
export const boardMembers = mysqlTable("board_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(), // e.g., "Ordförande", "Sekreterare"
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  photo: text("photo"), // URL to photo
  order: int("order").default(0).notNull(),
  active: int("active").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BoardMember = typeof boardMembers.$inferSelect;
export type InsertBoardMember = typeof boardMembers.$inferInsert;

/**
 * Content history table for version control
 */
export const contentHistory = mysqlTable("content_history", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull().references(() => pageContent.id, { onDelete: 'cascade' }),
  content: text("content"),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = typeof contentHistory.$inferInsert;

/**
 * Documents table for PDF file sharing
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"), // Size in bytes
  category: mysqlEnum("category", ["stadgar", "protokoll", "informationsblad", "arsmoten", "ovrigt"]).notNull(),
  accessLevel: mysqlEnum("accessLevel", ["public", "members_only", "admin_only"]).default("members_only").notNull(),
  uploadedBy: int("uploadedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Password reset tokens table for password recovery
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: int("used").notNull().default(0), // 0 = not used, 1 = used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
