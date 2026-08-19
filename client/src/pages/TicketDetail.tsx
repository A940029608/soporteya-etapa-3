import { useAuth } from "@/_core/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { TicketBadge } from "@/components/TicketBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, roleLabel } from "@/lib/tickets";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Clock3, MessageSquarePlus, Pencil, Save, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const detail = trpc.tickets.detail.useQuery({ id: ticketId }, { enabled: Number.isInteger(ticketId) });
  const coordinator = user?.supportRole === "coordinador";
  const technician = user?.supportRole === "tecnico";
  const techs = trpc.tickets.technicians.useQuery(undefined, { enabled: coordinator });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", category: "", priority: "Media", description: "", status: "Abierto", assigneeId: "" });
  const [comment, setComment] = useState("");

  useEffect(() => {
    const ticket = detail.data?.ticket;
    if (!ticket) return;
    setDraft({ title: ticket.title, category: ticket.category, priority: ticket.priority, description: ticket.description, status: ticket.status, assigneeId: ticket.assigneeId ? String(ticket.assigneeId) : "" });
  }, [detail.data?.ticket]);

  const refresh = async () => { await Promise.all([utils.tickets.detail.invalidate({ id: ticketId }), utils.tickets.list.invalidate(), utils.tickets.indicators.invalidate()]); };
  const update = trpc.tickets.update.useMutation({ onSuccess: async () => { await refresh(); setEditing(false); toast.success("Ticket actualizado"); }, onError: error => toast.error(error.message) });
  const remove = trpc.tickets.remove.useMutation({ onSuccess: async () => { await utils.tickets.list.invalidate(); toast.success("Ticket eliminado"); setLocation("/"); }, onError: error => toast.error(error.message) });
  const addComment = trpc.tickets.comment.useMutation({ onSuccess: async () => { setComment(""); await refresh(); toast.success("Comentario agregado"); }, onError: error => toast.error(error.message) });

  if (detail.isLoading) return <div className="grid min-h-[55vh] place-items-center text-sm text-slate-500">Cargando expediente…</div>;
  if (detail.error || !detail.data) return <div className="surface-card mx-auto max-w-2xl p-10 text-center"><h1 className="text-xl font-semibold">No fue posible abrir el ticket</h1><p className="mt-2 text-sm text-slate-500">{detail.error?.message || "Expediente no encontrado"}</p><Button onClick={() => setLocation("/")} className="mt-6">Regresar</Button></div>;

  const { ticket, comments, history } = detail.data;
  const canChangeStatus = coordinator || technician;
  const canEdit = coordinator || technician || (user?.id === ticket.ownerId && ticket.status === "Abierto");
  const canDelete = coordinator || (user?.supportRole === "colaborador" && user.id === ticket.ownerId && ticket.status === "Abierto");

  function save() {
    update.mutate({ id: ticket.id, changes: { title: draft.title, category: draft.category, priority: draft.priority as never, description: draft.description, ...(canChangeStatus ? { status: draft.status as never } : {}), ...(coordinator ? { assigneeId: draft.assigneeId ? Number(draft.assigneeId) : null } : {}) } });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <PageHeader eyebrow={ticket.folio} title={ticket.title} description={`Expediente creado ${formatDate(ticket.createdAt)} · Vista ${roleLabel(user?.supportRole)}`} actions={<div className="flex gap-2"><Button variant="outline" onClick={() => setLocation("/")} className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>{canEdit && <Button onClick={() => editing ? save() : setEditing(true)} className="rounded-xl bg-[#1261a0] hover:bg-[#0f5389]">{editing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}{editing ? "Guardar" : "Editar"}</Button>}</div>} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,.85fr)]">
        <div className="space-y-6">
          <section className="surface-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6"><div><p className="table-label">Estado actual</p><div className="mt-2"><TicketBadge status={ticket.status} /></div></div><div className="text-right"><p className="table-label">Última actualización</p><p className="mt-2 text-sm font-medium text-slate-700">{formatDate(ticket.updatedAt)}</p></div></div>
            {editing ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="field-group sm:col-span-2"><span>Título</span><Input value={draft.title} onChange={e => setDraft(v => ({ ...v, title: e.target.value }))} className="field-input" /></label><label className="field-group"><span>Categoría</span><Input value={draft.category} onChange={e => setDraft(v => ({ ...v, category: e.target.value }))} className="field-input" /></label><label className="field-group"><span>Prioridad</span><select value={draft.priority} onChange={e => setDraft(v => ({ ...v, priority: e.target.value }))} className="field-select"><option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option></select></label>{canChangeStatus && <label className="field-group"><span>Estado</span><select value={draft.status} onChange={e => setDraft(v => ({ ...v, status: e.target.value }))} className="field-select"><option>Abierto</option><option>En atención</option><option>Resuelto</option><option>Cerrado</option></select></label>}{coordinator && <label className="field-group"><span>Técnico asignado</span><select value={draft.assigneeId} onChange={e => setDraft(v => ({ ...v, assigneeId: e.target.value }))} className="field-select"><option value="">Sin asignar</option>{(techs.data ?? []).map(item => <option key={item.id} value={item.id}>{item.name || item.email || `Técnico ${item.id}`}</option>)}</select></label>}<label className="field-group sm:col-span-2"><span>Descripción</span><Textarea value={draft.description} onChange={e => setDraft(v => ({ ...v, description: e.target.value }))} rows={8} className="field-input resize-none" /></label></div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-3"><div><p className="table-label">Categoría</p><p className="mt-2 font-medium text-slate-800">{ticket.category}</p></div><div><p className="table-label">Prioridad</p><p className="mt-2 font-medium text-slate-800">{ticket.priority}</p></div><div><p className="table-label">Asignación</p><p className="mt-2 font-medium text-slate-800">{ticket.assigneeId ? `Técnico #${ticket.assigneeId}` : "Sin asignar"}</p></div><div className="sm:col-span-3"><p className="table-label">Descripción</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{ticket.description}</p></div></div>
            )}
            <div className="mt-8 flex items-center justify-end border-t border-slate-100 pt-6">
              {canDelete ? <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"><Trash2 className="mr-2 h-4 w-4" /> Eliminar ticket</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar este ticket?</AlertDialogTitle><AlertDialogDescription>La eliminación será lógica y permanecerá registrada como evidencia en el historial.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => remove.mutate({ id: ticket.id })} className="bg-rose-700 hover:bg-rose-800">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : <p className="text-xs text-slate-500">La eliminación no está habilitada para este rol o estado.</p>}
            </div>
          </section>
          <section className="surface-card p-6 sm:p-8"><h2 className="text-lg font-semibold text-slate-950">Comentarios</h2><p className="mt-1 text-sm text-slate-500">La conversación forma parte del expediente y conserva autor y fecha.</p><div className="mt-5 flex gap-3"><Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Añade una actualización útil para el seguimiento…" rows={3} className="field-input resize-none" /><Button disabled={addComment.isPending || comment.trim().length < 2} onClick={() => addComment.mutate({ id: ticket.id, body: comment })} className="h-auto rounded-xl bg-[#1261a0] px-4 hover:bg-[#0f5389]"><MessageSquarePlus className="h-5 w-5" /><span className="sr-only">Agregar comentario</span></Button></div><div className="mt-6 space-y-3">{comments.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Todavía no hay comentarios.</p> : comments.map(item => <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#1261a0] ring-1 ring-slate-200"><UserRound className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-slate-800">{item.authorName || "Usuario"}</p><p className="text-xs text-slate-500">{roleLabel(item.authorRole || undefined)}</p></div></div><time className="text-xs text-slate-500">{formatDate(item.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p></article>)}</div></section>
        </div>
        <aside className="surface-card h-fit p-6 sm:p-7"><div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-[#1261a0]" /><div><h2 className="font-semibold text-slate-950">Historial de cambios</h2><p className="text-xs text-slate-500">Bitácora inmutable del expediente</p></div></div><div className="relative mt-7 space-y-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200">{history.map(item => <article key={item.id} className="relative pl-7"><span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#1261a0] ring-1 ring-slate-200" /><p className="text-sm font-semibold text-slate-800">{item.action}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.actorName || "Usuario"} · {formatDate(item.createdAt)}</p>{item.field && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><span className="font-medium">{item.field}:</span> {item.oldValue || "—"} → {item.newValue || "—"}</p>}</article>)}</div></aside>
      </div>
    </div>
  );
}
