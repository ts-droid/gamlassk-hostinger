import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

import { configureGoogleAuth } from "../googleAuth";
import { createGoogleAuthRoutes } from "../googleAuthRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ENV } from "./env";
import { serveStatic, setupVite } from "./vite";
import * as cron from 'node-cron';
import { sendPaymentReminders } from '../cron/paymentReminders';
import { ensureSchemaCompatibility } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
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
    const { bootstrapOwnerPassword } = await import("../passwordAuth");
    const bootstrapped = await bootstrapOwnerPassword(ENV.ownerEmail, ENV.adminPassword);
    console.log(`[Startup] Owner password bootstrap=${bootstrapped ? "ok" : "skipped"}`);
  }

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Cookie parser for reading cookies
  app.use(cookieParser());
  // Initialize Passport
  app.use(passport.initialize());
  // Configure Google OAuth
  configureGoogleAuth();

  // Google OAuth routes
  app.use(createGoogleAuthRoutes());
  
  // Calendar iCal feed
  app.get('/api/calendar/feed.ics', async (req, res) => {
    const { getAllEvents } = await import('../eventDb');
    const { generateICalFeed } = await import('../icalGenerator');
    
    const events = await getAllEvents();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const icalFeed = generateICalFeed(events, baseUrl);
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="gamla-ssk-events.ics"');
    res.send(icalFeed);
  });
  
  // Single event iCal download
  app.get('/api/calendar/event/:id.ics', async (req, res) => {
    const { getEventById } = await import('../eventDb');
    const { generateSingleEventICal } = await import('../icalGenerator');
    
    const eventId = parseInt(req.params.id);
    const event = await getEventById(eventId);
    
    if (!event) {
      res.status(404).send('Event not found');
      return;
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const icalEvent = generateSingleEventICal(event, baseUrl);
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics"`);
    res.send(icalEvent);
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Schedule cron jobs
  // DISABLED: Automatic payment reminders (use manual reminders instead)
  // cron.schedule('0 9 * * *', () => {
  //   console.log('[Cron] Running daily payment reminders...');
  //   sendPaymentReminders().catch(error => {
  //     console.error('[Cron] Payment reminders failed:', error);
  //   });
  // });
  
  console.log('[Cron] Automatic payment reminders DISABLED - use manual reminders in admin panel');

  const port =
    process.env.NODE_ENV === "production"
      ? preferredPort
      : await findAvailablePort(preferredPort);

  if (process.env.NODE_ENV !== "production" && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.on("error", error => {
    console.error("[Startup] Server failed to listen:", error);
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
