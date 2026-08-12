function normal(a, b, c) {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const length = Math.hypot(nx, ny, nz) || 1;
  return [nx / length, ny / length, nz / length];
}
function facet(a, b, c) {
  const n = normal(a, b, c);
  return [
    `  facet normal ${n.join(" ")}`,
    "    outer loop",
    `      vertex ${a.join(" ")}`,
    `      vertex ${b.join(" ")}`,
    `      vertex ${c.join(" ")}`,
    "    endloop",
    "  endfacet",
  ].join("\n");
}

function quad(triangles, a, b, c, d) {
  triangles.push([a, b, c], [a, c, d]);
}

export function createOpenTrayStl({ width, depth, height, wall }) {
  const base = Math.min(Math.max(wall, 1.2), height - 0.8);
  if (width <= wall * 2 + 1 || depth <= wall * 2 + 1 || height <= base) {
    throw new Error("The tray dimensions do not leave enough interior space.");
  }

  const A = [0, 0, 0];
  const B = [width, 0, 0];
  const C = [width, depth, 0];
  const D = [0, depth, 0];
  const E = [0, 0, height];
  const F = [width, 0, height];
  const G = [width, depth, height];
  const H = [0, depth, height];

  const a = [wall, wall, base];
  const b = [width - wall, wall, base];
  const c = [width - wall, depth - wall, base];
  const d = [wall, depth - wall, base];
  const e = [wall, wall, height];
  const f = [width - wall, wall, height];
  const g = [width - wall, depth - wall, height];
  const h = [wall, depth - wall, height];

  const triangles = [];
  quad(triangles, A, D, C, B);
  quad(triangles, A, B, F, E);
  quad(triangles, B, C, G, F);
  quad(triangles, C, D, H, G);
  quad(triangles, D, A, E, H);

  quad(triangles, E, F, f, e);
  quad(triangles, F, G, g, f);
  quad(triangles, G, H, h, g);
  quad(triangles, H, E, e, h);

  quad(triangles, a, e, f, b);
  quad(triangles, b, f, g, c);
  quad(triangles, c, g, h, d);
  quad(triangles, d, h, e, a);
  quad(triangles, a, b, c, d);

  return `solid printpath_open_tray\n${triangles.map(([v1, v2, v3]) => facet(v1, v2, v3)).join("\n")}\nendsolid printpath_open_tray\n`;
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "printpath-design";
}
