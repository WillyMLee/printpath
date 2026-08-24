"""Render an accurate STL project cover with PrintPath's MotionDeck-inspired stage."""

from __future__ import annotations

import argparse
import math
import re
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


def load_stl(path: Path) -> np.ndarray:
    data = path.read_bytes()
    if len(data) >= 84:
        triangle_count = struct.unpack("<I", data[80:84])[0]
        if len(data) == 84 + triangle_count * 50:
            record_type = np.dtype([("normal", "<f4", (3,)), ("vertices", "<f4", (3, 3)), ("attribute", "<u2")])
            records = np.frombuffer(data, dtype=record_type, count=triangle_count, offset=84)
            return records["vertices"].astype(float)
    text = data.decode("utf-8")
    vertices = np.array(
        [[float(value) for value in match] for match in re.findall(r"vertex\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)", text)],
        dtype=float,
    )
    if len(vertices) == 0 or len(vertices) % 3:
        raise ValueError("Expected an ASCII STL containing complete triangles.")
    return vertices.reshape((-1, 3, 3))


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "arialbd.ttf" if bold else "arial.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size=size)


def rotate_z(points: np.ndarray, degrees: float) -> np.ndarray:
    angle = math.radians(degrees)
    rotation = np.array([[math.cos(angle), -math.sin(angle), 0], [math.sin(angle), math.cos(angle), 0], [0, 0, 1]])
    return points @ rotation.T


def camera_basis(azimuth: float, elevation: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    azimuth = math.radians(azimuth)
    elevation = math.radians(elevation)
    view = np.array([math.cos(elevation) * math.cos(azimuth), math.cos(elevation) * math.sin(azimuth), math.sin(elevation)])
    right = np.cross(view, np.array([0.0, 0.0, 1.0]))
    right /= np.linalg.norm(right)
    up = np.cross(right, view)
    up /= np.linalg.norm(up)
    return right, up, view


def shade(base: tuple[int, int, int], amount: float) -> tuple[int, int, int, int]:
    amount = max(0.42, min(1.22, amount))
    return tuple(max(0, min(255, round(channel * amount))) for channel in base) + (255,)


def parse_hex_color(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    if len(value) != 6:
        raise ValueError("Colors must use six-digit hex notation, for example #ecebe5.")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def rounded_label(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, fill: str, color: str) -> None:
    draw.rounded_rectangle(box, radius=(box[3] - box[1]) // 2, fill=fill)
    draw.text((box[0] + 20, box[1] + 11), text, font=font(20, True), fill=color)


def render(
    stl_path: Path,
    output_path: Path,
    *,
    eyebrow: str = "DRAWER GAP TRAY",
    title: str = "One uninterrupted compartment",
    subtitle: str = "Designed for the narrow zone beside an existing Gridfinity layout.",
    status: str = "ACTUAL STL · APPROVED",
    profile: str = "P1S · ONE PART",
    dimensions: str = "254.4 × 39.4 × 49.4 mm",
    footer: str = "SOFT MATTE PREVIEW  •  AUG 2026",
    portrait: bool = False,
    clean: bool = False,
    base_color: tuple[int, int, int] = (105, 207, 170),
) -> None:
    scale_factor = 2
    width, height = 1200 * scale_factor, 675 * scale_factor
    image = Image.new("RGB", (width, height), "#f6f7f1")
    draw = ImageDraw.Draw(image, "RGBA")

    # Perspective-like stage grid inspired by MotionDeck's live preview.
    horizon = 245 * scale_factor
    floor_bottom = 650 * scale_factor
    vanishing = (650 * scale_factor, horizon)
    for x in range(-300, 1600, 85):
        draw.line((vanishing[0], vanishing[1], x * scale_factor, floor_bottom), fill=(107, 125, 116, 22), width=2)
    for index in range(12):
        t = index / 11
        y = horizon + (t ** 1.8) * (floor_bottom - horizon)
        draw.line((50 * scale_factor, y, 1160 * scale_factor, y), fill=(107, 125, 116, 18 + index * 2), width=2)

    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_box = (365, 480, 835, 610) if clean and portrait else (225, 470, 985, 610) if clean else (505, 500, 985, 615) if portrait else (255, 485, 1050, 610)
    shadow_draw.ellipse(tuple(value * scale_factor for value in shadow_box), fill=(21, 54, 44, 75))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28 * scale_factor))
    image = Image.alpha_composite(image.convert("RGBA"), shadow)
    draw = ImageDraw.Draw(image, "RGBA")

    triangles = load_stl(stl_path)
    centered = triangles - triangles.reshape((-1, 3)).mean(axis=0)
    centered = rotate_z(centered, -17)
    right, up, view = camera_basis(-58, 31)
    projected_x = centered @ right
    projected_y = centered @ up
    depth = centered @ view
    projected = np.stack((projected_x, projected_y), axis=-1)
    flat = projected.reshape((-1, 2))
    span = flat.max(axis=0) - flat.min(axis=0)
    target_width, target_height = ((560, 470) if clean and portrait else (900, 410) if clean else (470, 390) if portrait else (780, 335))
    object_scale = min(target_width * scale_factor / span[0], target_height * scale_factor / span[1])
    projected *= object_scale
    center_x = 600 if clean else 765 if portrait else 665
    center_y = 390 if clean else 445 if portrait else 430
    projected[..., 0] += center_x * scale_factor
    projected[..., 1] = center_y * scale_factor - projected[..., 1]

    edges_a = centered[:, 1] - centered[:, 0]
    edges_b = centered[:, 2] - centered[:, 0]
    normals = np.cross(edges_a, edges_b)
    normal_lengths = np.linalg.norm(normals, axis=1)
    normals = normals / np.where(normal_lengths[:, None] == 0, 1, normal_lengths[:, None])
    light = np.array([-0.35, -0.5, 0.79])
    light /= np.linalg.norm(light)
    intensity = 0.62 + np.maximum(0, normals @ light) * 0.48
    order = np.argsort(depth.mean(axis=1))
    for index in order:
        polygon = [tuple(point) for point in projected[index]]
        draw.polygon(polygon, fill=shade(base_color, float(intensity[index])))

    # A clean outer silhouette keeps the render soft while the shaded faces reveal the cavity.
    points = sorted({tuple(np.round(point, 3)) for point in projected.reshape((-1, 2))})

    def cross(origin: tuple[float, float], a: tuple[float, float], b: tuple[float, float]) -> float:
        return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0])

    lower: list[tuple[float, float]] = []
    for point in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], point) <= 0:
            lower.pop()
        lower.append(point)
    upper: list[tuple[float, float]] = []
    for point in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], point) <= 0:
            upper.pop()
        upper.append(point)
    hull = lower[:-1] + upper[:-1]
    outline_color = tuple(round(channel * 0.52) for channel in base_color) + (190,)
    draw.line(hull + [hull[0]], fill=outline_color, width=2 * scale_factor, joint="curve")

    if not clean:
        # Labeled covers are retained for sharing; the website uses clean product renders.
        draw.text((72 * scale_factor, 60 * scale_factor), eyebrow, font=font(22 * scale_factor, True), fill="#2d6e5a")
        draw.text((72 * scale_factor, 101 * scale_factor), title, font=font(42 * scale_factor, True), fill="#132d25")
        draw.text((74 * scale_factor, 158 * scale_factor), subtitle, font=font(21 * scale_factor), fill="#65766f")
        rounded_label(draw, (72 * scale_factor, 202 * scale_factor, 390 * scale_factor, 254 * scale_factor), status, "#ddf4e9", "#236a55")
        rounded_label(draw, (408 * scale_factor, 202 * scale_factor, 605 * scale_factor, 254 * scale_factor), profile, "#e8ece7", "#52635c")
        draw.rounded_rectangle((750 * scale_factor, 565 * scale_factor, 1135 * scale_factor, 630 * scale_factor), radius=18 * scale_factor, fill="#ffffffdd", outline="#dfe7e1")
        draw.text((780 * scale_factor, 580 * scale_factor), dimensions, font=font(24 * scale_factor, True), fill="#18372d")
        draw.text((72 * scale_factor, 598 * scale_factor), footer, font=font(18 * scale_factor, True), fill="#71827b")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").resize((1200, 675), Image.Resampling.LANCZOS).save(output_path, quality=94)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stl", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--eyebrow", default="DRAWER GAP TRAY")
    parser.add_argument("--title", default="One uninterrupted compartment")
    parser.add_argument("--subtitle", default="Designed for the narrow zone beside an existing Gridfinity layout.")
    parser.add_argument("--status", default="ACTUAL STL · APPROVED")
    parser.add_argument("--profile", default="P1S · ONE PART")
    parser.add_argument("--dimensions", default="254.4 × 39.4 × 49.4 mm")
    parser.add_argument("--footer", default="SOFT MATTE PREVIEW  •  AUG 2026")
    parser.add_argument("--portrait", action="store_true")
    parser.add_argument("--clean", action="store_true")
    parser.add_argument("--base-color", default="#69cfaa")
    args = parser.parse_args()
    render(
        args.stl,
        args.output,
        eyebrow=args.eyebrow,
        title=args.title,
        subtitle=args.subtitle,
        status=args.status,
        profile=args.profile,
        dimensions=args.dimensions,
        footer=args.footer,
        portrait=args.portrait,
        clean=args.clean,
        base_color=parse_hex_color(args.base_color),
    )
