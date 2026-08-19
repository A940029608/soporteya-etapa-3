import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, CheckCircle2, CloudCog, Database, Download, ExternalLink, FileCode2, Github, Globe2, LockKeyhole, MonitorSmartphone, Route, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type SecurityAudit = {
  generatedAt: string;
  testFiles: number;
  tests: number;
  passed: number;
  checks: Array<{ test: string; type: string; result: string; evidence: string }>;
};

const PUBLISHED_APP_URL = "https://soporteya-nogales.manus.space";

export default function Documentation() {
  const [audit, setAudit] = useState<SecurityAudit | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState(() => localStorage.getItem("soporteya-github-url") ?? "");
  const validRepository = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(repositoryUrl.trim());
  useEffect(() => {
    fetch("/security-audit.json").then(response => response.ok ? response.json() : null).then(setAudit).catch(() => setAudit(null));
  }, []);
  const generateWord = trpc.academic.generate.useMutation({
    onSuccess: result => {
      const binary = atob(result.base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      const url = URL.createObjectURL(new Blob([bytes], { type: result.mimeType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Word académico generado", { description: "El documento cumple Arial 11, interlineado 1.5 y texto justificado." });
    },
    onError: error => toast.error("No fue posible generar el Word", { description: error.message }),
  });

  function saveRepository() {
    if (!validRepository) {
      toast.error("Ingresa una URL de repositorio válida", { description: "Ejemplo: https://github.com/usuario/soporteya" });
      return;
    }
    localStorage.setItem("soporteya-github-url", repositoryUrl.trim());
    toast.success("Enlace de GitHub guardado");
  }

  return <div className="mx-auto max-w-[1350px] space-y-7"><PageHeader eyebrow="Evidencia integrada" title="Documentación técnica" description="La funcionalidad, la arquitectura y las pruebas de seguridad permanecen visibles dentro de la propia aplicación." actions={<div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded-xl" asChild><a href={PUBLISHED_APP_URL} target="_blank" rel="noreferrer"><Globe2 className="mr-2 h-4 w-4" /> Aplicación publicada <ExternalLink className="ml-2 h-3.5 w-3.5" /></a></Button>{validRepository ? <Button variant="outline" className="rounded-xl" asChild><a href={repositoryUrl.trim()} target="_blank" rel="noreferrer"><Github className="mr-2 h-4 w-4" /> Repositorio GitHub <ExternalLink className="ml-2 h-3.5 w-3.5" /></a></Button> : <Button variant="outline" className="rounded-xl" disabled><Github className="mr-2 h-4 w-4" /> Repositorio pendiente</Button>}<Button onClick={() => generateWord.mutate(validRepository ? { repositoryUrl: repositoryUrl.trim() } : undefined)} disabled={generateWord.isPending} className="rounded-xl bg-[#1261a0] hover:bg-[#0f5389]"><Download className="mr-2 h-4 w-4" /> {generateWord.isPending ? "Generando…" : "Word Etapa 3"}</Button></div>} />
    <section className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between"><label className="field-group flex-1"><span>Repositorio GitHub de evidencia</span><Input value={repositoryUrl} onChange={event => setRepositoryUrl(event.target.value)} placeholder="https://github.com/usuario/soporteya" className="field-input" /><small className={validRepository || repositoryUrl.length === 0 ? "text-slate-500" : "text-rose-700"}>El enlace guardado aparece en la cabecera y se integra en el Word académico.</small></label><Button onClick={saveRepository} disabled={!validRepository} className="h-10 rounded-xl bg-[#102a43] hover:bg-[#173b57]"><Save className="mr-2 h-4 w-4" /> Guardar enlace</Button></section>
    <section className="surface-card p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">3.1 Descripción de funcionalidad</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Flujo CRUD de tickets</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cada operación atraviesa validación, autorización y persistencia antes de devolver una respuesta a la interfaz.</p></div><FileCode2 className="h-8 w-8 text-[#1261a0]" /></div><div className="mt-8 grid gap-3 md:grid-cols-4">{[
      { verb: "CREATE", title: "Agregar", copy: "Valida el formulario, genera folio y registra el evento inicial." },
      { verb: "READ", title: "Recuperar", copy: "Filtra los expedientes visibles según el rol autenticado." },
      { verb: "UPDATE", title: "Actualizar", copy: "Modifica datos o estado y conserva los valores anterior y nuevo." },
      { verb: "DELETE", title: "Borrar", copy: "Aplica eliminación lógica para preservar trazabilidad y evidencia." },
    ].map((item, index) => <div key={item.verb} className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><span className="font-mono text-[11px] font-bold tracking-[.16em] text-[#1261a0]">{item.verb}</span><h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>{index < 3 && <ArrowDown className="absolute -bottom-5 left-1/2 z-10 h-5 w-5 -translate-x-1/2 text-slate-300 md:-right-5 md:bottom-auto md:left-auto md:top-1/2 md:-translate-y-1/2 md:rotate-[-90deg]" />}</div>)}</div></section>
    <section className="surface-card p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">3.2 Implementación</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Arquitectura de la solución</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">La solución separa presentación, contrato de API, autorización y persistencia para mantener responsabilidades verificables.</p></div><CloudCog className="h-8 w-8 text-[#1261a0]" /></div><div className="mt-8 grid gap-4 md:grid-cols-4">{[
      { icon: MonitorSmartphone, title: "Interfaz React", copy: "Formularios, filtros, detalle, historial, indicadores y documentación responsiva." },
      { icon: Route, title: "Router tipado", copy: "Contratos de consulta y mutación con validación estricta de entradas." },
      { icon: LockKeyhole, title: "Políticas de acceso", copy: "Reglas independientes para colaborador, técnico y coordinación." },
      { icon: Database, title: "Base de datos cloud", copy: "Tickets, comentarios e historial persistidos con consultas parametrizadas." },
    ].map(item => <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#1261a0] ring-1 ring-slate-200"><item.icon className="h-5 w-5" /></div><h3 className="mt-4 font-semibold text-slate-950">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p></article>)}</div></section>
    <section className="surface-card p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">3.3 Pruebas de seguridad</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Controles estáticos y dinámicos</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Los resultados se generan desde una auditoría ejecutada sobre el código y la suite automatizada.</p>{audit && <p className="mt-3 text-xs font-semibold uppercase tracking-[.12em] text-emerald-700">{audit.passed}/{audit.tests} pruebas aprobadas · {audit.testFiles} archivos · {new Date(audit.generatedAt).toLocaleString("es-MX")}</p>}</div><ShieldCheck className="h-8 w-8 text-emerald-600" /></div><div className="mt-7 overflow-hidden rounded-2xl border border-slate-200"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#102a43] text-white"><tr><th className="px-5 py-4">Prueba</th><th className="px-5 py-4">Tipo</th><th className="px-5 py-4">Resultado</th><th className="px-5 py-4">Evidencia</th></tr></thead><tbody className="divide-y divide-slate-100">{(audit?.checks ?? []).map(row => <tr key={row.test}><td className="px-5 py-4 font-medium text-slate-900">{row.test}</td><td className="px-5 py-4 text-slate-600">{row.type}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> {row.result}</span></td><td className="px-5 py-4 leading-6 text-slate-600">{row.evidence}</td></tr>)}</tbody></table></div>{!audit && <p className="p-8 text-center text-sm text-slate-500">Cargando evidencia de seguridad…</p>}</div></section>
  </div>;
}
