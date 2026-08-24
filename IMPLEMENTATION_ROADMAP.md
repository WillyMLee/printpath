# PrintPath Implementation Roadmap

Last updated: 2026-08-24

## 2026-08-24 — Porcelain Reed vase + Evergarden bouquet

- Added a third saved vase version without replacing Petal Twist or Leaf Bloom.
- Translated the supplied white-vase reference into original printable geometry: 245 mm tall, 36 fine vertical ribs, a softly planted base, a clean round rim, 2.4 mm walls, and a 3.2 mm floor.
- Added the approved vase STL and a white-PETG print guide; the body remains capable of holding real flowers after a leak test.
- Added a coordinated printable-flower study with three interchangeable head silhouettes, universal keyed stems, leaves, snap-fit color centers, and a removable arrangement grid.
- Kept the bouquet labeled as design review until its joints and seven-stem composition have fit-tested STLs.

## 2026-08-24 — Capiz Cove shell study

- Added Capiz Cove as version 4 inside the existing phone-stand project rather than replacing Tidepool Buddy.
- Chose a Filipino-first visual language: white pearlescent capiz-pane rhythm, dark-blue scallop reef structure, and a light-blue measured phone cradle.
- Added a compact two-version selector so Tidepool Buddy and Capiz Cove can be compared and reopened independently; the earlier forest and fern directions remain recorded in project history.
- Avoided reproducing Niʻihau shell lei patterns. Hawaiian shell lei remain a living, specific practice; Capiz Cove keeps only a broad shoreline mood while sourcing its cultural design reference from documented Filipino capiz art and architecture.

## 2026-08-24 — Tidepool Buddy phone stand

- Advanced the saved phone-stand project to a third direction: an original ocean-themed Tidepool Buddy with a manta-like base, curling wave support, and removable sea-foam accents.
- Locked the visual palette to light blue, dark blue, and white as three separately printable parts, keeping the design practical for a single-nozzle P1S without requiring AMS.
- Preserved the earlier forest-guardian and fern-cradle directions as project history rather than replacing them.
- CAD remains gated on the exact phone and case envelope, camera bump, viewing orientation, and charging method; the first print is a lip-depth and viewing-angle coupon.

## 2026-08-19 — Bathroom additions

- Added a priority Sink Rack Drain Bridge concept: removable PETG catch adapter plus measured drain channel so the rack can sit level. CAD remains gated on the rack outlet, sink reach, and available fall; the first artifact is an outlet-and-slope coupon.
- Added two low-clutter bathroom concepts: a ventilated Retainer Drying Dock with washable insert, and a Low-Profile Shower Tool Rail with replaceable open-draining clips.
- Project counts now reflect 17 top-level projects: 1 completed, 4 active, and 12 concepts.
- Next physical input: one straight side photo of the rack and sink, plus the outlet size, horizontal reach to the inside sink edge, and vertical drop.

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
| Magnetic hex token pods | Generated single, split, and triple tray STLs, 6 mm magnet-fit coupon, replaceable cups, two-pod connection-test plate, and staged print guide | Printable alpha |
| Vase inspiration | Four original form directions informed by spiral, fan, cloud-stack, and folded-organic references on Thangs | Saved study |
| Deployment | GitHub workflow and Cloudflare Workers static hosting | Shipped |
| Public access | Browse-only showcase with protected project authoring | Shipped |
| AI cost boundary | Signed Maker Mode sessions, server-only OpenAI key, body/token caps, and rate limits | Shipped |
| Print planning facts | Readable plate, print-job, component, material, and time estimates on every project card | Shipped |
| Honest concept estimates | Geometry-backed projects show one planning estimate; project cards and workbench metrics show `Pending CAD` until volume exists | Shipped |
| Cozy source dimensions | Published 305 × 225 × 51 mm box and 181 unsleeved 63 × 88 mm cards mapped; three physical fit checks remain | Shipped |
| Responsive 7 Wonders pipeline | One full-image organizer composition maps published box/card data and reduces the fit gate to three physical checks | Shipped |
| Navigation and library cleanup | Five top-level projects, nested drafts excluded from the count, simplified Overview, and a minimal category-based template list | Shipped |
| Responsive project cards | Card columns follow available workspace width; headings, print facts, and next steps wrap safely on compact desktop and phone layouts | Shipped |
| Organizer presentation standard | 7 Wonders, Cozy Stickerville, and magnetic-token workbenches use one full-image 16:9 layout with contain-fit artwork on desktop and mobile | Shipped |
| Project workspace cleanup | Removed the duplicate thumbnail gallery; active projects use full workbench rows and completed prints have a dedicated archive section | Shipped |
| Project master-detail workspace | Completed-first project index, most-recent marker, minimal clickable cards, and one selected detail workbench | Shipped |
| New concept queue | Pottery signature stamps, perfume Lazy Susan, three saved phone-stand directions, ceramic cabinet risers, and a film-camera toolkit with measurement gates | Outlined |
| Board-game and apartment concepts | Token upgrade studio, five-plate magnetic 3D island scaffold, official-CAD Steam Controller dock, and four-part quiet utility kit | Outlined |

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
- **2026-08-14:** Require a two-pod magnetic connection test before batch-printing token storage; one pod alone cannot validate polarity or holding strength.
- **2026-08-14:** Keep organizer artwork in one 16:9 contain-fit presentation instead of maintaining crop-prone project-specific mobile compositions.
- **2026-08-14:** Use full project records for active work and a separate completed archive instead of repeating every project in a thumbnail gallery and a detail row.
- **2026-08-14:** Put completed work first, keep the vase first among active projects as the most recent, and render full diagrams and print facts only for the selected project.
- **2026-08-15:** Keep new ideas as five top-level projects; the creature and nature phone stands remain saved directions inside one project. A third ocean direction was added on 2026-08-24.
- **2026-08-15:** Require test coupons before clay-stamp relief, Lazy Susan bearing fit, phone lip angle, or any lens-cap contact becomes full printable geometry.
- **2026-08-17:** Treat game-specific token replacements as kits inside one reusable studio rather than separate top-level projects for every game.
- **2026-08-17:** Stage the magnetic 19-hex island across five planning plates; keep board magnets permanently captured and prefer ferrous inserts over second magnets in small player pieces.
- **2026-08-17:** Use Valve's official Steam Controller and Puck CAD plus keep-out drawings as the fit authority before creating the holder geometry.
- **2026-08-17:** Group small apartment optimizations into one quiet utility family whose pieces consume no new floor area and share a restrained visual language.
