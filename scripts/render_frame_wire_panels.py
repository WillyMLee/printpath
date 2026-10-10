"""Render deterministic product previews from the wire-panel CAD meshes."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from generate_frame_wire_panels import (
    ASSEMBLY_GAP,
    COLUMNS,
    PANEL_HEIGHTS,
    PANEL_WIDTH,
    ROWS,
    make_tile,
)
from render_design_drafts import Part, box, render


def standing(triangles: list[tuple[tuple[float, float, float], ...]], offset_x: float, offset_z: float) -> np.ndarray:
    mesh = np.asarray(triangles, dtype=float)
    # Printed X/Y/Z becomes installed width/depth/height.
    installed = mesh[..., [0, 2, 1]]
    installed[..., 0] += offset_x
    installed[..., 2] += offset_z
    return installed


def panel_parts(panel_name: str, offset_x: float, back_view: bool = False) -> list[Part]:
    height = PANEL_HEIGHTS[panel_name]
    tile_width = (PANEL_WIDTH - (COLUMNS - 1) * ASSEMBLY_GAP) / COLUMNS
    tile_height = (height - (ROWS - 1) * ASSEMBLY_GAP) / ROWS
    parts: list[Part] = []
    for row in range(ROWS):
        for column in range(COLUMNS):
            triangles, _, _ = make_tile(height, row, column)
            mesh = standing(
                triangles,
                offset_x + column * (tile_width + ASSEMBLY_GAP),
                (ROWS - row - 1) * (tile_height + ASSEMBLY_GAP),
            )
            if back_view:
                mesh[..., 0] = 2 * (offset_x + PANEL_WIDTH / 2) - mesh[..., 0]
                mesh[..., 1] *= -1
            shade = (49, 53, 51) if (row + column) % 2 == 0 else (58, 62, 60)
            parts.append(Part(mesh, shade, f"{panel_name} tile {row + 1}-{column + 1}"))

    # Context rails show how the face spans the 15 mm rounded-square frame poles.
    frame_height = height + 24
    center_x = offset_x + PANEL_WIDTH / 2
    rails = [
        box((15, 15, frame_height), (offset_x + 7.5, 9, height / 2)),
        box((15, 15, frame_height), (offset_x + PANEL_WIDTH - 7.5, 9, height / 2)),
        box((PANEL_WIDTH, 15, 15), (center_x, 9, -7.5)),
        box((PANEL_WIDTH, 15, 15), (center_x, 9, height + 7.5)),
    ]
    if back_view:
        for rail in rails:
            rail[..., 0] = 2 * (offset_x + PANEL_WIDTH / 2) - rail[..., 0]
            rail[..., 1] *= -1
    parts.extend(Part(rail, (98, 105, 102), "15 mm frame") for rail in rails)
    return parts


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    projects = root / "public" / "projects"
    front = panel_parts("panel-1", -530) + panel_parts("panel-2", 30)
    render(front, projects / "printer-stand-wire-panels-product-draft.png")
    back = panel_parts("panel-2", -250, back_view=True)
    render(back, projects / "printer-stand-wire-panels-back-detail.png")
    print("Rendered front and rear CAD previews.")


if __name__ == "__main__":
    main()
