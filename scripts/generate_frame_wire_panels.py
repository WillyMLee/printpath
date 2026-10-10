"""Generate a modular, snap-mounted wire-cover panel system for a Bambu Lab P1S.

The two finished covers are 500 x 380 mm and 500 x 400 mm. Each is divided
into a 5 x 2 grid so every tile is comfortably P1S printable. Tiles print with
their visible face on the build plate; shallow rear ribs stiffen a 0.8 mm skin.

This is a fit-first design. Print the three-size frame coupon before the panel
plates, then regenerate the latch packs with the winning clearance if needed.
"""

from __future__ import annotations

import argparse
import json
import math
import struct
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

Vec3 = tuple[float, float, float]
Triangle = tuple[Vec3, Vec3, Vec3]
Box = tuple[float, float, float, float, float, float]

PANEL_WIDTH = 500.0
PANEL_HEIGHTS = {"panel-1": 380.0, "panel-2": 400.0}
COLUMNS = 5
ROWS = 2
ASSEMBLY_GAP = 0.5
FACE = 0.8
RIB_WIDTH = 4.5
RIB_HEIGHT = 2.2

SEAM_DEPTH = 20.0
SEAM_KEY_WIDTH = 10.8
SEAM_KEY_THICKNESS = 1.8
SEAM_RAIL = 3.0
SEAM_LIP = 1.0

TUBE_SIZE = 15.0
DEFAULT_CLIP_CLEARANCE = 0.6
CLIP_WALL = 2.4
CLIP_LENGTH = 18.0
LATCH_TONGUE_WIDTH = 11.4
LATCH_TONGUE_LENGTH = 30.0
LATCH_TONGUE_THICKNESS = 2.2
LATCH_RECEIVER_CENTER = 24.0

PETG_DENSITY = 1.27


@dataclass
class MeshReport:
    triangles: int
    dimensions: tuple[float, float, float]
    volume_mm3: float

    @property
    def petg_grams(self) -> float:
        return self.volume_mm3 / 1000.0 * PETG_DENSITY


def quad(triangles: list[Triangle], a: Vec3, b: Vec3, c: Vec3, d: Vec3) -> None:
    triangles.extend(((a, b, c), (a, c, d)))


def union_boxes(boxes: list[Box]) -> tuple[list[Triangle], float]:
    """Return a watertight surface for the exact union of axis-aligned boxes."""
    xs = sorted({value for box in boxes for value in (box[0], box[1])})
    ys = sorted({value for box in boxes for value in (box[2], box[3])})
    zs = sorted({value for box in boxes for value in (box[4], box[5])})
    occupied: set[tuple[int, int, int]] = set()
    volume = 0.0

    for ix in range(len(xs) - 1):
        mx = (xs[ix] + xs[ix + 1]) / 2
        for iy in range(len(ys) - 1):
            my = (ys[iy] + ys[iy + 1]) / 2
            for iz in range(len(zs) - 1):
                mz = (zs[iz] + zs[iz + 1]) / 2
                if any(x0 < mx < x1 and y0 < my < y1 and z0 < mz < z1 for x0, x1, y0, y1, z0, z1 in boxes):
                    occupied.add((ix, iy, iz))
                    volume += (xs[ix + 1] - xs[ix]) * (ys[iy + 1] - ys[iy]) * (zs[iz + 1] - zs[iz])

    triangles: list[Triangle] = []
    for ix, iy, iz in occupied:
        x0, x1 = xs[ix], xs[ix + 1]
        y0, y1 = ys[iy], ys[iy + 1]
        z0, z1 = zs[iz], zs[iz + 1]
        if (ix - 1, iy, iz) not in occupied:
            quad(triangles, (x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0))
        if (ix + 1, iy, iz) not in occupied:
            quad(triangles, (x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1))
        if (ix, iy - 1, iz) not in occupied:
            quad(triangles, (x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1))
        if (ix, iy + 1, iz) not in occupied:
            quad(triangles, (x0, y1, z0), (x0, y1, z1), (x1, y1, z1), (x1, y1, z0))
        if (ix, iy, iz - 1) not in occupied:
            quad(triangles, (x0, y0, z0), (x0, y1, z0), (x1, y1, z0), (x1, y0, z0))
        if (ix, iy, iz + 1) not in occupied:
            quad(triangles, (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1))
    return triangles, volume


def translated(triangles: list[Triangle], dx: float, dy: float, dz: float = 0.0) -> list[Triangle]:
    return [tuple((x + dx, y + dy, z + dz) for x, y, z in triangle) for triangle in triangles]


def print_oriented(triangles: list[Triangle]) -> list[Triangle]:
    """Put an assembled X/Y/Z clip onto the bed as X/Z/Y for support-free printing."""
    points = [point for triangle in triangles for point in triangle]
    min_x = min(point[0] for point in points)
    min_y = min(point[1] for point in points)
    min_z = min(point[2] for point in points)
    mapped = [tuple((x - min_x, z - min_z, y - min_y) for x, y, z in triangle) for triangle in triangles]
    # Swapping Y and Z mirrors the coordinate system, so restore outward winding.
    return [(triangle[0], triangle[2], triangle[1]) for triangle in mapped]


def add_seam_receiver(boxes: list[Box], side: str, width: float, height: float) -> None:
    cap_bottom = FACE + SEAM_KEY_THICKNESS + 0.4
    cap_top = cap_bottom + 1.0
    half = SEAM_KEY_WIDTH / 2
    if side in ("left", "right"):
        x0, x1 = (0.0, SEAM_DEPTH) if side == "left" else (width - SEAM_DEPTH, width)
        center = height / 2
        boxes.extend([
            (x0, x1, center - half - SEAM_RAIL, center - half, FACE, cap_top),
            (x0, x1, center + half, center + half + SEAM_RAIL, FACE, cap_top),
            (x0, x1, center - half, center - half + SEAM_LIP, cap_bottom, cap_top),
            (x0, x1, center + half - SEAM_LIP, center + half, cap_bottom, cap_top),
        ])
    else:
        y0, y1 = (0.0, SEAM_DEPTH) if side == "top" else (height - SEAM_DEPTH, height)
        center = width / 2
        boxes.extend([
            (center - half - SEAM_RAIL, center - half, y0, y1, FACE, cap_top),
            (center + half, center + half + SEAM_RAIL, y0, y1, FACE, cap_top),
            (center - half, center - half + SEAM_LIP, y0, y1, cap_bottom, cap_top),
            (center + half - SEAM_LIP, center + half, y0, y1, cap_bottom, cap_top),
        ])


def add_latch_receiver(boxes: list[Box], side: str, width: float, height: float) -> None:
    center_x = LATCH_RECEIVER_CENTER if side == "left" else width - LATCH_RECEIVER_CENTER
    center_y = height / 2
    channel_width = LATCH_TONGUE_WIDTH + 0.6
    half = channel_width / 2
    length = LATCH_TONGUE_LENGTH + 2.0
    rail = 3.0
    cap_bottom = FACE + LATCH_TONGUE_THICKNESS + 0.6
    cap_top = cap_bottom + 1.0
    boxes.extend([
        (center_x - half - rail, center_x - half, center_y - length / 2, center_y + length / 2, FACE, cap_top),
        (center_x + half, center_x + half + rail, center_y - length / 2, center_y + length / 2, FACE, cap_top),
        (center_x - half, center_x - half + 1.0, center_y - length / 2, center_y + length / 2, cap_bottom, cap_top),
        (center_x + half - 1.0, center_x + half, center_y - length / 2, center_y + length / 2, cap_bottom, cap_top),
    ])


def tile_boxes(panel_height: float, row: int, column: int) -> tuple[list[Box], float, float]:
    width = (PANEL_WIDTH - (COLUMNS - 1) * ASSEMBLY_GAP) / COLUMNS
    height = (panel_height - (ROWS - 1) * ASSEMBLY_GAP) / ROWS
    boxes: list[Box] = [(0.0, width, 0.0, height, 0.0, FACE)]

    # Only exterior sides receive perimeter ribs; seam channels stay clear.
    if column == 0:
        boxes.append((0.0, RIB_WIDTH, 0.0, height, FACE, FACE + RIB_HEIGHT))
    if column == COLUMNS - 1:
        boxes.append((width - RIB_WIDTH, width, 0.0, height, FACE, FACE + RIB_HEIGHT))
    if row == 0:
        boxes.append((0.0, width, 0.0, RIB_WIDTH, FACE, FACE + RIB_HEIGHT))
    if row == ROWS - 1:
        boxes.append((0.0, width, height - RIB_WIDTH, height, FACE, FACE + RIB_HEIGHT))

    # A shallow rear grid makes the 0.8 mm face behave like a much thicker panel.
    for fraction in (1 / 3, 2 / 3):
        cx = width * fraction
        boxes.append((cx - RIB_WIDTH / 2, cx + RIB_WIDTH / 2, 0.0, height, FACE, FACE + RIB_HEIGHT))
        cy = height * fraction
        boxes.append((0.0, width, cy - RIB_WIDTH / 2, cy + RIB_WIDTH / 2, FACE, FACE + RIB_HEIGHT))

    if column > 0:
        add_seam_receiver(boxes, "left", width, height)
    if column < COLUMNS - 1:
        add_seam_receiver(boxes, "right", width, height)
    if row > 0:
        add_seam_receiver(boxes, "top", width, height)
    if row < ROWS - 1:
        add_seam_receiver(boxes, "bottom", width, height)
    if column == 0:
        add_latch_receiver(boxes, "left", width, height)
    if column == COLUMNS - 1:
        add_latch_receiver(boxes, "right", width, height)
    return boxes, width, height


def make_tile(panel_height: float, row: int, column: int) -> tuple[list[Triangle], float, tuple[float, float]]:
    boxes, width, height = tile_boxes(panel_height, row, column)
    triangles, volume = union_boxes(boxes)
    return triangles, volume, (width, height)


def make_seam_key() -> tuple[list[Triangle], float]:
    length = SEAM_DEPTH * 2 + ASSEMBLY_GAP - 0.4
    boxes: list[Box] = [(0.0, length, 0.0, SEAM_KEY_WIDTH, 0.0, SEAM_KEY_THICKNESS)]
    # Two low friction bumps stop the key drifting without requiring a hard press fit.
    for x in (5.0, length - 8.0):
        boxes.append((x, x + 3.0, 2.2, SEAM_KEY_WIDTH - 2.2, SEAM_KEY_THICKNESS, SEAM_KEY_THICKNESS + 0.3))
    return union_boxes(boxes)


def clip_boxes(clearance: float, side: str, coupon: bool = False) -> list[Box]:
    inside = TUBE_SIZE + clearance
    tile_width = (PANEL_WIDTH - (COLUMNS - 1) * ASSEMBLY_GAP) / COLUMNS
    center_x = TUBE_SIZE / 2 if side == "left" or coupon else tile_width - TUBE_SIZE / 2
    front = FACE + 0.4
    back = front + inside
    half = inside / 2
    y0, y1 = 0.0, 15.0 if coupon else CLIP_LENGTH
    boxes: list[Box] = [
        (center_x - half - CLIP_WALL, center_x - half, y0, y1, front, back + CLIP_WALL),
        (center_x + half, center_x + half + CLIP_WALL, y0, y1, front, back + CLIP_WALL),
        (center_x - half - CLIP_WALL, center_x + half + CLIP_WALL, y0, y1, back, back + CLIP_WALL),
        (center_x - half, center_x - half + 0.55, y0, y1, front, front + 3.0),
        (center_x + half - 0.55, center_x + half, y0, y1, front, front + 3.0),
    ]
    if coupon:
        return boxes

    receiver_x = LATCH_RECEIVER_CENTER if side == "left" else tile_width - LATCH_RECEIVER_CENTER
    tongue_z0 = FACE + 0.4
    tongue_z1 = tongue_z0 + LATCH_TONGUE_THICKNESS
    boxes.append((receiver_x - LATCH_TONGUE_WIDTH / 2, receiver_x + LATCH_TONGUE_WIDTH / 2, 0.0, LATCH_TONGUE_LENGTH, tongue_z0, tongue_z1))
    boxes.append((receiver_x - 1.2, receiver_x + 1.2, 0.0, CLIP_LENGTH, tongue_z1, back + CLIP_WALL))
    bridge_x0 = min(receiver_x, center_x + half)
    bridge_x1 = max(receiver_x, center_x - half)
    boxes.append((bridge_x0, bridge_x1, 0.0, CLIP_LENGTH, back, back + CLIP_WALL))
    return boxes


def make_latch(clearance: float, side: str) -> tuple[list[Triangle], float]:
    triangles, volume = union_boxes(clip_boxes(clearance, side))
    return print_oriented(triangles), volume


def make_coupon() -> tuple[list[Triangle], float]:
    combined: list[Triangle] = []
    volume = 0.0
    x_cursor = 0.0
    for index, clearance in enumerate((0.2, 0.6, 1.0), start=1):
        triangles, part_volume = union_boxes(clip_boxes(clearance, "left", coupon=True))
        printed = print_oriented(triangles)
        xs = [point[0] for triangle in printed for point in triangle]
        printed = translated(printed, x_cursor - min(xs), 0.0)
        combined.extend(printed)
        volume += part_volume
        width = max(xs) - min(xs)
        # Raised bars identify tight / nominal / loose without tiny text.
        marker, marker_volume = union_boxes([(x_cursor + width / 2 - index, x_cursor + width / 2 + index, 0.0, 2.0, 15.0, 15.6)])
        combined.extend(marker)
        volume += marker_volume
        x_cursor += width + 8.0
    return combined, volume


def normal(triangle: Triangle) -> Vec3:
    a, b, c = triangle
    ab = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    ac = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
    cross = (ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0])
    length = math.sqrt(sum(component * component for component in cross))
    return tuple(component / length for component in cross) if length else (0.0, 0.0, 0.0)


def write_binary_stl(path: Path, triangles: list[Triangle], label: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as handle:
        handle.write(label.encode("ascii")[:80].ljust(80, b"\0"))
        handle.write(struct.pack("<I", len(triangles)))
        for triangle in triangles:
            values = normal(triangle) + tuple(value for point in triangle for value in point)
            handle.write(struct.pack("<12fH", *values, 0))


def validate(triangles: list[Triangle], *, p1s_required: bool = True) -> MeshReport:
    def key(vertex: Vec3) -> tuple[int, int, int]:
        return tuple(round(value * 1_000_000) for value in vertex)

    edges: Counter[tuple[tuple[int, int, int], tuple[int, int, int]]] = Counter()
    points = [point for triangle in triangles for point in triangle]
    for triangle in triangles:
        keys = [key(point) for point in triangle]
        for first, second in ((0, 1), (1, 2), (2, 0)):
            edges[tuple(sorted((keys[first], keys[second])))] += 1
    bad_edges = [edge for edge, count in edges.items() if count != 2]
    if bad_edges:
        raise ValueError(f"Mesh contains {len(bad_edges)} non-manifold edges.")
    minimum = tuple(min(point[axis] for point in points) for axis in range(3))
    maximum = tuple(max(point[axis] for point in points) for axis in range(3))
    dimensions = tuple(maximum[axis] - minimum[axis] for axis in range(3))
    if p1s_required and any(value > 256.0 for value in dimensions):
        raise ValueError(f"Mesh exceeds the P1S volume: {dimensions}")
    signed_volume = sum(
        (
            a[0] * (b[1] * c[2] - b[2] * c[1])
            + a[1] * (b[2] * c[0] - b[0] * c[2])
            + a[2] * (b[0] * c[1] - b[1] * c[0])
        ) / 6.0
        for a, b, c in triangles
    )
    if signed_volume <= 0:
        raise ValueError(f"Mesh winding is inverted or volume is zero: {signed_volume}")
    return MeshReport(len(triangles), dimensions, signed_volume)


def require_volume(report: MeshReport, expected_volume: float) -> None:
    if not math.isclose(report.volume_mm3, expected_volume, rel_tol=1e-6, abs_tol=0.05):
        raise ValueError(f"Mesh volume {report.volume_mm3:.3f} does not match CAD volume {expected_volume:.3f}.")


def plate_mesh(panel_height: float, first: tuple[int, int], second: tuple[int, int]) -> tuple[list[Triangle], float]:
    mesh_a, volume_a, size_a = make_tile(panel_height, *first)
    mesh_b, volume_b, _ = make_tile(panel_height, *second)
    gap = 4.0
    mesh_b = translated(mesh_b, size_a[0] + gap, 0.0)
    return mesh_a + mesh_b, volume_a + volume_b


def pack_parts(part: list[Triangle], count: int, part_dimensions: tuple[float, float, float], columns: int) -> list[Triangle]:
    combined: list[Triangle] = []
    step_x = part_dimensions[0] + 4.0
    step_y = part_dimensions[1] + 4.0
    for index in range(count):
        combined.extend(translated(part, (index % columns) * step_x, (index // columns) * step_y))
    return combined


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--clip-clearance", type=float, default=DEFAULT_CLIP_CLEARANCE)
    args = parser.parse_args()
    if not 0.1 <= args.clip_clearance <= 1.5:
        raise ValueError("Clip clearance must stay between 0.1 and 1.5 mm.")

    root = Path(__file__).resolve().parents[1]
    output_dir = root / "public" / "projects" / "printer-stand-wire-panels-oct-2026"
    output_dir.mkdir(parents=True, exist_ok=True)
    reports: dict[str, dict[str, object]] = {}
    full_panel_grams: dict[str, float] = {}

    pairs = [((0, 0), (0, 1)), ((0, 2), (0, 3)), ((0, 4), (1, 0)), ((1, 1), (1, 2)), ((1, 3), (1, 4))]
    for panel_name, panel_height in PANEL_HEIGHTS.items():
        total_grams = 0.0
        for index, pair in enumerate(pairs, start=1):
            mesh, volume = plate_mesh(panel_height, *pair)
            check = validate(mesh)
            require_volume(check, volume)
            filename = f"printer-stand-{panel_name}-plate-{index:02d}-oct-2026.stl"
            write_binary_stl(output_dir / filename, mesh, f"PrintPath {panel_name} plate {index}")
            total_grams += check.petg_grams
            reports[filename] = {"dimensions_mm": check.dimensions, "triangles": check.triangles, "petg_grams": round(check.petg_grams, 1)}
        full_panel_grams[panel_name] = total_grams

    seam_key, seam_volume = make_seam_key()
    key_check = validate(seam_key)
    key_pack = pack_parts(seam_key, 26, key_check.dimensions, 5)
    key_pack_check = validate(key_pack)
    require_volume(key_pack_check, seam_volume * 26)
    key_filename = "printer-stand-seam-key-26-pack-oct-2026.stl"
    write_binary_stl(output_dir / key_filename, key_pack, "PrintPath wire panel seam key pack")
    reports[key_filename] = {"dimensions_mm": key_pack_check.dimensions, "triangles": key_pack_check.triangles, "petg_grams": round(key_pack_check.petg_grams, 1)}

    for side in ("left", "right"):
        latch, latch_volume = make_latch(args.clip_clearance, side)
        latch_check = validate(latch)
        latch_pack = pack_parts(latch, 4, latch_check.dimensions, 2)
        pack_check = validate(latch_pack)
        require_volume(pack_check, latch_volume * 4)
        filename = f"printer-stand-frame-latch-{side}-4-pack-oct-2026.stl"
        write_binary_stl(output_dir / filename, latch_pack, f"PrintPath {side} frame latch pack")
        reports[filename] = {"dimensions_mm": pack_check.dimensions, "triangles": pack_check.triangles, "petg_grams": round(pack_check.petg_grams, 1)}

    coupon, coupon_volume = make_coupon()
    coupon_check = validate(coupon)
    require_volume(coupon_check, coupon_volume)
    coupon_filename = "printer-stand-frame-fit-coupon-15mm-oct-2026.stl"
    write_binary_stl(output_dir / coupon_filename, coupon, "PrintPath 15 mm frame fit coupon")
    reports[coupon_filename] = {"dimensions_mm": coupon_check.dimensions, "triangles": coupon_check.triangles, "petg_grams": round(coupon_check.petg_grams, 1)}

    total_accessory_grams = key_pack_check.petg_grams + sum(reports[f"printer-stand-frame-latch-{side}-4-pack-oct-2026.stl"]["petg_grams"] for side in ("left", "right"))
    report = {
        "design": {
            "finished_panels_mm": [[500, 380], [500, 400]],
            "grid_per_panel": [5, 2],
            "tile_width_mm": round((PANEL_WIDTH - (COLUMNS - 1) * ASSEMBLY_GAP) / COLUMNS, 2),
            "tile_heights_mm": [round((height - ASSEMBLY_GAP) / 2, 2) for height in PANEL_HEIGHTS.values()],
            "visible_face_mm": FACE,
            "ribbed_thickness_mm": FACE + RIB_HEIGHT,
            "assumed_tube_mm": TUBE_SIZE,
            "selected_clip_clearance_mm": args.clip_clearance,
        },
        "files": reports,
        "planning": {
            "panel_1_petg_grams": round(full_panel_grams["panel-1"] + total_accessory_grams / 2, 0),
            "panel_2_petg_grams": round(full_panel_grams["panel-2"] + total_accessory_grams / 2, 0),
            "total_petg_grams": round(sum(full_panel_grams.values()) + total_accessory_grams, 0),
            "plates": 13,
            "time_range_hours": [30, 38],
        },
    }
    (output_dir / "printer-stand-wire-panel-mesh-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
