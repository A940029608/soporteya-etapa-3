import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildStage3Document } from "../server/academicDocument";

const outputDir = resolve(process.cwd(), "artifacts");
await mkdir(outputDir, { recursive: true });
const buffer = await buildStage3Document(undefined, process.env.EVIDENCE_BASE_URL ?? "http://127.0.0.1:3000");
const output = resolve(outputDir, "Proyecto_Integrador_Etapa_3_SoporteYa_Arturo_Vega_Castillo.docx");
await writeFile(output, buffer);
console.log(output);
