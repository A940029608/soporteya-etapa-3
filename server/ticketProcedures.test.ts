import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

type FakeTicket = {
  id: number;
  folio: string;
  title: string;
  category: string;
  priority: "Baja" | "Media" | "Alta" | "Urgente";
  description: string;
  status: "Abierto" | "En atención" | "Resuelto" | "Cerrado";
  ownerId: number;
  assigneeId: number | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  deletedAt: Date | null;
};

const memory = vi.hoisted(() => ({ tickets: [] as FakeTicket[], sequence: 1 }));

vi.mock("./db", () => ({
  listVisibleTickets: vi.fn(async (_user, filters) => memory.tickets
    .filter(ticket => !ticket.deletedAt)
    .filter(ticket => !filters.status || ticket.status === filters.status)
    .filter(ticket => !filters.priority || ticket.priority === filters.priority)
    .map(ticket => ({ ...ticket, ownerName: "Coordinador" }))),
  getTicketById: vi.fn(async id => memory.tickets.find(ticket => ticket.id === id && !ticket.deletedAt)),
  getTicketTimeline: vi.fn(async () => ({ history: [], comments: [] })),
  createTicket: vi.fn(async (actor, input) => {
    const now = new Date("2026-08-18T12:00:00.000Z");
    const ticket: FakeTicket = {
      id: memory.sequence++,
      folio: `SY-2026-${String(memory.sequence).padStart(4, "0")}`,
      ...input,
      ownerId: actor.id,
      assigneeId: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: input.status === "Resuelto" || input.status === "Cerrado" ? now : null,
      deletedAt: null,
    };
    memory.tickets.push(ticket);
    return ticket;
  }),
  updateTicket: vi.fn(async (_actor, current, changes) => {
    Object.assign(current, changes, { updatedAt: new Date("2026-08-18T14:00:00.000Z") });
    if (changes.status === "Resuelto" || changes.status === "Cerrado") {
      current.resolvedAt = new Date("2026-08-18T14:00:00.000Z");
    }
    return current;
  }),
  softDeleteTicket: vi.fn(async (_actor, current) => {
    current.deletedAt = new Date("2026-08-18T15:00:00.000Z");
    return { success: true as const };
  }),
  addTicketComment: vi.fn(async (_actor, _ticketId, body) => ({ id: 1, body })),
  listTechnicians: vi.fn(async () => []),
  getCoordinatorIndicators: vi.fn(async () => {
    const rows = memory.tickets.filter(ticket => !ticket.deletedAt);
    const byStatus = { Abierto: 0, "En atención": 0, Resuelto: 0, Cerrado: 0 };
    let totalHours = 0;
    let resolved = 0;
    rows.forEach(ticket => {
      byStatus[ticket.status] += 1;
      if (ticket.resolvedAt) {
        totalHours += (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / 3_600_000;
        resolved += 1;
      }
    });
    return {
      total: rows.length,
      byStatus,
      averageResolutionHours: resolved ? totalHours / resolved : 0,
      summary: rows,
    };
  }),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

import { appRouter } from "./routers";

function coordinatorContext(): TrpcContext {
  const now = new Date("2026-08-18T10:00:00.000Z");
  return {
    user: {
      id: 1,
      openId: "coord",
      name: "Coordinador",
      email: "coord@example.com",
      loginMethod: "manus",
      role: "admin",
      supportRole: "coordinador",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const ticketInput = {
  title: "Sin acceso a la VPN institucional",
  category: "Conectividad",
  priority: "Alta" as const,
  description: "La conexión se interrumpe después de validar las credenciales del usuario.",
  status: "Abierto" as const,
};

describe("procedimientos funcionales de tickets", () => {
  beforeEach(() => {
    memory.tickets.splice(0, memory.tickets.length);
    memory.sequence = 1;
  });

  it("completa crear, recuperar, actualizar y eliminar con persistencia controlada", async () => {
    const caller = appRouter.createCaller(coordinatorContext());

    const created = await caller.tickets.create(ticketInput);
    expect(created.id).toBe(1);
    expect(created.status).toBe("Abierto");

    const listed = await caller.tickets.list({});
    expect(listed).toHaveLength(1);
    expect(listed[0]?.folio).toMatch(/^SY-2026-/);

    const updated = await caller.tickets.update({ id: created.id, changes: { status: "Resuelto", assigneeId: 9 } });
    expect(updated.status).toBe("Resuelto");
    expect(updated.assigneeId).toBe(9);
    expect(updated.resolvedAt).toBeInstanceOf(Date);

    const detail = await caller.tickets.detail({ id: created.id });
    expect(detail.ticket.status).toBe("Resuelto");

    await expect(caller.tickets.remove({ id: created.id })).resolves.toEqual({ success: true });
    await expect(caller.tickets.list({})).resolves.toHaveLength(0);
  });

  it("calcula conteos por estado y promedio de resolución", async () => {
    const caller = appRouter.createCaller(coordinatorContext());
    await caller.tickets.create(ticketInput);
    const second = await caller.tickets.create({ ...ticketInput, title: "Equipo sin audio", priority: "Media" });
    await caller.tickets.update({ id: second.id, changes: { status: "Resuelto" } });

    const indicators = await caller.tickets.indicators();
    expect(indicators.total).toBe(2);
    expect(indicators.byStatus.Abierto).toBe(1);
    expect(indicators.byStatus.Resuelto).toBe(1);
    expect(indicators.averageResolutionHours).toBe(2);
  });
});
