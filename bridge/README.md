# PrintPath Bridge

PrintPath Bridge is a deliberately small local service that moves reviewed PrintPath designs into Bambu Studio without receiving Bambu Lab credentials.

## Safety boundary

- Listens only on `127.0.0.1:32145`.
- Accepts the hosted PrintPath origin and local development origins only.
- Requires a locally generated pairing code for file creation.
- Writes files to `Documents/PrintPath Exports`.
- Opens the model in Bambu Studio, but never slices or starts a print automatically.
- Does not read Bambu Studio sessions, passwords, cookies, or printer access codes.

## Start on Windows

Double-click `start-bridge.cmd` or run:

```powershell
npm run bridge
```

Keep the terminal window open and enter its pairing code in PrintPath. The code is created once and stored under `%LOCALAPPDATA%\PrintPath\Bridge`.

If Bambu Studio uses a nonstandard installation folder, set `PRINTPATH_BAMBU_STUDIO_PATH` to the full `bambu-studio.exe` path before starting the bridge. Without it, the bridge asks Windows to open the STL with its registered application.

## Current geometry support

Version 0.3 includes two local, parametric generators:

- `open-tray` creates one exact-dimension, square-corner tray STL.
- `gridfinity-gap-tray` creates one watertight, uninterrupted compartment for a narrow leftover zone beside an existing Gridfinity layout.

For a 255 × 40 × 50 mm drawer space, the gap-tray generator creates one part with one compartment. With the default 0.3 mm-per-side fit allowance, its printed outside is 254.4 × 39.4 × 50 mm and its interior is 249.6 × 34.6 × 47.6 mm with 2.4 mm walls and floor.

The STL is pre-rotated 45 degrees, giving it an approximately 207.75 × 207.75 mm plate footprint instead of placing the long edge against the P1S boundary. It is deliberately described as a custom companion to Gridfinity, not a standard baseplate-compatible bin. A standard bin footprint is approximately 41.5 mm wide, so it cannot fit inside the measured 40 mm zone.

## What to inspect in Bambu Studio

The bridge opens the diagonally arranged STL. Before printing, confirm that the part is flat on the plate, its full footprint is inside the printable boundary, the plate and filament profiles match the P1S setup, the sliced preview has continuous walls and floor, and the estimated material is acceptable. The bridge never presses Print.
