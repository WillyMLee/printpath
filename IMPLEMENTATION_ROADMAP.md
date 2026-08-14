# PrintPath Implementation Roadmap

Last updated: 2026-08-14

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
| Project presentation | Clean actual-STL product renders, readable project typography, and labeled sharing covers | Shipped |
| Information architecture | Maker-focused navigation, room/use template categories, and one unified process page | Shipped |
| Branding | PrintPath cube favicon for browser tabs and bookmarks | Shipped |
| Vase project | Visible saved-version history for Petal Twist v1 and Leaf Bloom v2; both manifold and downloadable | Design review |
| Project controls | Working status filters and persistent version selection | Shipped |
| 7 Wonders Duel organizer | Official inventory research, 196 × 196 × 42 mm reference envelope, four-module layout v1, and measurement gate | Layout v1 |
| Cozy Stickerville organizer | Official inventory map, P1S-aware modular concept, campaign-state workflow, and measurement packet | Research mapped |
| Magnetic hex token pods | Generated single, split, and triple tray STLs, 6 mm magnet-fit coupon, replaceable cups, and print guide | Printable alpha |
| Vase inspiration | Four original form directions informed by spiral, fan, cloud-stack, and folded-organic references on Thangs | Saved study |
| Deployment | GitHub workflow and Cloudflare Workers static hosting | Shipped |
| Public access | Browse-only showcase with protected project authoring | Shipped |
| AI cost boundary | Signed Maker Mode sessions, server-only OpenAI key, body/token caps, and rate limits | Shipped |
| Print planning facts | Readable plate, print-job, component, material, and time estimates on every project card | Shipped |

## Next implementation candidates

### Project history and learning

- Add a post-print outcome: `perfect`, `too tight`, `too loose`, `warped`, or `failed`.
- Store the actual print date, filament, slicer estimate, and user notes.
- Let a completed project create a revised version without losing the approved artifact.
- Add artifact download links and checksums to the project detail page.

### Central data control tower

- Implement one Convex adapter for projects, versions, approvals, printer profiles, and artifact metadata.
- Keep IndexedDB as the offline cache/outbox after Convex becomes authoritative.
- Reuse Maker Mode identity when cross-device sync is enabled; do not create a second login system.
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
- **2026-08-13:** Use text-free actual-STL renders inside the interface and reserve labeled covers for sharing or export.
- **2026-08-13:** Treat vase redesigns as versions of one project; keep every artifact available and let one version be explicitly selected.
- **2026-08-13:** Never remove a prior design from the visible project record; experiments remain previewable and downloadable even when another version is selected.
- **2026-08-13:** Project filters must change the visible project set, and selecting a saved version must update the active preview and artifact links.
- **2026-08-13:** Start the 7 Wonders Duel organizer with four lift-out modules; require actual box, sleeve, expansion, and storage-orientation answers before CAD.
- **2026-08-13:** Keep the showcase public while requiring Maker Mode for project authoring and every paid AI request.
- **2026-08-13:** Keep OpenAI credentials server-only; cap, rate-limit, and fail closed on all AI intake requests.
- **2026-08-14:** Treat 196 × 196 × 42 mm as a 7 Wonders Duel reference insert envelope, not a guaranteed fit; require the user's box, sleeve, and deck measurements before CAD.
- **2026-08-14:** Make Cozy Stickerville modular across staged P1S plates because its published 225 × 300 × 53 mm outer box exceeds one P1S plate direction.
- **2026-08-14:** De-risk the magnetic token system with a three-size magnet coupon and separate glue-on cups before integrating magnets into full trays.
- **2026-08-14:** Use Thangs references only as form vocabulary; preserve original PrintPath geometry and the PETG water-holding requirements.
- **2026-08-14:** Show plate count, print jobs, components, material, and time together; label unsliced numbers as estimates and keep Bambu Studio as the final authority.
