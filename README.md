# PrintPath

PrintPath is an open-source, visual workflow for turning an everyday 3D-printing idea into a precise, reviewable design specification. The first prototype captures the job, dimensions, printer profile, and print-readiness checks without requiring CAD knowledge.

**Live prototype:** [printpath.willymlee.workers.dev](https://printpath.willymlee.workers.dev)

## Current prototype

- Guided four-step design intake
- Plain-language “Make a Design” starting point
- P1S-specific 256 × 256 × 256 mm machine profile
- Explicit build-plate and nozzle awareness
- Live dimension visualization
- Custom-fit Gridfinity layouts, edge fillers, and fractional bins
- Filterable templates for board games, bathrooms, bedrooms, plants, and everyday objects
- Prefilled dimensions, materials, part counts, and assembly assumptions for every template
- Local, pairing-code-protected handoff into Bambu Studio without sharing Bambu credentials
- Printable generators for an exact-dimension open tray and a two-part, non-standard Gridfinity-pitch drawer strip
- Multi-part plate, checkpoint, and assembly planning
- Build-volume, wall-thickness, and clearance checks
- Automatic local saving
- Portable JSON project-spec export
- Responsive interface ready for Cloudflare Workers static assets

Most visual previews are intentionally labeled as concepts and do not yet produce printable geometry.

The **Exact-fit open tray** and **Custom drawer grid** workflows are exceptions. PrintPath Bridge can generate their STLs locally and open them in Bambu Studio for human slicing and print review. The drawer workflow can produce a two-module, pitch-aligned organizer for spaces that are narrower than a standard Gridfinity bin; it does not falsely claim standard baseplate compatibility.

## Safe Bambu Studio handoff

The local bridge keeps Bambu authentication inside Bambu Studio and never starts a print automatically.

1. Open **Bambu handoff** in PrintPath, download the Windows bridge ZIP, and extract it on the computer running Bambu Studio. Node.js is currently required.
2. Double-click `bridge/start-bridge.cmd` (or run `npm run bridge` from a repository clone).
3. Keep the bridge window open and copy its one-time pairing code into PrintPath.
4. Open the **Exact-fit open tray** or **Custom drawer grid** template, review its dimensions, and choose the Bambu handoff action.
5. Inspect the model, plate, filament, orientation, supports, and sliced preview in Bambu Studio before pressing Print.

The bridge listens only on `127.0.0.1`, restricts web origins, and stores generated files under `Documents/PrintPath Exports`. See [bridge/README.md](bridge/README.md) for the security boundary and current limitations.

## Run locally

```bash
npm install
npm run dev
```

## Validate and deploy

```bash
npm run build
npm run deploy:dry
npm run deploy
```

Deployment uses Cloudflare Workers static assets as configured in `wrangler.jsonc`.

## Roadmap

1. Photo-guided measurement capture
2. Parametric CadQuery/OpenSCAD generation
3. Geometry validation and rendered previews
4. STL/STEP/3MF artifact downloads
5. Bambu Studio handoff and slice-profile recommendations
6. Optional project accounts and shared community templates

## Project status

Early working prototype. Naming, contribution guidelines, and the public release workflow will be refined as the project develops.

## License

MIT
