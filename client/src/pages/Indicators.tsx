import { useAuth } from "@/_core/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { TicketBadge } from "@/components/TicketBadge";
import { formatDate } from "@/lib/tickets";
import { trpc } from "@/lib/trpc";
import { Activity, BarChart3, Clock3, LockKeyhole, Tickets } from "lucide-react";

export default function Indicators() {
  const { user } = useAuth();
  const allowed = user?.supportRole === "coordinador";
  const indicators = trpc.tickets.indicators.useQuery(undefined, { enabled: allowed });

  if (!allowed) return <div className="mx-auto grid min-h-[65vh] max-w-xl place-items-center text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-700"><LockKeyhole className="h-7 w-7" /></div><h1 className="mt-5 text-2xl font-semibold text-slate-950">Acceso exclusivo de coordinación</h1><p className="mt-3 text-sm leading-6 text-slate-600">Los indicadores agregados pueden exponer información del servicio y se protegen mediante autorización en el servidor.</p></div></div>;
  if (indicators.isLoading || !indicators.data) return <div className="grid min-h-[55vh] place-items-center text-sm text-slate-500">Calculando indicadores…</div>;
  const data = indicators.data;
  const max = Math.max(...Object.values(data.byStatus), 1);

  return <div className="mx-auto max-w-[1500px] space-y-7"><PageHeader eyebrow="Coordinación" title="Indicadores del servicio" description="Métricas calculadas sobre tickets vigentes para supervisar carga, avance y tiempos de resolución." />
    <section className="grid gap-4 md:grid-cols-3"><Metric icon={Tickets} label="Tickets vigentes" value={String(data.total)} /><Metric icon={Clock3} label="Promedio de resolución" value={`${data.averageResolutionHours} h`} /><Metric icon={Activity} label="Cierre acumulado" value={String(data.byStatus.Cerrado)} /></section>
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <section className="surface-card p-6 sm:p-8"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-[#1261a0]" /><div><h2 className="font-semibold text-slate-950">Distribución por estado</h2><p className="text-sm text-slate-500">Valores calculados en tiempo real</p></div></div><div className="mt-8 space-y-6">{Object.entries(data.byStatus).map(([label, value]) => <div key={label}><div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="font-semibold text-slate-950">{value}</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#1261a0] to-[#36a3c7] transition-[width] duration-500" style={{ width: `${Math.max(value / max * 100, value ? 8 : 0)}%` }} /></div></div>)}</div></section>
      <section className="surface-card overflow-hidden"><div className="border-b border-slate-100 p-6"><h2 className="font-semibold text-slate-950">Resumen operativo</h2><p className="mt-1 text-sm text-slate-500">Últimos expedientes actualizados</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Folio</th><th className="px-4 py-4">Ticket</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Prioridad</th><th className="px-6 py-4">Actualización</th></tr></thead><tbody className="divide-y divide-slate-100">{data.summary.map(row => <tr key={row.id}><td className="px-6 py-4 font-mono text-xs font-semibold text-[#1261a0]">{row.folio}</td><td className="max-w-[240px] truncate px-4 py-4 font-medium text-slate-800">{row.title}</td><td className="px-4 py-4"><TicketBadge status={row.status} /></td><td className="px-4 py-4 text-slate-700">{row.priority}</td><td className="px-6 py-4 text-slate-600">{formatDate(row.updatedAt)}</td></tr>)}</tbody></table></div></section>
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Tickets; label: string; value: string }) { return <article className="surface-card flex items-center gap-4 p-5"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-[#1261a0]"><Icon className="h-5 w-5" /></div><div><p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p><p className="text-sm text-slate-500">{label}</p></div></article>; }

