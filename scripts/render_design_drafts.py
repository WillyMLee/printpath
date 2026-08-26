"""Render deterministic geometry drafts for PrintPath concept projects.

These are product-style previews of real triangle meshes built in memory. They are
not print-approved STLs: phone fit dimensions and connector coupons remain gates.
"""

from __future__ import annotations

import math
import struct
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

Vec3 = tuple[float, float, float]


@dataclass
class Part:
    triangles: np.ndarray
    color: tuple[int, int, int]
    name: str


def mesh(triangles: list[tuple[Vec3, Vec3, Vec3]]) -> np.ndarray:
    return np.asarray(triangles, dtype=float)


def box(size: Vec3, center: Vec3) -> np.ndarray:
    sx, sy, sz = (value / 2 for value in size)
    cx, cy, cz = center
    v = np.array([
        [cx - sx, cy - sy, cz - sz], [cx + sx, cy - sy, cz - sz],
        [cx + sx, cy + sy, cz - sz], [cx - sx, cy + sy, cz - sz],
        [cx - sx, cy - sy, cz + sz], [cx + sx, cy - sy, cz + sz],
        [cx + sx, cy + sy, cz + sz], [cx - sx, cy + sy, cz + sz],
    ])
    faces = [(0, 2, 1), (0, 3, 2), (4, 5, 6), (4, 6, 7), (0, 1, 5), (0, 5, 4),
             (1, 2, 6), (1, 6, 5), (2, 3, 7), (2, 7, 6), (3, 0, 4), (3, 4, 7)]
    return v[np.asarray(faces)]


def prism(points: list[tuple[float, float]], z0: float, z1: float) -> np.ndarray:
    vertices = [(x, y, z0) for x, y in points] + [(x, y, z1) for x, y in points]
    count = len(points)
    triangles: list[tuple[Vec3, Vec3, Vec3]] = []
    for index in range(1, count - 1):
        triangles.append((vertices[0], vertices[index + 1], vertices[index]))
        triangles.append((vertices[count], vertices[count + index], vertices[count + index + 1]))
    for index in range(count):
        following = (index + 1) % count
        triangles.extend(((vertices[index], vertices[following], vertices[count + following]),
                          (vertices[index], vertices[count + following], vertices[count + index])))
    return mesh(triangles)


def cylinder(radius: float, height: float, center: Vec3, segments: int = 24) -> np.ndarray:
    cx, cy, cz = center
    z0, z1 = cz - height / 2, cz + height / 2
    lower = [(cx + radius * math.cos(2 * math.pi * i / segments), cy + radius * math.sin(2 * math.pi * i / segments), z0) for i in range(segments)]
    upper = [(x, y, z1) for x, y, _ in lower]
    triangles: list[tuple[Vec3, Vec3, Vec3]] = []
    for index in range(segments):
        following = (index + 1) % segments
        triangles.extend(((lower[index], lower[following], upper[following]), (lower[index], upper[following], upper[index])))
        triangles.append(((cx, cy, z0), lower[following], lower[index]))
        triangles.append(((cx, cy, z1), upper[index], upper[following]))
    return mesh(triangles)


def ellipsoid(radii: Vec3, center: Vec3, segments: int = 28, rings: int = 14) -> np.ndarray:
    rx, ry, rz = radii
    cx, cy, cz = center
    vertices = []
    for ring in range(rings + 1):
        phi = math.pi * ring / rings
        for segment in range(segments):
            theta = 2 * math.pi * segment / segments
            vertices.append((cx + rx * math.sin(phi) * math.cos(theta), cy + ry * math.sin(phi) * math.sin(theta), cz + rz * math.cos(phi)))
    triangles: list[tuple[Vec3, Vec3, Vec3]] = []
    for ring in range(rings):
        for segment in range(segments):
            following = (segment + 1) % segments
            a = ring * segments + segment
            b = ring * segments + following
            c = (ring + 1) * segments + following
            d = (ring + 1) * segments + segment
            triangles.extend(((vertices[a], vertices[b], vertices[c]), (vertices[a], vertices[c], vertices[d])))
    return mesh(triangles)


def rotate_x(triangles: np.ndarray, degrees: float, origin: Vec3 = (0, 0, 0)) -> np.ndarray:
    angle = math.radians(degrees)
    rotation = np.array([[1, 0, 0], [0, math.cos(angle), -math.sin(angle)], [0, math.sin(angle), math.cos(angle)]])
    return (triangles - np.asarray(origin)) @ rotation.T + np.asarray(origin)


def rotate_z(triangles: np.ndarray, degrees: float) -> np.ndarray:
    angle = math.radians(degrees)
    rotation = np.array([[math.cos(angle), -math.sin(angle), 0], [math.sin(angle), math.cos(angle), 0], [0, 0, 1]])
    return triangles @ rotation.T


def translate(triangles: np.ndarray, offset: Vec3) -> np.ndarray:
    return triangles + np.asarray(offset)


def load_stl(path: Path) -> np.ndarray:
    data = path.read_bytes()
    count = struct.unpack("<I", data[80:84])[0]
    record = np.dtype([("normal", "<f4", (3,)), ("vertices", "<f4", (3, 3)), ("attribute", "<u2")])
    return np.frombuffer(data, dtype=record, count=count, offset=84)["vertices"].astype(float)


def phone_parts() -> list[Part]:
    bars = [box((6, 10, 164), (-38, 3, 91)), box((6, 10, 164), (38, 3, 91)),
            box((70, 10, 6), (0, 3, 12)), box((70, 10, 6), (0, 3, 170))]
    return [Part(rotate_x(bar, -12, (0, 3, 12)), (48, 63, 65), "assumed phone envelope") for bar in bars]


def tidepool() -> list[Part]:
    parts = [Part(ellipsoid((68, 46, 8), (0, 2, 8)), (31, 77, 112), "manta base")]
    for index, (y, z, angle) in enumerate([((24), 36, -10), (28, 57, -4), (31, 78, 4), (34, 97, 12)]):
        arc = rotate_x(box((88 - index * 10, 11, 23), (0, y, z)), angle, (0, y, z))
        parts.append(Part(arc, (94, 183, 204), "wave support"))
    parts.append(Part(box((88, 18, 12), (0, -25, 18)), (110, 198, 218), "phone lip"))
    for x in (-44, -22, 22, 44):
        parts.append(Part(ellipsoid((10, 8, 5), (x, -32, 27)), (244, 246, 239), "foam accent"))
    return parts + phone_parts()


def capiz() -> list[Part]:
    fan = [(-70, -26), (-56, 28), (-34, 52), (0, 62), (34, 52), (56, 28), (70, -26)]
    parts = [Part(prism(fan, 0, 14), (28, 66, 102), "scallop reef")]
    for index, x in enumerate((-48, -24, 0, 24, 48)):
        pane = ellipsoid((25, 4, 45 + (2 - abs(index - 2)) * 5), (x, 30, 72 + (2 - abs(index - 2)) * 3))
        parts.append(Part(pane, (234, 240, 233), "capiz pane"))
    parts.append(Part(box((92, 20, 15), (0, -25, 19)), (104, 191, 205), "tide cradle"))
    return parts + phone_parts()


def cozy() -> list[Part]:
    parts = [Part(box((132, 92, 14), (0, 2, 7)), (48, 105, 58), "field base"),
             Part(box((112, 72, 10), (0, 3, 18)), (80, 142, 72), "upper terrace"),
             Part(box((88, 13, 105), (0, 30, 72)), (239, 215, 165), "barn support")]
    roof = prism([(-58, 25), (0, 62), (58, 25), (46, 17), (0, 46), (-46, 17)], 119, 133)
    parts.append(Part(roof, (177, 74, 59), "barn roof"))
    parts.append(Part(box((90, 21, 14), (0, -25, 24)), (168, 169, 157), "stone bridge lip"))
    parts.append(Part(box((18, 27, 6), (0, -28, 16)), (84, 145, 164), "cable channel"))
    for x, color in [(-35, (226, 187, 73)), (0, (105, 165, 81)), (35, (206, 103, 82))]:
        parts.append(Part(box((18, 18, 8), (x, -1, 29)), color, "crop tile"))
    return parts + phone_parts()


def evergarden(vase_path: Path) -> list[Part]:
    vase = load_stl(vase_path)
    vase[:, :, 2] *= 0.72
    parts = [Part(vase, (235, 235, 229), "Porcelain Reed vase")]
    positions = [(-45, 2, 218), (-28, 6, 244), (-8, 8, 226), (14, 4, 250), (34, 6, 220), (48, 3, 240), (4, 7, 270)]
    colors = [(100, 181, 202), (244, 241, 231), (40, 77, 112), (100, 181, 202), (244, 241, 231), (100, 181, 202), (40, 77, 112)]
    for index, (x, y, z) in enumerate(positions):
        parts.append(Part(cylinder(2.2, z - 120, (x, y, 120 + (z - 120) / 2), 14), (82, 137, 92), "stem"))
        petal_count = 6 if index % 3 == 0 else 8 if index % 3 == 1 else 5
        for petal in range(petal_count):
            angle = 360 * petal / petal_count
            petal_mesh = ellipsoid((8, 3, 16), (0, 0, 0), 18, 10)
            petal_mesh = rotate_x(petal_mesh, 82)
            petal_mesh = rotate_z(petal_mesh, angle)
            petal_mesh = translate(petal_mesh, (x + 12 * math.cos(math.radians(angle)), y, z + 12 * math.sin(math.radians(angle))))
            parts.append(Part(petal_mesh, colors[index], "flower petal"))
        parts.append(Part(ellipsoid((7, 4, 7), (x, y - 3, z)), (225, 184, 74), "flower center"))
        if index < 5:
            leaf = rotate_z(ellipsoid((14, 3, 28), (x + (12 if index % 2 else -12), y, 165 + index * 6), 18, 10), 28 if index % 2 else -28)
            parts.append(Part(leaf, (104, 163, 112), "leaf"))
    return parts


def camera_basis(azimuth: float, elevation: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    azimuth, elevation = math.radians(azimuth), math.radians(elevation)
    view = np.array([math.cos(elevation) * math.cos(azimuth), math.cos(elevation) * math.sin(azimuth), math.sin(elevation)])
    right = np.cross(view, np.array([0.0, 0.0, 1.0])); right /= np.linalg.norm(right)
    up = np.cross(right, view); up /= np.linalg.norm(up)
    return right, up, view


def shade(color: tuple[int, int, int], amount: float) -> tuple[int, int, int, int]:
    amount = max(0.42, min(1.18, amount))
    return tuple(max(0, min(255, round(channel * amount))) for channel in color) + (255,)


def render(parts: list[Part], output: Path) -> None:
    scale = 2
    image = Image.new("RGB", (1200 * scale, 675 * scale), "#f6f7f1")
    draw = ImageDraw.Draw(image, "RGBA")
    horizon, bottom = 248 * scale, 650 * scale
    vanish = (650 * scale, horizon)
    for x in range(-300, 1600, 85):
        draw.line((vanish[0], vanish[1], x * scale, bottom), fill=(107, 125, 116, 22), width=2)
    for index in range(12):
        t = index / 11
        y = horizon + (t ** 1.8) * (bottom - horizon)
        draw.line((50 * scale, y, 1160 * scale, y), fill=(107, 125, 116, 18 + index * 2), width=2)
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse((320 * scale, 500 * scale, 900 * scale, 620 * scale), fill=(21, 54, 44, 65))
    image = Image.alpha_composite(image.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(28 * scale)))
    draw = ImageDraw.Draw(image, "RGBA")

    all_points = np.concatenate([part.triangles.reshape((-1, 3)) for part in parts])
    center = (all_points.min(axis=0) + all_points.max(axis=0)) / 2
    prepared = [rotate_z(part.triangles - center, -17) for part in parts]
    right, up, view = camera_basis(-58, 29)
    flat_all = []
    for triangles in prepared:
        flat_all.append(np.stack((triangles @ right, triangles @ up), axis=-1))
    flat = np.concatenate([projected.reshape((-1, 2)) for projected in flat_all])
    span = flat.max(axis=0) - flat.min(axis=0)
    object_scale = min(820 * scale / span[0], 465 * scale / span[1])
    records = []
    light = np.array([-0.35, -0.5, 0.79]); light /= np.linalg.norm(light)
    for part, triangles, projected in zip(parts, prepared, flat_all):
        projected = projected * object_scale
        projected[..., 0] += 600 * scale
        projected[..., 1] = 390 * scale - projected[..., 1]
        edges_a, edges_b = triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0]
        normals = np.cross(edges_a, edges_b)
        lengths = np.linalg.norm(normals, axis=1)
        normals = normals / np.where(lengths[:, None] == 0, 1, lengths[:, None])
        intensity = 0.62 + np.maximum(0, normals @ light) * 0.48
        depth = (triangles @ view).mean(axis=1)
        for index in range(len(triangles)):
            records.append((depth[index], projected[index], shade(part.color, float(intensity[index]))))
    for _, polygon, color in sorted(records, key=lambda record: record[0]):
        draw.polygon([tuple(point) for point in polygon], fill=color)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").resize((1200, 675), Image.Resampling.LANCZOS).save(output, quality=94)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    projects = root / "public" / "projects"
    scenes = {
        "tidepool-buddy-product-draft.png": tidepool(),
        "capiz-cove-product-draft.png": capiz(),
        "cozy-harvest-product-draft.png": cozy(),
        "evergarden-bouquet-product-draft.png": evergarden(projects / "porcelain-reed-vase-aug-2026.stl"),
    }
    for filename, parts in scenes.items():
        render(parts, projects / filename)
        print(f"Rendered {filename}: {sum(len(part.triangles) for part in parts):,} triangles")


if __name__ == "__main__":
    main()
