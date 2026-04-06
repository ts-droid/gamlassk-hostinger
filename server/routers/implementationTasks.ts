import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "../_core/trpc";
import { getAllImplementationTasks, getImplementationTasksByPhase, updateImplementationTaskStatus } from "../db";
import { getDb } from "../db";
import { implementationTasks } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const implementationTasksRouter = router({
  // Get all tasks
  list: publicProcedure.query(async () => {
    return await getAllImplementationTasks();
  }),

  // Get tasks by phase
  listByPhase: publicProcedure
    .input(z.object({ phase: z.string() }))
    .query(async ({ input }) => {
      return await getImplementationTasksByPhase(input.phase);
    }),

  // Get task statistics
  stats: publicProcedure.query(async () => {
    const tasks = await getAllImplementationTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    
    // Calculate by phase
    const phases = Array.from(new Set(tasks.map(t => t.phase)));
    const phaseStats = phases.map(phase => {
      const phaseTasks = tasks.filter(t => t.phase === phase);
      return {
        phase,
        total: phaseTasks.length,
        completed: phaseTasks.filter(t => t.status === "completed").length,
        inProgress: phaseTasks.filter(t => t.status === "in_progress").length,
        pending: phaseTasks.filter(t => t.status === "pending").length,
        progress: Math.round((phaseTasks.filter(t => t.status === "completed").length / phaseTasks.length) * 100),
      };
    });

    return {
      total,
      completed,
      inProgress,
      pending,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      phases: phaseStats,
    };
  }),

  // Toggle task status (admin only)
  toggleStatus: adminProcedure
    .input(z.object({
      taskId: z.number(),
      status: z.enum(["pending", "in_progress", "completed"]),
    }))
    .mutation(async ({ input, ctx }) => {
      return await updateImplementationTaskStatus(input.taskId, input.status, ctx.user?.id);
    }),

  // Bulk create tasks (admin only, for initial setup)
  bulkCreate: adminProcedure
    .input(z.array(z.object({
      phase: z.string(),
      title: z.string(),
      description: z.string().optional(),
      estimatedHours: z.number().optional(),
      priority: z.enum(["high", "medium", "low"]).default("medium"),
      order: z.number().default(0),
    })))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = await db.insert(implementationTasks).values(input);
      return { success: true, count: input.length };
    }),

  // Delete task (admin only)
  delete: adminProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(implementationTasks).where(eq(implementationTasks.id, input.taskId));
      return { success: true };
    }),
});
