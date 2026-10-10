# Printer Stand Wire-Cover Panels — October 2026

## What this design covers

This prototype creates two plain-black covers measured to the outside edges of the stand frame:

- Panel 1: **500 × 380 mm**
- Panel 2: **500 × 400 mm**
- Assumed frame tube: **15 × 15 mm rounded square**
- Attachment: replaceable left/right PETG C-latches; no top latch is required

Each cover is a 5 × 2 grid. The controlled 0.5 mm seams are included in the finished dimensions. Panel 1 tiles are 99.6 × 189.75 mm; Panel 2 tiles are 99.6 × 199.75 mm.

The visible surface is only 0.8 mm thick. A 3.0 mm total ribbed depth on the hidden side adds stiffness without making the entire panel thick or heavy. Print the tiles visible-face-down on a clean Textured PEI Plate for one consistent matte-black finish.

## Do this first: frame coupon

Open `printer-stand-frame-fit-coupon-p1s-petg-oct-2026.3mf` in Bambu Studio and print it in black PETG before any panel plate. The prepared project is already laid on its broad side for a support-free print. The raw source is `printer-stand-frame-fit-coupon-15mm-oct-2026.stl` if you want to arrange it yourself.

The prepared P1S slice uses the 0.4 mm nozzle, Textured PEI Plate, 0.20 mm Standard profile, and Generic PETG. Its current estimate is **25 minutes 54 seconds and 5.91 g**. Confirm that filament slot 1 matches the PETG spool actually loaded before sending the plate.

The coupon contains three clips from left to right:

1. One raised bar: 0.2 mm clearance — tight
2. Two raised bars: 0.6 mm clearance — nominal and used by the supplied latch packs
3. Three raised bars: 1.0 mm clearance — loose

Choose the smallest clip that presses onto the real vertical tube with a distinct click, does not show white stress marks, does not rattle, and can still be removed by pulling at the clip rather than the middle of the panel.

If the middle coupon is not right, regenerate the files from the repository:

```powershell
python scripts/generate_frame_wire_panels.py --clip-clearance 0.2
python scripts/generate_frame_wire_panels.py --clip-clearance 1.0
```

Before the full print, also confirm that the tube is close to 15 mm deep—not only 15 mm wide—and photograph one exposed corner so the rounded-corner radius can be compared with the coupon.

## P1S starting profile

- Material: black PETG or PETG-HF
- Nozzle: 0.4 mm
- Layer height: 0.20 mm
- Walls: 3 for tiles and keys; 4 for frame latches
- Top/bottom layers: 4
- Infill: 15% gyroid for tiles; 100% for seam keys and latches
- Supports: off
- Brim: off initially; use a 3–5 mm outer brim only if a tile corner lifts
- Plate: clean Textured PEI Plate

The two tiles in each numbered panel STL are already arranged within a 203.2 × 189.75 mm or 203.2 × 199.75 mm footprint. This leaves comfortable space on the 256 × 256 mm P1S plate.

## Plate plan

1. Frame fit coupon — stop and test
2. Panel 1 plates 01–05
3. Panel 2 plates 01–05
4. Twenty-six seam keys
5. Left and right latch packs together on one plate

Planning estimate: **13 plates, approximately 30–38 hours, and approximately 679 g PETG**. Bambu Studio is the authority for final time and filament after slicing with your exact filament profile.

## Assembly

1. Lay each panel face-down on a towel.
2. Arrange the ten tiles as five columns by two rows. Keep the subtle 0.5 mm seams even.
3. Slide the low-profile seam keys into the rear channels. Use 13 keys per panel.
4. Slide one left or right latch cassette into each outside tile receiver—four latches per completed panel.
5. Hold the finished face against the stand, align every C-latch with the two vertical tubes, and press only at the latch locations until they click.
6. Check that the panel cannot chatter against the frame. Remove it by pulling beside one latch at a time; do not bow the center.

## Safety and final measurements

- Keep AC/USB modules, power bricks, ventilation openings, and warm wiring at least 25 mm clear.
- Route wires so the panel cannot pinch insulation against the metal frame.
- If a wire bundle projects more than about 12 mm behind the panel face, measure that projection before printing the full set.
- This prototype assumes the 500 mm width and both heights were measured outside-edge to outside-edge, as described.

The snap fit is intentionally gated by the coupon. The tile sizes and P1S plate fit are CAD-verified; real frame depth, corner radius, paint thickness, and access behind the poles still require the physical test.
