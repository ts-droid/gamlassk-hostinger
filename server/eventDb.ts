import { eq, and, gte, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import { events, eventRegistrations, Event, InsertEvent, EventRegistration } from "../drizzle/schema";

/**
 * Get all published events
 */
export async function getAllEvents(): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(events)
    .where(eq(events.status, "published"))
    .orderBy(events.eventDate);

  return result;
}

/**
 * Get upcoming events (from today onwards)
 */
export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  let query = db
    .select()
    .from(events)
    .where(
      and(
        eq(events.status, "published"),
        gte(events.eventDate, now)
      )
    )
    .orderBy(events.eventDate);

  if (limit) {
    query = query.limit(limit) as any;
  }

  const result = await query;
  return result;
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: number): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  return result[0];
}

/**
 * Create new event
 */
export async function createEvent(event: InsertEvent): Promise<Event> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(events).values(event);
  const insertedId = result[0].insertId;

  const newEvent = await getEventById(Number(insertedId));
  if (!newEvent) throw new Error("Failed to retrieve created event");

  return newEvent;
}

/**
 * Update event
 */
export async function updateEvent(eventId: number, updates: Partial<InsertEvent>): Promise<Event> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(events)
    .set(updates)
    .where(eq(events.id, eventId));

  const updated = await getEventById(eventId);
  if (!updated) throw new Error("Failed to retrieve updated event");

  return updated;
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(events).where(eq(events.id, eventId));
}

/**
 * Get event registrations for a specific event
 */
export async function getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, eventId))
    .orderBy(desc(eventRegistrations.registeredAt));

  return result;
}

/**
 * Get registration count for an event
 */
export async function getEventRegistrationCount(eventId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, "registered")
      )
    );

  return result[0]?.count || 0;
}

/**
 * Check if user is registered for an event
 */
export async function isUserRegistered(eventId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId),
        eq(eventRegistrations.status, "registered")
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Register user for an event
 */
export async function registerForEvent(
  eventId: number,
  userId: number,
  notes?: string
): Promise<EventRegistration> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if event exists and is published
  const event = await getEventById(eventId);
  if (!event) throw new Error("Event not found");
  if (event.status !== "published") throw new Error("Event is not available for registration");

  // Check if already registered
  const alreadyRegistered = await isUserRegistered(eventId, userId);
  if (alreadyRegistered) throw new Error("Already registered for this event");

  // Check if event is full
  if (event.maxParticipants) {
    const currentCount = await getEventRegistrationCount(eventId);
    if (currentCount >= event.maxParticipants) {
      if (event.allowWaitlist) {
        // Add to waitlist
        const result = await db.insert(eventRegistrations).values({
          eventId,
          userId,
          status: "waitlist",
          notes,
        });
        const insertedId = result[0].insertId;
        const registration = await db
          .select()
          .from(eventRegistrations)
          .where(eq(eventRegistrations.id, Number(insertedId)))
          .limit(1);
        return registration[0];
      } else {
        throw new Error("Event is full and waitlist is not allowed");
      }
    }
  }

  // Register user
  const result = await db.insert(eventRegistrations).values({
    eventId,
    userId,
    status: "registered",
    notes,
  });

  const insertedId = result[0].insertId;
  const registration = await db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.id, Number(insertedId)))
    .limit(1);

  return registration[0];
}

/**
 * Cancel event registration
 */
export async function cancelEventRegistration(eventId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(eventRegistrations)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
    })
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId)
      )
    );
}

/**
 * Get user's registered events
 */
export async function getUserEvents(userId: number): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      eventTime: events.eventTime,
      location: events.location,
      type: events.type,
      feeAmount: events.feeAmount,
      paymentInstructions: events.paymentInstructions,
      registrationNotice: events.registrationNotice,
      maxParticipants: events.maxParticipants,
      registrationDeadline: events.registrationDeadline,
      status: events.status,
      allowWaitlist: events.allowWaitlist,
      createdBy: events.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .innerJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
    .where(
      and(
        eq(eventRegistrations.userId, userId),
        eq(eventRegistrations.status, "registered")
      )
    )
    .orderBy(events.eventDate);

  return result;
}
