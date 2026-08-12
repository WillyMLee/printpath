import test from "node:test";
import assert from "node:assert/strict";
import { createOpenTrayStl, slugify } from "./stl.mjs";

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

test("creates safe file slugs", () => {
  assert.equal(slugify("William's Drawer / Tray"), "william-s-drawer-tray");
  assert.equal(slugify("***"), "printpath-design");
});
