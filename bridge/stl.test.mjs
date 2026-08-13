import test from "node:test";
import assert from "node:assert/strict";
import { createGridfinityGapTrayStl, createOpenTrayStl, slugify } from "./stl.mjs";

function stlVertices(stl) {
  return [...stl.matchAll(/vertex\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/g)].map((match) => match.slice(1).map(Number));
}

function stlBounds(stl) {
  const vertices = stlVertices(stl);
  return [0, 1, 2].map((axis) => {
    const values = vertices.map((vertex) => vertex[axis]);
    return [Math.min(...values), Math.max(...values)];
  });
}

function assertWatertight(stl) {
  const vertices = stlVertices(stl);
  const edges = new Map();
  const key = (a, b) => [a.join(","), b.join(",")].sort().join("|");
  for (let index = 0; index < vertices.length; index += 3) {
    for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) {
      const edge = key(vertices[index + a], vertices[index + b]);
      edges.set(edge, (edges.get(edge) || 0) + 1);
    }
  }
  assert.ok([...edges.values()].every((count) => count === 2), "every mesh edge should be shared by exactly two triangles");
}

test("creates a closed open-tray STL with 28 facets", () => {
  const stl = createOpenTrayStl({ width: 100, depth: 70, height: 24, wall: 2.4 });
  assert.match(stl, /^solid printpath_open_tray/);
  assert.equal((stl.match(/facet normal/g) || []).length, 28);
  assert.match(stl, /vertex 97\.6 67\.6 2\.4/);
});
test("rejects a tray without usable interior space", () => {
  assert.throws(
    () => createOpenTrayStl({ width: 5, depth: 5, height: 3, wall: 2.4 }),
    /do not leave enough interior space/,
  );
});

test("creates one watertight gap tray with fit clearance and a diagonal P1S orientation", () => {
  const result = createGridfinityGapTrayStl({ width: 255, depth: 40, height: 50, wall: 2.4, clearance: 0.3 });
  assert.equal(result.plan.compartmentCount, 1);
  assert.equal(result.plan.partCount, 1);
  assert.deepEqual(result.plan.measuredEnvelope, { length: 255, width: 40, height: 50 });
  assert.deepEqual(result.plan.outerDimensions, { length: 254.4, width: 39.4, height: 50 });
  assert.deepEqual(result.plan.interiorDimensions, { length: 249.6, width: 34.6, height: 47.6 });
  assert.equal(result.plan.plateRotationDegrees, 45);
  assert.deepEqual(result.plan.plateBounds, { width: 207.75, depth: 207.75, height: 50 });
  const bounds = stlBounds(result.model);
  assert.ok(Math.abs(bounds[0][0]) < 0.000001 && Math.abs(bounds[0][1] - 207.747972) < 0.000001);
  assert.ok(Math.abs(bounds[1][0]) < 0.000001 && Math.abs(bounds[1][1] - 207.747972) < 0.000001);
  assert.deepEqual(bounds[2], [0, 50]);
  assertWatertight(result.model);
});

test("rejects the gap-tray generator when a standard Gridfinity bin already fits", () => {
  assert.throws(
    () => createGridfinityGapTrayStl({ width: 255, depth: 42, height: 50, wall: 2.4 }),
    /only for a narrow gap/,
  );
});

test("creates safe file slugs", () => {
  assert.equal(slugify("William's Drawer / Tray"), "william-s-drawer-tray");
  assert.equal(slugify("***"), "printpath-design");
});
