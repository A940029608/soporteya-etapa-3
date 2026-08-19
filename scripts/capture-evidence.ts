import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { COOKIE_NAME } from "../shared/const";
import { ENV } from "../server/_core/env";
import { sdk } from "../server/_core/sdk";

const baseUrl = process.env.EVIDENCE_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = process.env.EVIDENCE_OUTPUT_DIR ?? "/home/ubuntu/webdev-static-assets/soporteya-e3";
await mkdir(outputDir, { recursive: true });

const token = await sdk.createSessionToken(ENV.ownerOpenId, {
  name: ENV.ownerName || "Usuario",
  expiresInMs: 30 * 60 * 1000,
});

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

await context.addCookies([{
  name: COOKIE_NAME,
  value: token,
  url: baseUrl,
  httpOnly: true,
  secure: false,
  sameSite: "Lax",
}]);

const page = await context.newPage();

async function open(path: string) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(600);
}

await open("/");
await page.screenshot({ path: resolve(outputDir, "01_panel_tickets.png"), fullPage: false });

await open("/tickets/nuevo");
await page.screenshot({ path: resolve(outputDir, "02_formulario_ticket.png"), fullPage: false });

await open("/indicadores");
await page.screenshot({ path: resolve(outputDir, "03_indicadores.png"), fullPage: false });

await open("/documentacion");
await page.locator('section:has-text("3.1 Descripción de funcionalidad")').screenshot({ path: resolve(outputDir, "04_diagrama_crud.png") });
await page.locator('section:has-text("3.3 Pruebas de seguridad")').screenshot({ path: resolve(outputDir, "05_pruebas_seguridad.png") });

await browser.close();
console.log(outputDir);
