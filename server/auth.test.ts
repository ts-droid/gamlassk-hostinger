import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Superadmin Authentication", () => {
  it("should have superadmin account with correct email and role", async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, "thomas.soderberg@gmail.com"))
      .limit(1);

    expect(result.length).toBe(1);
    expect(result[0].email).toBe("thomas.soderberg@gmail.com");
    expect(result[0].role).toBe("admin");
    expect(result[0].password).toBeTruthy();
  });

  it("should verify password hash correctly", async () => {
    const password = process.env.ADMIN_PASSWORD || "qwerty123456";
    const db = await getDb();
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, "thomas.soderberg@gmail.com"))
      .limit(1);

    expect(result.length).toBe(1);
    const user = result[0];
    expect(user.password).toBeTruthy();

    const isValid = await bcrypt.compare(password, user.password!);
    expect(isValid).toBe(true);
  });
});
