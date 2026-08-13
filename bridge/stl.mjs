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

function uniqueSorted(values) {
  return [...new Set(values.map((value) => Number(value.toFixed(6))))].sort((a, b) => a - b);
}

function createBoxUnionStl(name, boxes) {
  const xs = uniqueSorted(boxes.flatMap((box) => [box.x0, box.x1]));
  const ys = uniqueSorted(boxes.flatMap((box) => [box.y0, box.y1]));
  const zs = uniqueSorted(boxes.flatMap((box) => [box.z0, box.z1]));
  const occupied = new Set();

  for (let ix = 0; ix < xs.length - 1; ix += 1) {
    for (let iy = 0; iy < ys.length - 1; iy += 1) {
      for (let iz = 0; iz < zs.length - 1; iz += 1) {
        const x = (xs[ix] + xs[ix + 1]) / 2;
        const y = (ys[iy] + ys[iy + 1]) / 2;
        const z = (zs[iz] + zs[iz + 1]) / 2;
        if (boxes.some((box) => x > box.x0 && x < box.x1 && y > box.y0 && y < box.y1 && z > box.z0 && z < box.z1)) {
          occupied.add(`${ix},${iy},${iz}`);
        }
      }
    }
  }

  const triangles = [];
  const has = (ix, iy, iz) => occupied.has(`${ix},${iy},${iz}`);
  for (const key of occupied) {
    const [ix, iy, iz] = key.split(",").map(Number);
    const [x0, x1] = [xs[ix], xs[ix + 1]];
    const [y0, y1] = [ys[iy], ys[iy + 1]];
    const [z0, z1] = [zs[iz], zs[iz + 1]];
    if (!has(ix - 1, iy, iz)) quad(triangles, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
    if (!has(ix + 1, iy, iz)) quad(triangles, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]);
    if (!has(ix, iy - 1, iz)) quad(triangles, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
    if (!has(ix, iy + 1, iz)) quad(triangles, [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]);
    if (!has(ix, iy, iz - 1)) quad(triangles, [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]);
    if (!has(ix, iy, iz + 1)) quad(triangles, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);
  }

  return `solid ${name}\n${triangles.map(([v1, v2, v3]) => facet(v1, v2, v3)).join("\n")}\nendsolid ${name}\n`;
}

function moduleBoxes({ length, width, height, wall, cells, x = 0, y = 0 }) {
  const floor = Math.max(2.4, wall);
  const boxes = [
    { x0: x, x1: x + length, y0: y, y1: y + width, z0: 0, z1: floor },
    { x0: x, x1: x + length, y0: y, y1: y + wall, z0: 0, z1: height },
    { x0: x, x1: x + length, y0: y + width - wall, y1: y + width, z0: 0, z1: height },
    { x0: x, x1: x + wall, y0: y, y1: y + width, z0: 0, z1: height },
    { x0: x + length - wall, x1: x + length, y0: y, y1: y + width, z0: 0, z1: height },
  ];
  for (let cell = 1; cell < cells; cell += 1) {
    const divider = x + cell * 42;
    boxes.push({ x0: divider - wall / 2, x1: divider + wall / 2, y0: y, y1: y + width, z0: 0, z1: height });
  }
  return boxes;
}

export function createGridfinityPitchStripStls({ width, depth, height, wall }) {
  const longAxis = Math.max(width, depth);
  const shortAxis = Math.min(width, depth);
  const pitch = 42;
  const standardBinFootprint = 41.5;
  const cells = Math.floor(longAxis / pitch);
  if (shortAxis >= standardBinFootprint) throw new Error("This generator is only for drawer strips narrower than a standard Gridfinity bin.");
  if (shortAxis < wall * 2 + 8 || height <= Math.max(2.4, wall) + 5) throw new Error("The strip dimensions do not leave enough usable interior space.");
  if (cells < 2) throw new Error("The strip needs room for at least two 42 mm pitches.");

  const moduleCount = longAxis > 250 ? 2 : 1;
  const firstCells = Math.ceil(cells / moduleCount);
  const partCellCounts = moduleCount === 1 ? [cells] : [firstCells, cells - firstCells];
  const partLengths = partCellCounts.map((count) => count * pitch);
  const partBoxes = partLengths.map((length, index) => moduleBoxes({ length, width: shortAxis, height, wall, cells: partCellCounts[index] }));
  const assemblyBoxes = partLengths.flatMap((length, index) => moduleBoxes({
    length,
    width: shortAxis,
    height,
    wall,
    cells: partCellCounts[index],
    y: index * (shortAxis + 10),
  }));

  return {
    plan: {
      pitch,
      standardBinFootprint,
      requestedLength: longAxis,
      requestedWidth: shortAxis,
      usedLength: cells * pitch,
      leftoverLength: Number((longAxis - cells * pitch).toFixed(2)),
      moduleCount,
      partCellCounts,
      partLengths,
      height,
      assemblyBounds: {
        width: Math.max(...partLengths),
        depth: moduleCount * shortAxis + (moduleCount - 1) * 10,
        height,
      },
      compatibility: {
        pitchAligned: true,
        standardBaseplateCompatible: false,
        note: "42 mm pitch aligned; not compatible with a standard Gridfinity baseplate because the short side is under 41.5 mm",
      },
    },
    assembly: createBoxUnionStl("printpath_gridfinity_pitch_strip_all_parts", assemblyBoxes),
    parts: partBoxes.map((boxes, index) => createBoxUnionStl(`printpath_gridfinity_pitch_strip_part_${index + 1}`, boxes)),
  };
}

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "printpath-design";
}
