import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preferredPort = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(root, normalized);
}

async function resolveFile(requestUrl) {
  let filePath = safePath(new URL(requestUrl, "http://localhost").pathname);
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return path.join(root, "404.html");
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    filePath = path.join(root, "404.html");
  }

  return filePath;
}

function start(port) {
  const server = createServer(async (request, response) => {
    const filePath = await resolveFile(request.url || "/");
    const extension = path.extname(filePath);
    const status = path.basename(filePath) === "404.html" && !request.url?.includes("404")
      ? 404
      : 200;

    try {
      const content = await readFile(filePath);
      response.writeHead(status, {
        "Content-Type": mimeTypes[extension] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      response.end(content);
    } catch {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Erro ao servir arquivo.");
    }
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      start(port + 1);
      return;
    }
    console.error(error);
    process.exitCode = 1;
  });

  server.listen(port, () => {
    console.log(`Servidor local: http://localhost:${port}`);
  });
}

start(preferredPort);
