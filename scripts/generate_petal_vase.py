"""Generate PrintPath's single-piece, water-capable vase variants."""

from __future__ import annotations

import argparse
import math
import struct
from collections import Counter
from pathlib import Path

Vec3 = tuple[float, float, float]
Triangle = tuple[Vec3, Vec3, Vec3]

HEIGHT = 245.0
WALL = 2.4
FLOOR = 3.2
FLUTES = 8
ANGULAR_SEGMENTS = 128
VERTICAL_RINGS = 80


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def interpolate_profile(t: float, values: list[tuple[float, float]]) -> float:
    for (left_t, left_value), (right_t, right_value) in zip(values, values[1:]):
        if t <= right_t:
            blend = smoothstep((t - left_t) / (right_t - left_t))
            return left_value + (right_value - left_value) * blend
    return values[-1][1]


def outer_radius(z: float, theta: float) -> float:
    t = max(0.0, min(1.0, z / HEIGHT))
    core = interpolate_profile(t, [(0.0, 51.0), (0.13, 57.0), (0.35, 55.0), (0.62, 47.0), (0.82, 39.0), (1.0, 41.0)])
    amplitude = interpolate_profile(t, [(0.0, 3.8), (0.32, 5.2), (0.75, 3.0), (1.0, 4.2)])
    twist = math.radians(13.0) * t
    return core + amplitude * math.cos(FLUTES * (theta + twist))


def leaf_bloom_outer_radius(z: float, theta: float) -> float:
    """A broad seven-leaf body with a narrower waist and bouquet-friendly flare."""
    t = max(0.0, min(1.0, z / HEIGHT))
    core = interpolate_profile(t, [(0.0, 53.0), (0.12, 58.0), (0.28, 56.0), (0.52, 48.0), (0.72, 42.0), (0.84, 46.0), (0.93, 52.0), (1.0, 55.0)])
    amplitude = interpolate_profile(t, [(0.0, 2.2), (0.18, 4.8), (0.50, 7.0), (0.72, 5.0), (1.0, 6.2)])
    twist = math.radians(34.0) * smoothstep(t)
    phase = 7.0 * (theta + twist)
    leaf_fold = 0.64 * math.cos(phase) + 0.36 * math.cos(2.0 * phase)
    return core + amplitude * leaf_fold


def vertex(z: float, theta: float, inward: float = 0.0, style: str = "petal-twist") -> Vec3:
    radius_function = leaf_bloom_outer_radius if style == "leaf-bloom" else outer_radius
    radius = radius_function(z, theta) - inward
    return (radius * math.cos(theta), radius * math.sin(theta), z)


def top_vertex(theta: float, inward: float = 0.0, style: str = "petal-twist") -> Vec3:
    if style == "leaf-bloom":
        # A deeper seven-leaf crown opens the silhouette without exceeding 245 mm.
        phase = 7.0 * (theta + math.radians(34.0))
        z = HEIGHT - 4.0 + 4.0 * math.cos(phase)
    else:
        # Eight shallow petals: the highest points remain at the approved 245 mm bound.
        z = HEIGHT - 2.5 + 2.5 * math.cos(FLUTES * theta)
    return vertex(HEIGHT, theta, inward, style)[:2] + (z,)


def add_side(triangles: list[Triangle], lower: list[Vec3], upper: list[Vec3], inward: bool = False) -> None:
    count = len(lower)
    for index in range(count):
        following = (index + 1) % count
        a, b = lower[index], lower[following]
        c, d = upper[index], upper[following]
        if inward:
            triangles.extend(((a, d, b), (a, c, d)))
        else:
            triangles.extend(((a, b, d), (a, d, c)))


def generate(style: str = "petal-twist") -> list[Triangle]:
    angular_segments = 168 if style == "leaf-bloom" else ANGULAR_SEGMENTS
    angles = [2.0 * math.pi * index / angular_segments for index in range(angular_segments)]
    regular_z = [(HEIGHT - 8.0) * index / (VERTICAL_RINGS - 1) for index in range(VERTICAL_RINGS)]
    outer_rings = [[vertex(z, angle, style=style) for angle in angles] for z in regular_z]
    outer_rings.append([top_vertex(angle, style=style) for angle in angles])

    inner_z = [FLOOR] + [z for z in regular_z if z > FLOOR]
    inner_rings = [[vertex(z, angle, WALL, style) for angle in angles] for z in inner_z]
    inner_rings.append([top_vertex(angle, WALL, style) for angle in angles])

    triangles: list[Triangle] = []
    for lower, upper in zip(outer_rings, outer_rings[1:]):
        add_side(triangles, lower, upper)
    for lower, upper in zip(inner_rings, inner_rings[1:]):
        add_side(triangles, lower, upper, inward=True)

    bottom_center = (0.0, 0.0, 0.0)
    floor_center = (0.0, 0.0, FLOOR)
    for index in range(angular_segments):
        following = (index + 1) % angular_segments
        triangles.append((bottom_center, outer_rings[0][following], outer_rings[0][index]))
        triangles.append((floor_center, inner_rings[0][index], inner_rings[0][following]))

        inner = inner_rings[-1]
        outer = outer_rings[-1]
        triangles.append((inner[index], outer[index], outer[following]))
        triangles.append((inner[index], outer[following], inner[following]))
    return triangles


def normal(triangle: Triangle) -> Vec3:
    a, b, c = triangle
    ab = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    ac = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
    cross = (ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0])
    length = math.sqrt(sum(component * component for component in cross))
    return tuple(component / length for component in cross) if length else (0.0, 0.0, 0.0)


def write_binary_stl(path: Path, triangles: list[Triangle], style: str = "petal-twist") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as handle:
        label = b"PrintPath Leaf Bloom Vase" if style == "leaf-bloom" else b"PrintPath Petal Twist Vase"
        handle.write(label.ljust(80, b"\0"))
        handle.write(struct.pack("<I", len(triangles)))
        for triangle in triangles:
            values = normal(triangle) + tuple(component for point in triangle for component in point)
            handle.write(struct.pack("<12fH", *values, 0))


def validate(triangles: list[Triangle]) -> dict[str, object]:
    def key(vertex_value: Vec3) -> tuple[int, int, int]:
        return tuple(round(component * 1_000_000) for component in vertex_value)

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
        raise ValueError(f"Mesh is not watertight: {len(bad_edges)} edges do not have exactly two faces.")
    if dimensions[2] > 245.001 or max(dimensions[:2]) > 130:
        raise ValueError(f"Unexpected vase bounds: {dimensions}")
    return {"triangles": len(triangles), "dimensions": dimensions, "bounds_min": bounds_min, "bounds_max": bounds_max, "watertight": True}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    parser.add_argument("--style", choices=("petal-twist", "leaf-bloom"), default="petal-twist")
    args = parser.parse_args()
    mesh = generate(args.style)
    report = validate(mesh)
    write_binary_stl(args.output, mesh, args.style)
    print(f"Wrote {args.output}")
    print(f"Triangles: {report['triangles']}")
    print("Bounds: " + " × ".join(f"{value:.2f}" for value in report["dimensions"]) + " mm")
    print("Watertight: yes")
