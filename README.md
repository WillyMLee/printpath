# PrintPath

PrintPath is an open-source, visual workflow for turning an everyday 3D-printing idea into a precise, reviewable design specification. The first prototype captures the job, dimensions, printer profile, and print-readiness checks without requiring CAD knowledge.

**Live prototype:** [printpath.willymlee.workers.dev](https://printpath.willymlee.workers.dev)

## Current prototype

- Guided four-step design intake
- Live dimension visualization
- Bambu Lab printer and material profiles
- Build-volume, wall-thickness, and clearance checks
- Automatic local saving
- Portable JSON project-spec export
- Responsive interface ready for Cloudflare Workers static assets

The visual preview is intentionally labeled as a concept. It does not yet produce printable geometry.

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
