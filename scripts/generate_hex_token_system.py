"""Generate PrintPath's support-free magnetic hex token tray prototype."""

from __future__ import annotations

import math
import struct
from collections import Counter
from pathlib import Path

Vec3 = tuple[float, float, float]
Triangle = tuple[Vec3, Vec3, Vec3]

OUTER_RADIUS = 48.0
HEIGHT = 22.0
WALL = 2.4
FLOOR = 2.4
MAGNET_RADIUS = 3.15
MAGNET_DEPTH = 2.4
POCKET_DEPTH = 4.0
POCKET_FLOOR = POCKET_DEPTH - MAGNET_DEPTH
CYLINDER_SEGMENTS = 32


def add_quad(triangles: list[Triangle], a: Vec3, b: Vec3, c: Vec3, d: Vec3) -> None:
    triangles.extend(((a, b, c), (a, c, d)))


def ring(radius: float, z: float) -> list[Vec3]:
    return [
        (radius * math.cos(math.radians(index * 60)), radius * math.sin(math.radians(index * 60)), z)
        for index in range(6)
    ]


def add_hex_cup(triangles: list[Triangle]) -> float:
    outer_apothem = OUTER_RADIUS * math.cos(math.radians(30))
    inner_apothem = outer_apothem - WALL
    inner_radius = inner_apothem / math.cos(math.radians(30))
    outer_bottom = ring(OUTER_RADIUS, 0.0)
    outer_top = ring(OUTER_RADIUS, HEIGHT)
    inner_floor = ring(inner_radius, FLOOR)
    inner_top = ring(inner_radius, HEIGHT)
    bottom_center = (0.0, 0.0, 0.0)
    floor_center = (0.0, 0.0, FLOOR)

    for index in range(6):
        following = (index + 1) % 6
        triangles.append((bottom_center, outer_bottom[following], outer_bottom[index]))
        add_quad(triangles, outer_bottom[index], outer_bottom[following], outer_top[following], outer_top[index])
        add_quad(triangles, inner_floor[index], inner_top[index], inner_top[following], inner_floor[following])
        triangles.append((floor_center, inner_floor[index], inner_floor[following]))
        add_quad(triangles, outer_top[index], outer_top[following], inner_top[following], inner_top[index])
    return inner_apothem


def add_oriented_box(
    triangles: list[Triangle],
    *,
    length: float,
    width: float,
    height: float,
    angle_degrees: float,
    center_x: float = 0.0,
    center_y: float = 0.0,
    bottom: float = FLOOR - 0.2,
) -> None:
    angle = math.radians(angle_degrees)
    forward = (math.cos(angle), math.sin(angle))
    side = (-forward[1], forward[0])

    def point(along: float, across: float, z: float) -> Vec3:
        return (
            center_x + forward[0] * along + side[0] * across,
            center_y + forward[1] * along + side[1] * across,
            z,
        )

    low = bottom
    high = bottom + height
    half_length = length / 2
    half_width = width / 2
    a = point(-half_length, -half_width, low)
    b = point(half_length, -half_width, low)
    c = point(half_length, half_width, low)
    d = point(-half_length, half_width, low)
    e = point(-half_length, -half_width, high)
    f = point(half_length, -half_width, high)
    g = point(half_length, half_width, high)
    h = point(-half_length, half_width, high)
    add_quad(triangles, a, d, c, b)
    add_quad(triangles, a, b, f, e)
    add_quad(triangles, b, c, g, f)
    add_quad(triangles, c, d, h, g)
    add_quad(triangles, d, a, e, h)
    add_quad(triangles, e, f, g, h)


def generate_tray(variant: str) -> list[Triangle]:
    triangles: list[Triangle] = []
    inner_apothem = add_hex_cup(triangles)
    divider_height = HEIGHT - FLOOR - 5.0
    if variant == "split":
        add_oriented_box(triangles, length=inner_apothem * 2 + 1.0, width=2.2, height=divider_height, angle_degrees=0)
    elif variant == "triple":
        arm_length = inner_apothem + 1.0
        for angle in (0.0, 120.0, 240.0):
            radians = math.radians(angle)
            add_oriented_box(
                triangles,
                length=arm_length,
                width=2.2,
                height=divider_height,
                angle_degrees=angle,
                center_x=math.cos(radians) * arm_length / 2,
                center_y=math.sin(radians) * arm_length / 2,
            )
    elif variant != "single":
        raise ValueError(f"Unknown tray variant: {variant}")
    return triangles


def generate_magnet_cup(radius: float = MAGNET_RADIUS) -> list[Triangle]:
    triangles: list[Triangle] = []
    outer_radius = radius + 1.55
    outer_bottom = [
        (outer_radius * math.cos(2 * math.pi * index / CYLINDER_SEGMENTS), outer_radius * math.sin(2 * math.pi * index / CYLINDER_SEGMENTS), 0.0)
        for index in range(CYLINDER_SEGMENTS)
    ]
    outer_top = [(x, y, POCKET_DEPTH) for x, y, _ in outer_bottom]
    inner_floor = [
        (radius * math.cos(2 * math.pi * index / CYLINDER_SEGMENTS), radius * math.sin(2 * math.pi * index / CYLINDER_SEGMENTS), POCKET_FLOOR)
        for index in range(CYLINDER_SEGMENTS)
    ]
    inner_top = [(x, y, POCKET_DEPTH) for x, y, _ in inner_floor]
    outer_center = (0.0, 0.0, 0.0)
    floor_center = (0.0, 0.0, POCKET_FLOOR)
    for index in range(CYLINDER_SEGMENTS):
        following = (index + 1) % CYLINDER_SEGMENTS
        add_quad(triangles, outer_bottom[index], outer_bottom[following], outer_top[following], outer_top[index])
        add_quad(triangles, inner_floor[index], inner_top[index], inner_top[following], inner_floor[following])
        add_quad(triangles, outer_top[index], outer_top[following], inner_top[following], inner_top[index])
        triangles.append((outer_center, outer_bottom[following], outer_bottom[index]))
        triangles.append((floor_center, inner_floor[index], inner_floor[following]))
    return triangles


def add_vertical_cup(triangles: list[Triangle], center_x: float, radius: float) -> None:
    outer_radius = radius + 1.5
    outer_bottom = [
        (center_x + outer_radius * math.cos(2 * math.pi * index / CYLINDER_SEGMENTS), 9.0 + outer_radius * math.sin(2 * math.pi * index / CYLINDER_SEGMENTS), 1.8)
        for index in range(CYLINDER_SEGMENTS)
    ]
    outer_top = [(x, y, 5.6) for x, y, _ in outer_bottom]
    inner_floor = [
        (center_x + radius * math.cos(2 * math.pi * index / CYLINDER_SEGMENTS), 9.0 + radius * math.sin(2 * math.pi * index / CYLINDER_SEGMENTS), 3.2)
        for index in range(CYLINDER_SEGMENTS)
    ]
    inner_top = [(x, y, 5.6) for x, y, _ in inner_floor]
    outer_center = (center_x, 9.0, 1.8)
    floor_center = (center_x, 9.0, 3.2)
    for index in range(CYLINDER_SEGMENTS):
        following = (index + 1) % CYLINDER_SEGMENTS
        add_quad(triangles, outer_bottom[index], outer_bottom[following], outer_top[following], outer_top[index])
        add_quad(triangles, inner_floor[index], inner_top[index], inner_top[following], inner_floor[following])
        add_quad(triangles, outer_top[index], outer_top[following], inner_top[following], inner_top[index])
        triangles.append((outer_center, outer_bottom[following], outer_bottom[index]))
        triangles.append((floor_center, inner_floor[index], inner_floor[following]))


def generate_coupon() -> list[Triangle]:
    triangles: list[Triangle] = []
    add_oriented_box(triangles, length=45.0, width=18.0, height=2.0, angle_degrees=0, center_x=22.5, center_y=9.0, bottom=0.0)
    for center_x, radius in zip((8.0, 22.5, 37.0), (3.10, 3.175, 3.25)):
        add_vertical_cup(triangles, center_x, radius)
    return triangles


def translated(triangles: list[Triangle], offset_x: float, offset_y: float, offset_z: float = 0.0) -> list[Triangle]:
    return [
        tuple((x + offset_x, y + offset_y, z + offset_z) for x, y, z in triangle)
        for triangle in triangles
    ]


def generate_two_pod_starter_kit() -> list[Triangle]:
    """Lay out two pods and twelve cups as a connection-test set on one P1S plate."""
    triangles: list[Triangle] = []
    triangles.extend(translated(generate_tray("single"), -52.0, 0.0))
    triangles.extend(translated(generate_tray("single"), 52.0, 0.0))
    cup = generate_magnet_cup()
    cup_x_positions = (-37.5, -22.5, -7.5, 7.5, 22.5, 37.5)
    for y in (-52.0, 52.0):
        for x in cup_x_positions:
            triangles.extend(translated(cup, x, y))
    return triangles


def normal(triangle: Triangle) -> Vec3:
    a, b, c = triangle
    ab = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    ac = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
    cross = (
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0],
    )
    length = math.sqrt(sum(component * component for component in cross))
    return tuple(component / length for component in cross) if length else (0.0, 0.0, 0.0)


def write_binary_stl(path: Path, triangles: list[Triangle], label: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as handle:
        handle.write(label.encode("ascii")[:80].ljust(80, b"\0"))
        handle.write(struct.pack("<I", len(triangles)))
        for triangle in triangles:
            values = normal(triangle) + tuple(component for point in triangle for component in point)
            handle.write(struct.pack("<12fH", *values, 0))


def validate(triangles: list[Triangle]) -> dict[str, object]:
    def key(vertex: Vec3) -> tuple[int, int, int]:
        return tuple(round(component * 1_000_000) for component in vertex)

    edges: Counter[tuple[tuple[int, int, int], tuple[int, int, int]]] = Counter()
    points: list[Vec3] = []
    for triangle in triangles:
        points.extend(triangle)
        keys = [key(point) for point in triangle]
        for first, second in ((0, 1), (1, 2), (2, 0)):
            edges[tuple(sorted((keys[first], keys[second])))] += 1
    bad_edges = [edge for edge, count in edges.items() if count != 2]
    bounds_min = tuple(min(point[axis] for point in points) for axis in range(3))
    bounds_max = tuple(max(point[axis] for point in points) for axis in range(3))
    dimensions = tuple(bounds_max[axis] - bounds_min[axis] for axis in range(3))
    if bad_edges:
        raise ValueError(f"Mesh contains {len(bad_edges)} non-manifold shell edges.")
    if max(dimensions) > 256:
        raise ValueError(f"Mesh exceeds the P1S build volume: {dimensions}")
    return {"triangles": len(triangles), "dimensions": dimensions, "watertight_shells": True}


if __name__ == "__main__":
    project_dir = Path(__file__).resolve().parents[1] / "public" / "projects"
    outputs = {
        "single": project_dir / "magnetic-hex-token-tray-single-aug-2026.stl",
        "split": project_dir / "magnetic-hex-token-tray-split-aug-2026.stl",
        "triple": project_dir / "magnetic-hex-token-tray-triple-aug-2026.stl",
    }
    for variant, output in outputs.items():
        mesh = generate_tray(variant)
        report = validate(mesh)
        write_binary_stl(output, mesh, f"PrintPath magnetic hex tray {variant}")
        print(f"{variant}: {report['dimensions']} mm · {report['triangles']} triangles · watertight shells")
    coupon = generate_coupon()
    coupon_report = validate(coupon)
    coupon_path = project_dir / "magnetic-hex-token-tray-fit-coupon-aug-2026.stl"
    write_binary_stl(coupon_path, coupon, "PrintPath 6x2 magnet fit coupon")
    print(f"coupon: {coupon_report['dimensions']} mm · {coupon_report['triangles']} triangles · watertight shells")
    magnet_cup = generate_magnet_cup()
    magnet_cup_report = validate(magnet_cup)
    magnet_cup_path = project_dir / "magnetic-hex-token-magnet-cup-6x2-aug-2026.stl"
    write_binary_stl(magnet_cup_path, magnet_cup, "PrintPath 6x2 glue-on magnet cup")
    print(f"magnet cup: {magnet_cup_report['dimensions']} mm · {magnet_cup_report['triangles']} triangles · watertight shell")
    starter_kit = generate_two_pod_starter_kit()
    starter_kit_report = validate(starter_kit)
    starter_kit_path = project_dir / "magnetic-hex-token-two-pod-starter-kit-aug-2026.stl"
    write_binary_stl(starter_kit_path, starter_kit, "PrintPath two-pod magnetic connection starter kit")
    print(f"starter kit: {starter_kit_report['dimensions']} mm · {starter_kit_report['triangles']} triangles · watertight shells")
