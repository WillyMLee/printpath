import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createOpenTrayStl, slugify } from "./stl.mjs";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PRINTPATH_BRIDGE_PORT || 32145);
const VERSION = "0.1.0";
const MAX_BODY_BYTES = 64 * 1024;

const localDataRoot = process.env.LOCALAPPDATA || join(homedir(), ".printpath");
const bridgeDataRoot = process.env.PRINTPATH_BRIDGE_DATA_DIR || join(localDataRoot, "PrintPath", "Bridge");
const oneDriveDocuments = process.env.OneDrive ? join(process.env.OneDrive, "Documents") : "";
const defaultDocuments = existsSync(oneDriveDocuments) ? oneDriveDocuments : join(homedir(), "Documents");
const exportRoot = process.env.PRINTPATH_BRIDGE_EXPORT_DIR || join(defaultDocuments, "PrintPath Exports");
const tokenPath = join(bridgeDataRoot, "pairing-token.txt");

mkdirSync(bridgeDataRoot, { recursive: true });
mkdirSync(exportRoot, { recursive: true });

function formatToken(raw) {
  return `PP-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`.toUpperCase();
}

function loadOrCreateToken() {
  if (existsSync(tokenPath)) return readFileSync(tokenPath, "utf8").trim();
  const token = formatToken(randomBytes(9).toString("base64url").replace(/[^a-z0-9]/gi, ""));
  writeFileSync(tokenPath, `${token}\n`, { encoding: "utf8", mode: 0o600 });
  return token;
}

const pairingToken = loadOrCreateToken();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin === "https://printpath.willymlee.workers.dev") return true;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname);
  } catch {
    return false;
  }
}

function isAllowedHost(hostHeader = "") {
  const hostname = hostHeader.toLowerCase().split(":")[0];
  return hostname === "127.0.0.1" || hostname === "localhost";
}

function responseHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-PrintPath-Token",
    "Access-Control-Allow-Private-Network": "true",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
}

function sendJson(response, status, payload, origin) {
  response.writeHead(status, responseHeaders(origin));
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) reject(new Error("Request is too large."));
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function finiteNumber(value, label, minimum, maximum) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum} mm.`);
  }
  return value;
}

function validateProject(project) {
  if (!project || typeof project !== "object") throw new Error("A project is required.");
  const name = typeof project.name === "string" ? project.name.trim().slice(0, 120) : "";
  if (!name) throw new Error("Give the project a name before handing it off.");

  return {
    ...project,
    name,
    description: typeof project.description === "string" ? project.description.slice(0, 2000) : "",
    width: finiteNumber(project.width, "Width", 2, 256),
    depth: finiteNumber(project.depth, "Depth", 2, 256),
    height: finiteNumber(project.height, "Height", 2, 256),
    wall: finiteNumber(project.wall, "Wall thickness", 0.4, 20),
    printer: "Bambu Lab P1S",
  };
}

function findBambuStudio() {
  const candidates = [
    process.env.PRINTPATH_BAMBU_STUDIO_PATH,
    process.env["ProgramFiles"] && join(process.env["ProgramFiles"], "Bambu Studio", "bambu-studio.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Bambu Studio", "bambu-studio.exe"),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Programs", "Bambu Studio", "bambu-studio.exe"),
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

function openArtifact(artifactPath) {
  if (process.env.PRINTPATH_BRIDGE_NO_OPEN === "1") return "test mode (saved only)";
  if (process.platform !== "win32") return "saved-only";
  const studio = findBambuStudio();
  const child = studio
    ? spawn(studio, [artifactPath], { detached: true, stdio: "ignore" })
    : spawn("explorer.exe", [artifactPath], { detached: true, stdio: "ignore" });
  child.unref();
  return studio ? "Bambu Studio" : "Windows file association";
}

async function handleHandoff(request, response, origin) {
  if (request.headers["x-printpath-token"] !== pairingToken) {
    sendJson(response, 401, { ok: false, error: "The PrintPath pairing code is missing or incorrect." }, origin);
    return;
  }

  const payload = await readJson(request);
  const project = validateProject(payload.project);
  if (project.geometryKind !== "open-tray") {
    sendJson(response, 422, { ok: false, error: "This design does not have a safe geometry generator yet." }, origin);
    return;
  }

  const slug = slugify(project.name);
  const projectRoot = join(exportRoot, `${slug}-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  mkdirSync(projectRoot, { recursive: true });
  const modelPath = join(projectRoot, `${slug}.stl`);
  const manifestPath = join(projectRoot, `${slug}.printpath.json`);
  const model = createOpenTrayStl(project);

  writeFileSync(modelPath, model, "utf8");
  writeFileSync(manifestPath, JSON.stringify({
    format: "printpath-handoff",
    version: 1,
    createdAt: new Date().toISOString(),
    safety: "Review geometry, orientation, filament, plate, supports, and sliced preview in Bambu Studio before printing.",
    project,
    readiness: Array.isArray(payload.readiness) ? payload.readiness : [],
    files: [{ type: "model/stl", name: `${slug}.stl` }],
  }, null, 2), "utf8");

  const openedWith = openArtifact(modelPath);
  sendJson(response, 200, {
    ok: true,
    modelGenerated: true,
    fileName: `${slug}.stl`,
    outputDirectory: projectRoot,
    openedWith,
    nextStep: "Review and slice in Bambu Studio. PrintPath never starts the print automatically.",
  }, origin);
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (!isAllowedHost(request.headers.host) || !isAllowedOrigin(origin)) {
    sendJson(response, 403, { ok: false, error: "Request origin is not allowed." }, origin);
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, responseHeaders(origin));
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "PrintPath Bridge",
      version: VERSION,
      paired: request.headers["x-printpath-token"] === pairingToken,
      capabilities: ["open-tray-stl", "bambu-studio-handoff"],
      bambuStudio: {
        detected: Boolean(findBambuStudio()),
        launchMethod: findBambuStudio() ? "direct" : "windows-file-association",
      },
    }, origin);
    return;
  }

  if (request.method === "POST" && request.url === "/handoff") {
    try {
      await handleHandoff(request, response, origin);
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : "Handoff failed." }, origin);
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: "Not found." }, origin);
});

server.listen(PORT, HOST, () => {
  console.log(`\nPrintPath Bridge ${VERSION}`);
  console.log(`Listening only on http://${HOST}:${PORT}`);
  console.log(`Pairing code: ${pairingToken}`);
  console.log(`Exports: ${exportRoot}`);
  console.log("Keep this window open while using PrintPath. Press Ctrl+C to stop.\n");
});
