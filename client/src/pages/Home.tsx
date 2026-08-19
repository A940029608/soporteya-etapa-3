import { useAuth } from "@/_core/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { TicketBadge } from "@/components/TicketBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, priorityTone, roleLabel } from "@/lib/tickets";
import { trpc } from "@/lib/trpc";
import type { TicketFilters } from "@shared/tickets";
import { ArrowRight, CheckCircle2, Clock3, Plus, Search, Ticket, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [query, setQuery] = useState("");
  const filters = useMemo<TicketFilters>(() => ({
    status: status ? status as TicketFilters["status"] : undefined,
    priority: priority ? priority as TicketFilters["priority"] : undefined,
    query: query || undefined,
  }), [status, priority, query]);
  const result = trpc.tickets.list.useQuery(filters);
  const rows = result.data ?? [];
  const counters = {
    open: rows.filter(row => row.status === "Abierto").length,
    active: rows.filter(row => row.status === "En atención").length,
    solved: rows.filter(row => row.status === "Resuelto" || row.status === "Cerrado").length,
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <PageHeader
        eyebrow={`Vista ${roleLabel(user?.supportRole)}`}
        title="Control de tickets"
        description="Consulta el estado del servicio, filtra expedientes y continúa la atención desde un único registro trazable."
        actions={<Button onClick={() => setLocation("/tickets/nuevo")} className="h-11 rounded-xl bg-[#1261a0] px-5 hover:bg-[#0f5389]"><Plus className="mr-2 h-4 w-4" /> Nuevo ticket</Button>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Abiertos", value: counters.open, icon: TriangleAlert, tone: "bg-sky-50 text-sky-700" },
          { label: "En atención", value: counters.active, icon: Clock3, tone: "bg-amber-50 text-amber-700" },
          { label: "Resueltos y cerrados", value: counters.solved, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
        ].map(item => (
          <article key={item.label} className="surface-card flex items-center gap-4 p-5">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${item.tone}`}><item.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-semibold tracking-tight text-slate-950">{item.value}</p><p className="text-sm text-slate-500">{item.label}</p></div>
          </article>
        ))}
      </section>

      <section className="surface-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-lg font-semibold text-slate-950">Expedientes visibles</h2><p className="mt-1 text-sm text-slate-500">Los resultados respetan automáticamente los permisos del rol.</p></div>
          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_160px_160px]">
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Folio, título o categoría" className="h-10 rounded-xl border-slate-200 pl-9" /></div>
            <select aria-label="Filtrar por estado" value={status} onChange={event => setStatus(event.target.value)} className="field-select"><option value="">Todos los estados</option><option>Abierto</option><option>En atención</option><option>Resuelto</option><option>Cerrado</option></select>
            <select aria-label="Filtrar por prioridad" value={priority} onChange={event => setPriority(event.target.value)} className="field-select"><option value="">Todas las prioridades</option><option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option></select>
          </div>
        </div>

        {result.isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Cargando tickets…</div>
        ) : result.error ? (
          <div className="p-12 text-center text-sm text-rose-700">{result.error.message}</div>
        ) : rows.length === 0 ? (
          <div className="grid place-items-center px-6 py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100"><Ticket className="h-6 w-6 text-slate-500" /></div>
            <h3 className="mt-4 font-semibold text-slate-900">No hay tickets con estos filtros</h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">Crea la primera solicitud o cambia los filtros para ampliar la consulta.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map(row => (
              <button key={row.id} onClick={() => setLocation(`/tickets/${row.id}`)} className="group grid w-full gap-4 px-5 py-5 text-left transition-colors hover:bg-slate-50/80 lg:grid-cols-[minmax(0,1.5fr)_180px_150px_190px_32px] lg:items-center">
                <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-xs font-semibold text-[#1261a0]">{row.folio}</span><TicketBadge status={row.status} /></div><h3 className="mt-2 truncate font-semibold text-slate-950">{row.title}</h3><p className="mt-1 text-sm text-slate-500">{row.category}</p></div>
                <div><p className="table-label">Prioridad</p><p className={`mt-1 text-sm font-semibold ${priorityTone[row.priority]}`}>{row.priority}</p></div>
                <div><p className="table-label">Propietario</p><p className="mt-1 truncate text-sm text-slate-700">{row.ownerName || "Usuario"}</p></div>
                <div><p className="table-label">Último cambio</p><p className="mt-1 text-sm text-slate-700">{formatDate(row.updatedAt)}</p></div>
                <ArrowRight className="hidden h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 lg:block" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

