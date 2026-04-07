import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router, manageNewsProcedure, manageMembersProcedure, manageRolesProcedure, manageUsersProcedure, manageCMSProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb, getEventWithRegistrations, getUserEventRegistration, getUserRegisteredEvents } from "./db";
import { users, news, membershipApplications, roles, galleryPhotos, events, pageContent, siteSettings, boardMembers, contentHistory, documents, paymentConfirmations } from "../drizzle/schema";
import { z } from "zod";
import { desc, eq, isNotNull, gte, sql } from "drizzle-orm";
import { storagePut } from "./storage";
import crypto from "crypto";

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


export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    providers: publicProcedure.query(async () => {
      const { isGoogleAuthEnabled } = await import('./googleAuth');
      return {
        google: isGoogleAuthEnabled(),
        password: true, // Password-based login for registered members
      };
    }),
    
    // Password-based login
    loginWithPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const { authenticateWithPassword } = await import('./passwordAuth');
        const user = await authenticateWithPassword(input.email, input.password);
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Felaktig e-postadress eller lösenord',
          });
        }
        
        // Update last signed in
        const { upsertUser } = await import('./db');
        await upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
        });
        
        // Create session
        const { sdk } = await import('./_core/sdk');
        const { ONE_YEAR_MS } = await import('@shared/const');
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || '',
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { success: true, user };
      }),
    
    // Request password reset
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { generatePasswordResetToken } = await import('./passwordAuth');
        const token = await generatePasswordResetToken(input.email);
        
        if (!token) {
          // Don't reveal if email exists or not for security
          return { success: true, message: 'Om e-postadressen finns i systemet kommer du att få ett återställningsmail' };
        }
        
        // Send email with reset link
        const { sendPasswordResetEmail } = await import('./emailService');
        const emailResult = await sendPasswordResetEmail(input.email, token);
        
        if (!emailResult.success) {
          console.error('[PasswordReset] Failed to send email:', emailResult.error);
          // Still log the token for debugging if email fails
          console.log('[PasswordReset] Token for', input.email, ':', token);
          console.log('[PasswordReset] Reset link:', `${process.env.VITE_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`);
        }
        
        // Always return success message (don't reveal if email exists)
        return { success: true, message: 'Om e-postadressen finns i systemet kommer du att få ett återställningsmail' };
      }),
    
    // Reset password with token
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        const { verifyPasswordResetToken, resetPassword } = await import('./passwordAuth');
        
        const userId = await verifyPasswordResetToken(input.token);
        if (!userId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ogiltig eller utgången återställningslänk',
          });
        }
        
        const success = await resetPassword(userId, input.newPassword);
        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Kunde inte återställa lösenord',
          });
        }
        
        return { success: true, message: 'Lösenordet har återställts' };
      }),
    
    // Set password for first-time users
    setPassword: protectedProcedure
      .input(z.object({
        password: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        const { setUserPassword } = await import('./passwordAuth');
        const success = await setUserPassword(ctx.user.id, input.password);
        
        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Kunde inte sätta lösenord',
          });
        }
        
        return { success: true, message: 'Lösenordet har satts' };
      }),
  }),



  news: router({
    latest: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(news)
        .where(isNotNull(news.publishedAt)) // Only published news
        .orderBy(desc(news.publishedAt))
        .limit(3);
    }),
    list: manageNewsProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(news).orderBy(desc(news.createdAt));
    }),
    create: manageNewsProcedure
      .input(
        z.object({
          title: z.string().min(1),
          content: z.string().min(1),
          imageUrl: z.string().optional(),
          publishedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(news).values({
          ...input,
          authorId: ctx.user.id,
        });
        return result;
      }),
    update: manageNewsProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          content: z.string().min(1).optional(),
          imageUrl: z.string().optional(),
          publishedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        await db.update(news).set(data).where(eq(news.id, id));
        return { success: true };
      }),
    delete: manageNewsProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(news).where(eq(news.id, input.id));
        return { success: true };
      }),
  }),
  membership: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
           await db.insert(membershipApplications).values(input);
      
      // TODO: Send email notifications
      // 1. Send confirmation email to applicant
      // 2. Send notification email to admins
      // See EMAIL_SETUP.md for configuration instructions
      
      return { success: true };     }),
    list: manageMembersProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(membershipApplications)
        .orderBy(desc(membershipApplications.createdAt));
    }),
    updateStatus: manageMembersProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(membershipApplications)
          .set({ status: input.status })
          .where(eq(membershipApplications.id, input.id));
        return { success: true };
      }),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => {
      return ctx.user;
    }),
    update: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          streetAddress: z.string().optional(),
          postalCode: z.string().optional(),
          city: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(users)
          .set(input)
          .where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),
  roles: router({
    // Get all roles
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Check if user has permission to view roles
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
      
      const allRoles = await db.select().from(roles);
      return allRoles.map((role) => ({
        ...role,
        permissions: normalizePermissions(role.permissions),
      }));
    }),
    
    // Create new role (huvudadmin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        permissions: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is huvudadmin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0]?.roleId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const userRole = await db.select().from(roles).where(eq(roles.id, user[0].roleId)).limit(1);
        if (!userRole[0] || userRole[0].name !== 'huvudadmin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only huvudadmin can create roles' });
        }
        
        await db.insert(roles).values({
          name: input.name,
          description: input.description,
          permissions: input.permissions,
          isCustom: 1,
        });
        
        return { success: true };
      }),
    
    // Update role (huvudadmin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is huvudadmin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0]?.roleId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const userRole = await db.select().from(roles).where(eq(roles.id, user[0].roleId)).limit(1);
        if (!userRole[0] || userRole[0].name !== 'huvudadmin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only huvudadmin can update roles' });
        }
        
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.permissions) updateData.permissions = input.permissions;
        
        await db.update(roles).set(updateData).where(eq(roles.id, input.id));
        
        return { success: true };
      }),
    
    // Delete role (huvudadmin only, cannot delete system roles)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is huvudadmin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0]?.roleId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const userRole = await db.select().from(roles).where(eq(roles.id, user[0].roleId)).limit(1);
        if (!userRole[0] || userRole[0].name !== 'huvudadmin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only huvudadmin can delete roles' });
        }
        
        // Check if role is a system role
        const roleToDelete = await db.select().from(roles).where(eq(roles.id, input.id)).limit(1);
        if (roleToDelete[0] && roleToDelete[0].isCustom === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete system roles' });
        }
        
        await db.delete(roles).where(eq(roles.id, input.id));
        
        return { success: true };
      }),
  }),
  userManagement: router({
    // List all users (huvudadmin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Check if user is huvudadmin
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user[0]?.roleId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
      
      const userRole = await db.select().from(roles).where(eq(roles.id, user[0].roleId)).limit(1);
      if (!userRole[0] || userRole[0].name !== 'huvudadmin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only huvudadmin can view all users' });
      }
      
      return await db.select().from(users);
    }),
    
    // Assign role to user (huvudadmin only)
    assignRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        roleId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is huvudadmin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0]?.roleId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const userRole = await db.select().from(roles).where(eq(roles.id, user[0].roleId)).limit(1);
        if (!userRole[0] || userRole[0].name !== 'huvudadmin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only huvudadmin can assign roles' });
        }

        const targetRole = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
        if (!targetRole[0]) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Role not found' });
        }

        await db.update(users).set({
          roleId: input.roleId,
          role: 'admin',
        }).where(eq(users.id, input.userId));
        
        return { success: true };
      }),
  }),
  gallery: router({
    // Get all photos (public)
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      return await db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt));
    }),
    
    // Get photos by category (public)
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        return await db.select().from(galleryPhotos)
          .where(eq(galleryPhotos.category, input.category))
          .orderBy(desc(galleryPhotos.createdAt));
      }),
    
    // Upload photo with automatic compression (admin only)
    upload: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        imageBase64: z.string(), // Base64 encoded image
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        // Decode base64 image
        const imageBuffer = Buffer.from(input.imageBase64, 'base64');
        
        // Process and upload image
        const { processAndUploadImage } = await import('./imageProcessor');
        const processedImages = await processAndUploadImage(imageBuffer, input.title, 'gallery');
        
        // Save to database
        await db.insert(galleryPhotos).values({
          title: input.title,
          description: input.description,
          imageUrl: processedImages.medium.url, // Legacy field
          thumbnailUrl: processedImages.thumbnail.url,
          mediumUrl: processedImages.medium.url,
          originalUrl: processedImages.original.url,
          category: input.category,
          uploadedBy: ctx.user.id,
        });
        
        return { success: true, images: processedImages };
      }),
    
    // Create photo (admin only) - Legacy method
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().url(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        await db.insert(galleryPhotos).values({
          ...input,
          uploadedBy: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    // Update photo (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const { id, ...updateData } = input;
        await db.update(galleryPhotos).set(updateData).where(eq(galleryPhotos.id, id));
        
        return { success: true };
      }),
    
    // Delete photo (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        await db.delete(galleryPhotos).where(eq(galleryPhotos.id, input.id));
        
        return { success: true };
      }),
  }),
  events: router({
    // Get all upcoming events (public)
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      return await db.select().from(events).where(gte(events.eventDate, new Date())).orderBy(events.eventDate);
    }),
    
    // Get all events (admin)
    listAll: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Check if user is admin
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user[0] || user[0].role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
      
      return await db.select().from(events).orderBy(desc(events.eventDate));
    }),
    
    // Create event (admin only)
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventDate: z.date(),
        eventTime: z.string().optional(),
        location: z.string().optional(),
        type: z.string().optional(),
        maxParticipants: z.number().optional(),
        registrationDeadline: z.date().optional(),
        status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
        allowWaitlist: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        await db.insert(events).values({
          ...input,
          allowWaitlist: input.allowWaitlist ? 1 : 0,
          createdBy: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    // Update event (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        eventDate: z.date().optional(),
        eventTime: z.string().optional(),
        location: z.string().optional(),
        type: z.string().optional(),
        maxParticipants: z.number().optional(),
        registrationDeadline: z.date().optional(),
        status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
        allowWaitlist: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const { id, allowWaitlist, ...updateData } = input;
        await db.update(events).set({
          ...updateData,
          ...(allowWaitlist !== undefined ? { allowWaitlist: allowWaitlist ? 1 : 0 } : {}),
        }).where(eq(events.id, id));
        
        return { success: true };
      }),
    
    // Delete event (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        await db.delete(events).where(eq(events.id, input.id));
        
        return { success: true };
      }),
    
    // Get event with registrations (admin only)
    getWithRegistrations: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if user is admin
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (!user[0] || user[0].role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        return await getEventWithRegistrations(input.id);
      }),
    
    // Register for event (authenticated users)
    register: protectedProcedure
      .input(z.object({
        eventId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { eventRegistrations } = await import('../drizzle/schema');
        
        // Check if event exists and get details
        const event = await db.select().from(events).where(eq(events.id, input.eventId)).limit(1);
        if (event.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Evenemang hittades inte' });
        }
        
        // Check if registration deadline has passed
        if (event[0].registrationDeadline && new Date() > new Date(event[0].registrationDeadline)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Anmälningstiden har gått ut' });
        }
        
        // Check if already registered
        const existing = await getUserEventRegistration(input.eventId, ctx.user.id);
        if (existing && existing.status !== 'cancelled') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Du är redan anmäld till detta evenemang' });
        }
        
        // Get current registration count
        const eventWithRegs = await getEventWithRegistrations(input.eventId);
        if (!eventWithRegs) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Evenemang hittades inte' });
        }
        
        // Determine status based on max participants
        let status: 'registered' | 'waitlist' = 'registered';
        if (event[0].maxParticipants && eventWithRegs.registeredCount >= event[0].maxParticipants) {
          if (event[0].allowWaitlist) {
            status = 'waitlist';
          } else {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Evenemanget är fullt' });
          }
        }
        
        // Create or update registration
        if (existing) {
          await db.update(eventRegistrations)
            .set({ status, notes: input.notes, registeredAt: new Date(), cancelledAt: null })
            .where(eq(eventRegistrations.id, existing.id));
        } else {
          await db.insert(eventRegistrations).values({
            eventId: input.eventId,
            userId: ctx.user.id,
            status,
            notes: input.notes,
          });
        }
        
        return { success: true, status };
      }),
    
    // Cancel event registration
    cancelRegistration: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { eventRegistrations } = await import('../drizzle/schema');
        
        const registration = await getUserEventRegistration(input.eventId, ctx.user.id);
        if (!registration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Ingen anmälan hittades' });
        }
        
        await db.update(eventRegistrations)
          .set({ status: 'cancelled', cancelledAt: new Date() })
          .where(eq(eventRegistrations.id, registration.id));
        
        return { success: true };
      }),
    
    // Get user's registered events
    myEvents: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRegisteredEvents(ctx.user.id);
    }),
    
    // Get user's registration status for an event
    myRegistration: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getUserEventRegistration(input.eventId, ctx.user.id);
        
        return { success: true };
      }),
  }),
  cms: router({
    // Get all content for a specific page (public)
    getPageContent: publicProcedure
      .input(z.object({ page: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        return await db.select().from(pageContent)
          .where(eq(pageContent.page, input.page))
          .orderBy(pageContent.order);
      }),
    
    // Get all page content (admin)
    getAllContent: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      return await db.select().from(pageContent).orderBy(pageContent.page, pageContent.order);
    }),
    
    // Update page content (admin)
    updateContent: adminProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        order: z.number().optional(),
        published: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { id, ...updateData } = input;
        await db.update(pageContent)
          .set({ ...updateData, updatedBy: ctx.user.id })
          .where(eq(pageContent.id, id));
        
        return { success: true };
      }),
    
    // Create new content section (admin)
    createContent: adminProcedure
      .input(z.object({
        page: z.string(),
        sectionKey: z.string(),
        type: z.string(),
        content: z.string(),
        order: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.insert(pageContent).values({
          ...input,
          updatedBy: ctx.user.id,
        });
        
        return { success: true };
      }),

    updatePageContent: protectedProcedure
      .input(z.object({ id: z.number(), content: z.string().nullable() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Get current content before updating
        const [current] = await db.select().from(pageContent).where(eq(pageContent.id, input.id)).limit(1);
        
        // Save current content to history
        if (current) {
          await db.insert(contentHistory).values({
            contentId: input.id,
            content: current.content,
            updatedBy: ctx.user.id,
          });
        }

        // Update content
        await db.update(pageContent).set({ content: input.content }).where(eq(pageContent.id, input.id));
        return { success: true };
      }),

    getContentHistory: protectedProcedure
      .input(z.object({ contentId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const history = await db
          .select({
            id: contentHistory.id,
            content: contentHistory.content,
            createdAt: contentHistory.createdAt,
            updatedBy: contentHistory.updatedBy,
            userName: users.name,
          })
          .from(contentHistory)
          .leftJoin(users, eq(contentHistory.updatedBy, users.id))
          .where(eq(contentHistory.contentId, input.contentId))
          .orderBy(desc(contentHistory.createdAt))
          .limit(20);

        return history;
      }),

    restoreContentVersion: protectedProcedure
      .input(z.object({ contentId: z.number(), historyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Get the historical version
        const [history] = await db.select().from(contentHistory).where(eq(contentHistory.id, input.historyId)).limit(1);
        if (!history) throw new TRPCError({ code: "NOT_FOUND", message: "History not found" });

        // Save current content to history before restoring
        const [current] = await db.select().from(pageContent).where(eq(pageContent.id, input.contentId)).limit(1);
        if (current) {
          await db.insert(contentHistory).values({
            contentId: input.contentId,
            content: current.content,
            updatedBy: ctx.user.id,
          });
        }

        // Restore the historical content
        await db.update(pageContent).set({ content: history.content }).where(eq(pageContent.id, input.contentId));
        return { success: true };
      }),

    // Delete content section (admin)
    deleteContent: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.delete(pageContent).where(eq(pageContent.id, input.id));
        return { success: true };
      }),

    // Get site settings (public)
    getSettings: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      return await db.select().from(siteSettings);
    }),
    
    // Update site setting (admin)
    updateSetting: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Check if setting exists
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, input.key)).limit(1);
        
        if (existing.length > 0) {
          // Update existing
          await db.update(siteSettings)
            .set({ value: input.value, type: input.type, updatedBy: ctx.user.id })
            .where(eq(siteSettings.key, input.key));
        } else {
          // Create new
          await db.insert(siteSettings).values({
            key: input.key,
            value: input.value,
            type: input.type || 'text',
            updatedBy: ctx.user.id,
          });
        }
        
        return { success: true };
      }),
    
    // Board members management
    getBoardMembers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      return await db.select().from(boardMembers)
        .where(eq(boardMembers.active, 1))
        .orderBy(boardMembers.order);
    }),
    
    getAllBoardMembers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      return await db.select().from(boardMembers).orderBy(boardMembers.order);
    }),
    
    createBoardMember: adminProcedure
      .input(z.object({
        name: z.string(),
        role: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        photo: z.string().optional(),
        order: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.insert(boardMembers).values(input);
        
        return { success: true };
      }),
    
    updateBoardMember: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        photo: z.string().optional(),
        order: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const { id, ...updateData } = input;
        await db.update(boardMembers).set(updateData).where(eq(boardMembers.id, id));
        
        return { success: true };
      }),
    
    deleteBoardMember: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.delete(boardMembers).where(eq(boardMembers.id, input.id));
        
        return { success: true };
      }),
  }),
  upload: router({
    image: publicProcedure
      .input(z.object({ 
        filename: z.string(),
        contentType: z.string(),
        data: z.string() // base64 encoded
      }))
      .mutation(async ({ input }) => {
        try {
          // Generate unique filename
          const ext = input.filename.split('.').pop();
          const randomSuffix = crypto.randomBytes(8).toString('hex');
          const fileKey = `news-images/${randomSuffix}.${ext}`;
          
          // Decode base64 data
          const buffer = Buffer.from(input.data, 'base64');
          
          // Upload to S3
          const { url } = await storagePut(fileKey, buffer, input.contentType);
          
          return { url };
        } catch (error) {
          console.error('Image upload error:', error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload image'
          });
        }
      }),
  }),

  // Member Registry
  members: router({
    // Verify current user's member status
    verifyStatus: protectedProcedure.query(async ({ ctx }) => {
      const { verifyMemberStatus } = await import('./db');
      return await verifyMemberStatus(ctx.user.id);
    }),

    // Get all members (admin only)
    list: manageUsersProcedure
      .input(z.object({
        status: z.enum(['pending', 'active', 'inactive']).optional(),
        memberType: z.enum(['ordinarie', 'hedersmedlem', 'stodmedlem']).optional(),
        paymentStatus: z.enum(['paid', 'unpaid', 'exempt']).optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getMembers } = await import('./db');
        return await getMembers(input);
      }),

    // Get member by ID (admin only)
    getById: manageUsersProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getMemberById } = await import('./db');
        const member = await getMemberById(input.id);
        if (!member) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
        }
        return member;
      }),

    // Update member (admin only)
    update: manageUsersProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        personnummer: z.string().optional(),
        streetAddress: z.string().optional(),
        postalCode: z.string().optional(),
        city: z.string().optional(),
        membershipStatus: z.enum(['pending', 'active', 'inactive']).optional(),
        membershipNumber: z.string().optional(),
        joinYear: z.number().optional(),
        memberType: z.enum(['ordinarie', 'hedersmedlem', 'stodmedlem']).optional(),
        paymentStatus: z.enum(['paid', 'unpaid', 'exempt']).optional(),
        paymentYear: z.number().optional(),
        showInDirectory: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateMember } = await import('./db');
        return await updateMember(id, data);
      }),

    // Generate member number
    generateMemberNumber: manageUsersProcedure
      .mutation(async () => {
        const { generateMemberNumber } = await import('./db');
        return { memberNumber: await generateMemberNumber() };
      }),

    // Get members for directory (logged-in members only)
    directory: protectedProcedure.query(async () => {
      const { getMembersForDirectory } = await import('./db');
      return await getMembersForDirectory();
    }),

    // Import members from CSV (admin only)
    importCSV: manageUsersProcedure
      .input(z.object({ csvData: z.string() }))
      .mutation(async ({ input }) => {
        const { importMembersFromCSV } = await import('./memberImportExport');
        return await importMembersFromCSV(input.csvData);
      }),

    // Export members to Excel (admin only)
    exportExcel: manageUsersProcedure.mutation(async ({ ctx }) => {
      const { exportMembersToExcel } = await import('./memberImportExport');
      const buffer = await exportMembersToExcel();
      // Return base64 encoded buffer
      return {
        data: buffer.toString('base64'),
        filename: `medlemmar_${new Date().toISOString().split('T')[0]}.xlsx`,
      };
    }),

    // Send payment reminder (admin only)
    sendPaymentReminder: manageUsersProcedure
      .input(z.object({ memberId: z.number() }))
      .mutation(async ({ input }) => {
        const { getMemberById } = await import('./db');
        const member = await getMemberById(input.memberId);
        
        if (!member) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' });
        }
        
        if (!member.email) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Member has no email address' });
        }

        // TODO: Send payment reminder email
        // For now, just log it (automatic emails are disabled)
        console.log(`[Payment Reminder] Would send to ${member.email} (${member.name})`);
        
        return { success: true, message: 'Payment reminder sent' };
      }),
  }),

  // Documents router for PDF upload and sharing
  documents: router({
    // List all documents (with access control)
    list: publicProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      // Filter based on user role
      if (!ctx.user) {
        // Guest: only public documents
        return db.select().from(documents)
          .where(eq(documents.accessLevel, 'public'))
          .orderBy(desc(documents.createdAt));
      } else if (ctx.user.role !== 'admin') {
        // Members: public + members_only
        return db.select().from(documents)
          .where(sql`${documents.accessLevel} IN ('public', 'members_only')`)
          .orderBy(desc(documents.createdAt));
      }
      // Admins see all documents
      return db.select().from(documents).orderBy(desc(documents.createdAt));
    }),

    // Get documents by category
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        
        // Apply access control
        if (!ctx.user) {
          return db.select().from(documents)
            .where(sql`${documents.category} = ${input.category} AND ${documents.accessLevel} = 'public'`)
            .orderBy(desc(documents.createdAt));
        } else if (ctx.user.role !== 'admin') {
          return db.select().from(documents)
            .where(sql`${documents.category} = ${input.category} AND ${documents.accessLevel} IN ('public', 'members_only')`)
            .orderBy(desc(documents.createdAt));
        }
        
        return db.select().from(documents)
          .where(eq(documents.category, input.category as any))
          .orderBy(desc(documents.createdAt));
      }),

    // Upload document (admin only)
    upload: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        fileData: z.string(), // Base64 encoded PDF
        fileName: z.string(),
        fileSize: z.number(),
        category: z.enum(['stadgar', 'protokoll', 'informationsblad', 'arsmoten', 'ovrigt']),
        accessLevel: z.enum(['public', 'members_only', 'admin_only']),
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate file size (max 10MB)
        if (input.fileSize > 10 * 1024 * 1024) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Filen är för stor (max 10MB)' });
        }

        // Validate file extension
        if (!input.fileName.toLowerCase().endsWith('.pdf')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Endast PDF-filer är tillåtna' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileData, 'base64');

        // Upload to S3
        const fileKey = `documents/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, 'application/pdf');

        // Save to database
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Databas inte tillgänglig' });

        await db.insert(documents).values({
          title: input.title,
          description: input.description,
          fileUrl: url,
          fileSize: input.fileSize,
          category: input.category,
          accessLevel: input.accessLevel,
          uploadedBy: ctx.user.id,
        });

        return { success: true, url };
      }),

    // Delete document (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Databas inte tillgänglig' });
        
        await db.delete(documents).where(eq(documents.id, input.id));
        return { success: true };
      }),
  }),
  
  // Payment confirmations router
  payments: router({
    // Get Swish number from settings
    getSwishNumber: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const setting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'swish_number')).limit(1);
      return setting[0]?.value || '123 XXX XXXX';
    }),
    
    // Submit payment confirmation (authenticated users)
    submitConfirmation: protectedProcedure
      .input(z.object({
        amount: z.string(),
        paymentYear: z.number(),
        receiptBase64: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        let receiptUrl: string | undefined;
        
        // Upload receipt if provided
        if (input.receiptBase64) {
          const receiptBuffer = Buffer.from(input.receiptBase64, 'base64');
          const filename = `payment-receipt-${ctx.user.id}-${Date.now()}.pdf`;
          const { url } = await storagePut(`receipts/${filename}`, receiptBuffer, 'application/pdf');
          receiptUrl = url;
        }
        
        // Insert payment confirmation
        await db.insert(paymentConfirmations).values({
          userId: ctx.user.id,
          amount: input.amount,
          paymentYear: input.paymentYear,
          receiptUrl,
          notes: input.notes,
          status: 'pending',
        });
        
        return { success: true };
      }),
    
    // Get user's payment confirmations
    myPayments: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      return await db.select().from(paymentConfirmations)
        .where(eq(paymentConfirmations.userId, ctx.user.id))
        .orderBy(desc(paymentConfirmations.createdAt));
    }),
    
    // Admin: Get all payment confirmations
    listAll: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
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
        userEmail: users.email,
      })
      .from(paymentConfirmations)
      .leftJoin(users, eq(paymentConfirmations.userId, users.id))
      .orderBy(desc(paymentConfirmations.createdAt));
      
      return payments;
    }),
    
    // Admin: Verify payment
    verify: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['verified', 'rejected']),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.update(paymentConfirmations)
          .set({
            status: input.status,
            verifiedBy: ctx.user.id,
            verifiedAt: new Date(),
          })
          .where(eq(paymentConfirmations.id, input.id));
        
        // If verified, update user's payment status
        if (input.status === 'verified') {
          const payment = await db.select().from(paymentConfirmations)
            .where(eq(paymentConfirmations.id, input.id)).limit(1);
          
          if (payment[0]) {
            await db.update(users)
              .set({
                paymentStatus: 'paid',
                paymentYear: payment[0].paymentYear,
              })
              .where(eq(users.id, payment[0].userId));
          }
        }
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
