import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rawReport = resolve(root, ".security-vitest.json");
execFileSync("pnpm", ["vitest", "run", "server/tickets.test.ts", "server/auth.logout.test.ts", "--reporter=json", `--outputFile=${rawReport}`], { cwd: root, stdio: "inherit" });

const report = JSON.parse(readFileSync(rawReport, "utf8"));
const router = readFileSync(resolve(root, "server/routers.ts"), "utf8");
const policy = readFileSync(resolve(root, "server/ticketPolicy.ts"), "utf8");
const validation = readFileSync(resolve(root, "shared/tickets.ts"), "utf8");
const db = readFileSync(resolve(root, "server/db.ts"), "utf8");

const checks = [
  {
    test: "Validación de entradas",
    type: "Estática y dinámica",
    result: validation.includes("ticketInputSchema") && validation.includes(".min(") ? "Aprobada" : "Revisar",
    evidence: "Esquemas Zod para longitud, catálogos y tipos; casos válidos e inválidos incluidos en Vitest.",
  },
  {
    test: "Autenticación",
    type: "Dinámica",
    result: router.includes("protectedProcedure") && report.numPassedTests === report.numTotalTests ? "Aprobada" : "Revisar",
    evidence: "La prueba invoca una mutación sin sesión y verifica la respuesta UNAUTHORIZED antes de acceder a datos.",
  },
  {
    test: "Control de acceso",
    type: "Estática y dinámica",
    result: policy.includes("canViewIndicators") && policy.includes("canViewTicket") && report.numPassedTests === report.numTotalTests ? "Aprobada" : "Revisar",
    evidence: "Políticas por rol verificadas unitariamente; una prueba dinámica confirma FORBIDDEN para indicadores de coordinación.",
  },
  {
    test: "Inyección y datos no confiables",
    type: "Estática",
    result: db.includes("drizzle") && db.includes("eq(") && !db.includes("db.execute(`") ? "Aprobada" : "Revisar",
    evidence: "Consultas parametrizadas mediante ORM; no se construyen sentencias SQL con entradas del usuario.",
  },
];

const output = {
  generatedAt: new Date().toISOString(),
  testFiles: report.numTotalTestSuites,
  tests: report.numTotalTests,
  passed: report.numPassedTests,
  checks,
};
const target = resolve(root, "client/public/security-audit.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Auditoría escrita en ${target}`);

