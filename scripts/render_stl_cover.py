"""Render an accurate STL project cover with PrintPath's MotionDeck-inspired stage."""

from __future__ import annotations

import argparse
import math
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


def load_ascii_stl(path: Path) -> np.ndarray:
    text = path.read_text(encoding="utf-8")
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


def rounded_label(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, fill: str, color: str) -> None:
    draw.rounded_rectangle(box, radius=(box[3] - box[1]) // 2, fill=fill)
    draw.text((box[0] + 20, box[1] + 11), text, font=font(20, True), fill=color)


def render(stl_path: Path, output_path: Path) -> None:
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
    shadow_draw.ellipse((255 * scale_factor, 485 * scale_factor, 1050 * scale_factor, 610 * scale_factor), fill=(21, 54, 44, 75))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28 * scale_factor))
    image = Image.alpha_composite(image.convert("RGBA"), shadow)
    draw = ImageDraw.Draw(image, "RGBA")

    triangles = load_ascii_stl(stl_path)
    centered = triangles - triangles.reshape((-1, 3)).mean(axis=0)
    centered = rotate_z(centered, -17)
    right, up, view = camera_basis(-58, 31)
    projected_x = centered @ right
    projected_y = centered @ up
    depth = centered @ view
    projected = np.stack((projected_x, projected_y), axis=-1)
    flat = projected.reshape((-1, 2))
    span = flat.max(axis=0) - flat.min(axis=0)
    object_scale = min(780 * scale_factor / span[0], 335 * scale_factor / span[1])
    projected *= object_scale
    projected[..., 0] += 665 * scale_factor
    projected[..., 1] = 430 * scale_factor - projected[..., 1]

    edges_a = centered[:, 1] - centered[:, 0]
    edges_b = centered[:, 2] - centered[:, 0]
    normals = np.cross(edges_a, edges_b)
    normal_lengths = np.linalg.norm(normals, axis=1)
    normals = normals / np.where(normal_lengths[:, None] == 0, 1, normal_lengths[:, None])
    light = np.array([-0.35, -0.5, 0.79])
    light /= np.linalg.norm(light)
    intensity = 0.62 + np.maximum(0, normals @ light) * 0.48
    order = np.argsort(depth.mean(axis=1))
    base_color = (105, 207, 170)

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
    draw.line(hull + [hull[0]], fill=(28, 103, 80, 190), width=2 * scale_factor, joint="curve")

    # Minimal framing and dimensional truth.
    draw.text((72 * scale_factor, 60 * scale_factor), "DRAWER GAP TRAY", font=font(22 * scale_factor, True), fill="#2d6e5a")
    draw.text((72 * scale_factor, 101 * scale_factor), "One uninterrupted compartment", font=font(42 * scale_factor, True), fill="#132d25")
    draw.text((74 * scale_factor, 158 * scale_factor), "Designed for the narrow zone beside an existing Gridfinity layout.", font=font(21 * scale_factor), fill="#65766f")
    rounded_label(draw, (72 * scale_factor, 202 * scale_factor, 342 * scale_factor, 254 * scale_factor), "ACTUAL STL · APPROVED", "#ddf4e9", "#236a55")
    rounded_label(draw, (360 * scale_factor, 202 * scale_factor, 550 * scale_factor, 254 * scale_factor), "P1S · ONE PART", "#e8ece7", "#52635c")
    draw.rounded_rectangle((750 * scale_factor, 565 * scale_factor, 1135 * scale_factor, 630 * scale_factor), radius=18 * scale_factor, fill="#ffffffdd", outline="#dfe7e1")
    draw.text((780 * scale_factor, 580 * scale_factor), "254.4 × 39.4 × 49.4 mm", font=font(24 * scale_factor, True), fill="#18372d")
    draw.text((72 * scale_factor, 598 * scale_factor), "SOFT MATTE PREVIEW  •  AUG 2026", font=font(18 * scale_factor, True), fill="#71827b")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").resize((1200, 675), Image.Resampling.LANCZOS).save(output_path, quality=94)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stl", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    render(args.stl, args.output)
