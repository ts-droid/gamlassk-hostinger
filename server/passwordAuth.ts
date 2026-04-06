import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db';
import { users, passwordResetTokens } from '../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import { upsertUser } from './db';

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 24;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate user with email and password
 * Returns user object if authentication successful, null otherwise
 */
export async function authenticateWithPassword(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    console.error('[PasswordAuth] Database not available');
    return null;
  }

  try {
    // Find user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      console.log('[PasswordAuth] User not found:', email);
      return null;
    }

    const user = result[0];

    // Check if user has a password set
    if (!user.password) {
      console.log('[PasswordAuth] User has no password set:', email);
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      console.log('[PasswordAuth] Invalid password for:', email);
      return null;
    }

    console.log('[PasswordAuth] Authentication successful:', email);
    return user;
  } catch (error) {
    console.error('[PasswordAuth] Authentication error:', error);
    return null;
  }
}

/**
 * Generate a password reset token
 * Returns token string if successful, null otherwise
 */
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    console.error('[PasswordAuth] Database not available');
    return null;
  }

  try {
    // Find user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      console.log('[PasswordAuth] User not found for reset:', email);
      return null;
    }

    const user = result[0];

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    // Store token in database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      used: 0,
    });

    console.log('[PasswordAuth] Reset token generated for:', email);
    return token;
  } catch (error) {
    console.error('[PasswordAuth] Error generating reset token:', error);
    return null;
  }
}

/**
 * Verify and use a password reset token
 * Returns userId if token is valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.error('[PasswordAuth] Database not available');
    return null;
  }

  try {
    const now = new Date();
    
    // Find valid token
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, 0),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (result.length === 0) {
      console.log('[PasswordAuth] Invalid or expired token');
      return null;
    }

    const resetToken = result[0];

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: 1 })
      .where(eq(passwordResetTokens.id, resetToken.id));

    console.log('[PasswordAuth] Reset token verified for user:', resetToken.userId);
    return resetToken.userId;
  } catch (error) {
    console.error('[PasswordAuth] Error verifying reset token:', error);
    return null;
  }
}

/**
 * Reset user password
 */
export async function resetPassword(userId: number, newPassword: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.error('[PasswordAuth] Database not available');
    return false;
  }

  try {
    const hashedPassword = await hashPassword(newPassword);
    
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        loginMethod: 'password',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log('[PasswordAuth] Password reset successful for user:', userId);
    return true;
  } catch (error) {
    console.error('[PasswordAuth] Error resetting password:', error);
    return false;
  }
}

/**
 * Set initial password for a user (e.g., when member first registers)
 */
export async function setUserPassword(userId: number, password: string): Promise<boolean> {
  return resetPassword(userId, password);
}

/**
 * Ensure an owner/admin account has a usable password in environments where
 * password reset email delivery may not be configured yet.
 */
export async function bootstrapOwnerPassword(email: string, password: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return false;
  }

  const db = await getDb();
  if (!db) {
    console.error('[PasswordAuth] Database not available for owner bootstrap');
    return false;
  }

  try {
    let result = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (result.length === 0) {
      await upsertUser({
        openId: `email:${normalizedEmail}`,
        email: normalizedEmail,
        name: normalizedEmail,
        loginMethod: 'password',
      });

      result = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
    }

    if (result.length === 0) {
      console.error('[PasswordAuth] Failed to create owner account for bootstrap:', normalizedEmail);
      return false;
    }

    const owner = result[0];
    const hashedPassword = await hashPassword(password);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        loginMethod: 'password',
        updatedAt: new Date(),
      })
      .where(eq(users.id, owner.id));

    console.log('[PasswordAuth] Owner password bootstrap complete for:', normalizedEmail);
    return true;
  } catch (error) {
    console.error('[PasswordAuth] Error bootstrapping owner password:', error);
    return false;
  }
}
