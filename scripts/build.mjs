import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../src/scripts/config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const ignored = new Set(["dist", "node_modules", ".git"]);
const copiedEntries = [
  "index.html",
  "404.html",
  "privacidade",
  "src",
  "favicon.svg",
  "site.webmanifest"
];

function assertInsideRoot(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside project root: ${target}`);
  }
}

function normalizeSiteUrl(url) {
  return String(url || "https://example.com").replace(/\/+$/, "");
}

async function copyEntry(entry) {
  if (ignored.has(entry)) return;
  const source = path.join(root, entry);
  const target = path.join(dist, entry);
  await cp(source, target, {
    recursive: true,
    filter: (src) => !ignored.has(path.basename(src))
  });
}

async function writeSeoFiles() {
  const siteUrl = normalizeSiteUrl(siteConfig.seo.siteUrl);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/privacidade/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  await writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(dist, "robots.txt"), robots, "utf8");
}

async function build() {
  assertInsideRoot(dist);
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  const entries = new Set(await readdir(root));
  for (const entry of copiedEntries) {
    if (entries.has(entry)) {
      await copyEntry(entry);
    }
  }

  await writeSeoFiles();
  console.log(`Build concluído em ${dist}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
