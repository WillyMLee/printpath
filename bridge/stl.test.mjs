import test from "node:test";
import assert from "node:assert/strict";
import { createGridfinityPitchStripStls, createOpenTrayStl, slugify } from "./stl.mjs";

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

test("creates two watertight 126 x 40 x 50 mm Gridfinity-pitch strip modules", () => {
  const result = createGridfinityPitchStripStls({ width: 255, depth: 40, height: 50, wall: 2.4 });
  assert.deepEqual(result.plan.partLengths, [126, 126]);
  assert.equal(result.plan.usedLength, 252);
  assert.equal(result.plan.leftoverLength, 3);
  assert.equal(result.parts.length, 2);
  for (const part of result.parts) {
    assert.deepEqual(stlBounds(part), [[0, 126], [0, 40], [0, 50]]);
    assertWatertight(part);
  }
  assert.deepEqual(stlBounds(result.assembly), [[0, 126], [0, 90], [0, 50]]);
  assertWatertight(result.assembly);
});

test("rejects the narrow-strip generator when a standard Gridfinity bin already fits", () => {
  assert.throws(
    () => createGridfinityPitchStripStls({ width: 255, depth: 42, height: 50, wall: 2.4 }),
    /only for drawer strips narrower/,
  );
});

test("creates safe file slugs", () => {
  assert.equal(slugify("William's Drawer / Tray"), "william-s-drawer-tray");
  assert.equal(slugify("***"), "printpath-design");
});
