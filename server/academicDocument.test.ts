import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { buildStage3Document } from "./academicDocument";

describe("documento académico de la Etapa 3", () => {
  it("genera un archivo DOCX válido y no vacío", async () => {
    const buffer = await buildStage3Document("https://github.com/organizacion/soporteya");
    expect(buffer.subarray(0, 4).toString("hex")).toBe("504b0304");
    expect(buffer.length).toBeGreaterThan(10_000);
  });

  it("aplica el formato académico requerido en el XML del DOCX", async () => {
    const buffer = await buildStage3Document("https://github.com/organizacion/soporteya");
    const zip = await JSZip.loadAsync(buffer);
    const documentXml = await zip.file("word/document.xml")!.async("string");
    const stylesXml = await zip.file("word/styles.xml")!.async("string");

    expect(documentXml).toContain('w:ascii="Arial"');
    expect(documentXml).toContain('w:sz w:val="22"');
    expect(documentXml).toContain('w:line="360"');
    expect(documentXml).toContain('w:val="both"');
    expect(documentXml).toContain('w:hanging="720"');
    expect(stylesXml).toContain('w:ascii="Arial"');
    expect(stylesXml).toContain('w:sz w:val="22"');
  });
});
