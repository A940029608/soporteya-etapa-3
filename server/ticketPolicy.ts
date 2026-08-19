import type { SupportRole } from "@shared/tickets";

export type PolicyUser = {
  id: number;
  role?: "user" | "admin";
  supportRole?: SupportRole;
};

export type PolicyTicket = {
  ownerId: number;
  assigneeId: number | null;
  status: "Abierto" | "En atención" | "Resuelto" | "Cerrado";
};

export function getSupportRole(user: PolicyUser): SupportRole {
  if (user.supportRole) return user.supportRole;
  return user.role === "admin" ? "coordinador" : "colaborador";
}

export function canViewTicket(user: PolicyUser, ticket: PolicyTicket) {
  const role = getSupportRole(user);
  if (role === "coordinador") return true;
  if (role === "tecnico") return ticket.assigneeId === user.id;
  return ticket.ownerId === user.id;
}

export function canEditGeneral(user: PolicyUser, ticket: PolicyTicket) {
  const role = getSupportRole(user);
  if (role === "coordinador") return true;
  if (role === "tecnico") return ticket.assigneeId === user.id;
  return ticket.ownerId === user.id && ticket.status === "Abierto";
}

export function canChangeStatus(user: PolicyUser, ticket: PolicyTicket) {
  const role = getSupportRole(user);
  return role === "coordinador" || (role === "tecnico" && ticket.assigneeId === user.id);
}

export function canDeleteTicket(user: PolicyUser, ticket: PolicyTicket) {
  const role = getSupportRole(user);
  return role === "coordinador" || (role === "colaborador" && ticket.ownerId === user.id && ticket.status === "Abierto");
}

export function canAssignTicket(user: PolicyUser) {
  return getSupportRole(user) === "coordinador";
}

export function canViewIndicators(user: PolicyUser) {
  return getSupportRole(user) === "coordinador";
}

