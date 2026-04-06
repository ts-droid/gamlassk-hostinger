import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import bcrypt from "bcryptjs";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

const SUPERADMIN_EMAIL = "thomas.soderberg@gmail.com";

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

function getSessionSecret() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createSessionToken(
  openId: string,
  name: string
): Promise<string> {
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ openId, appId: ENV.appId || "gamla-ssk", name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSessionSecret());
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    const { openId, appId, name } = payload as Record<string, unknown>;
    if (
      typeof openId !== "string" ||
      typeof appId !== "string" ||
      typeof name !== "string"
    )
      return null;
    return { openId, appId, name };
  } catch {
    return null;
  }
}

export function registerPasswordAuthRoutes(app: Express) {
  // POST /api/auth/login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "E-post och lösenord krävs" });
      return;
    }

    try {
      const user = await db.getUserByEmail(email.toLowerCase().trim());

      if (!user || !user.password) {
        res.status(401).json({ error: "Felaktig e-post eller lösenord" });
        return;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ error: "Felaktig e-post eller lösenord" });
        return;
      }

      const token = await createSessionToken(
        user.openId,
        user.name || user.email || ""
      );
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Inloggning misslyckades" });
    }
  });

  // POST /api/auth/register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password || !name) {
      res.status(400).json({ error: "Namn, e-post och lösenord krävs" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Lösenordet måste vara minst 8 tecken" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const existing = await db.getUserByEmail(normalizedEmail);
      if (existing) {
        res.status(409).json({ error: "E-postadressen är redan registrerad" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const openId = `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      // Superadmin gets admin role automatically
      const role = normalizedEmail === SUPERADMIN_EMAIL ? "admin" : "user";

      await db.upsertUser({
        openId,
        email: normalizedEmail,
        name,
        password: hashedPassword,
        loginMethod: "email",
        role,
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByEmail(normalizedEmail);
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

  // POST /api/auth/change-password
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    // Get session from cookie
    const { parse: parseCookies } = await import("cookie");
    const cookies = parseCookies(req.headers.cookie || "");
    const session = await verifySessionToken(cookies[COOKIE_NAME]);

    if (!session) {
      res.status(401).json({ error: "Inte inloggad" });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Nuvarande och nytt lösenord krävs" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "Nytt lösenord måste vara minst 8 tecken" });
      return;
    }

    try {
      const user = await db.getUserByOpenId(session.openId);
      if (!user || !user.password) {
        res.status(404).json({ error: "Användare hittades inte" });
        return;
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        res.status(401).json({ error: "Felaktigt nuvarande lösenord" });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.upsertUser({ openId: user.openId, password: hashedPassword });

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Change password failed", error);
      res.status(500).json({ error: "Lösenordsbyte misslyckades" });
    }
  });
}

// Used by context.ts to authenticate requests
export async function authenticateRequest(req: Request) {
  const { parse: parseCookies } = await import("cookie");
  const cookies = parseCookies(req.headers.cookie || "");
  const session = await verifySessionToken(cookies[COOKIE_NAME]);

  if (!session) return null;

  const user = await db.getUserByOpenId(session.openId);
  return user ?? null;
}
