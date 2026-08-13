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

test("bridge writes the one-compartment Gridfinity gap-tray handoff", async () => {
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
      name: "255mm one-compartment Gridfinity gap tray",
      description: "One continuous compartment for a 255 by 40 by 50 millimeter gap beside an existing Gridfinity layout.",
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
      partCount: 1,
      assemblyMethod: "Single print",
      designSystem: "gridfinity",
      gridfinityMode: "gap-tray",
      geometryKind: "gridfinity-gap-tray",
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
    assert.equal(result.generationPlan.compartmentCount, 1);
    assert.equal(result.generationPlan.partCount, 1);
    assert.equal(result.generationPlan.plateRotationDegrees, 45);
    assert.deepEqual(result.generationPlan.outerDimensions, { length: 254.3, width: 39.3, height: 50 });
    assert.deepEqual(result.generationPlan.plateBounds, { width: 207.61, depth: 207.61, height: 50 });
    assert.deepEqual(result.files.map((file) => file.name), [
      "255mm-one-compartment-gridfinity-gap-tray-p1s-diagonal.stl",
    ]);
    for (const file of result.files) assert.equal(existsSync(join(result.outputDirectory, file.name)), true);
    const manifest = JSON.parse(readFileSync(join(result.outputDirectory, "255mm-one-compartment-gridfinity-gap-tray.printpath.json"), "utf8"));
    assert.equal(manifest.project.geometryKind, "gridfinity-gap-tray");
    assert.equal(manifest.generationPlan.compartmentCount, 1);
    assert.equal(manifest.generationPlan.compatibility.standardBaseplateCompatible, false);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("exit", resolve));
    rmSync(testRoot, { recursive: true, force: true });
  }
});
