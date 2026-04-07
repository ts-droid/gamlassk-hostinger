import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Create a procedure that requires a specific permission
 * @param permission - The permission required (e.g., 'manage_news', 'manage_members')
 */
export const requirePermission = (permission: string) => {
  return t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    // Import userHasPermission dynamically to avoid circular dependency
    const { userHasPermission } = await import('../db');
    const hasPermission = await userHasPermission(ctx.user.id, permission);

    if (!hasPermission) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: `Du saknar behörighet: ${permission}` 
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });
};

// Convenience procedures for common permissions
export const manageNewsProcedure = protectedProcedure.use(requirePermission('manage_news'));
export const manageMembersProcedure = protectedProcedure.use(requirePermission('manage_members'));
export const manageRolesProcedure = protectedProcedure.use(requirePermission('manage_roles'));
export const manageUsersProcedure = protectedProcedure.use(requirePermission('manage_users'));
export const manageEventsProcedure = protectedProcedure.use(requirePermission('manage_events'));
export const manageGalleryProcedure = protectedProcedure.use(requirePermission('manage_gallery'));
export const manageCMSProcedure = protectedProcedure.use(requirePermission('manage_cms'));
