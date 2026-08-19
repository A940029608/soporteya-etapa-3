import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  supportRole: mysqlEnum("supportRole", ["colaborador", "tecnico", "coordinador"])
    .default("colaborador")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const tickets = mysqlTable(
  "tickets",
  {
    id: int("id").autoincrement().primaryKey(),
    folio: varchar("folio", { length: 40 }).notNull().unique(),
    title: varchar("title", { length: 140 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    priority: mysqlEnum("priority", ["Baja", "Media", "Alta", "Urgente"]).notNull(),
    description: text("description").notNull(),
    status: mysqlEnum("status", ["Abierto", "En atención", "Resuelto", "Cerrado"])
      .default("Abierto")
      .notNull(),
    ownerId: int("ownerId").notNull().references(() => users.id),
    assigneeId: int("assigneeId").references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
    deletedAt: timestamp("deletedAt"),
  },
  table => [
    index("tickets_owner_idx").on(table.ownerId),
    index("tickets_assignee_idx").on(table.assigneeId),
    index("tickets_status_idx").on(table.status),
    index("tickets_priority_idx").on(table.priority),
  ],
);

export const ticketHistory = mysqlTable(
  "ticket_history",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull().references(() => tickets.id),
    actorId: int("actorId").notNull().references(() => users.id),
    action: varchar("action", { length: 80 }).notNull(),
    field: varchar("field", { length: 80 }),
    oldValue: text("oldValue"),
    newValue: text("newValue"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("history_ticket_idx").on(table.ticketId)],
);

export const ticketComments = mysqlTable(
  "ticket_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull().references(() => tickets.id),
    authorId: int("authorId").notNull().references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("comments_ticket_idx").on(table.ticketId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
export type TicketHistory = typeof ticketHistory.$inferSelect;
export type TicketComment = typeof ticketComments.$inferSelect;

