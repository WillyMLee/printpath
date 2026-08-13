import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import test from "node:test";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

async function waitForFile(path, attempts = 100) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (existsSync(path)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${path}`);
}

test("bridge writes the complete non-standard Gridfinity strip handoff", async () => {
  const testRoot = mkdtempSync(join(tmpdir(), "printpath-bridge-"));
  const dataRoot = join(testRoot, "data");
  const exportRoot = join(testRoot, "exports");
  const port = 32146;
  let serverOutput = "";
  const child = spawn(process.execPath, ["bridge/server.mjs"], {
    cwd: repositoryRoot,
    windowsHide: true,
    env: {
      ...process.env,
      PRINTPATH_BRIDGE_PORT: String(port),
      PRINTPATH_BRIDGE_DATA_DIR: dataRoot,
      PRINTPATH_BRIDGE_EXPORT_DIR: exportRoot,
      PRINTPATH_BRIDGE_NO_OPEN: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => { serverOutput += chunk; });
  child.stderr.on("data", (chunk) => { serverOutput += chunk; });

  try {
    const tokenPath = join(dataRoot, "pairing-token.txt");
    await waitForFile(tokenPath);
    const token = readFileSync(tokenPath, "utf8").trim();
    const project = {
      name: "255mm non-standard Gridfinity drawer strip",
      description: "Two pitch-aligned modules for a 255 by 40 by 50 millimeter drawer space.",
      width: 255,
      depth: 40,
      height: 50,
      wall: 2.4,
      clearance: 0.35,
      cornerRadius: 0,
      printer: "Bambu Lab P1S",
      plate: "Textured PEI Plate",
      nozzle: 0.4,
      material: "PLA",
      layerHeight: 0.2,
      strength: "Balanced",
      partCount: 2,
      assemblyMethod: "Placed end to end",
      designSystem: "gridfinity",
      gridfinityMode: "pitch-strip",
      geometryKind: "gridfinity-pitch-strip",
    };
    const response = await fetch(`http://127.0.0.1:${port}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-PrintPath-Token": token },
      body: JSON.stringify({ project, readiness: [] }),
    });
    assert.equal(response.status, 200, serverOutput);
    const result = await response.json();
    assert.equal(result.ok, true);
    assert.equal(result.openedWith, "test mode (saved only)");
    assert.deepEqual(result.generationPlan.partLengths, [126, 126]);
    assert.equal(result.generationPlan.usedLength, 252);
    assert.equal(result.generationPlan.leftoverLength, 3);
    assert.deepEqual(result.generationPlan.assemblyBounds, { width: 126, depth: 90, height: 50 });
    assert.deepEqual(result.files.map((file) => file.name), [
      "255mm-non-standard-gridfinity-drawer-strip-all-parts.stl",
      "255mm-non-standard-gridfinity-drawer-strip-part-a.stl",
      "255mm-non-standard-gridfinity-drawer-strip-part-b.stl",
    ]);
    for (const file of result.files) assert.equal(existsSync(join(result.outputDirectory, file.name)), true);
    const manifest = JSON.parse(readFileSync(join(result.outputDirectory, "255mm-non-standard-gridfinity-drawer-strip.printpath.json"), "utf8"));
    assert.equal(manifest.project.geometryKind, "gridfinity-pitch-strip");
    assert.equal(manifest.generationPlan.compatibility.standardBaseplateCompatible, false);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("exit", resolve));
    rmSync(testRoot, { recursive: true, force: true });
  }
});
