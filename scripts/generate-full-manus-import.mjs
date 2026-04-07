import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const importsDir = path.join(projectRoot, "imports", "hostinger");
const usersCsvPath = "/Users/thomassoderberg/Downloads/users_20260406_192204.csv";
const usersSqlPath = path.join(importsDir, "users_20260406_192204.sql");
const outputPath = path.join(importsDir, "full_manus_import.sql");

const csvFiles = {
  roles: "/Users/thomassoderberg/Downloads/roles_20260406_224316.csv",
  news: "/Users/thomassoderberg/Downloads/news_20260406_224244.csv",
  galleryPhotos: "/Users/thomassoderberg/Downloads/gallery_photos_20260406_224216.csv",
  boardMembers: "/Users/thomassoderberg/Downloads/board_members_20260406_224054.csv",
  siteSettings: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK hemsida inställningar 2026-04-06.csv",
  pageContent: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK hemsida innehåll, 2026-04-06.csv",
  membershipApplications: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK medlemsansökningar 2026-04-06.csv",
  paymentConfirmations: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK Betalningsbekräftelser 2026-04-06.csv",
  events: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK Evenemang 2026-04-06.csv",
  eventRegistrations: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK Event Registrations 2026-04-06.csv",
  documents: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK Dokument 2026-04-06.csv",
  contentHistory: "/Users/thomassoderberg/Downloads/Gamla Södertälje SK Innehållshistorik 2026-04-06.csv",
};

const tableDefinitions = [
  `CREATE TABLE IF NOT EXISTS \`news\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`content\` text NOT NULL,
  \`imageUrl\` text NULL,
  \`authorId\` int NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`publishedAt\` timestamp NULL,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`membership_applications\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`email\` varchar(320) NOT NULL,
  \`phone\` varchar(20) NULL,
  \`message\` text NULL,
  \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`gallery_photos\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`description\` text NULL,
  \`imageUrl\` text NOT NULL,
  \`thumbnailUrl\` text NULL,
  \`mediumUrl\` text NULL,
  \`originalUrl\` text NULL,
  \`category\` varchar(100) NULL,
  \`uploadedBy\` int NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`events\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`description\` text NULL,
  \`eventDate\` timestamp NOT NULL,
  \`eventTime\` varchar(10) NULL,
  \`location\` varchar(255) NULL,
  \`type\` varchar(100) NULL,
  \`maxParticipants\` int NULL,
  \`registrationDeadline\` timestamp NULL,
  \`status\` enum('draft','published','cancelled','completed') NOT NULL DEFAULT 'published',
  \`allowWaitlist\` int NOT NULL DEFAULT 0,
  \`createdBy\` int NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`event_registrations\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`eventId\` int NOT NULL,
  \`userId\` int NOT NULL,
  \`status\` enum('registered','waitlist','cancelled') NOT NULL DEFAULT 'registered',
  \`notes\` text NULL,
  \`registeredAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`cancelledAt\` timestamp NULL,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`payment_confirmations\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`userId\` int NOT NULL,
  \`amount\` varchar(20) NOT NULL,
  \`paymentType\` varchar(50) NOT NULL DEFAULT 'membership_fee',
  \`paymentYear\` int NOT NULL,
  \`receiptUrl\` text NULL,
  \`status\` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  \`notes\` text NULL,
  \`verifiedBy\` int NULL,
  \`verifiedAt\` timestamp NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`page_content\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`page\` varchar(100) NOT NULL,
  \`sectionKey\` varchar(100) NOT NULL,
  \`type\` varchar(50) NOT NULL,
  \`content\` text NULL,
  \`order\` int NOT NULL DEFAULT 0,
  \`published\` int NOT NULL DEFAULT 1,
  \`updatedBy\` int NULL,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`site_settings\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`key\` varchar(100) NOT NULL,
  \`value\` text NOT NULL,
  \`type\` varchar(50) NOT NULL DEFAULT 'text',
  \`updatedBy\` int NULL,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`site_settings_key_unique\` (\`key\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`board_members\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`role\` varchar(255) NOT NULL,
  \`phone\` varchar(50) NULL,
  \`email\` varchar(320) NULL,
  \`photo\` text NULL,
  \`order\` int NOT NULL DEFAULT 0,
  \`active\` int NOT NULL DEFAULT 1,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`content_history\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`contentId\` int NOT NULL,
  \`content\` text NULL,
  \`updatedBy\` int NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
  `CREATE TABLE IF NOT EXISTS \`documents\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`description\` text NULL,
  \`fileUrl\` text NOT NULL,
  \`fileSize\` int NULL,
  \`category\` enum('stadgar','protokoll','informationsblad','arsmoten','ovrigt') NOT NULL,
  \`accessLevel\` enum('public','members_only','admin_only') NOT NULL DEFAULT 'members_only',
  \`uploadedBy\` int NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
);`,
].join("\n\n");

const tableImports = [
  {
    name: "roles",
    path: csvFiles.roles,
    columns: ["id", "name", "description", "permissions", "isCustom", "createdAt", "updatedAt"],
  },
  {
    name: "news",
    path: csvFiles.news,
    columns: ["id", "title", "content", "imageUrl", "authorId", "createdAt", "updatedAt", "publishedAt"],
  },
  {
    name: "gallery_photos",
    path: csvFiles.galleryPhotos,
    columns: ["id", "title", "description", "imageUrl", "category", "uploadedBy", "createdAt", "thumbnailUrl", "mediumUrl", "originalUrl"],
  },
  {
    name: "board_members",
    path: csvFiles.boardMembers,
    columns: ["id", "name", "role", "phone", "email", "photo", "order", "active", "createdAt", "updatedAt"],
  },
  {
    name: "site_settings",
    path: csvFiles.siteSettings,
    columns: ["id", "key", "value", "type", "updatedBy", "updatedAt"],
    transformRow: (row) => {
      const next = { ...row };
      if (row.key === "site_logo") {
        next.value = "/logo-wreath.png";
      }
      return next;
    },
    extraRows: [
      {
        id: "30002",
        key: "site_header_logo",
        value: "/logo-wreath.png",
        type: "image",
        updatedBy: "1",
        updatedAt: "2026-04-07 00:47:00",
      },
    ],
  },
  {
    name: "page_content",
    path: csvFiles.pageContent,
    columns: ["id", "page", "sectionKey", "type", "content", "order", "published", "updatedBy", "updatedAt"],
  },
  {
    name: "membership_applications",
    path: csvFiles.membershipApplications,
    columns: ["id", "name", "email", "phone", "message", "status", "createdAt", "updatedAt"],
  },
  {
    name: "payment_confirmations",
    path: csvFiles.paymentConfirmations,
    columns: ["id", "userId", "amount", "paymentType", "paymentYear", "receiptUrl", "status", "notes", "verifiedBy", "verifiedAt", "createdAt", "updatedAt"],
  },
  {
    name: "events",
    path: csvFiles.events,
    columns: ["id", "title", "description", "eventDate", "eventTime", "location", "type", "maxParticipants", "registrationDeadline", "status", "allowWaitlist", "createdBy", "createdAt", "updatedAt"],
  },
  {
    name: "event_registrations",
    path: csvFiles.eventRegistrations,
    columns: ["id", "eventId", "userId", "status", "notes", "registeredAt", "cancelledAt"],
  },
  {
    name: "documents",
    path: csvFiles.documents,
    columns: ["id", "title", "description", "fileUrl", "fileSize", "category", "accessLevel", "uploadedBy", "createdAt", "updatedAt"],
    transformRow: (row) => {
      const next = { ...row };
      const title = (row.title || "").toLowerCase();
      if (title.includes("stadgar")) {
        next.fileUrl = "/documents/gamla-ssk-stadgar.pdf";
      } else if (title.includes("protokoll")) {
        next.fileUrl = "/documents/protokoll-gamla-sodertalje-sk-nov-13-2025.pdf";
      }
      return next;
    },
  },
  {
    name: "content_history",
    path: csvFiles.contentHistory,
    columns: ["id", "contentId", "content", "updatedBy", "createdAt"],
  },
];

function sqlString(value) {
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function sqlValue(value) {
  if (value === undefined || value === null) return "NULL";
  const trimmed = String(value).trim();
  if (!trimmed) return "NULL";
  if (/^-?\d+$/.test(trimmed) && !/^0\d+/.test(trimmed)) {
    return trimmed;
  }
  return sqlString(trimmed);
}

function parseCsv(filePath) {
  const csv = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    throw new Error(`Failed to parse ${filePath}: ${parsed.errors[0].message}`);
  }
  return parsed.data;
}

function buildUpserts(tableName, rows, columns) {
  if (!rows.length) return `-- ${tableName}: no rows to import`;

  return rows.map((row) => {
    const values = columns.map((column) => sqlValue(row[column]));
    const updates = columns
      .filter((column) => column !== "id")
      .map((column) => `  \`${column}\` = VALUES(\`${column}\`)`)
      .join(",\n");

    return [
      `INSERT INTO \`${tableName}\` (${columns.map((column) => `\`${column}\``).join(", ")})`,
      `VALUES (${values.join(", ")} )`,
      "ON DUPLICATE KEY UPDATE",
      `${updates};`,
    ].join("\n");
  }).join("\n\n");
}

fs.mkdirSync(importsDir, { recursive: true });

execFileSync("node", [path.join(projectRoot, "scripts", "generate-users-import-sql.mjs"), usersCsvPath, usersSqlPath], {
  cwd: projectRoot,
  stdio: "inherit",
});

const usersSql = fs.readFileSync(usersSqlPath, "utf8").trim();

const contentSections = tableImports.map((config) => {
  const rawRows = parseCsv(config.path);
  const transformedRows = rawRows.map((row) => (config.transformRow ? config.transformRow(row) : row));
  const rows = config.extraRows ? transformedRows.concat(config.extraRows) : transformedRows;
  return `-- ${config.name}\n${buildUpserts(config.name, rows, config.columns)}`;
});

const output = [
  "-- Full Manus import for Hostinger",
  "-- Includes users, roles, CMS content, news, events, and local document URLs.",
  "",
  usersSql,
  "",
  "START TRANSACTION;",
  "",
  tableDefinitions,
  "",
  ...contentSections,
  "",
  "COMMIT;",
  "",
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote full import SQL to ${outputPath}`);
