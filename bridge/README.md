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

Version 0.2 includes two local, parametric generators:

- `open-tray` creates one exact-dimension, square-corner tray STL.
- `gridfinity-pitch-strip` creates two watertight organizer modules, their individual STL files, and an all-parts STL arranged for one P1S plate.

For a 255 × 40 × 50 mm drawer space, the strip generator creates two 126 × 40 × 50 mm modules. Each module has three compartments aligned to the 42 mm Gridfinity pitch, so the pair uses 252 mm and leaves 3 mm of drawer clearance.

The strip is deliberately described as Gridfinity-pitch-aligned, not standard baseplate-compatible. A standard bin footprint is approximately 41.5 mm wide, so it cannot fit inside a measured 40 mm strip.

## What to inspect in Bambu Studio

The bridge opens the all-parts STL. Before printing, confirm that both modules are flat on the plate, the plate and filament profiles match the P1S setup, the sliced preview has continuous walls and floors, and the estimated material is acceptable. The bridge never presses Print.
