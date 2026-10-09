import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getActiveServices, siteConfig } from "../src/scripts/config.js";
import { isConfiguredWhatsApp } from "../src/scripts/whatsapp.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filesToScan = [
  "index.html",
  "privacidade/index.html",
  "404.html",
  "src/styles/main.css",
  "src/scripts/config.js",
  "src/scripts/consent.js",
  "src/scripts/quote-modal.js",
  "src/scripts/render.js"
];

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

for (const file of filesToScan) {
  const content = await readFile(path.join(root, file), "utf8");
  assert(!/href=(["'])\s*\1/.test(content), `${file}: contém href vazio.`);
  assert(!/console\.log/.test(content), `${file}: contém console.log.`);
}

const services = getActiveServices(siteConfig);
const ids = new Set(services.map((service) => service.id));
assert(services.length >= 1, "Nenhum serviço ativo configurado.");
assert(ids.size === services.length, "IDs de serviços ativos precisam ser únicos.");
assert(
  siteConfig.contact.whatsapp.isDemoNumber ||
    isConfiguredWhatsApp(siteConfig.contact.whatsapp),
  "WhatsApp precisa ser demonstrativo ou configurado com número internacional."
);
assert(
  siteConfig.analytics.ga4Id === "" || /^G-[A-Z0-9]+$/.test(siteConfig.analytics.ga4Id),
  "GA4 ID deve ficar vazio ou seguir o formato público G-XXXX."
);
assert(
  siteConfig.analytics.gtmId === "" || /^GTM-[A-Z0-9]+$/.test(siteConfig.analytics.gtmId),
  "GTM ID deve ficar vazio ou seguir o formato público GTM-XXXX."
);

if (errors.length) {
  for (const error of errors) {
    console.error(`Lint: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Lint concluído sem erros.");
}
