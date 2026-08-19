import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  ticketCommentSchema,
  ticketFiltersSchema,
  ticketInputSchema,
  ticketUpdateSchema,
} from "@shared/tickets";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { buildStage3Document } from "./academicDocument";
import {
  canAssignTicket,
  canChangeStatus,
  canDeleteTicket,
  canEditGeneral,
  canViewIndicators,
  canViewTicket,
} from "./ticketPolicy";

function notFound() {
  throw new TRPCError({ code: "NOT_FOUND", message: "Ticket no encontrado" });
}

async function visibleTicket(user: NonNullable<Parameters<typeof canViewTicket>[0]>, id: number) {
  const ticket = await db.getTicketById(id);
  if (!ticket || !canViewTicket(user, ticket)) notFound();
  return ticket!;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  tickets: router({
    list: protectedProcedure.input(ticketFiltersSchema).query(({ ctx, input }) => db.listVisibleTickets(ctx.user, input)),
    detail: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const ticket = await visibleTicket(ctx.user, input.id);
      const timeline = await db.getTicketTimeline(ticket.id);
      return { ticket, ...timeline };
    }),
    create: protectedProcedure.input(ticketInputSchema).mutation(({ ctx, input }) => db.createTicket(ctx.user, input)),
    update: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), changes: ticketUpdateSchema }))
      .mutation(async ({ ctx, input }) => {
        const ticket = await visibleTicket(ctx.user, input.id);
        const changedKeys = Object.keys(input.changes);
        if (!canEditGeneral(ctx.user, ticket)) throw new TRPCError({ code: "FORBIDDEN", message: "No puedes editar este ticket" });
        if (input.changes.status && !canChangeStatus(ctx.user, ticket)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Tu rol no puede cambiar el estado" });
        }
        if (changedKeys.includes("assigneeId") && !canAssignTicket(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Solo coordinación puede asignar técnicos" });
        }
        return db.updateTicket(ctx.user, ticket, input.changes);
      }),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const ticket = await visibleTicket(ctx.user, input.id);
      if (!canDeleteTicket(ctx.user, ticket)) throw new TRPCError({ code: "FORBIDDEN", message: "No puedes eliminar este ticket" });
      return db.softDeleteTicket(ctx.user, ticket);
    }),
    comment: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }).merge(ticketCommentSchema))
      .mutation(async ({ ctx, input }) => {
        const ticket = await visibleTicket(ctx.user, input.id);
        return db.addTicketComment(ctx.user, ticket.id, input.body);
      }),
    technicians: protectedProcedure.query(({ ctx }) => {
      if (!canAssignTicket(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Acceso exclusivo de coordinación" });
      return db.listTechnicians();
    }),
    indicators: protectedProcedure.query(({ ctx }) => {
      if (!canViewIndicators(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Acceso exclusivo de coordinación" });
      return db.getCoordinatorIndicators();
    }),
  }),
  academic: router({
    generate: protectedProcedure
      .input(z.object({ repositoryUrl: z.string().url().optional() }).optional())
      .mutation(async ({ input, ctx }) => {
        const forwardedProto = ctx.req.headers["x-forwarded-proto"];
        const protocol = typeof forwardedProto === "string" ? forwardedProto.split(",")[0]?.trim() : ctx.req.protocol;
        const host = ctx.req.get?.("host") ?? ctx.req.headers.host;
        const assetOrigin = host ? `${protocol || "https"}://${host}` : undefined;
        const buffer = await buildStage3Document(input?.repositoryUrl, assetOrigin);
        return {
          filename: "Proyecto_Integrador_Etapa_3_SoporteYa_Arturo_Vega_Castillo.docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          base64: buffer.toString("base64"),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
