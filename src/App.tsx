import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Box,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Download,
  ExternalLink,
  FileJson,
  Gauge,
  Grid3X3,
  Home,
  Layers3,
  Lightbulb,
  Link2,
  LockKeyhole,
  LogIn,
  LogOut,
  Menu,
  PackageCheck,
  PencilRuler,
  Plus,
  Printer,
  RotateCcw,
  Ruler,
  Settings,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import Dashboard, { type AppPage, type StarterTemplate } from "./Dashboard";
import { createProjectStore, type ProjectStoreSummary } from "./projectStore";
import roadmapUrl from "../IMPLEMENTATION_ROADMAP.md?url";

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
  designSystem: "custom" | "gridfinity";
  gridfinityMode?: "full-grid" | "fractional" | "gap-tray";
  geometryKind: "brief-only" | "open-tray" | "gridfinity-gap-tray";
  objectIntent: "one-compartment" | "multiple-compartments" | "spacer" | "base" | "holder" | "other";
  dimensionIntent: "available-envelope" | "finished-outside" | "usable-inside";
  fitPreference: "loose" | "sliding" | "snug" | "press-fit";
  gridRelationship: "connects" | "aligned" | "adjacent-only" | "none";
  onePartRequired: boolean;
  obstacles: string;
  floorThickness: number;
  verticalClearance: number;
  supportsAllowed: boolean;
  brimAllowed: boolean;
  orchestrationPreference: "auto" | "lean" | "reviewed";
  intentConfirmedAt?: string;
  completedAt?: string;
  printTitle?: string;
  createdAt: string;
};

type NumberKey = "width" | "depth" | "height" | "wall" | "floorThickness" | "clearance" | "verticalClearance" | "cornerRadius" | "nozzle" | "layerHeight" | "partCount";

type AccessMode = "checking" | "public" | "maker";

type SessionResponse = {
  authenticated?: boolean;
  displayName?: string;
  aiConfigured?: boolean;
  error?: string;
};

const STORAGE_KEY = "printpath-project-v1";
const BRIDGE_PAIRING_KEY = "printpath-bridge-pairing-v1";
const ACTIVE_PROJECT_KEY = "printpath-active-project-v1";
const BRIDGE_URL = "http://127.0.0.1:32145";
const SHOWCASED_PROJECT_COUNT = 14;
const projectStore = createProjectStore<ProjectSpec>();

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
  designSystem: "custom",
  geometryKind: "brief-only",
  objectIntent: "holder",
  dimensionIntent: "available-envelope",
  fitPreference: "sliding",
  gridRelationship: "none",
  onePartRequired: true,
  obstacles: "",
  floorThickness: 3.2,
  verticalClearance: 0.6,
  supportsAllowed: false,
  brimAllowed: true,
  orchestrationPreference: "auto",
  createdAt: new Date().toISOString(),
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
const GAP_TRAY_COMPLETED_AT = "2026-08-13T16:50:21.505Z";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeKnownCompletedProject(project: ProjectSpec): ProjectSpec {
  const isApprovedGapTray = project.geometryKind === "gridfinity-gap-tray"
    && Math.max(project.width, project.depth) === 255
    && Math.min(project.width, project.depth) === 40
    && project.height === 50;
  if (!isApprovedGapTray) return project;
  return {
    ...project,
    name: "Drawer Gap Tray",
    printTitle: project.printTitle || "Drawer Gap Tray · Aug 2026",
    intentConfirmedAt: project.intentConfirmedAt || GAP_TRAY_COMPLETED_AT,
    completedAt: project.completedAt || GAP_TRAY_COMPLETED_AT,
  };
}

function loadProject(): ProjectSpec {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterSpec;
    const parsed = JSON.parse(stored) as Partial<Omit<ProjectSpec, "geometryKind" | "gridfinityMode">> & { geometryKind?: string; gridfinityMode?: string };
    const isLegacyStrip = parsed.geometryKind === "gridfinity-pitch-strip" || parsed.name === "Non-standard Gridfinity-pitch drawer strip";
    const migrated = isLegacyStrip ? {
      ...parsed,
      name: "One-compartment drawer gap tray",
      description: `One continuous custom compartment for the measured gap beside the existing Gridfinity layout. It prints diagonally as a single P1S part and is not a standard baseplate-compatible bin.`,
      partCount: 1,
      assemblyMethod: "Single print",
      gridfinityMode: "gap-tray",
      geometryKind: "gridfinity-gap-tray",
    } : parsed;
    const normalized = { ...starterSpec, ...migrated, printer: "Bambu Lab P1S" } as ProjectSpec;
    if (normalized.geometryKind === "gridfinity-gap-tray") {
      return normalizeKnownCompletedProject({
        ...normalized,
        name: normalized.name === "One-compartment Gridfinity gap tray" ? "One-compartment drawer gap tray" : normalized.name,
        objectIntent: "one-compartment",
        dimensionIntent: "available-envelope",
        fitPreference: "sliding",
        gridRelationship: "adjacent-only",
        onePartRequired: true,
        floorThickness: typeof parsed.floorThickness === "number" ? parsed.floorThickness : normalized.wall,
        verticalClearance: normalized.verticalClearance ?? 0.6,
      });
    }
    return normalized;
  } catch {
    return starterSpec;
  }
}

function suggestedPrintTitle(spec: ProjectSpec) {
  const created = new Date(spec.createdAt || Date.now());
  const month = created.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const base = spec.geometryKind === "gridfinity-gap-tray"
    ? "Drawer Gap Tray"
    : spec.geometryKind === "open-tray"
      ? "Exact-Fit Tray"
      : spec.name || "PrintPath Design";
  return `${base} · ${month}`;
}

function printedDimensions(spec: ProjectSpec) {
  if (spec.dimensionIntent === "usable-inside") {
    return {
      width: spec.width + spec.wall * 2,
      depth: spec.depth + spec.wall * 2,
      height: spec.height + spec.floorThickness,
    };
  }
  if (spec.dimensionIntent === "finished-outside") {
    return { width: spec.width, depth: spec.depth, height: spec.height };
  }
  return {
    width: Math.max(1, spec.width - spec.clearance * 2),
    depth: Math.max(1, spec.depth - spec.clearance * 2),
    height: Math.max(1, spec.height - spec.verticalClearance),
  };
}

function orchestrationRoute(spec: ProjectSpec) {
  if (spec.orchestrationPreference === "lean" || (spec.geometryKind !== "brief-only" && spec.partCount === 1 && spec.orchestrationPreference === "auto")) {
    return { label: "Deterministic fast path", detail: "Known generator · automated checks · no agent fan-out", agents: 0 };
  }
  if (spec.partCount > 1 || spec.orchestrationPreference === "reviewed") {
    return { label: "Plan + independent review", detail: "Geometry planner · printability reviewer", agents: 2 };
  }
  return { label: "Guided specification", detail: "One planning pass after required answers", agents: 1 };
}

function PartPreview({ spec }: { spec: ProjectSpec }) {
  const [flipped, setFlipped] = useState(false);
  const displayOuter = printedDimensions(spec);

  if (spec.geometryKind === "gridfinity-gap-tray") {
    return (
      <div className="preview-shell grid-strip-preview">
        <div className="preview-toolbar">
          <div>
            <span className="eyebrow">Printable part</span>
            <strong>One continuous compartment</strong>
          </div>
          <button className="icon-button" onClick={() => setFlipped((value) => !value)} aria-label="Rotate preview">
            <RotateCcw size={17} />
          </button>
        </div>
        <div className="preview-canvas">
          <div className="grid-floor" />
          <svg viewBox="0 0 680 430" role="img" aria-label={`One printable ${Math.max(displayOuter.width, displayOuter.depth)} by ${Math.min(displayOuter.width, displayOuter.depth)} by ${displayOuter.height} millimeter drawer compartment`}>
            <defs>
              <linearGradient id="stripTop" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#78d4b7" /><stop offset="1" stopColor="#c9f2e5" /></linearGradient>
              <linearGradient id="stripSide" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#43a487" /><stop offset="1" stopColor="#27725e" /></linearGradient>
              <filter id="stripShadow" x="-30%" y="-40%" width="160%" height="190%"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#163a32" floodOpacity="0.2" /></filter>
            </defs>
            <ellipse cx="340" cy="329" rx="260" ry="27" fill="#24483e" opacity="0.1" />
            <g className="strip-part-group" style={{ transformOrigin: "340px 225px", transform: flipped ? "scaleX(-1)" : "scaleX(1)" }} filter="url(#stripShadow)">
              <path d="M 75 178 L 112 151 L 605 151 L 568 178 Z" fill="url(#stripTop)" stroke="#277b65" strokeWidth="2" />
              <path d="M 568 178 L 605 151 L 605 253 L 568 280 Z" fill="url(#stripSide)" stroke="#236b59" strokeWidth="2" />
              <rect x="75" y="178" width="493" height="102" fill="#61c3a4" stroke="#277b65" strokeWidth="2" />
              <path d="M 91 188 L 120 167 L 581 167 L 552 188 L 552 260 L 91 260 Z" fill="#eff8f3" stroke="#318d73" strokeWidth="2" />
              <text x="340" y="307" textAnchor="middle" className="strip-part-label">ONE OPEN COMPARTMENT · SINGLE PART</text>
            </g>
            <g className="strip-dimension">
              <line x1="75" y1="338" x2="568" y2="338" /><line x1="75" y1="330" x2="75" y2="346" /><line x1="568" y1="330" x2="568" y2="346" />
              <rect x="278" y="324" width="86" height="28" rx="14" /><text x="321" y="343">{Number(Math.max(displayOuter.width, displayOuter.depth).toFixed(1))} mm</text>
              <line x1="625" y1="178" x2="625" y2="280" /><line x1="617" y1="178" x2="633" y2="178" /><line x1="617" y1="280" x2="633" y2="280" />
              <rect x="591" y="215" width="68" height="28" rx="14" /><text x="625" y="234">{Number(displayOuter.height.toFixed(1))} mm</text>
            </g>
          </svg>
          <span className="preview-note">Printed {Number(Math.max(displayOuter.width, displayOuter.depth).toFixed(1))} × {Number(Math.min(displayOuter.width, displayOuter.depth).toFixed(1))} × {Number(displayOuter.height.toFixed(1))} mm · 45° on one P1S plate</span>
        </div>
      </div>
    );
  }

  const isCozyOrganizer = /cozy stickerville/i.test(`${spec.name} ${spec.description}`);

  if (isCozyOrganizer) {
    return (
      <div className="preview-shell responsive-pipeline-preview cozy-pipeline-preview">
        <div className="preview-toolbar">
          <div>
            <span className="eyebrow">Live organizer plan</span>
            <strong>Cozy Stickerville module pipeline</strong>
          </div>
          <span className="cozy-preview-status">2 source dimensions mapped</span>
        </div>
        <div className="preview-canvas">
          <img src="/projects/cozy-stickerville-organizer-concept.svg?v=2" alt="Exploded four-module Cozy Stickerville organizer layout and design pipeline" />
          <span className="preview-note">Published inputs mapped · 3 physical checks remain</span>
        </div>
      </div>
    );
  }

  const isSevenWondersOrganizer = /7 wonders duel/i.test(`${spec.name} ${spec.description}`);

  if (isSevenWondersOrganizer) {
    return (
      <div className="preview-shell responsive-pipeline-preview seven-wonders-pipeline-preview">
        <div className="preview-toolbar">
          <div><span className="eyebrow">Live organizer plan</span><strong>7 Wonders Duel module pipeline</strong></div>
          <span className="pipeline-preview-status">2 card systems mapped</span>
        </div>
        <div className="preview-canvas">
          <img src="/projects/seven-wonders-duel-organizer-concept.svg?v=2" alt="Exploded four-module 7 Wonders Duel organizer and design pipeline" />
          <span className="preview-note">Published inputs mapped · 3 physical checks remain</span>
        </div>
      </div>
    );
  }

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
        <span className="preview-note">{spec.geometryKind === "open-tray" ? "Concept preview · exact tray STL available at Review" : "Concept visualization · printable geometry comes next"}</span>
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
  const [projectId, setProjectId] = useState(() => localStorage.getItem(ACTIVE_PROJECT_KEY) || crypto.randomUUID());
  const [storeReady, setStoreReady] = useState(false);
  const [storeSummary, setStoreSummary] = useState<ProjectStoreSummary>({ projectCount: 0, versionCount: 0, provider: "Local control tower", syncTarget: "Convex-ready" });
  const [currentPage, setCurrentPage] = useState<AppPage>("overview");
  const [activeStep, setActiveStep] = useState(1);
  const [mobileNav, setMobileNav] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [pairingCode, setPairingCode] = useState(() => sessionStorage.getItem(BRIDGE_PAIRING_KEY) || localStorage.getItem(BRIDGE_PAIRING_KEY) || "");
  const [bridgeState, setBridgeState] = useState<{ status: "checking" | "online" | "offline"; paired: boolean; version?: string; bambuStudioDetected?: boolean }>({ status: "checking", paired: false });
  const [handoffState, setHandoffState] = useState<{ status: "idle" | "sending" | "success" | "error"; message?: string }>({ status: "idle" });
  const [accessMode, setAccessMode] = useState<AccessMode>("checking");
  const [makerName, setMakerName] = useState("");
  const [aiConfigured, setAiConfigured] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const pendingMakerAction = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<SessionResponse> : undefined)
      .then((session) => {
        if (cancelled) return;
        setAccessMode(session?.authenticated ? "maker" : "public");
        setMakerName(session?.displayName || "");
        setAiConfigured(Boolean(session?.aiConfigured));
      })
      .catch(() => {
        if (!cancelled) setAccessMode("public");
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStoreReady(false);
    localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
    void projectStore.load(projectId).then(async (project) => {
      if (cancelled) return;
      if (project) {
        const normalizedProject = normalizeKnownCompletedProject(project.draft);
        setSpec(normalizedProject);
        if (normalizedProject.completedAt && !project.draft.completedAt) {
          await projectStore.checkpoint(projectId, normalizedProject.name, normalizedProject, "completed");
        }
      } else {
        await projectStore.checkpoint(projectId, spec.name, spec, spec.completedAt ? "completed" : "created");
      }
      if (!cancelled) {
        setStoreSummary(await projectStore.summary());
        setStoreReady(true);
      }
    }).catch(() => setStoreReady(true));
    return () => { cancelled = true; };
  }, [projectId]);

  useEffect(() => {
    if (!storeReady) return;
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spec));
      void projectStore.saveDraft(projectId, spec.name, spec).then((summary) => {
        setStoreSummary(summary);
        setSaveState("saved");
      }).catch(() => setSaveState("saved"));
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [projectId, spec, storeReady]);

  useEffect(() => {
    void checkBridge(pairingCode);
  }, []);

  const checks = useMemo(() => {
    const isGridfinity = spec.designSystem === "gridfinity";
    const shortestGridSide = Math.min(spec.width, spec.depth);
    const longGridSide = Math.max(spec.width, spec.depth);
    const isGapTray = spec.geometryKind === "gridfinity-gap-tray";
    const calculatedOuter = printedDimensions(spec);
    const printedLongSide = Math.max(calculatedOuter.width, calculatedOuter.depth);
    const printedShortSide = Math.min(calculatedOuter.width, calculatedOuter.depth);
    const printedHeight = calculatedOuter.height;
    const diagonalPlateSide = Number(((printedLongSide + printedShortSide) / Math.sqrt(2)).toFixed(1));
    const printableLongestSide = isGapTray ? diagonalPlateSide : longGridSide;
    const baseChecks = [
      {
        label: "Build volume",
        detail: isGapTray ? `${diagonalPlateSide} × ${diagonalPlateSide} × ${Number(printedHeight.toFixed(1))} mm at 45° · P1S` : `${P1S_BUILD_VOLUME[0]} × ${P1S_BUILD_VOLUME[1]} × ${P1S_BUILD_VOLUME[2]} mm · P1S`,
        ok: printableLongestSide <= P1S_BUILD_VOLUME[0] && (isGapTray || shortestGridSide <= P1S_BUILD_VOLUME[1]) && printedHeight <= P1S_BUILD_VOLUME[2],
      },
      {
        label: "Plate margin",
        detail: isGapTray ? `${diagonalPlateSide} mm diagonal footprint · ${Number(((256 - diagonalPlateSide) / 2).toFixed(1))} mm centered edge margin` : `${printableLongestSide} mm longest printed side · 6 mm breathing room recommended`,
        ok: printableLongestSide <= 250,
      },
      {
        label: "Wall thickness",
        detail: `${spec.wall} mm · ${Math.round(spec.wall / spec.nozzle)} nozzle lines`,
        ok: spec.wall >= spec.nozzle * 2,
      },
      {
        label: isGapTray ? "Drawer fit" : "Fit allowance",
        detail: isGapTray ? `${Number(printedLongSide.toFixed(1))} × ${Number(printedShortSide.toFixed(1))} × ${Number(printedHeight.toFixed(1))} mm · ${spec.clearance} mm side / ${spec.verticalClearance} mm top allowance` : `${spec.clearance} mm clearance`,
        ok: spec.dimensionIntent !== "available-envelope" || (spec.clearance >= 0.2 && spec.verticalClearance >= 0.2),
      },
      {
        label: "Plate & nozzle",
        detail: `${spec.plate} · ${spec.nozzle} mm nozzle`,
        ok: Boolean(spec.plate) && [0.2, 0.4, 0.6, 0.8].includes(spec.nozzle),
      },
    ];
    const relevantChecks = spec.geometryKind === "open-tray" ? baseChecks.filter((check) => check.label !== "Fit allowance") : baseChecks;
    if (spec.partCount > 1) {
      relevantChecks.push({
        label: "Assembly plan",
        detail: `${spec.partCount} parts · ${spec.assemblyMethod}`,
        ok: spec.assemblyMethod !== "Not sure yet",
      });
    }
    if (isGridfinity && spec.gridfinityMode !== "fractional") {
      relevantChecks.push({
        label: isGapTray ? "Gridfinity gap strategy" : "Gridfinity bin footprint",
        detail: isGapTray ? `One custom compartment beside the grid · not a baseplate part` : shortestGridSide >= 41.5 ? `${shortestGridSide} mm shortest side · a 41.5 mm standard bin fits` : `${shortestGridSide} mm shortest side · needs at least 41.5 mm`,
        ok: isGapTray || shortestGridSide >= 41.5,
      });
    }
    if (spec.geometryKind !== "brief-only") {
      relevantChecks.push({
        label: "Design approval",
        detail: spec.intentConfirmedAt ? `${spec.printTitle || suggestedPrintTitle(spec)} · intent frozen` : "Confirm the intent statement before handoff",
        ok: Boolean(spec.intentConfirmedAt),
      });
    }
    return relevantChecks;
  }, [spec]);

  const gridfinityPlan = useMemo(() => {
    if (spec.designSystem !== "gridfinity" || spec.gridfinityMode === "fractional") return null;
    const pitch = 42;
    const standardBinFootprint = 41.5;
    const columns = Math.floor(spec.width / pitch);
    const rows = Math.floor(spec.depth / pitch);
    const widthRemainder = Number((spec.width - columns * pitch).toFixed(1));
    const depthRemainder = Number((spec.depth - rows * pitch).toFixed(1));
    const fullGridFits = columns > 0 && rows > 0 && Math.min(spec.width, spec.depth) >= standardBinFootprint;
    const longAxisCells = spec.width >= spec.depth ? columns : rows;
    const diagonalPlateSide = Number(((Math.max(spec.width, spec.depth) + Math.min(spec.width, spec.depth) - spec.clearance * 4) / Math.sqrt(2)).toFixed(1));
    const canGenerateGapTray = Math.min(spec.width, spec.depth) < standardBinFootprint && Math.min(spec.width, spec.depth) >= spec.wall * 2 + 1 && longAxisCells >= 1 && diagonalPlateSide <= 250;
    return { pitch, standardBinFootprint, columns, rows, widthRemainder, depthRemainder, fullGridFits, diagonalPlateSide, canGenerateGapTray };
  }, [spec.designSystem, spec.gridfinityMode, spec.width, spec.depth, spec.wall, spec.clearance]);

  const readyCount = checks.filter((check) => check.ok).length;
  const preApprovalReady = checks.filter((check) => check.label !== "Design approval").every((check) => check.ok);
  const hasPrintableGeometry = spec.geometryKind !== "brief-only";
  const outer = printedDimensions(spec);
  const route = orchestrationRoute(spec);
  const estimatedGrams = Math.max(4, Math.round((spec.width * spec.depth * spec.height * 0.2 * 1.24) / 1000));
  const estimatedHours = Math.max(0.4, estimatedGrams / 13).toFixed(1);

  function updateField<K extends keyof ProjectSpec>(key: K, value: ProjectSpec[K]) {
    setSpec((current) => ({
      ...current,
      [key]: value,
      ...(key === "intentConfirmedAt" || key === "printTitle" || key === "completedAt" ? {} : { intentConfirmedAt: undefined, completedAt: undefined }),
    }));
  }

  function updateNumber(key: NumberKey, raw: string) {
    const value = Number(raw);
    if (Number.isFinite(value)) updateField(key, value);
  }

  function enableGridfinityGapTray() {
    if (!gridfinityPlan?.canGenerateGapTray) return;
    setSpec((current) => ({
      ...current,
      name: "One-compartment drawer gap tray",
      description: `One continuous ${Math.max(current.width, current.depth)} × ${Math.min(current.width, current.depth)} × ${current.height} mm compartment for the narrow zone beside the existing Gridfinity layout. It prints diagonally as one P1S part and intentionally does not claim standard baseplate compatibility.`,
      cornerRadius: 0,
      partCount: 1,
      assemblyMethod: "Single print",
      gridfinityMode: "gap-tray",
      geometryKind: "gridfinity-gap-tray",
      objectIntent: "one-compartment",
      dimensionIntent: "available-envelope",
      fitPreference: "sliding",
      gridRelationship: "adjacent-only",
      onePartRequired: true,
      floorThickness: current.wall,
      verticalClearance: 0.6,
      printTitle: undefined,
      intentConfirmedAt: undefined,
      completedAt: undefined,
    }));
    setHandoffState({ status: "idle" });
  }

  function requestMakerAccess(action?: () => void) {
    pendingMakerAction.current = action || null;
    setLoginError("");
    setLoginPassword("");
    setLoginOpen(true);
  }

  function requireMaker(action: () => void) {
    if (accessMode === "maker") {
      action();
      return;
    }
    requestMakerAccess(action);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginSubmitting(true);
    setLoginError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const result = await response.json() as SessionResponse;
      if (!response.ok || !result.authenticated) throw new Error(result.error || "Sign-in failed.");
      setAccessMode("maker");
      setMakerName(result.displayName || loginUsername);
      setAiConfigured(Boolean(result.aiConfigured));
      setLoginPassword("");
      setLoginOpen(false);
      const action = pendingMakerAction.current;
      pendingMakerAction.current = null;
      action?.();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function signOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      setAccessMode("public");
      setMakerName("");
      setLoginPassword("");
      pendingMakerAction.current = null;
      navigate("overview");
    }
  }

  async function askPrintPathAi(idea: string): Promise<string> {
    const response = await fetch("/api/ai/design", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });
    const result = await response.json() as { brief?: string; error?: string };
    if (response.status === 401) {
      setAccessMode("public");
      requestMakerAccess();
    }
    if (!response.ok || !result.brief) throw new Error(result.error || "PrintPath AI could not complete that request.");
    return result.brief;
  }

  function startFresh() {
    setStoreReady(false);
    setProjectId(crypto.randomUUID());
    setSpec({ ...freshSpec, createdAt: new Date().toISOString() });
    setActiveStep(0);
    setCurrentPage("workbench");
    setMobileNav(false);
  }

  function startIdea(idea: string) {
    setStoreReady(false);
    setProjectId(crypto.randomUUID());
    setSpec({ ...freshSpec, description: idea, createdAt: new Date().toISOString() });
    setActiveStep(0);
    navigate("workbench");
  }

  function navigate(page: AppPage) {
    setCurrentPage(page);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function useTemplate(template: StarterTemplate) {
    const templates: Record<Exclude<StarterTemplate, "blank">, Partial<ProjectSpec>> = {
      "grid-fit-tile": {
        name: "Gridfinity fit tile",
        description: "A single 42 mm confidence tile to verify scale, first-layer grip, and grid feel before printing a larger system.",
        category: "Container or organizer",
        width: 42,
        depth: 42,
        height: 6,
        wall: 2,
        clearance: 0.25,
        cornerRadius: 4,
        designSystem: "gridfinity",
        gridfinityMode: "full-grid",
      },
      "loose-tray": {
        name: "Exact-fit open tray",
        description: "A simple square-corner open tray sized to the measured space, with a solid base and uniform walls.",
        category: "Container or organizer",
        width: 120,
        depth: 80,
        height: 28,
        wall: 3,
        clearance: 0.3,
        cornerRadius: 0,
        geometryKind: "open-tray",
      },
      "utensil-tray": {
        name: "Custom kitchen utensil tray",
        description: "A measured set of long compartments for everyday utensils, with the number and width of lanes chosen from the actual drawer contents.",
        category: "Container or organizer",
        width: 280, depth: 180, height: 45, wall: 2.4, clearance: 0.5, cornerRadius: 7,
        partCount: 2, assemblyMethod: "Placed side by side",
        objectIntent: "multiple-compartments",
        dimensionIntent: "available-envelope",
        gridRelationship: "none",
      },
      "sink-caddy": {
        name: "Ventilated kitchen sink caddy",
        description: "A water-safe holder for a sponge, dish brush, and cloth with drainage, airflow, and removable wet-zone pieces for cleaning.",
        category: "Holder or mount",
        width: 150, depth: 75, height: 90, wall: 2.6, clearance: 0.7, cornerRadius: 9,
        material: "PETG", partCount: 2, assemblyMethod: "Slides together",
        objectIntent: "holder",
        gridRelationship: "none",
      },
      "bag-clip": {
        name: "Reusable kitchen bag clip set",
        description: "A small batch of flexible snap clips sized to seal folded snack, coffee, and freezer bags without sharp corners.",
        category: "Replacement part",
        width: 85, depth: 14, height: 8, wall: 2.4, clearance: 0.4, cornerRadius: 4,
        material: "PETG", partCount: 6,
        objectIntent: "holder",
        gridRelationship: "none",
      },
      "drawer-strip": {
        name: "Custom drawer base strip",
        description: "A measured single-row strip used to verify drawer fit before producing a complete multi-plate base.",
        category: "Container or organizer",
        width: 210,
        depth: 42,
        height: 6,
        wall: 2,
        clearance: 0.3,
        cornerRadius: 4,
        designSystem: "gridfinity",
        gridfinityMode: "full-grid",
      },
      "grid-customizer": {
        name: "Custom drawer Gridfinity layout",
        description: "A measured Gridfinity layout that uses full 42 mm cells, centers the usable grid, and fills the leftover drawer space intentionally.",
        category: "Container or organizer",
        width: 210, depth: 168, height: 7, wall: 2.4, clearance: 0.3, cornerRadius: 4,
        partCount: 2, assemblyMethod: "Placed side by side",
        designSystem: "gridfinity",
        gridfinityMode: "full-grid",
      },
      "grid-edge-filler": {
        name: "Gridfinity edge and corner fillers",
        description: "Measured strips and corner pieces that keep a standard Gridfinity grid centered and secure inside a drawer with awkward leftover space.",
        category: "Container or organizer",
        width: 42, depth: 14, height: 7, wall: 2.4, clearance: 0.3, cornerRadius: 3,
        partCount: 4, assemblyMethod: "Slides together",
        designSystem: "gridfinity",
        gridfinityMode: "fractional",
      },
      "grid-fractional-bin": {
        name: "Fractional-width Gridfinity bin",
        description: "A half-width bin for objects that are smaller than one standard Gridfinity cell, with a separate test fit before the full-height print.",
        category: "Container or organizer",
        width: 21, depth: 42, height: 35, wall: 2, clearance: 0.3, cornerRadius: 4,
        designSystem: "gridfinity",
        gridfinityMode: "fractional",
      },
      "token-tray": {
        name: "Pourable board game token tray",
        description: "A rounded token well with a low pouring corner so pieces can move between the tray, table, and game box quickly.",
        category: "Container or organizer",
        width: 90, depth: 70, height: 22, wall: 2.4, clearance: 0.35, cornerRadius: 8,
      },
      "card-holder": {
        name: "Sleeved card holder",
        description: "A slightly leaning card well sized for a sleeved deck, with finger access and enough clearance to remove cards without binding.",
        category: "Holder or mount",
        width: 72, depth: 100, height: 45, wall: 2.4, clearance: 0.5, cornerRadius: 5,
      },
      "board-game-insert": {
        name: "Modular board game box organizer",
        description: "A six-part box insert that separates cards, tokens, boards, and player pieces into labeled modules with a plate-by-plate assembly plan.",
        category: "Container or organizer",
        width: 240, depth: 240, height: 55, wall: 2.2, clearance: 0.5, cornerRadius: 5,
        partCount: 6, assemblyMethod: "Slides together",
      },
      "vanity-organizer": {
        name: "Custom vanity drawer organizer",
        description: "A measured compartment layout for cosmetics and daily tools that works around drawer rails, pipes, and other obstacles.",
        category: "Container or organizer",
        width: 220, depth: 140, height: 38, wall: 2.4, clearance: 0.5, cornerRadius: 7,
        partCount: 2, assemblyMethod: "Slides together",
      },
      "toothbrush-dock": {
        name: "Toothbrush and razor dock",
        description: "Ventilated upright storage with removable drip cups sized to the handles you use and designed for easy cleaning.",
        category: "Holder or mount",
        width: 105, depth: 70, height: 95, wall: 2.6, clearance: 0.6, cornerRadius: 8,
        material: "PETG", partCount: 2, assemblyMethod: "Slides together",
      },
      "nightstand-dock": {
        name: "Nightstand charging dock",
        description: "A phone rest with a routed charging cable, watch landing area, and pocket tray sized to the devices on the nightstand.",
        category: "Holder or mount",
        width: 170, depth: 110, height: 35, wall: 2.8, clearance: 0.5, cornerRadius: 9,
        partCount: 2, assemblyMethod: "Slides together",
      },
      "jewelry-tray": {
        name: "Stackable jewelry tray",
        description: "A soft-corner compartment tray with room for rings, small pieces, and alignment features for adding another layer later.",
        category: "Container or organizer",
        width: 180, depth: 120, height: 25, wall: 2.2, clearance: 0.35, cornerRadius: 8,
      },
      "plant-drip-tray": {
        name: "Exact-fit planter drip tray",
        description: "A low-profile waterproof saucer matched to the planter base with a raised lip sized for routine runoff.",
        category: "Container or organizer",
        width: 145, depth: 145, height: 12, wall: 2.8, clearance: 1, cornerRadius: 14,
        material: "PETG",
      },
      "trellis-clips": {
        name: "Plant and trellis clips",
        description: "A small batch of reusable clips tuned to the plant stem and trellis rod diameters without pinching new growth.",
        category: "Holder or mount",
        width: 22, depth: 18, height: 10, wall: 2, clearance: 0.5, cornerRadius: 4,
        material: "PETG", partCount: 8,
      },
      "propagation-stand": {
        name: "Propagation tube stand",
        description: "A broad, water-safe holder that keeps glass propagation tubes upright and separates them for easy removal.",
        category: "Holder or mount",
        width: 160, depth: 80, height: 60, wall: 3, clearance: 0.7, cornerRadius: 10,
        material: "PETG", partCount: 2, assemblyMethod: "Slides together",
      },
      "cable-guide": {
        name: "Measured cable guide set",
        description: "Snap-in cable routing matched to the cable thickness and the desk or furniture edge it mounts beneath.",
        category: "Holder or mount",
        width: 28, depth: 18, height: 14, wall: 2.4, clearance: 0.4, cornerRadius: 5,
        partCount: 6,
      },
      "wall-hook": {
        name: "Purpose-fit wall hook",
        description: "A load-aware hook shaped around the exact object it holds and the fastener or mounting tape used on the wall.",
        category: "Holder or mount",
        width: 55, depth: 35, height: 70, wall: 3.2, clearance: 0.4, cornerRadius: 7,
        strength: "Strong",
      },
    };
    setStoreReady(false);
    setProjectId(crypto.randomUUID());
    setSpec(template === "blank"
      ? { ...freshSpec, createdAt: new Date().toISOString() }
      : { ...starterSpec, ...templates[template], floorThickness: templates[template].wall ?? starterSpec.floorThickness, createdAt: new Date().toISOString(), intentConfirmedAt: undefined, completedAt: undefined, printTitle: undefined });
    setActiveStep(template === "blank" ? 0 : 1);
    navigate("workbench");
  }

  async function saveCheckpoint(reason: "step-complete" | "approved" | "handoff" | "completed") {
    const summary = await projectStore.checkpoint(projectId, spec.name, spec, reason);
    setStoreSummary(summary);
  }

  function approveDesign() {
    const approved = {
      ...spec,
      printTitle: spec.printTitle || suggestedPrintTitle(spec),
      intentConfirmedAt: new Date().toISOString(),
    };
    setSpec(approved);
    void projectStore.checkpoint(projectId, approved.name, approved, "approved").then(setStoreSummary);
  }

  function completeProject() {
    const completed = { ...spec, completedAt: spec.completedAt || new Date().toISOString() };
    setSpec(completed);
    void projectStore.checkpoint(projectId, completed.name, completed, "completed").then(setStoreSummary);
    navigate("projects");
  }

  function exportSpec() {
    const payload = {
      format: "printpath-project",
      version: 2,
      units: "millimeters",
      exportedAt: new Date().toISOString(),
      projectId,
      project: spec,
      printedOutside: printedDimensions(spec),
      orchestration: route,
      readiness: checks,
      nextStep: spec.intentConfirmedAt ? "Generate the approved artifact and review its slice in Bambu Studio." : "Confirm the design intent before generating an artifact.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${spec.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "printpath-project"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function checkBridge(token = pairingCode) {
    setBridgeState((current) => ({ ...current, status: "checking" }));
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1800);
    try {
      const response = await fetch(`${BRIDGE_URL}/health`, {
        cache: "no-store",
        headers: token ? { "X-PrintPath-Token": token.trim().toUpperCase() } : undefined,
        signal: controller.signal,
        targetAddressSpace: "loopback",
      } as RequestInit & { targetAddressSpace: "loopback" });
      if (!response.ok) throw new Error("Bridge did not respond.");
      const result = await response.json() as { paired?: boolean; version?: string; bambuStudio?: { detected?: boolean } };
      setBridgeState({ status: "online", paired: Boolean(result.paired), version: result.version, bambuStudioDetected: Boolean(result.bambuStudio?.detected) });
      if (result.paired && token) {
        const normalized = token.trim().toUpperCase();
        setPairingCode(normalized);
        sessionStorage.setItem(BRIDGE_PAIRING_KEY, normalized);
        localStorage.removeItem(BRIDGE_PAIRING_KEY);
      }
    } catch {
      setBridgeState({ status: "offline", paired: false });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function handoffToBambu() {
    if (!bridgeState.paired || !hasPrintableGeometry) return;
    setHandoffState({ status: "sending" });
    try {
      const response = await fetch(`${BRIDGE_URL}/handoff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PrintPath-Token": pairingCode,
        },
        body: JSON.stringify({ projectId, project: spec, readiness: checks, orchestration: route }),
        targetAddressSpace: "loopback",
      } as RequestInit & { targetAddressSpace: "loopback" });
      const result = await response.json() as { ok?: boolean; fileName?: string; openedWith?: string; files?: Array<{ role?: string }>; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "The handoff failed.");
      const launchMessage = result.openedWith === "Bambu Studio"
        ? `${result.fileName} opened in Bambu Studio.`
        : `${result.fileName} was saved and sent to Windows. Choose Bambu Studio if Windows asks which app to use.`;
      const savedParts = result.files && result.files.length > 1 ? " Parts A and B were saved beside it." : "";
      setHandoffState({ status: "success", message: `${launchMessage}${savedParts} Review the sliced preview before printing.` });
      void saveCheckpoint("handoff");
    } catch (error) {
      setHandoffState({ status: "error", message: error instanceof Error ? error.message : "The handoff failed." });
      void checkBridge(pairingCode);
    }
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
      <div className="prompt-block">
        <div><span className="step-kicker">Intent gate</span><strong>Answer these before dimensions</strong><p>These choices prevent a correct measurement from becoming the wrong object.</p></div>
        <div className="prompt-grid">
          <label className="field"><span>What are we making?</span><select value={spec.objectIntent} onChange={(event) => updateField("objectIntent", event.target.value as ProjectSpec["objectIntent"])}><option value="one-compartment">One continuous compartment</option><option value="multiple-compartments">Multiple compartments</option><option value="spacer">Spacer or filler</option><option value="base">Baseplate or foundation</option><option value="holder">Holder or mount</option><option value="other">Something else</option></select></label>
          <label className="field"><span>Relationship to Gridfinity</span><select value={spec.gridRelationship} onChange={(event) => updateField("gridRelationship", event.target.value as ProjectSpec["gridRelationship"])}><option value="adjacent-only">Sits beside it</option><option value="connects">Mechanically connects</option><option value="aligned">Aligns to the 42 mm pitch</option><option value="none">No relationship</option></select></label>
        </div>
        <label className="toggle-row"><input type="checkbox" checked={spec.onePartRequired} onChange={(event) => updateField("onePartRequired", event.target.checked)} /><span><strong>Must be one physical part</strong><small>If disabled, PrintPath may plan multiple plates or assembly.</small></span></label>
      </div>
      <div className="orchestration-picker">
        <div><span className="step-kicker">Work routing</span><strong>How much reasoning should this design use?</strong></div>
        <div className="segmented">
          {([['auto','Auto'],['lean','Lean'],['reviewed','Reviewed']] as const).map(([value, label]) => <button key={value} className={spec.orchestrationPreference === value ? "active" : ""} type="button" onClick={() => updateField("orchestrationPreference", value)}>{label}</button>)}
        </div>
        <p><strong>{route.label}</strong> · {route.detail}</p>
      </div>
    </section>,
    <section className="form-section" key="measure">
      <div className="section-heading">
        <span className="step-kicker">Step 2 of 4</span>
        <h2>Let’s capture the fit</h2>
        <p>First identify what the numbers mean, then enter the measurements.</p>
      </div>
      <div className="meaning-picker">
        <span>These dimensions describe</span>
        <div className="choice-card-row">
          {([['available-envelope','Maximum available space','PrintPath subtracts fit clearance.'],['finished-outside','Exact finished outside','No dimensional allowance is applied.'],['usable-inside','Required usable inside','Walls and floor are added outside.']] as const).map(([value, title, detail]) => <button type="button" key={value} className={spec.dimensionIntent === value ? "active" : ""} onClick={() => updateField("dimensionIntent", value)}><strong>{title}</strong><small>{detail}</small></button>)}
        </div>
      </div>
      <div className="measurement-grid">
        {(["width", "depth", "height"] as NumberKey[]).map((key) => (
          <label className="field dimension-field" key={key}>
            <span>{key[0].toUpperCase() + key.slice(1)}</span>
            <div className="input-unit"><input type="number" min="1" step="1" value={spec[key]} onChange={(event) => updateNumber(key, event.target.value)} /><em>mm</em></div>
          </label>
        ))}
      </div>
      {gridfinityPlan && (
        <div className={`grid-measure-note ${gridfinityPlan.fullGridFits ? "fits" : "does-not-fit"}`}>
          <Grid3X3 size={18} />
          <div><strong>{gridfinityPlan.fullGridFits ? "A standard Gridfinity bin fits." : "A standard 41.5 mm bin footprint does not fit across the short side."}</strong><p>{spec.geometryKind === "gridfinity-gap-tray" ? "This measured zone stays independent from the grid and becomes one continuous compartment with drawer-fit clearance." : "PrintPath will show the exact grid count, leftover space, and a printable custom-gap option at Review."}</p></div>
        </div>
      )}
      <div className="form-divider" />
      <div className="measurement-grid details-grid">
        <label className="field dimension-field">
          <span>Wall thickness</span>
          <div className="input-unit"><input type="number" min="0.4" step="0.1" value={spec.wall} onChange={(event) => updateNumber("wall", event.target.value)} /><em>mm</em></div>
          <small>2.4–3 mm is a sturdy start for a small organizer.</small>
        </label>
        <label className="field dimension-field">
          <span>Floor thickness</span>
          <div className="input-unit"><input type="number" min="0.4" step="0.1" value={spec.floorThickness} onChange={(event) => updateNumber("floorThickness", event.target.value)} /><em>mm</em></div>
          <small>Independent from wall thickness.</small>
        </label>
        {spec.geometryKind !== "open-tray" && (
          <label className="field dimension-field">
            <span>Fit clearance</span>
            <div className="input-unit"><input type="number" min="0" step="0.05" value={spec.clearance} onChange={(event) => updateNumber("clearance", event.target.value)} /><em>mm</em></div>
            <small>Space between fitted parts.</small>
          </label>
        )}
        {spec.dimensionIntent === "available-envelope" && <label className="field dimension-field">
          <span>Top clearance</span>
          <div className="input-unit"><input type="number" min="0" step="0.1" value={spec.verticalClearance} onChange={(event) => updateNumber("verticalClearance", event.target.value)} /><em>mm</em></div>
          <small>Keeps the tray below the measured maximum height.</small>
        </label>}
        <label className="field dimension-field">
          <span>Corner radius</span>
          <div className="input-unit"><input type="number" min="0" step="0.5" value={spec.cornerRadius} onChange={(event) => updateNumber("cornerRadius", event.target.value)} /><em>mm</em></div>
          <small>Softens edges and stress points.</small>
        </label>
      </div>
      <div className="fit-preference">
        <span>Desired fit</span>
        <div className="segmented">{([['loose','Loose'],['sliding','Sliding'],['snug','Snug'],['press-fit','Press fit']] as const).map(([value,label]) => <button type="button" key={value} className={spec.fitPreference === value ? "active" : ""} onClick={() => updateField("fitPreference", value)}>{label}</button>)}</div>
      </div>
      <label className="field field-wide obstacles-field"><span>Obstacles, rails, lips, or taper</span><textarea rows={3} value={spec.obstacles} onChange={(event) => updateField("obstacles", event.target.value)} placeholder="None, or describe anything that reduces the opening at an edge or corner…" /><small>For a long drawer gap, measure both ends if the sides may not be parallel.</small></label>
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
        <label className="field"><span>Assembly</span><select value={spec.assemblyMethod} onChange={(event) => updateField("assemblyMethod", event.target.value)}><option>Single print</option><option>Placed end to end</option><option>Placed side by side</option><option>Slides together</option><option>Snap fit</option><option>Screws</option><option>Glue</option><option>Not sure yet</option></select></label>
      </div>
      <div className="strength-options">
        <span>Strength preference</span>
        <div className="segmented">
          {["Light", "Balanced", "Strong"].map((strength) => <button key={strength} className={spec.strength === strength ? "active" : ""} onClick={() => updateField("strength", strength)} type="button">{strength}</button>)}
        </div>
      </div>
      <div className="print-permission-row">
        <label className="toggle-row"><input type="checkbox" checked={spec.supportsAllowed} onChange={(event) => updateField("supportsAllowed", event.target.checked)} /><span><strong>Supports are acceptable</strong><small>Leave off for this open tray.</small></span></label>
        <label className="toggle-row"><input type="checkbox" checked={spec.brimAllowed} onChange={(event) => updateField("brimAllowed", event.target.checked)} /><span><strong>Brim is acceptable</strong><small>Bambu Studio may recommend it for adhesion.</small></span></label>
      </div>
    </section>,
    <section className="form-section review-section" key="review">
      <div className="section-heading review-heading">
        <span className="step-kicker">Step 4 of 4</span>
        <h2>Ready for one last check.</h2>
        <p>Confirm the fit, printer plan, and next action before creating or exporting anything.</p>
      </div>
      <div className="review-summary">
        <span className="brief-icon"><FileJson size={22} /></span>
        <div><small>PROJECT BRIEF</small><strong>{spec.name || "Untitled project"}</strong><p>{spec.description || "Add a short description before generating CAD."}</p></div>
        <span className={readyCount === checks.length ? "review-check-count ready" : "review-check-count warning"}>{readyCount}/{checks.length} checks</span>
      </div>

      <section className={`intent-confirmation ${spec.intentConfirmedAt ? "approved" : ""}`}>
        <div className="intent-confirmation-heading"><span><ShieldCheck size={18} /></span><div><small>INTENT CHECKPOINT</small><strong>{spec.intentConfirmedAt ? "Approved and frozen" : "Confirm the object before generating it"}</strong></div><em>{route.agents} agent{route.agents === 1 ? "" : "s"}</em></div>
        <p>
          {spec.objectIntent === "one-compartment" ? "One continuous open compartment" : spec.objectIntent.replaceAll("-", " ")}; {spec.gridRelationship === "adjacent-only" ? "sits beside Gridfinity without connecting" : spec.gridRelationship.replaceAll("-", " ")}; {spec.onePartRequired ? "one physical part" : `${spec.partCount} planned parts`}. Printed outside: {Number(outer.width.toFixed(1))} × {Number(outer.depth.toFixed(1))} × {Number(outer.height.toFixed(1))} mm{spec.geometryKind === "gridfinity-gap-tray" ? ", positioned at 45° on the P1S plate" : ""}.
        </p>
        <div className="intent-facts"><span><small>Measurement meaning</small><strong>{spec.dimensionIntent.replaceAll("-", " ")}</strong></span><span><small>Fit</small><strong>{spec.fitPreference}</strong></span><span><small>Workflow</small><strong>{route.label}</strong></span></div>
        <label className="field print-title-field"><span>Short print title</span><input value={spec.printTitle || suggestedPrintTitle(spec)} onChange={(event) => updateField("printTitle", event.target.value)} /></label>
        {!spec.intentConfirmedAt
          ? <button className="primary-button" type="button" disabled={!preApprovalReady} onClick={approveDesign}><Check size={17} /> Approve this design</button>
          : <button className="secondary-button" type="button" onClick={() => updateField("intentConfirmedAt", undefined)}><RotateCcw size={16} /> Reopen design</button>}
      </section>

      {gridfinityPlan && (
        <section className={`grid-fit-review ${gridfinityPlan.fullGridFits ? "fits" : "does-not-fit"} ${spec.geometryKind === "gridfinity-gap-tray" ? "selected" : ""}`}>
          <div className="grid-fit-heading">
            <span><Grid3X3 size={19} /></span>
            <div><small>{spec.geometryKind === "gridfinity-gap-tray" ? "GRIDFINITY GAP PLAN" : "42 MM GRID CHECK"}</small><strong>{spec.geometryKind === "gridfinity-gap-tray" ? "One custom zone beside the existing grid" : gridfinityPlan.fullGridFits ? "Standard cells fit this footprint" : "This strip is too narrow for a standard bin"}</strong></div>
            <em>{spec.geometryKind === "gridfinity-gap-tray" ? "Printable plan" : gridfinityPlan.fullGridFits ? "Compatible" : "Adjust plan"}</em>
          </div>
          <div className="grid-fit-stats">
            {spec.geometryKind === "gridfinity-gap-tray" ? <>
              <span><small>Measured zone</small><strong>{spec.width} × {spec.depth} × {spec.height} mm</strong><em>drawer opening</em></span>
              <span><small>Printed outside</small><strong>{Number(outer.width.toFixed(1))} × {Number(outer.depth.toFixed(1))} × {Number(outer.height.toFixed(1))} mm</strong><em>{spec.clearance} mm side · {spec.verticalClearance} mm top allowance</em></span>
              <span><small>Usable interior</small><strong>{Number((outer.width - spec.wall * 2).toFixed(1))} × {Number((outer.depth - spec.wall * 2).toFixed(1))} × {Number((outer.height - spec.floorThickness).toFixed(1))} mm</strong><em>one uninterrupted compartment</em></span>
            </> : <>
              <span><small>Along {spec.width} mm</small><strong>{gridfinityPlan.columns} cells</strong><em>{gridfinityPlan.columns * gridfinityPlan.pitch} mm used</em></span>
              <span><small>Across {spec.depth} mm</small><strong>{gridfinityPlan.rows} cells</strong><em>{gridfinityPlan.rows * gridfinityPlan.pitch} mm used</em></span>
              <span><small>Left over</small><strong>{gridfinityPlan.widthRemainder} × {gridfinityPlan.depthRemainder} mm</strong><em>width × depth</em></span>
            </>}
          </div>
          <p className="grid-fit-guidance">
            {gridfinityPlan.fullGridFits
              ? `Center the full cells and distribute the ${gridfinityPlan.widthRemainder} mm × ${gridfinityPlan.depthRemainder} mm remainder as intentional edge space.`
              : `${Math.min(spec.width, spec.depth)} mm is ${Number((gridfinityPlan.standardBinFootprint - Math.min(spec.width, spec.depth)).toFixed(1))} mm narrower than a standard 41.5 mm bin footprint. Treat this measured zone as one custom gap-filler compartment beside the existing grid. Rotated 45°, its plate footprint is approximately ${gridfinityPlan.diagonalPlateSide} × ${gridfinityPlan.diagonalPlateSide} mm.`}
          </p>
          {gridfinityPlan.canGenerateGapTray && spec.geometryKind !== "gridfinity-gap-tray" && (
            <button className="grid-strip-action" type="button" onClick={enableGridfinityGapTray}><Grid3X3 size={17} /><span><strong>Build one continuous compartment</strong><small>Fits the {Math.max(spec.width, spec.depth)} × {Math.min(spec.width, spec.depth)} × {spec.height} mm zone · one diagonal P1S part</small></span><ChevronRight size={17} /></button>
          )}
          {spec.geometryKind === "gridfinity-gap-tray" && <div className="grid-strip-selected"><CircleCheck size={16} /><span>One-compartment printable geometry selected</span></div>}
        </section>
      )}

      <dl className="spec-list">
        <div><dt>Envelope</dt><dd>{spec.width} × {spec.depth} × {spec.height} mm</dd></div>
        {spec.geometryKind === "gridfinity-gap-tray" && <div><dt>Printed outside</dt><dd>{Number(outer.width.toFixed(1))} × {Number(outer.depth.toFixed(1))} × {Number(outer.height.toFixed(1))} mm</dd></div>}
        <div><dt>Construction</dt><dd>{spec.wall} mm walls · {spec.floorThickness} mm floor · {spec.cornerRadius} mm corners</dd></div>
        <div><dt>Print profile</dt><dd>P1S · {spec.nozzle} mm · {spec.plate}</dd></div>
        <div><dt>Part plan</dt><dd>{spec.partCount} {spec.partCount === 1 ? "part" : "parts"} · {spec.assemblyMethod}</dd></div>
      </dl>

      {hasPrintableGeometry ? <section className="bridge-card">
        <div className="bridge-heading">
          <span className="bridge-icon"><Link2 size={19} /></span>
          <div><small>BAMBU HANDOFF</small><strong>Create the STL locally</strong></div>
          <span className={`bridge-status ${bridgeState.status}`}>
            {bridgeState.status === "online" ? <Wifi size={13} /> : <WifiOff size={13} />}
            {bridgeState.status === "checking" ? "Checking" : bridgeState.status === "online" ? `Bridge ${bridgeState.version || "online"}` : "Bridge offline"}
          </span>
        </div>
        <div className="bridge-safety"><ShieldCheck size={16} /><p>PrintPath creates the local file. You still choose the filament, slice it, inspect the preview, and press Print in Bambu Studio.</p></div>
        {bridgeState.status === "offline" ? (
          <div className="bridge-setup"><p>Install and start the local helper on this computer, then retry.</p><div><button className="secondary-button" type="button" onClick={() => navigate("process")}>View print process <ExternalLink size={14} /></button><button className="secondary-button" type="button" onClick={() => void checkBridge()}>Retry connection</button></div></div>
        ) : !bridgeState.paired ? (
          <div className="bridge-pairing">
            <label><span>Pairing code from the Bridge window</span><input value={pairingCode} onChange={(event) => setPairingCode(event.target.value.toUpperCase())} placeholder="PP-XXXX-XXXX-XXXX" /></label>
            <button className="secondary-button" type="button" disabled={!pairingCode.trim()} onClick={() => void checkBridge(pairingCode)}>Pair this browser</button>
          </div>
        ) : (
          <div className="bridge-connected"><CircleCheck size={16} /><span>Paired locally. No Bambu account credentials are stored here.</span></div>
        )}
        {bridgeState.status === "online" && (
          <div className={`studio-availability ${bridgeState.bambuStudioDetected ? "detected" : "not-detected"}`}><span /><p>{bridgeState.bambuStudioDetected ? "Bambu Studio detected on this computer." : "Bambu Studio was not detected. Restart the helper after installing it, or choose Bambu Studio if Windows asks."}</p></div>
        )}
        <div className="geometry-readiness supported">
          <div><strong>{spec.geometryKind === "gridfinity-gap-tray" ? "One continuous compartment ready" : "Exact tray geometry available"}</strong><p>{spec.geometryKind === "gridfinity-gap-tray" ? "Creates one STL already rotated 45° for a safe single-part P1S plate layout." : "Creates a square-corner STL from these outer dimensions and wall thickness."}</p></div>
        </div>
        <button className="primary-button large" type="button" disabled={!bridgeState.paired || !hasPrintableGeometry || readyCount !== checks.length || handoffState.status === "sending"} onClick={() => void handoffToBambu()}>
          <ExternalLink size={18} /> {handoffState.status === "sending" ? "Creating local model…" : spec.geometryKind === "gridfinity-gap-tray" ? "Create one compartment and open in Bambu Studio" : "Create STL and open in Bambu Studio"}
        </button>
        {handoffState.message && <p className={`handoff-message ${handoffState.status}`}>{handoffState.message}</p>}
      </section> : (
        <section className="review-next-step">
          <span><Ruler size={19} /></span>
          <div><small>NEXT STEP</small><strong>The fit plan is ready; printable geometry is not.</strong><p>Export the reviewed specification now. PrintPath will not invent a Gridfinity base that does not fit your measured space.</p></div>
        </section>
      )}
      <button className={`${hasPrintableGeometry ? "secondary-button" : "primary-button"} large review-export`} onClick={exportSpec} type="button"><Download size={18} /> Export project spec</button>
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
            <button className={currentPage === "projects" ? "active" : ""} onClick={() => navigate("projects")}><Layers3 size={18} /><span>My projects</span><em>{SHOWCASED_PROJECT_COUNT}</em></button>
            <button className={currentPage === "library" ? "active" : ""} onClick={() => navigate("library")}><Sparkles size={18} /><span>Design library</span></button>
            <button className={currentPage === "process" ? "active" : ""} onClick={() => navigate("process")}><Link2 size={18} /><span>How it works</span></button>
            {currentPage === "workbench" && <button className="active" onClick={() => navigate("workbench")}><PencilRuler size={18} /><span>Active workbench</span></button>}
          </nav>
          <button className="new-project-button" onClick={() => requireMaker(startFresh)}>{accessMode === "maker" ? <Plus size={18} /> : <LockKeyhole size={17} />} New project</button>
        </div>
        <div className="sidebar-bottom">
          <div className="roadmap-card"><span><Sparkles size={16} /></span><strong>Building in public</strong><p>The living roadmap records shipped decisions, next improvements, and deferred work.</p><a href={roadmapUrl} target="_blank" rel="noreferrer">View roadmap <ChevronRight size={14} /></a></div>
          <button className={`settings-link ${currentPage === "settings" ? "active" : ""}`} onClick={() => navigate("settings")}><Settings size={18} /> Machine setup</button>
          {accessMode === "maker" ? (
            <button className="profile access-profile" onClick={() => void signOut()} aria-label="Sign out of Maker Mode">
              <span>NY</span><div><strong>{makerName || "Maker Mode"}</strong><small>Protected · sign out</small></div><LogOut size={16} />
            </button>
          ) : (
            <button className="profile access-profile public" onClick={() => requestMakerAccess()}>
              <span><LockKeyhole size={14} /></span><div><strong>Public showcase</strong><small>Sign in for Maker Mode</small></div><LogIn size={16} />
            </button>
          )}
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
          onOpenProject={() => requireMaker(() => navigate("workbench"))}
          onNewProject={() => requireMaker(startFresh)}
          onStartIdea={(idea) => requireMaker(() => startIdea(idea))}
          onUseTemplate={(template) => requireMaker(() => useTemplate(template))}
          onNozzleChange={(value) => updateField("nozzle", value)}
          onPlateChange={(value) => updateField("plate", value)}
          bridgeStatus={bridgeState.status}
          bridgePaired={bridgeState.paired}
          bridgeVersion={bridgeState.version}
          bambuStudioDetected={bridgeState.bambuStudioDetected}
          pairingCode={pairingCode}
          onPairingCodeChange={setPairingCode}
          onCheckBridge={() => void checkBridge(pairingCode)}
          projectId={projectId}
          projectCount={SHOWCASED_PROJECT_COUNT}
          versionCount={storeSummary.versionCount}
          storageProvider={storeSummary.provider}
          syncTarget={storeSummary.syncTarget}
          lastSavedAt={storeSummary.lastSavedAt}
          orchestrationLabel={route.label}
          orchestrationDetail={route.detail}
          orchestrationAgents={route.agents}
          projectApproved={Boolean(spec.intentConfirmedAt)}
          projectCompleted={Boolean(spec.completedAt)}
          accessMode={accessMode}
          aiConfigured={aiConfigured}
          onRequestAccess={() => requestMakerAccess()}
          onAskAi={askPrintPathAi}
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
                <button className="primary-button" onClick={() => { void saveCheckpoint("step-complete"); setActiveStep((step) => Math.min(steps.length - 1, step + 1)); }}>Continue <ChevronRight size={17} /></button>
              ) : (
                <button className="text-button review-done-button" disabled={!spec.intentConfirmedAt} onClick={completeProject}>{spec.completedAt ? "View completed project" : "Mark design complete"}</button>
              )}
            </div>
          </section>

          <section className="visual-panel">
            <PartPreview spec={spec} />
            <div className="metrics-row">
              <Metric icon={Clock3} label="Rough time" value={hasPrintableGeometry ? `~${estimatedHours} hr` : "Pending CAD"} detail={hasPrintableGeometry ? "geometry estimate" : "slice after geometry"} />
              <Metric icon={Layers3} label="Material" value={hasPrintableGeometry ? `~${estimatedGrams} g` : "Pending CAD"} detail={hasPrintableGeometry ? spec.material : "no volume yet"} />
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
      {loginOpen && (
        <div className="access-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !loginSubmitting) {
            pendingMakerAction.current = null;
            setLoginOpen(false);
          }
        }}>
          <section className="access-modal" role="dialog" aria-modal="true" aria-labelledby="maker-access-title">
            <button className="access-modal-close" onClick={() => { pendingMakerAction.current = null; setLoginOpen(false); }} aria-label="Close Maker Mode sign-in"><X size={18} /></button>
            <span className="access-modal-icon"><LockKeyhole size={22} /></span>
            <span className="page-eyebrow">Protected workspace</span>
            <h2 id="maker-access-title">Enter Maker Mode</h2>
            <p>The public site can browse projects and the design library. Signing in unlocks project editing and the rate-limited AI design intake.</p>
            <form onSubmit={(event) => void signIn(event)}>
              <label><span>Username</span><input autoFocus autoComplete="username" value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} required /></label>
              <label><span>Password</span><input type="password" autoComplete="current-password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required /></label>
              {loginError && <p className="access-modal-error" role="alert">{loginError}</p>}
              <button className="primary-button" type="submit" disabled={loginSubmitting}>{loginSubmitting ? "Checking…" : <><LogIn size={16} /> Unlock Maker Mode</>}</button>
            </form>
            <small><ShieldCheck size={13} /> Credentials go only to the Cloudflare Worker and are never stored in browser code.</small>
          </section>
        </div>
      )}
    </div>
  );
}
