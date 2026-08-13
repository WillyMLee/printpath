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

function createOpenTrayTriangles({ width, depth, height, wall, floorThickness = wall }) {
  const base = Math.min(Math.max(floorThickness, 1.2), height - 0.8);
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

  return { triangles, base };
}

function trianglesToStl(name, triangles) {
  return `solid ${name}\n${triangles.map(([v1, v2, v3]) => facet(v1, v2, v3)).join("\n")}\nendsolid ${name}\n`;
}

export function createOpenTrayStl(dimensions) {
  return trianglesToStl("printpath_open_tray", createOpenTrayTriangles(dimensions).triangles);
}

export function createGridfinityGapTrayStl({ width, depth, height, wall, floorThickness = wall, clearance = 0.3, verticalClearance = 0.6, dimensionIntent = "available-envelope" }) {
  const longAxis = Math.max(width, depth);
  const shortAxis = Math.min(width, depth);
  const standardBinFootprint = 41.5;
  if (shortAxis >= standardBinFootprint) throw new Error("This generator is only for a narrow gap beside a standard Gridfinity layout.");
  const partLength = Number((dimensionIntent === "available-envelope" ? longAxis - clearance * 2 : dimensionIntent === "usable-inside" ? longAxis + wall * 2 : longAxis).toFixed(3));
  const partWidth = Number((dimensionIntent === "available-envelope" ? shortAxis - clearance * 2 : dimensionIntent === "usable-inside" ? shortAxis + wall * 2 : shortAxis).toFixed(3));
  const partHeight = Number((dimensionIntent === "available-envelope" ? height - verticalClearance : dimensionIntent === "usable-inside" ? height + floorThickness : height).toFixed(3));
  const { triangles, base } = createOpenTrayTriangles({ width: partLength, depth: partWidth, height: partHeight, wall, floorThickness });
  const angleDegrees = 45;
  const angle = angleDegrees * Math.PI / 180;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const rotate = ([x, y, z]) => [x * cosine - y * sine, x * sine + y * cosine, z];
  const rotated = triangles.map((triangle) => triangle.map(rotate));
  const allVertices = rotated.flat();
  const minX = Math.min(...allVertices.map((vertex) => vertex[0]));
  const minY = Math.min(...allVertices.map((vertex) => vertex[1]));
  const translate = ([x, y, z]) => [Number((x - minX).toFixed(6)), Number((y - minY).toFixed(6)), z];
  const plateTriangles = rotated.map((triangle) => triangle.map(translate));
  const plateSide = Number(((partLength + partWidth) / Math.sqrt(2)).toFixed(2));
  if (plateSide > 250 || partHeight > 256) throw new Error("The single compartment does not leave a safe P1S plate margin, even when rotated diagonally.");

  return {
    plan: {
      standardBinFootprint,
      requestedLength: longAxis,
      requestedWidth: shortAxis,
      dimensionIntent,
      fitClearancePerSide: clearance,
      verticalClearance,
      compartmentCount: 1,
      partCount: 1,
      measuredEnvelope: { length: longAxis, width: shortAxis, height },
      outerDimensions: { length: partLength, width: partWidth, height: partHeight },
      interiorDimensions: {
        length: Number((partLength - wall * 2).toFixed(2)),
        width: Number((partWidth - wall * 2).toFixed(2)),
        height: Number((partHeight - base).toFixed(2)),
      },
      plateRotationDegrees: angleDegrees,
      height: partHeight,
      plateBounds: { width: plateSide, depth: plateSide, height: partHeight },
      compatibility: {
        adjacentToGridfinity: true,
        pitchAligned: false,
        standardBaseplateCompatible: false,
        note: "A custom one-compartment gap filler beside the existing Gridfinity layout; not a standard Gridfinity bin or baseplate part.",
      },
    },
    model: trianglesToStl("printpath_gridfinity_gap_tray_p1s_diagonal", plateTriangles),
  };
}

// Keeps projects saved by Bridge 0.2 working while generating the corrected one-compartment design.
export const createGridfinityPitchStripStls = createGridfinityGapTrayStl;

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "printpath-design";
}
