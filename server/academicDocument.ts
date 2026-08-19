import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LineRuleType,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import securityAudit from "../client/public/security-audit.json";

const NAVY = "102A43";
const BLUE = "1261A0";
const TEXT = "222222";
const LIGHT = "EAF2F8";
const WHITE = "FFFFFF";
const PUBLISHED_APP_URL = "https://soporteya-nogales.manus.space";
const DEFAULT_REPOSITORY_URL = "https://github.com/A940029608/soporteya-etapa-3";

const EVIDENCE_ASSETS = {
  dashboard: "/manus-storage/01_panel_tickets_979f958e.png",
  form: "/manus-storage/02_formulario_ticket_b3c6d6f1.png",
  indicators: "/manus-storage/03_indicadores_87094f02.png",
  crud: "/manus-storage/04_diagrama_crud_7a57a650.png",
  security: "/manus-storage/05_pruebas_seguridad_2d8a0b1f.png",
} as const;

function run(text: string, options: { bold?: boolean; italics?: boolean; color?: string; size?: number } = {}) {
  return new TextRun({ text, font: "Arial", size: options.size ?? 22, bold: options.bold, italics: options.italics, color: options.color ?? TEXT });
}

function body(text: string) {
  return new Paragraph({
    children: [run(text)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 120 },
    widowControl: true,
  });
}

function heading(text: string, level: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2, pageBreakBefore = false) {
  return new Paragraph({
    heading: level,
    pageBreakBefore,
    children: [run(text, { bold: true, color: level === HeadingLevel.HEADING_1 ? NAVY : BLUE, size: level === HeadingLevel.HEADING_1 ? 24 : 22 })],
    spacing: { line: 360, lineRule: LineRuleType.AUTO, before: level === HeadingLevel.HEADING_1 ? 240 : 160, after: 120 },
    keepNext: true,
  });
}

function tableCell(text: string, header = false) {
  return new TableCell({
    shading: { fill: header ? NAVY : WHITE },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({
      children: [run(text, { bold: header, color: header ? WHITE : TEXT })],
      alignment: header ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
      spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 0 },
    })],
  });
}

function dataTable(headers: string[], rows: string[][], widths?: number[]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, color: "D7E2EA", size: 4 },
      bottom: { style: BorderStyle.SINGLE, color: "D7E2EA", size: 4 },
      left: { style: BorderStyle.SINGLE, color: "D7E2EA", size: 4 },
      right: { style: BorderStyle.SINGLE, color: "D7E2EA", size: 4 },
      insideHorizontal: { style: BorderStyle.SINGLE, color: "D7E2EA", size: 4 },
      insideVertical: { style: BorderStyle.SINGLE, color: "D7E2EA", size: 4 },
    },
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map(item => tableCell(item, true)) }),
      ...rows.map(row => new TableRow({ cantSplit: true, children: row.map(item => tableCell(item)) })),
    ],
  });
}

function spacer(size = 120) {
  return new Paragraph({ children: [], spacing: { after: size } });
}

function reference(text: string) {
  return new Paragraph({
    children: [run(text)],
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 720, hanging: 720 },
    spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 120 },
  });
}

async function loadEvidence(assetOrigin?: string) {
  const evidence = new Map<string, Uint8Array>();
  if (!assetOrigin) return evidence;
  const origin = assetOrigin.replace(/\/$/, "");
  await Promise.all(Object.entries(EVIDENCE_ASSETS).map(async ([key, path]) => {
    try {
      const response = await fetch(`${origin}${path}`);
      if (response.ok) evidence.set(key, new Uint8Array(await response.arrayBuffer()));
    } catch {
      // La exportación continúa y documenta la ausencia de la captura.
    }
  }));
  return evidence;
}

function evidenceBlock(data: Uint8Array | undefined, caption: string, width: number, height: number) {
  if (!data) {
    return [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(`Evidencia no disponible durante esta exportación: ${caption}`, { italics: true, color: "666666", size: 18 })], spacing: { line: 360, after: 120 } })];
  }
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ data, type: "png", transformation: { width, height } })], spacing: { before: 120, after: 80 } }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [run(caption, { italics: true, color: "555555", size: 18 })], spacing: { line: 360, after: 180 } }),
  ];
}

export async function buildStage3Document(repositoryUrl?: string, assetOrigin?: string) {
  const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Mexico_City" }).format(new Date());
  const evidence = await loadEvidence(assetOrigin);
  const repositoryEvidence = repositoryUrl && repositoryUrl !== "https://github.com/"
    ? repositoryUrl
    : DEFAULT_REPOSITORY_URL;

  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 540, after: 160 }, children: [run("UNIVERSIDAD DEL VALLE DE MÉXICO", { bold: true, color: NAVY, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 320 }, children: [run("CAMPUS EN LÍNEA", { bold: true, color: BLUE, size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [run("SOLUCIONES DE PROGRAMACIÓN MÓVIL", { bold: true, color: NAVY, size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 }, children: [run("PROYECTO INTEGRADOR · ETAPA 3", { bold: true, color: BLUE, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 520 }, children: [run("Desarrollo de la aplicación web «SoporteYa»", { bold: true, color: NAVY, size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [run("Alumno: Arturo Vega Castillo", { bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [run("Docente: Franklin Tapia Penagos")] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [run("Matrícula: 940029608")] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [run(`Ciudad de México, ${date}`)] }),

    heading("Introducción", HeadingLevel.HEADING_1, true),
    body("La tercera etapa del Proyecto Integrador materializa los requisitos y prototipos de SoporteYa en una aplicación web funcional para gestionar solicitudes de soporte técnico. El producto implementa el ciclo completo de atención mediante operaciones de creación, consulta, actualización y eliminación lógica, con persistencia en una base de datos alojada en la nube."),
    body("La implementación conserva los tres perfiles definidos previamente: el colaborador consulta sus propios tickets, el técnico atiende los expedientes asignados y el coordinador supervisa el conjunto del servicio. Cada operación se valida en el cliente y en el servidor, aplica permisos por rol y genera una entrada de historial para mantener trazabilidad."),
    body("El documento integra la descripción funcional, el proceso de implementación y las pruebas de seguridad. La evidencia procede del código ejecutable, de la suite automatizada y de la documentación técnica visible dentro de la propia interfaz."),

    heading("I. Integración de las Etapas 1 y 2", HeadingLevel.HEADING_1),
    body("La Etapa 1 identificó la dispersión de solicitudes y definió como objetivo centralizar su registro y seguimiento. La Etapa 2 tradujo los requisitos en interfaces, rutas, roles y una arquitectura por capas. La Etapa 3 conserva ese vocabulario y lo convierte en contratos de datos, políticas de autorización y componentes de interfaz verificables."),
    dataTable(["Etapa", "Aportación recuperada", "Aplicación en el desarrollo"], [
      ["Etapa 1", "Problema, usuarios, requisitos funcionales y restricciones.", "Modelo de tickets, roles y criterios de acceso."],
      ["Etapa 2", "Prototipos, navegación, estados y arquitectura conceptual.", "Páginas responsivas, rutas, diseño visual y separación de responsabilidades."],
      ["Etapa 3", "Código ejecutable, persistencia, pruebas y evidencia.", "CRUD, historial, comentarios, indicadores, documentación y Word descargable."],
    ]),

    heading("III. Desarrollo de la aplicación", HeadingLevel.HEADING_1, true),
    heading("3.1 Descripción de funcionalidad", HeadingLevel.HEADING_2),
    body("SoporteYa administra un expediente único por incidencia. El formulario solicita título, categoría, prioridad, descripción y estado; antes de guardar, el navegador muestra errores específicos y el servidor repite la validación. Un folio se genera de forma automática y cada cambio queda relacionado con el usuario autenticado."),
    dataTable(["Operación", "Comportamiento implementado", "Evidencia de trazabilidad"], [
      ["Agregar (Create)", "Valida el formulario, crea el ticket y devuelve el folio.", "Evento “Ticket creado” con actor y fecha."],
      ["Recuperar (Read)", "Lista, filtra y abre únicamente expedientes permitidos por el rol.", "Consultas con filtros de propietario o técnico asignado."],
      ["Actualizar (Update)", "Modifica datos, asignación o estado conforme a permisos.", "Valores anterior y nuevo en ticket_history."],
      ["Borrar (Delete)", "Aplica eliminación lógica para conservar evidencia.", "Fecha de baja y evento de eliminación en el historial."],
    ]),
    spacer(),
    body("Los estados se controlan mediante un catálogo cerrado con los valores exactos Abierto, En atención, Resuelto y Cerrado. La vista de detalle incorpora comentarios, historial de cambios, actualización condicionada y eliminación según rol y estado."),
    heading("Evidencias de funcionalidad", HeadingLevel.HEADING_2),
    ...evidenceBlock(evidence.get("dashboard"), "Figura 1. Panel autenticado de gestión y filtrado de tickets.", 580, 363),
    ...evidenceBlock(evidence.get("crud"), "Figura 2. Diagrama CRUD integrado dentro de la aplicación.", 580, 204),

    heading("3.2 Implementación", HeadingLevel.HEADING_2),
    body("La solución utiliza React y TypeScript en la interfaz; tRPC y Zod como contrato tipado y validación; Express para el servidor; Drizzle ORM para consultas parametrizadas; y una base de datos MySQL/TiDB administrada en la nube. Esta combinación permite mantener el mismo tipo de datos desde el formulario hasta la persistencia."),
    dataTable(["Capa", "Componentes", "Responsabilidad"], [
      ["Presentación", "React, Tailwind CSS y componentes accesibles.", "Formularios, filtros, detalle, indicadores y documentación."],
      ["Contrato de API", "tRPC y Zod.", "Validar entradas y exponer consultas y mutaciones tipadas."],
      ["Autorización", "Políticas de colaborador, técnico y coordinador.", "Impedir lectura o modificación fuera del alcance del rol."],
      ["Persistencia", "Drizzle ORM y base de datos cloud.", "Guardar tickets, comentarios, historial y marcas de tiempo."],
    ]),
    spacer(),
    body(`Aplicación publicada y verificada: ${PUBLISHED_APP_URL}`),
    body(`El repositorio de evidencia se presenta en la interfaz. Referencia: ${repositoryEvidence}`),
    body("El proceso de implementación comprendió la definición del esquema, generación y revisión de la migración SQL, aplicación en la base de datos, construcción de procedimientos del servidor, desarrollo de vistas, integración de indicadores y ejecución de pruebas automatizadas."),
    ...evidenceBlock(evidence.get("form"), "Figura 3. Formulario de alta con campos, validación y estado inicial.", 580, 363),
    ...evidenceBlock(evidence.get("indicators"), "Figura 4. Indicadores exclusivos para coordinación.", 580, 363),

    heading("3.3 Pruebas de seguridad", HeadingLevel.HEADING_2),
    body(`La auditoría automatizada se ejecutó sobre ${securityAudit.testFiles} archivos y reportó ${securityAudit.passed} de ${securityAudit.tests} pruebas aprobadas. Los resultados visibles en la aplicación se generan desde el mismo archivo de auditoría utilizado para esta documentación.`),
    dataTable(["Prueba", "Tipo", "Resultado", "Evidencia"], securityAudit.checks.map(item => [item.test, item.type, item.result, item.evidence])),
    spacer(),
    body("Las pruebas dinámicas invocan procedimientos protegidos sin sesión y con un rol no autorizado para verificar respuestas UNAUTHORIZED y FORBIDDEN antes de realizar operaciones en la base. Las pruebas estáticas revisan validadores, políticas y ausencia de concatenación SQL con entradas del usuario."),
    ...evidenceBlock(evidence.get("security"), "Figura 5. Resultados de controles estáticos y dinámicos visibles en la interfaz.", 580, 305),

    heading("Conclusión", HeadingLevel.HEADING_1, true),
    body("La Etapa 3 convirtió el diseño de SoporteYa en una aplicación web funcional con persistencia en la nube. El CRUD implementado cubre el ciclo de creación, consulta, atención y cierre, mientras que los comentarios y el historial mantienen un expediente comprensible para los tres perfiles definidos."),
    body("La separación entre interfaz, contrato tipado, autorización y persistencia facilita comprobar cada responsabilidad. Los indicadores del coordinador se calculan a partir de registros vigentes y las acciones sensibles se limitan en el servidor, por lo que la seguridad no depende únicamente de ocultar controles visuales."),
    body("El resultado cumple los apartados 3.1, 3.2 y 3.3 y deja preparada una base extensible para adjuntos, notificaciones y distribución móvil posterior. La documentación integrada y el Word descargable permiten verificar tanto el funcionamiento técnico como el cumplimiento académico."),

    heading("Referencias", HeadingLevel.HEADING_1, true),
    reference("Argentesting. (2021, 22 de octubre). Desarrollo seguro sobre aplicaciones móviles [Video]. YouTube. https://www.youtube.com/watch?v=k5xOeh3WON4"),
    reference("Drizzle Team. (s. f.). Drizzle ORM documentation. https://orm.drizzle.team/docs/overview"),
    reference("Grupo Babel. (2020, 19 de agosto). Herramientas para pruebas de seguridad de aplicaciones [Video]. YouTube. https://www.youtube.com/watch?v=G4HoSGUaF2Y"),
    reference("OWASP Foundation. (2024). OWASP Web Security Testing Guide. https://owasp.org/www-project-web-security-testing-guide/"),
    reference("OWASP Foundation. (2025). OWASP Application Security Verification Standard. https://owasp.org/www-project-application-security-verification-standard/"),
    reference("React Team. (2026). React documentation. https://react.dev/"),
    reference("Testing Para Todos. (2020, 11 de agosto). Cómo hacer testing de una app (100 % práctico): Introducción al testing [Video]. YouTube. https://www.youtube.com/watch?v=miRs8XlZRcI"),
    reference("Zod. (2026). TypeScript-first schema validation with static type inference. https://zod.dev/"),
  ];

  const document = new Document({
    creator: "Arturo Vega Castillo",
    title: "Proyecto Integrador Etapa 3 — SoporteYa",
    description: "Desarrollo, implementación y pruebas de seguridad de SoporteYa.",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 22, color: TEXT },
          paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 360, lineRule: LineRuleType.AUTO, after: 120 } },
        },
      },
    },
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [run("SoporteYa · Proyecto Integrador Etapa 3", { color: BLUE, size: 18 })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("Arturo Vega Castillo · Página ", { size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: TEXT })] })] }) },
      children,
    }],
  });

  return Packer.toBuffer(document);
}
