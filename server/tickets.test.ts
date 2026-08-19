import { describe, expect, it } from "vitest";
import { ticketCommentSchema, ticketInputSchema } from "@shared/tickets";
import {
  canAssignTicket,
  canChangeStatus,
  canDeleteTicket,
  canViewIndicators,
  canViewTicket,
} from "./ticketPolicy";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ticket = { ownerId: 10, assigneeId: 20, status: "Abierto" as const };

describe("validaciones de tickets", () => {
  it("acepta un ticket completo", () => {
    expect(ticketInputSchema.parse({
      title: "Sin acceso a VPN",
      category: "Conectividad",
      priority: "Alta",
      description: "La conexión se interrumpe al validar las credenciales institucionales.",
      status: "Abierto",
    }).status).toBe("Abierto");
  });

  it("rechaza entradas incompletas", () => {
    expect(() => ticketInputSchema.parse({ title: "VPN", category: "TI", priority: "Alta", description: "Falla" })).toThrow();
    expect(() => ticketCommentSchema.parse({ body: "" })).toThrow();
  });
});

describe("políticas por rol", () => {
  it("limita al colaborador a sus tickets", () => {
    expect(canViewTicket({ id: 10, supportRole: "colaborador" }, ticket)).toBe(true);
    expect(canViewTicket({ id: 11, supportRole: "colaborador" }, ticket)).toBe(false);
    expect(canDeleteTicket({ id: 10, supportRole: "colaborador" }, ticket)).toBe(true);
  });

  it("limita al técnico a tickets asignados", () => {
    expect(canViewTicket({ id: 20, supportRole: "tecnico" }, ticket)).toBe(true);
    expect(canChangeStatus({ id: 20, supportRole: "tecnico" }, ticket)).toBe(true);
    expect(canChangeStatus({ id: 21, supportRole: "tecnico" }, ticket)).toBe(false);
  });

  it("reserva asignación e indicadores para coordinación", () => {
    expect(canAssignTicket({ id: 1, supportRole: "coordinador" })).toBe(true);
    expect(canViewIndicators({ id: 1, supportRole: "coordinador" })).toBe(true);
    expect(canViewIndicators({ id: 2, supportRole: "tecnico" })).toBe(false);
  });

  it("rechaza dinámicamente una mutación sin autenticación", async () => {
    const ctx = { user: null, req: {}, res: {} } as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tickets.create({
      title: "Sin acceso a VPN",
      category: "Conectividad",
      priority: "Alta",
      description: "La conexión se interrumpe al validar las credenciales institucionales.",
      status: "Abierto",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rechaza dinámicamente indicadores para un técnico", async () => {
    const now = new Date();
    const ctx = {
      user: { id: 20, openId: "tech", name: "Técnico", email: "tech@example.com", loginMethod: "manus", role: "user", supportRole: "tecnico", createdAt: now, updatedAt: now, lastSignedIn: now },
      req: {},
      res: {},
    } as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tickets.indicators()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

