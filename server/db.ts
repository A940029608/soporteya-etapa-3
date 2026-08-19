import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  type InsertUser,
  type Ticket,
  type User,
  ticketComments,
  ticketHistory,
  tickets,
  users,
} from "../drizzle/schema";
import type { TicketFilters, TicketInput, TicketUpdate } from "@shared/tickets";
import { ENV } from "./_core/env";
import { getSupportRole } from "./ticketPolicy";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("La base de datos no está disponible");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = requireDb(await getDb());
  const isOwner = user.openId === ENV.ownerOpenId;
  const values: InsertUser = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    lastSignedIn: user.lastSignedIn ?? new Date(),
    role: isOwner ? "admin" : (user.role ?? "user"),
    supportRole: isOwner ? "coordinador" : (user.supportRole ?? "colaborador"),
  };
  await db.insert(users).values(values).onDuplicateKeyUpdate({
    set: {
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      lastSignedIn: values.lastSignedIn,
      role: values.role,
      supportRole: values.supportRole,
    },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = requireDb(await getDb());
  const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return user;
}

export async function listTechnicians() {
  const db = requireDb(await getDb());
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.supportRole, "tecnico"))
    .orderBy(users.name);
}

export async function listVisibleTickets(user: User, filters: TicketFilters) {
  const db = requireDb(await getDb());
  const conditions = [isNull(tickets.deletedAt)];
  const role = getSupportRole(user);
  if (role === "colaborador") conditions.push(eq(tickets.ownerId, user.id));
  if (role === "tecnico") conditions.push(eq(tickets.assigneeId, user.id));
  if (filters.status) conditions.push(eq(tickets.status, filters.status));
  if (filters.priority) conditions.push(eq(tickets.priority, filters.priority));
  if (filters.query) {
    const term = `%${filters.query}%`;
    conditions.push(or(like(tickets.folio, term), like(tickets.title, term), like(tickets.category, term))!);
  }

  return db
    .select({
      id: tickets.id,
      folio: tickets.folio,
      title: tickets.title,
      category: tickets.category,
      priority: tickets.priority,
      status: tickets.status,
      ownerId: tickets.ownerId,
      ownerName: users.name,
      assigneeId: tickets.assigneeId,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      resolvedAt: tickets.resolvedAt,
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.ownerId, users.id))
    .where(and(...conditions))
    .orderBy(desc(tickets.updatedAt));
}

export async function getTicketById(id: number) {
  const db = requireDb(await getDb());
  const [ticket] = await db.select().from(tickets).where(and(eq(tickets.id, id), isNull(tickets.deletedAt))).limit(1);
  return ticket;
}

export async function getTicketTimeline(ticketId: number) {
  const db = requireDb(await getDb());
  const history = await db
    .select({
      id: ticketHistory.id,
      action: ticketHistory.action,
      field: ticketHistory.field,
      oldValue: ticketHistory.oldValue,
      newValue: ticketHistory.newValue,
      createdAt: ticketHistory.createdAt,
      actorId: ticketHistory.actorId,
      actorName: users.name,
    })
    .from(ticketHistory)
    .leftJoin(users, eq(ticketHistory.actorId, users.id))
    .where(eq(ticketHistory.ticketId, ticketId))
    .orderBy(desc(ticketHistory.createdAt));

  const comments = await db
    .select({
      id: ticketComments.id,
      body: ticketComments.body,
      createdAt: ticketComments.createdAt,
      authorId: ticketComments.authorId,
      authorName: users.name,
      authorRole: users.supportRole,
    })
    .from(ticketComments)
    .leftJoin(users, eq(ticketComments.authorId, users.id))
    .where(eq(ticketComments.ticketId, ticketId))
    .orderBy(desc(ticketComments.createdAt));

  return { history, comments };
}

export async function createTicket(actor: User, input: TicketInput) {
  const db = requireDb(await getDb());
  const folio = `SY-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  return db.transaction(async tx => {
    const [created] = await tx
      .insert(tickets)
      .values({ ...input, folio, ownerId: actor.id, resolvedAt: input.status === "Resuelto" || input.status === "Cerrado" ? new Date() : null })
      .$returningId();
    await tx.insert(ticketHistory).values({
      ticketId: created.id,
      actorId: actor.id,
      action: "Ticket creado",
      field: "status",
      oldValue: null,
      newValue: input.status,
    });
    const [ticket] = await tx.select().from(tickets).where(eq(tickets.id, created.id)).limit(1);
    return ticket;
  });
}

function serialise(value: unknown) {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function updateTicket(actor: User, current: Ticket, changes: TicketUpdate) {
  const db = requireDb(await getDb());
  const updateValues: Record<string, unknown> = { ...changes };
  if (changes.status) {
    updateValues.resolvedAt = changes.status === "Resuelto" || changes.status === "Cerrado"
      ? current.resolvedAt ?? new Date()
      : null;
  }

  return db.transaction(async tx => {
    const changedEntries = Object.entries(changes).filter(([key, value]) => value !== undefined && current[key as keyof Ticket] !== value);
    if (changedEntries.length === 0) return current;

    await tx.update(tickets).set(updateValues).where(eq(tickets.id, current.id));
    await tx.insert(ticketHistory).values(
      changedEntries.map(([field, value]) => ({
        ticketId: current.id,
        actorId: actor.id,
        action: field === "status" ? "Estado actualizado" : field === "assigneeId" ? "Asignación actualizada" : "Ticket actualizado",
        field,
        oldValue: serialise(current[field as keyof Ticket]),
        newValue: serialise(value),
      })),
    );
    const [ticket] = await tx.select().from(tickets).where(eq(tickets.id, current.id)).limit(1);
    return ticket;
  });
}

export async function softDeleteTicket(actor: User, current: Ticket) {
  const db = requireDb(await getDb());
  return db.transaction(async tx => {
    await tx.insert(ticketHistory).values({
      ticketId: current.id,
      actorId: actor.id,
      action: "Ticket eliminado",
      field: "deletedAt",
      oldValue: null,
      newValue: new Date().toISOString(),
    });
    await tx.update(tickets).set({ deletedAt: new Date() }).where(eq(tickets.id, current.id));
    return { success: true as const };
  });
}

export async function addTicketComment(actor: User, ticketId: number, body: string) {
  const db = requireDb(await getDb());
  return db.transaction(async tx => {
    const [created] = await tx.insert(ticketComments).values({ ticketId, authorId: actor.id, body }).$returningId();
    await tx.insert(ticketHistory).values({
      ticketId,
      actorId: actor.id,
      action: "Comentario agregado",
      field: "comment",
      oldValue: null,
      newValue: body.slice(0, 180),
    });
    return { id: created.id, body };
  });
}

export async function getCoordinatorIndicators() {
  const db = requireDb(await getDb());
  const rows = await db.select().from(tickets).where(isNull(tickets.deletedAt));
  const byStatus = { Abierto: 0, "En atención": 0, Resuelto: 0, Cerrado: 0 };
  let resolutionTotal = 0;
  let resolvedCount = 0;
  for (const ticket of rows) {
    byStatus[ticket.status] += 1;
    if (ticket.resolvedAt) {
      resolutionTotal += ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      resolvedCount += 1;
    }
  }
  const averageResolutionHours = resolvedCount ? Math.round((resolutionTotal / resolvedCount / 3_600_000) * 10) / 10 : 0;
  return {
    total: rows.length,
    byStatus,
    averageResolutionHours,
    summary: rows
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 12)
      .map(row => ({ id: row.id, folio: row.folio, title: row.title, status: row.status, priority: row.priority, updatedAt: row.updatedAt })),
  };
}

