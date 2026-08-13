# PrintPath

PrintPath is an open-source, visual workflow for turning an everyday 3D-printing idea into a precise, reviewable design specification. The first prototype captures the job, dimensions, printer profile, and print-readiness checks without requiring CAD knowledge.

**Live prototype:** [printpath.willymlee.workers.dev](https://printpath.willymlee.workers.dev)

## Current prototype

- Guided four-step design intake
- Plain-language “Make a Design” starting point
- Public read-only showcase with a protected Maker Mode for authoring
- Server-side OpenAI Responses API intake with signed sessions and per-user/IP rate limits
- P1S-specific 256 × 256 × 256 mm machine profile
- Explicit build-plate and nozzle awareness
- Live dimension visualization
- Custom-fit Gridfinity layouts, edge fillers, and fractional bins
- Filterable templates for board games, bathrooms, bedrooms, plants, and everyday objects
- Prefilled dimensions, materials, part counts, and assembly assumptions for every template
- Local, pairing-code-protected handoff into Bambu Studio without sharing Bambu credentials
- Printable generators for an exact-dimension open tray and a one-compartment Gridfinity gap tray
- Multi-part plate, checkpoint, and assembly planning
- Build-volume, wall-thickness, and clearance checks
- Automatic local saving
- Structured intent, dimension-meaning, fit, Gridfinity-relationship, and one-part gates
- IndexedDB control tower with immutable design checkpoints and a future Convex adapter boundary
- Cost-aware orchestration routes for deterministic, guided, and independently reviewed designs
- Explicit design approval and date-based print titles before artifact generation
- Portable JSON project-spec export
- Responsive interface on Cloudflare Workers with selective `/api/*` Worker routing

Most visual previews are intentionally labeled as concepts and do not yet produce printable geometry.

The **Exact-fit open tray** and **Custom drawer grid** workflows are exceptions. PrintPath Bridge can generate their STLs locally and open them in Bambu Studio for human slicing and print review. The drawer workflow can produce one continuous gap-filler compartment beside an existing Gridfinity layout. It rotates long parts diagonally for P1S plate margin and does not falsely claim standard baseplate compatibility.

## Safe Bambu Studio handoff

The local bridge keeps Bambu authentication inside Bambu Studio and never starts a print automatically.

1. Open **Bambu handoff** in PrintPath, download the Windows bridge ZIP, and extract it on the computer running Bambu Studio. Node.js is currently required.
2. Double-click `bridge/start-bridge.cmd` (or run `npm run bridge` from a repository clone).
3. Keep the bridge window open and copy its one-time pairing code into PrintPath.
4. Open the **Exact-fit open tray** or **Custom drawer grid** template, review its dimensions, and choose the Bambu handoff action.
5. Approve the frozen intent statement and short print title.
6. Inspect the model, plate, filament, orientation, supports, and sliced preview in Bambu Studio before pressing Print.

The bridge listens only on `127.0.0.1`, restricts web origins, and stores generated files under `Documents/PrintPath Exports`. See [bridge/README.md](bridge/README.md) for the security boundary and current limitations.

## Data strategy

PrintPath uses one storage interface. IndexedDB is the active local-first implementation; a future Convex adapter can become the shared source of truth for projects, versions, profiles, approvals, and artifact metadata. Cloudflare hosts the application assets and stateless authentication/AI boundary, but does not hold a second project database.

## Maker Mode and AI safety

The public site can browse projects, versions, templates, the process, and downloadable showcase artifacts. Starting or editing a project opens Maker Mode sign-in. The AI design-intake button is additionally protected at the Worker endpoint, so changing browser code cannot bypass authentication.

- Credentials and the OpenAI key are Cloudflare secrets, never Vite variables or committed files.
- Sessions are signed, expire after eight hours, and use an `HttpOnly; Secure; SameSite=Strict` cookie.
- Login attempts are limited to 8 per minute per IP; AI intake is limited to 6 per minute per signed-in maker/IP.
- Each AI request is capped at 2,000 input characters and 700 output tokens, uses `store: false`, and fails closed when no API key is installed.
- The existing measurement, geometry, project, download, and Bambu handoff flows remain deterministic and do not call OpenAI.

Configure production secrets through interactive prompts so values do not enter shell history:

```powershell
npx wrangler secret put AUTH_USERNAME
npx wrangler secret put AUTH_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put OPENAI_API_KEY
```

The OpenAI key is optional. Without it, Maker Mode can still unlock protected project tools and the AI endpoint returns a safe “not configured” response. For local development, copy `.dev.vars.example` to `.dev.vars` and use non-production values; `.dev.vars` is ignored by Git.

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

Run `npm run typegen` after changing Worker bindings. Deployment uses selective Worker-first routing for `/api/*`; hashed assets remain on Cloudflare’s static-asset path.

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
