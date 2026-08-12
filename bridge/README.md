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

Version 0.1 generates a square-corner, open-tray STL for templates explicitly marked as `open-tray`. Other objects remain design briefs until their own parametric generators are implemented.
