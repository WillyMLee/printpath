# PrintPath Implementation Roadmap

Last updated: 2026-08-13

This is the living implementation record for PrintPath. Update it whenever a feature ships, a workflow decision changes, or a new project exposes friction.

## Product principles

1. Capture intent before dimensions.
2. Prefer deterministic generators and checks for supported templates.
3. Use agents only when ambiguity, novelty, or assembly risk justifies them.
4. Keep Bambu Studio as the final slice-and-print safety boundary.
5. Maintain one shared application database when cloud sync is introduced.
6. Show actual generated geometry in project imagery whenever possible.

## Shipped

| Area | Capability | Status |
| --- | --- | --- |
| Intake | Intent, dimension meaning, fit, Gridfinity relationship, obstacles, and one-part gates | Shipped |
| Printer context | Bambu Lab P1S, nozzle, plate, material, build-volume, wall, and margin checks | Shipped |
| Orchestration | Deterministic, guided, and independently reviewed routes | Shipped |
| Local control tower | IndexedDB projects, drafts, immutable checkpoints, approval, and handoff state | Shipped |
| Bambu handoff | Pairing-protected local bridge, approved-design gate, STL generation, and Studio launch | Shipped |
| Gridfinity gap tray | One 254.4 × 39.4 × 49.4 mm part for a 255 × 40 × 50 mm envelope | Completed |
| Project presentation | Actual-STL cover render and completed-project card | Shipped |
| Information architecture | Maker-focused navigation, room/use template categories, and one unified process page | Shipped |
| Branding | PrintPath cube favicon for browser tabs and bookmarks | Shipped |
| Petal Twist vase | 245 mm single-piece PETG draft, actual-STL preview, manifold validation, and downloadable artifact | Design review |
| Deployment | GitHub workflow and Cloudflare Workers static hosting | Shipped |

## Next implementation candidates

### Project history and learning

- Add a post-print outcome: `perfect`, `too tight`, `too loose`, `warped`, or `failed`.
- Store the actual print date, filament, slicer estimate, and user notes.
- Let a completed project create a revised version without losing the approved artifact.
- Add artifact download links and checksums to the project detail page.

### Central data control tower

- Implement one Convex adapter for projects, versions, approvals, printer profiles, and artifact metadata.
- Keep IndexedDB as the offline cache/outbox after Convex becomes authoritative.
- Add authentication only when cross-device sync is enabled.
- Do not create a parallel Cloudflare project database.

### Modeling accuracy

- Add photo-guided measurement capture and annotated reference images.
- Add multi-location measurements for long, tapered, or non-square openings.
- Create reusable test coupons before long prints.
- Validate generated mesh bounds against the approved design packet automatically.
- Add an optional orbitable STL viewer; keep static covers for fast project browsing.

### Bambu workflow

- Record handoff receipts and attach them to the matching project version.
- Test Bambu Studio CLI-based 3MF creation behind an experimental flag.
- Preserve manual slice review before any print action.
- Improve phone reprint guidance as supported Bambu workflows evolve.

### Template pipeline

- Promote templates only after they have a deterministic generator and validation tests.
- Start compound projects with an inventory, plate plan, test-fit stop, and assembly order.
- Create cover renders from the generated artifact rather than illustrative placeholders.

## Suggested next projects

1. **Drawer divider end-cap** — a small, quick print that tests snug-versus-sliding fit.
2. **Board-game token tray** — one compartment with a pour corner; introduces curved access without assembly.
3. **Sleeved-card holder** — tests usable-inside dimensions and finger clearance.
4. **Plant drip tray** — tests PETG defaults, water containment, and exact outside sizing.
5. **Two-part board-game insert** — first compound workflow with a plate and fit-check plan.

## Deferred

- Additional printer models beyond the P1S
- Automatic printing without a human Bambu Studio review
- Public community publishing and template marketplace
- Multi-user live collaboration

## Decision log

- **2026-08-13:** Keep project data local-first and prepare a single Convex adapter rather than adding D1.
- **2026-08-13:** Treat the 255 × 40 × 50 mm dimensions as a maximum available envelope.
- **2026-08-13:** Apply 0.3 mm clearance per horizontal side and 0.6 mm top clearance to the drawer gap tray.
- **2026-08-13:** Describe the tray as adjacent to Gridfinity, not Gridfinity-compatible.
- **2026-08-13:** Use the generated STL as the source for the project cover render.
- **2026-08-13:** Remove Control Tower and Bambu Handoff from primary navigation; explain both as project memory and print handoff within one process page.
- **2026-08-13:** Organize the design library by Kitchen, Bathroom, Bedroom, Board Games, Plants, and Desk & Workshop while keeping Gridfinity as a featured system.
- **2026-08-13:** Keep the water-holding vase seam-free at 245 mm tall; use PETG, a 2.4 mm wall, a 3.2 mm floor, and require a physical leak test.
