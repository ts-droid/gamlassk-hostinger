import fs from "fs";
import path from "path";

const runtimeDependencies = [
  "@trpc/server",
  "axios",
  "bcryptjs",
  "cookie",
  "cookie-parser",
  "dotenv",
  "drizzle-orm",
  "exceljs",
  "express",
  "ical-generator",
  "jose",
  "mysql2",
  "nanoid",
  "papaparse",
  "passport",
  "passport-google-oauth20",
  "resend",
  "sharp",
  "superjson",
  "zod",
];

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const runtimeDir = path.join(rootDir, "hostinger-deploy");

if (!fs.existsSync(path.join(distDir, "index.js"))) {
  throw new Error("dist/index.js not found. Run the build first.");
}

const rootPackage = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));

const dependencies = Object.fromEntries(
  runtimeDependencies.map((name) => {
    const version = rootPackage.dependencies?.[name];
    if (!version) {
      throw new Error(`Missing dependency version for ${name}`);
    }
    return [name, version];
  }),
);

fs.rmSync(runtimeDir, { recursive: true, force: true });
fs.mkdirSync(runtimeDir, { recursive: true });
fs.mkdirSync(path.join(runtimeDir, "public"), { recursive: true });

fs.copyFileSync(path.join(distDir, "index.js"), path.join(runtimeDir, "index.js"));
fs.cpSync(path.join(distDir, "public"), path.join(runtimeDir, "public"), { recursive: true });

const runtimePackage = {
  name: "gamlassk-hostinger-runtime",
  private: true,
  type: "module",
  engines: {
    node: "22.x",
  },
  scripts: {
    start: "NODE_ENV=production node index.js",
  },
  dependencies,
  // Pin patched versions of transitive dependencies with known CVEs
  overrides: {
    qs: ">=6.16.0",
    exceljs: {
      uuid: "^11.1.1",
    },
  },
};

fs.writeFileSync(
  path.join(runtimeDir, "package.json"),
  `${JSON.stringify(runtimePackage, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(runtimeDir, "README.md"),
  [
    "# Hostinger Runtime Bundle",
    "",
    "This folder is generated from the root project with `pnpm hostinger:prepare`.",
    "",
    "Use this folder as the Hostinger root directory for deployments that should avoid building with Vite/esbuild on the server.",
    "",
    "Recommended Hostinger settings:",
    "",
    "- Root directory: `./hostinger-deploy`",
    "- Package manager: `npm`",
    "- Entry file: `index.js`",
    "- Node.js version: `22.x`",
    "- Build command: leave empty if Hostinger allows it, otherwise `npm install`",
    "- Start command: `npm start`",
    "",
  ].join("\n"),
);

console.log(`Prepared Hostinger runtime in ${runtimeDir}`);
