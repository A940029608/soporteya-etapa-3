import type { SupportRole } from "@shared/tickets";

export const statusTone = {
  Abierto: "bg-sky-50 text-sky-700 ring-sky-200",
  "En atención": "bg-amber-50 text-amber-800 ring-amber-200",
  Resuelto: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cerrado: "bg-slate-100 text-slate-700 ring-slate-200",
} as const;

export const priorityTone = {
  Baja: "text-slate-600",
  Media: "text-sky-700",
  Alta: "text-orange-700",
  Urgente: "text-rose-700",
} as const;

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Sin registro";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function roleLabel(role: SupportRole | undefined) {
  if (role === "tecnico") return "Técnico";
  if (role === "coordinador") return "Coordinador / Admin";
  return "Colaborador";
}

