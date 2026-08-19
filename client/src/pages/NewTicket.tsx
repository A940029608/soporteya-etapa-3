import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ticketInputSchema, type TicketInput } from "@shared/tickets";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const initial: TicketInput = { title: "", category: "", priority: "Media", description: "", status: "Abierto" };

export default function NewTicket() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<TicketInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();
  const create = trpc.tickets.create.useMutation({
    onSuccess: async ticket => {
      await utils.tickets.list.invalidate();
      toast.success("Ticket registrado", { description: `Se creó el folio ${ticket?.folio}.` });
      setLocation(`/tickets/${ticket?.id}`);
    },
    onError: error => toast.error("No fue posible guardar", { description: error.message }),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = ticketInputSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach(issue => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      toast.error("Revisa los campos señalados");
      return;
    }
    setErrors({});
    create.mutate(parsed.data);
  }

  const set = (key: keyof TicketInput, value: string) => setForm(current => ({ ...current, [key]: value }));

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeader eyebrow="Alta controlada" title="Nuevo ticket" description="Describe la incidencia con información verificable. La validación se ejecuta antes de enviar datos al servidor." actions={<Button variant="outline" onClick={() => setLocation("/")} className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Regresar</Button>} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={submit} noValidate className="surface-card p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="field-group sm:col-span-2"><span>Título</span><Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ej. Sin acceso a la VPN corporativa" aria-invalid={Boolean(errors.title)} className="field-input" />{errors.title && <small>{errors.title}</small>}</label>
            <label className="field-group"><span>Categoría</span><Input value={form.category} onChange={e => set("category", e.target.value)} placeholder="Conectividad" aria-invalid={Boolean(errors.category)} className="field-input" />{errors.category && <small>{errors.category}</small>}</label>
            <label className="field-group"><span>Prioridad</span><select value={form.priority} onChange={e => set("priority", e.target.value)} className="field-select"><option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option></select></label>
            <label className="field-group"><span>Estado inicial</span><select value={form.status} onChange={e => set("status", e.target.value)} className="field-select"><option>Abierto</option><option>En atención</option><option>Resuelto</option><option>Cerrado</option></select></label>
            <div className="hidden sm:block" />
            <label className="field-group sm:col-span-2"><span>Descripción</span><Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Indica qué ocurre, desde cuándo, qué intentaste y cuál es el impacto." rows={9} aria-invalid={Boolean(errors.description)} className="field-input resize-none" />{errors.description && <small>{errors.description}</small>}</label>
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={() => setLocation("/")}>Cancelar</Button><Button type="submit" disabled={create.isPending} className="rounded-xl bg-[#1261a0] px-6 hover:bg-[#0f5389]">{create.isPending ? "Guardando…" : "Crear ticket"}</Button></div>
        </form>
        <aside className="space-y-4">
          <div className="surface-card p-5"><ShieldCheck className="h-6 w-6 text-[#1261a0]" /><h2 className="mt-4 font-semibold text-slate-950">Validación en dos capas</h2><p className="mt-2 text-sm leading-6 text-slate-600">El navegador orienta al usuario y el servidor vuelve a validar cada valor antes de persistirlo.</p></div>
          <div className="surface-card p-5"><CheckCircle2 className="h-6 w-6 text-emerald-600" /><h2 className="mt-4 font-semibold text-slate-950">Trazabilidad automática</h2><p className="mt-2 text-sm leading-6 text-slate-600">El sistema asigna un folio y registra el evento de creación en el historial.</p></div>
        </aside>
      </div>
    </div>
  );
}

