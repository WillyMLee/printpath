import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Download,
  FileJson,
  Gauge,
  Home,
  Layers3,
  Lightbulb,
  Menu,
  PackageCheck,
  PencilRuler,
  Plus,
  Printer,
  RotateCcw,
  Ruler,
  Save,
  Settings,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import Dashboard, { type AppPage, type StarterTemplate } from "./Dashboard";

type ProjectSpec = {
  name: string;
  description: string;
  category: string;
  width: number;
  depth: number;
  height: number;
  wall: number;
  clearance: number;
  cornerRadius: number;
  printer: string;
  plate: string;
  nozzle: number;
  material: string;
  layerHeight: number;
  strength: string;
  partCount: number;
  assemblyMethod: string;
};

type NumberKey = "width" | "depth" | "height" | "wall" | "clearance" | "cornerRadius" | "nozzle" | "layerHeight" | "partCount";

const STORAGE_KEY = "printpath-project-v1";

const starterSpec: ProjectSpec = {
  name: "Under-desk headphone hanger",
  description: "A rounded hook that mounts beneath my desk and holds one pair of over-ear headphones without pinching the headband.",
  category: "Holder or mount",
  width: 78,
  depth: 48,
  height: 32,
  wall: 3.2,
  clearance: 0.35,
  cornerRadius: 6,
  printer: "Bambu Lab P1S",
  plate: "Textured PEI Plate",
  nozzle: 0.4,
  material: "PLA",
  layerHeight: 0.2,
  strength: "Balanced",
  partCount: 1,
  assemblyMethod: "Single print",
};

const freshSpec: ProjectSpec = {
  ...starterSpec,
  name: "",
  description: "",
};

const steps = [
  { label: "Describe", detail: "What should it do?", icon: Lightbulb },
  { label: "Measure", detail: "Capture the fit", icon: Ruler },
  { label: "Print setup", detail: "Printer & material", icon: Printer },
  { label: "Review", detail: "Check the brief", icon: PackageCheck },
];

const P1S_BUILD_VOLUME: [number, number, number] = [256, 256, 256];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadProject(): ProjectSpec {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...starterSpec, ...JSON.parse(stored), printer: "Bambu Lab P1S" } : starterSpec;
  } catch {
    return starterSpec;
  }
}

function PartPreview({ spec }: { spec: ProjectSpec }) {
  const [flipped, setFlipped] = useState(false);
  const visualWidth = clamp(170 + (spec.width - 50) * 1.15, 165, 315);
  const visualHeight = clamp(94 + (spec.height - 20) * 1.4, 96, 190);
  const visualDepth = clamp(56 + (spec.depth - 30) * 0.7, 50, 98);
  const x = 320 - visualWidth / 2;
  const y = 214 - visualHeight / 2;
  const dx = visualDepth * 0.72;
  const dy = visualDepth * -0.42;
  const slotWidth = clamp(visualWidth * 0.46, 82, 140);
  const slotHeight = clamp(visualHeight * 0.34, 34, 68);

  return (
    <div className="preview-shell">
      <div className="preview-toolbar">
        <div>
          <span className="eyebrow">Live concept</span>
          <strong>Dimension preview</strong>
        </div>
        <button className="icon-button" onClick={() => setFlipped((value) => !value)} aria-label="Rotate preview">
          <RotateCcw size={17} />
        </button>
      </div>

      <div className="preview-canvas">
        <div className="grid-floor" />
        <svg viewBox="0 0 680 430" role="img" aria-label={`Concept preview, ${spec.width} by ${spec.depth} by ${spec.height} millimeters`}>
          <defs>
            <linearGradient id="front" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8be0c5" />
              <stop offset="1" stopColor="#4bb798" />
            </linearGradient>
            <linearGradient id="top" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#a4ead4" />
              <stop offset="1" stopColor="#d4f6eb" />
            </linearGradient>
            <linearGradient id="side" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3f9f84" />
              <stop offset="1" stopColor="#247660" />
            </linearGradient>
            <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="17" stdDeviation="14" floodColor="#163a32" floodOpacity="0.22" />
            </filter>
          </defs>

          <ellipse cx="354" cy="352" rx={visualWidth * 0.64} ry="25" fill="#24483e" opacity="0.11" />
          <g
            className="part-group"
            style={{ transformOrigin: "340px 215px", transform: flipped ? "scaleX(-1)" : "scaleX(1)" }}
            filter="url(#shadow)"
          >
            <path
              d={`M ${x} ${y} L ${x + dx} ${y + dy} L ${x + visualWidth + dx} ${y + dy} L ${x + visualWidth} ${y} Z`}
              fill="url(#top)"
              stroke="#277b65"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d={`M ${x + visualWidth} ${y} L ${x + visualWidth + dx} ${y + dy} L ${x + visualWidth + dx} ${y + visualHeight + dy} L ${x + visualWidth} ${y + visualHeight} Z`}
              fill="url(#side)"
              stroke="#236b59"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect
              x={x}
              y={y}
              width={visualWidth}
              height={visualHeight}
              rx={clamp(spec.cornerRadius * 1.7, 8, 24)}
              fill="url(#front)"
              stroke="#277b65"
              strokeWidth="2"
            />
            <rect
              x={x + visualWidth / 2 - slotWidth / 2}
              y={y + visualHeight / 2 - slotHeight / 2}
              width={slotWidth}
              height={slotHeight}
              rx={slotHeight / 2}
              fill="#e9f0ea"
              stroke="#287862"
              strokeWidth="2"
            />
            <path
              d={`M ${x + visualWidth / 2 - slotWidth / 2 + 12} ${y + visualHeight / 2 - slotHeight / 2 + 4} Q ${x + visualWidth / 2} ${y + visualHeight / 2 - 3} ${x + visualWidth / 2 + slotWidth / 2 - 12} ${y + visualHeight / 2 - slotHeight / 2 + 4}`}
              fill="none"
              stroke="#a9d9ca"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.75"
            />
            <circle cx={x + 24} cy={y + 24} r="7" fill="#318d73" stroke="#d5f4e9" strokeWidth="2" />
            <circle cx={x + visualWidth - 24} cy={y + 24} r="7" fill="#318d73" stroke="#d5f4e9" strokeWidth="2" />
          </g>

          <g className="dimension-markers">
            <line x1={x} y1={y + visualHeight + 42} x2={x + visualWidth} y2={y + visualHeight + 42} />
            <line x1={x} y1={y + visualHeight + 32} x2={x} y2={y + visualHeight + 51} />
            <line x1={x + visualWidth} y1={y + visualHeight + 32} x2={x + visualWidth} y2={y + visualHeight + 51} />
            <rect x={x + visualWidth / 2 - 34} y={y + visualHeight + 27} width="68" height="28" rx="14" />
            <text x={x + visualWidth / 2} y={y + visualHeight + 46}>{spec.width} mm</text>

            <line x1={x - 42} y1={y} x2={x - 42} y2={y + visualHeight} />
            <line x1={x - 51} y1={y} x2={x - 32} y2={y} />
            <line x1={x - 51} y1={y + visualHeight} x2={x - 32} y2={y + visualHeight} />
            <rect x={x - 76} y={y + visualHeight / 2 - 14} width="68" height="28" rx="14" />
            <text x={x - 42} y={y + visualHeight / 2 + 5}>{spec.height} mm</text>

            <line x1={x + visualWidth + 12} y1={y - 9} x2={x + visualWidth + dx + 12} y2={y + dy - 9} />
            <rect x={x + visualWidth + dx / 2 - 18} y={y + dy / 2 - 35} width="70" height="28" rx="14" />
            <text x={x + visualWidth + dx / 2 + 17} y={y + dy / 2 - 16}>{spec.depth} mm</text>
          </g>
        </svg>
        <span className="preview-note">Concept visualization · printable geometry comes next</span>
      </div>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Gauge }) {
  return (
    <div className="metric">
      <span className="metric-icon"><Icon size={18} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

export default function App() {
  const [spec, setSpec] = useState<ProjectSpec>(loadProject);
  const [currentPage, setCurrentPage] = useState<AppPage>("overview");
  const [activeStep, setActiveStep] = useState(1);
  const [mobileNav, setMobileNav] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");

  useEffect(() => {
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spec));
      setSaveState("saved");
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [spec]);

  const checks = useMemo(() => {
    const baseChecks = [
      {
        label: "Build volume",
        detail: `${P1S_BUILD_VOLUME[0]} × ${P1S_BUILD_VOLUME[1]} × ${P1S_BUILD_VOLUME[2]} mm · P1S`,
        ok: spec.width <= P1S_BUILD_VOLUME[0] && spec.depth <= P1S_BUILD_VOLUME[1] && spec.height <= P1S_BUILD_VOLUME[2],
      },
      {
        label: "Wall thickness",
        detail: `${spec.wall} mm · ${Math.round(spec.wall / spec.nozzle)} nozzle lines`,
        ok: spec.wall >= spec.nozzle * 2,
      },
      {
        label: "Fit allowance",
        detail: `${spec.clearance} mm clearance`,
        ok: spec.clearance >= 0.2,
      },
      {
        label: "Plate & nozzle",
        detail: `${spec.plate} · ${spec.nozzle} mm nozzle`,
        ok: Boolean(spec.plate) && [0.2, 0.4, 0.6, 0.8].includes(spec.nozzle),
      },
    ];
    if (spec.partCount > 1) {
      baseChecks.push({
        label: "Assembly plan",
        detail: `${spec.partCount} parts · ${spec.assemblyMethod}`,
        ok: spec.assemblyMethod !== "Not sure yet",
      });
    }
    return baseChecks;
  }, [spec]);

  const readyCount = checks.filter((check) => check.ok).length;
  const estimatedGrams = Math.max(4, Math.round((spec.width * spec.depth * spec.height * 0.2 * 1.24) / 1000));
  const estimatedHours = Math.max(0.4, estimatedGrams / 13).toFixed(1);

  function updateField<K extends keyof ProjectSpec>(key: K, value: ProjectSpec[K]) {
    setSpec((current) => ({ ...current, [key]: value }));
  }

  function updateNumber(key: NumberKey, raw: string) {
    const value = Number(raw);
    if (Number.isFinite(value)) updateField(key, value);
  }

  function startFresh() {
    setSpec(freshSpec);
    setActiveStep(0);
    setCurrentPage("workbench");
    setMobileNav(false);
  }

  function navigate(page: AppPage) {
    setCurrentPage(page);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function useTemplate(template: StarterTemplate) {
    const templates: Record<StarterTemplate, ProjectSpec> = {
      "grid-fit-tile": {
        ...starterSpec,
        name: "Gridfinity fit tile",
        description: "A single 42 mm confidence tile to verify scale, first-layer grip, and grid feel before printing a larger system.",
        category: "Container or organizer",
        width: 42,
        depth: 42,
        height: 6,
        wall: 2,
        clearance: 0.25,
        cornerRadius: 4,
      },
      "loose-tray": {
        ...starterSpec,
        name: "Loose-fit 2×2 tray",
        description: "A small open tray that uses the Gridfinity footprint without committing the drawer to a full base system.",
        category: "Container or organizer",
        width: 84,
        depth: 84,
        height: 28,
        wall: 2.4,
        clearance: 0.3,
        cornerRadius: 5,
      },
      "drawer-strip": {
        ...starterSpec,
        name: "Custom drawer base strip",
        description: "A measured single-row strip used to verify drawer fit before producing a complete multi-plate base.",
        category: "Container or organizer",
        width: 210,
        depth: 42,
        height: 6,
        wall: 2,
        clearance: 0.3,
        cornerRadius: 4,
      },
      blank: freshSpec,
    };
    setSpec(templates[template]);
    setActiveStep(template === "blank" ? 0 : 1);
    navigate("workbench");
  }

  function exportSpec() {
    const payload = {
      format: "printpath-project",
      version: 1,
      units: "millimeters",
      exportedAt: new Date().toISOString(),
      project: spec,
      readiness: checks,
      nextStep: "Generate parametric CAD from this reviewed specification.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${spec.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "printpath-project"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const stepContent = [
    <section className="form-section" key="describe">
      <div className="section-heading">
        <span className="step-kicker">Step 1 of 4</span>
        <h2>What do you want to make?</h2>
        <p>Describe the job in everyday language. Precision comes in the next step.</p>
      </div>
      <label className="field field-wide">
        <span>Project name</span>
        <input value={spec.name} onChange={(event) => updateField("name", event.target.value)} placeholder="e.g. Garage remote wall mount" />
      </label>
      <label className="field field-wide">
        <span>What should it do?</span>
        <textarea value={spec.description} onChange={(event) => updateField("description", event.target.value)} rows={5} placeholder="Tell us what it holds, where it goes, and what a good fit feels like…" />
        <small>Tip: mention what this part touches or needs to fit around.</small>
      </label>
      <label className="field field-wide">
        <span>Part type</span>
        <select value={spec.category} onChange={(event) => updateField("category", event.target.value)}>
          <option>Holder or mount</option><option>Replacement part</option><option>Container or organizer</option><option>Adapter or spacer</option><option>Prototype</option><option>Something else</option>
        </select>
      </label>
    </section>,
    <section className="form-section" key="measure">
      <div className="section-heading">
        <span className="step-kicker">Step 2 of 4</span>
        <h2>Let’s capture the fit</h2>
        <p>Start with the outside size. Every change updates the concept preview.</p>
      </div>
      <div className="measurement-grid">
        {(["width", "depth", "height"] as NumberKey[]).map((key) => (
          <label className="field dimension-field" key={key}>
            <span>{key[0].toUpperCase() + key.slice(1)}</span>
            <div className="input-unit"><input type="number" min="1" step="1" value={spec[key]} onChange={(event) => updateNumber(key, event.target.value)} /><em>mm</em></div>
          </label>
        ))}
      </div>
      <div className="form-divider" />
      <div className="measurement-grid details-grid">
        <label className="field dimension-field">
          <span>Wall thickness</span>
          <div className="input-unit"><input type="number" min="0.4" step="0.1" value={spec.wall} onChange={(event) => updateNumber("wall", event.target.value)} /><em>mm</em></div>
          <small>3–4 mm is a sturdy start.</small>
        </label>
        <label className="field dimension-field">
          <span>Fit clearance</span>
          <div className="input-unit"><input type="number" min="0" step="0.05" value={spec.clearance} onChange={(event) => updateNumber("clearance", event.target.value)} /><em>mm</em></div>
          <small>Space between fitted parts.</small>
        </label>
        <label className="field dimension-field">
          <span>Corner radius</span>
          <div className="input-unit"><input type="number" min="0" step="0.5" value={spec.cornerRadius} onChange={(event) => updateNumber("cornerRadius", event.target.value)} /><em>mm</em></div>
          <small>Softens edges and stress points.</small>
        </label>
      </div>
      <button className="helper-card" type="button">
        <span className="helper-icon"><PencilRuler size={20} /></span>
        <span><strong>Not sure what to measure?</strong><small>A photo-guided measurement helper is next on our roadmap.</small></span>
        <ChevronRight size={18} />
      </button>
    </section>,
    <section className="form-section" key="setup">
      <div className="section-heading">
        <span className="step-kicker">Step 3 of 4</span>
        <h2>Choose your print setup</h2>
        <p>Your P1S profile keeps build volume, plate, nozzle, and assembly limits visible.</p>
      </div>
      <div className="locked-printer-row"><span className="helper-icon"><Printer size={20} /></span><div><small>PRINTER PROFILE</small><strong>Bambu Lab P1S</strong><p>256 × 256 × 256 mm build volume</p></div><span className="ready-badge">Active</span></div>
      <div className="measurement-grid">
        <label className="field">
          <span>Nozzle</span>
          <select value={spec.nozzle} onChange={(event) => updateField("nozzle", Number(event.target.value))}>
            <option value={0.2}>0.2 mm</option><option value={0.4}>0.4 mm</option><option value={0.6}>0.6 mm</option><option value={0.8}>0.8 mm</option>
          </select>
        </label>
        <label className="field">
          <span>Build plate</span>
          <select value={spec.plate} onChange={(event) => updateField("plate", event.target.value)}>
            <option>Textured PEI Plate</option><option>Smooth PEI / High Temp Plate</option><option>Cool Plate</option><option>Engineering Plate</option>
          </select>
        </label>
        <label className="field">
          <span>Material</span>
          <select value={spec.material} onChange={(event) => updateField("material", event.target.value)}>
            <option>PLA</option><option>PETG</option><option>ABS</option><option>ASA</option><option>TPU</option>
          </select>
        </label>
      </div>
      <div className="measurement-grid setup-secondary-grid">
        <label className="field"><span>Layer height</span><select value={spec.layerHeight} onChange={(event) => updateField("layerHeight", Number(event.target.value))}><option value={0.12}>0.12 mm · Fine</option><option value={0.16}>0.16 mm · Quality</option><option value={0.2}>0.20 mm · Standard</option><option value={0.28}>0.28 mm · Draft</option></select></label>
        <label className="field"><span>Number of parts</span><input type="number" min="1" max="24" step="1" value={spec.partCount} onChange={(event) => updateNumber("partCount", event.target.value)} /></label>
        <label className="field"><span>Assembly</span><select value={spec.assemblyMethod} onChange={(event) => updateField("assemblyMethod", event.target.value)}><option>Single print</option><option>Slides together</option><option>Snap fit</option><option>Screws</option><option>Glue</option><option>Not sure yet</option></select></label>
      </div>
      <div className="strength-options">
        <span>Strength preference</span>
        <div className="segmented">
          {["Light", "Balanced", "Strong"].map((strength) => <button key={strength} className={spec.strength === strength ? "active" : ""} onClick={() => updateField("strength", strength)} type="button">{strength}</button>)}
        </div>
      </div>
    </section>,
    <section className="form-section" key="review">
      <div className="section-heading">
        <span className="step-kicker">Step 4 of 4</span>
        <h2>Your design brief is ready</h2>
        <p>Review the assumptions, then export a clean spec for the CAD generation step.</p>
      </div>
      <div className="brief-card">
        <span className="brief-icon"><FileJson size={22} /></span>
        <div><small>PROJECT BRIEF</small><strong>{spec.name || "Untitled project"}</strong><p>{spec.description || "Add a short description before generating CAD."}</p></div>
      </div>
      <dl className="spec-list">
        <div><dt>Envelope</dt><dd>{spec.width} × {spec.depth} × {spec.height} mm</dd></div>
        <div><dt>Construction</dt><dd>{spec.wall} mm walls · {spec.cornerRadius} mm corners</dd></div>
        <div><dt>Print profile</dt><dd>P1S · {spec.nozzle} mm · {spec.plate}</dd></div>
        <div><dt>Part plan</dt><dd>{spec.partCount} {spec.partCount === 1 ? "part" : "parts"} · {spec.assemblyMethod}</dd></div>
      </dl>
      <button className="primary-button large" onClick={exportSpec} type="button"><Download size={18} /> Export project spec</button>
      <button className="secondary-button large" type="button"><WandSparkles size={18} /> CAD generation is the next build milestone</button>
    </section>,
  ];

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <button className="icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button>
        <div className="brand compact"><span className="brand-mark"><Box size={20} /></span><strong>PrintPath</strong></div>
        <span className={`save-state ${saveState}`}><span />{saveState === "saved" ? "Saved" : "Saving"}</span>
      </header>

      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand"><span className="brand-mark"><Box size={24} /></span><div><strong>PrintPath</strong><small>Make it real.</small></div></div>
          <button className="icon-button close-nav" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={20} /></button>
          <nav className="main-nav" aria-label="Main navigation">
            <button className={currentPage === "overview" ? "active" : ""} onClick={() => navigate("overview")}><Home size={18} /><span>Overview</span></button>
            <button className={currentPage === "projects" ? "active" : ""} onClick={() => navigate("projects")}><Layers3 size={18} /><span>My projects</span><em>3</em></button>
            <button className={currentPage === "library" ? "active" : ""} onClick={() => navigate("library")}><Sparkles size={18} /><span>Design library</span></button>
            {currentPage === "workbench" && <button className="active" onClick={() => navigate("workbench")}><PencilRuler size={18} /><span>Active workbench</span></button>}
          </nav>
          <button className="new-project-button" onClick={startFresh}><Plus size={18} /> New project</button>
        </div>
        <div className="sidebar-bottom">
          <div className="roadmap-card"><span><Sparkles size={16} /></span><strong>Building in public</strong><p>This prototype is the first step toward an open design-to-print workflow.</p><button>View roadmap <ChevronRight size={14} /></button></div>
          <button className={`settings-link ${currentPage === "settings" ? "active" : ""}`} onClick={() => navigate("settings")}><Settings size={18} /> Machine setup</button>
          <div className="profile"><span>WB</span><div><strong>William</strong><small>Maker workspace</small></div><ChevronRight size={16} /></div>
        </div>
      </aside>
      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      {currentPage !== "workbench" ? (
        <Dashboard
          page={currentPage}
          activeProjectName={spec.name}
          nozzle={spec.nozzle}
          plate={spec.plate}
          onNavigate={navigate}
          onOpenProject={() => navigate("workbench")}
          onNewProject={startFresh}
          onUseTemplate={useTemplate}
          onNozzleChange={(value) => updateField("nozzle", value)}
          onPlateChange={(value) => updateField("plate", value)}
        />
      ) : (
      <main className="workspace">
        <header className="workspace-header">
          <div>
            <span className="breadcrumb">WORKBENCH <ChevronRight size={13} /> ACTIVE PROJECT</span>
            <h1>{spec.name || "New print project"}</h1>
          </div>
          <div className="header-actions">
            <span className={`save-state ${saveState}`}><span />{saveState === "saved" ? "Saved locally" : "Saving…"}</span>
            <button className="secondary-button" onClick={exportSpec}><Download size={17} /> Export</button>
          </div>
        </header>

        <div className="machine-context">
          <span><Printer size={16} /><strong>Bambu Lab P1S</strong></span>
          <span><Box size={15} />256 × 256 × 256 mm</span>
          <span><CircleCheck size={15} />{spec.nozzle} mm nozzle</span>
          <span><Layers3 size={15} />{spec.plate}</span>
          <button onClick={() => navigate("settings")}>Edit setup</button>
        </div>

        <div className="workflow-layout">
          <section className="workflow-panel">
            <div className="stepper" aria-label="Project steps">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.label}
                    aria-label={`${step.label}: ${step.detail}`}
                    className={`${activeStep === index ? "active" : ""} ${activeStep > index ? "complete" : ""}`}
                    onClick={() => setActiveStep(index)}
                  >
                    <span className="step-icon">{activeStep > index ? <Check size={17} /> : <Icon size={17} />}</span>
                    <span><strong>{step.label}</strong><small>{step.detail}</small></span>
                  </button>
                );
              })}
            </div>
            <div className="form-wrap">{stepContent[activeStep]}</div>
            <div className="form-navigation">
              <button className="text-button" disabled={activeStep === 0} onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>Back</button>
              <span>{activeStep + 1} / {steps.length}</span>
              {activeStep < steps.length - 1 ? (
                <button className="primary-button" onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}>Continue <ChevronRight size={17} /></button>
              ) : (
                <button className="primary-button" onClick={exportSpec}><Download size={17} /> Export</button>
              )}
            </div>
          </section>

          <section className="visual-panel">
            <PartPreview spec={spec} />
            <div className="metrics-row">
              <Metric icon={Clock3} label="Rough time" value={`~${estimatedHours} hr`} detail="early estimate" />
              <Metric icon={Layers3} label="Material" value={`~${estimatedGrams} g`} detail={spec.material} />
              <Metric icon={Gauge} label="Readiness" value={`${readyCount}/${checks.length}`} detail={readyCount === checks.length ? "checks passed" : "needs review"} />
            </div>
            <div className="readiness-card">
              <div className="readiness-header"><div><span className="eyebrow">Automatic checks</span><strong>Print readiness</strong></div><span className={readyCount === checks.length ? "ready-badge" : "review-badge"}>{readyCount === checks.length ? "Looking good" : "Review needed"}</span></div>
              <div className="checks-list">
                {checks.map((check) => (
                  <div className={check.ok ? "check-row ok" : "check-row warning"} key={check.label}>
                    <span>{check.ok ? <CircleCheck size={18} /> : <Ruler size={18} />}</span>
                    <div><strong>{check.label}</strong><small>{check.detail}</small></div>
                    <em>{check.ok ? "Pass" : "Check"}</em>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      )}
    </div>
  );
}
