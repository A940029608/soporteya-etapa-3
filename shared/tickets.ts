import { z } from "zod";

export const TICKET_STATUSES = ["Abierto", "En atención", "Resuelto", "Cerrado"] as const;
export const TICKET_PRIORITIES = ["Baja", "Media", "Alta", "Urgente"] as const;
export const SUPPORT_ROLES = ["colaborador", "tecnico", "coordinador"] as const;

export const ticketStatusSchema = z.enum(TICKET_STATUSES);
export const ticketPrioritySchema = z.enum(TICKET_PRIORITIES);
export const supportRoleSchema = z.enum(SUPPORT_ROLES);

export const ticketInputSchema = z.object({
  title: z.string().trim().min(5, "El título debe contener al menos 5 caracteres").max(140),
  category: z.string().trim().min(3, "Selecciona o escribe una categoría válida").max(80),
  priority: ticketPrioritySchema,
  description: z.string().trim().min(20, "La descripción debe contener al menos 20 caracteres").max(4000),
  status: ticketStatusSchema.default("Abierto"),
});

export const ticketUpdateSchema = ticketInputSchema.partial().extend({
  assigneeId: z.number().int().positive().nullable().optional(),
});

export const ticketFiltersSchema = z.object({
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  query: z.string().trim().max(120).optional(),
}).default({});

export const ticketCommentSchema = z.object({
  body: z.string().trim().min(2, "El comentario es demasiado corto").max(2000),
});

export type TicketInput = z.infer<typeof ticketInputSchema>;
export type TicketUpdate = z.infer<typeof ticketUpdateSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
export type SupportRole = z.infer<typeof supportRoleSchema>;

