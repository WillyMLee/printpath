import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Box,
  Cable,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Coins,
  Component,
  CreditCard,
  Database,
  Download,
  Droplets,
  ExternalLink,
  Flower2,
  Gauge,
  Gamepad2,
  Gem,
  Grid3X3,
  GitBranch,
  HardDrive,
  KeyRound,
  Layers3,
  LayoutGrid,
  Link2,
  LockKeyhole,
  PackageCheck,
  PackageOpen,
  PanelsTopLeft,
  Plus,
  Printer,
  Ruler,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Sprout,
  WandSparkles,
  Wifi,
  WifiOff,
  Wrench,
  Workflow,
} from "lucide-react";

export type AppPage = "overview" | "projects" | "library" | "process" | "workbench" | "settings";

export type StarterTemplate =
  | "grid-fit-tile" | "loose-tray" | "drawer-strip" | "grid-customizer" | "grid-edge-filler" | "grid-fractional-bin"
  | "token-tray" | "card-holder" | "board-game-insert"
  | "vanity-organizer" | "toothbrush-dock"
  | "nightstand-dock" | "jewelry-tray"
  | "plant-drip-tray" | "trellis-clips" | "propagation-stand"
  | "utensil-tray" | "sink-caddy" | "bag-clip"
  | "cable-guide" | "wall-hook" | "blank";

type DashboardProps = {
  page: Exclude<AppPage, "workbench">;
  activeProjectName: string;
  nozzle: number;
  plate: string;
  onNavigate: (page: AppPage) => void;
  onOpenProject: () => void;
  onNewProject: () => void;
  onStartIdea: (idea: string) => void;
  onUseTemplate: (template: StarterTemplate) => void;
  onNozzleChange: (value: number) => void;
  onPlateChange: (value: string) => void;
  bridgeStatus: "checking" | "online" | "offline";
  bridgePaired: boolean;
  bridgeVersion?: string;
  bambuStudioDetected?: boolean;
  pairingCode: string;
  onPairingCodeChange: (value: string) => void;
  onCheckBridge: () => void;
  projectId: string;
  projectCount: number;
  versionCount: number;
  storageProvider: string;
  syncTarget: string;
  lastSavedAt?: string;
  orchestrationLabel: string;
  orchestrationDetail: string;
  orchestrationAgents: number;
  projectApproved: boolean;
  projectCompleted: boolean;
  accessMode: "checking" | "public" | "maker";
  aiConfigured: boolean;
  onRequestAccess: () => void;
  onAskAi: (idea: string) => Promise<string>;
};

const plateOptions = [
  "Textured PEI Plate",
  "Smooth PEI / High Temp Plate",
  "Cool Plate",
  "Engineering Plate",
];

type VaseVersionId = "petal-twist" | "leaf-bloom";
type ProjectFilter = "all" | "progress" | "ready" | "completed";

const projectCards = [
  {
    name: "Drawer Gap Tray",
    kind: "Custom fit",
    status: "Completed",
    statusClass: "complete",
    parts: "1 part · 1 plate",
    printFacts: { plates: "1", prints: "1", components: "1", material: "≈111 g PLA", time: "≈4–6 hr" },
    estimateNote: "Calculated from the approved tray geometry · confirm in Bambu Studio",
    next: "Ready to reprint",
    confidence: 100,
    cover: "/projects/drawer-gap-tray-aug-2026-product.png",
    filter: "completed" as Exclude<ProjectFilter, "all">,
    artIndex: 1,
    target: "drawer-gap-tray",
  },
  {
    name: "Petal Twist Vase",
    kind: "Floral vase",
    status: "Design review",
    statusClass: "progress",
    parts: "1 part · 1 plate",
    printFacts: { plates: "1", prints: "1", components: "1", material: "≈260 g PETG", time: "≈9 hr" },
    estimateNote: "Geometry-based planning estimate · Bambu Studio supplies the final sliced values",
    next: "Approve shape + water test",
    confidence: 86,
    cover: "/projects/petal-twist-vase-aug-2026-product.png",
    filter: "progress" as Exclude<ProjectFilter, "all">,
    artIndex: 2,
    target: "vase-history-title",
  },
  {
    name: "7 Wonders Duel Organizer",
    kind: "Board game insert",
    status: "Layout v1",
    statusClass: "progress",
    parts: "4 modules · 2 plates",
    printFacts: { plates: "2 planned", prints: "2", components: "4 modules", material: "Pending CAD", time: "Pending CAD" },
    estimateNote: "Concept layout only · material and time begin after printable geometry exists",
    next: "Confirm box + sleeve measurements",
    confidence: 72,
    cover: "/projects/seven-wonders-duel-organizer-concept.svg",
    filter: "progress" as Exclude<ProjectFilter, "all">,
    artIndex: 3,
    target: "seven-wonders-organizer",
  },
  {
    name: "Cozy Stickerville Organizer",
    kind: "Campaign insert",
    status: "Dimensions mapped",
    statusClass: "progress",
    parts: "4 modules · 2 plates",
    printFacts: { plates: "2 planned", prints: "2", components: "4 modules", material: "Pending CAD", time: "Pending CAD" },
    estimateNote: "Published box and card sizes mapped · material follows layout CAD",
    next: "Confirm inside box + supplied save box",
    confidence: 64,
    cover: "/projects/cozy-stickerville-organizer-concept.svg?v=2",
    filter: "progress" as Exclude<ProjectFilter, "all">,
    artIndex: 4,
    target: "cozy-stickerville-organizer",
  },
  {
    name: "Magnetic Hex Token Pods",
    kind: "Modular token system",
    status: "Alpha STL",
    statusClass: "ready",
    parts: "5 printable files · 1 plate",
    printFacts: { plates: "1", prints: "2 staged", components: "8 printed + 6 magnets", material: "≈40 g PLA", time: "≈3 hr" },
    estimateNote: "One pod, six cups, and the fit coupon · print the coupon first",
    next: "Print 6 × 2 mm magnet coupon",
    confidence: 78,
    cover: "/projects/magnetic-hex-token-system-concept.svg",
    filter: "ready" as Exclude<ProjectFilter, "all">,
    artIndex: 5,
    target: "magnetic-token-system",
  },
];

const SELECTED_VASE_VERSION_KEY = "printpath-selected-vase-version-v1";

const vaseVersions = [
  {
    id: "petal-twist" as const,
    version: 1,
    name: "Petal Twist Vase",
    image: "/projects/petal-twist-vase-aug-2026-product.png",
    stl: "/projects/petal-twist-vase-aug-2026.stl",
    guide: "/projects/petal-twist-vase-aug-2026-print-guide.md",
    dimensions: "122.6 × 122.6 × 245 mm",
    opening: "≈77 mm opening",
    description: "The original eight-flute vase with a stable bulb-shaped base and a soft scalloped rim.",
    historyNote: "Original eight-flute body with a compact scalloped opening and softly rounded base.",
    facts: [["122.6 × 122.6 × 245 mm", "P1S-safe size"], ["2.4 mm", "Continuous wall"], ["PETG", "One-piece body"]],
  },
  {
    id: "leaf-bloom" as const,
    version: 2,
    name: "Leaf Bloom Vase",
    image: "/projects/leaf-bloom-vase-aug-2026-product.png",
    stl: "/projects/leaf-bloom-vase-aug-2026.stl",
    guide: "/projects/leaf-bloom-vase-aug-2026-print-guide.md",
    dimensions: "122.9 × 122.5 × 245 mm",
    opening: "≈105 mm opening",
    description: "Seven leaf-like folds rise into a wider, gently flared opening for fuller greenery.",
    historyNote: "Seven twisted botanical folds and a wider flared opening for fuller, leaf-heavy arrangements.",
    facts: [["122.9 × 122.5 × 245 mm", "P1S-safe size"], ["≈105 mm", "Average inner opening"], ["PETG", "One-piece body"]],
  },
];

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <span className="page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function PrinterProfile({ nozzle, plate, compact = false }: { nozzle: number; plate: string; compact?: boolean }) {
  return (
    <div className={`printer-profile ${compact ? "compact" : ""}`}>
      <div className="printer-visual" aria-hidden="true">
        <div className="printer-frame"><span /><i /></div>
      </div>
      <div className="printer-copy">
        <span className="page-eyebrow">Your machine</span>
        <h3>Bambu Lab P1S</h3>
        <div className="profile-pills">
          <span><Box size={13} /> 256³ mm</span>
          <span><CircleDot size={13} /> {nozzle} mm</span>
          <span><Layers3 size={13} /> {plate}</span>
        </div>
      </div>
      <span className="profile-ready"><Check size={13} /> Profile active</span>
    </div>
  );
}

function GridTileGraphic() {
  return (
    <div className="grid-tile-graphic" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => <span key={index}><i /></span>)}
      <em>42 mm</em>
    </div>
  );
}

function OverviewPage(props: DashboardProps) {
  const [idea, setIdea] = useState("");
  const [aiBrief, setAiBrief] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const suggestions = ["A holder for…", "An organizer that fits…", "A replacement for…"];

  async function askAi() {
    if (props.accessMode !== "maker") {
      props.onRequestAccess();
      return;
    }
    setAiLoading(true);
    setAiBrief("");
    setAiError("");
    try {
      setAiBrief(await props.onAskAi(idea.trim()));
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "PrintPath AI could not complete that request.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="What should we make?"
        description="Describe the problem first. PrintPath will turn it into measurements, checks, and a P1S-ready plan."
        action={<button className="primary-button page-action" onClick={props.onNewProject}><Plus size={17} /> New project</button>}
      />

      <div className="overview-grid">
        <section className="confidence-hero make-design-hero">
          <div className="confidence-copy make-design-copy">
            <span className="recommendation-tag"><WandSparkles size={14} /> Design workspace</span>
            <span className="page-eyebrow">Start with ordinary words</span>
            <h2>Make a Design.</h2>
            <p>Tell us what should fit, hold, replace, or organize. You do not need CAD language or perfect measurements yet.</p>
            <div className="idea-composer">
              <textarea value={idea} onChange={(event) => setIdea(event.target.value)} rows={3} placeholder="Example: A narrow tray for the bathroom drawer that fits between the sink pipes…" />
              <div className="idea-composer-footer">
                <div className="idea-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setIdea(suggestion)}>{suggestion}</button>)}</div>
                <div className="idea-actions">
                  <button className="guided-design-button" disabled={!idea.trim()} onClick={() => props.onStartIdea(idea.trim())}>Guided setup</button>
                  <button className="primary-button" disabled={!idea.trim() || aiLoading || props.accessMode === "checking"} onClick={() => void askAi()}>
                    {props.accessMode === "maker" ? <WandSparkles size={16} /> : <LockKeyhole size={15} />}
                    {aiLoading ? "Thinking…" : props.accessMode === "maker" ? "Ask PrintPath AI" : "Unlock AI"}
                  </button>
                </div>
              </div>
              <div className={`ai-access-note ${props.accessMode}`}>
                {props.accessMode === "maker"
                  ? <><ShieldCheck size={14} /><span>{props.aiConfigured ? "Protected Maker Mode · AI requests are authenticated and rate-limited." : "Maker Mode is unlocked · add an OpenAI key to activate AI briefs."}</span></>
                  : <><LockKeyhole size={14} /><span>Public preview · browsing is free; AI requests require Maker Mode.</span></>}
              </div>
              {aiError && <p className="ai-response-error" role="alert">{aiError}</p>}
              {aiBrief && <div className="ai-brief"><span>AI DESIGN INTAKE</span><p>{aiBrief}</p><button onClick={() => props.onStartIdea(`${idea.trim()}\n\nPrintPath AI intake:\n${aiBrief}`)}>Continue with this brief <ArrowRight size={14} /></button></div>}
            </div>
          </div>
          <div className="design-orbit" aria-hidden="true">
            <span className="orbit-core"><WandSparkles size={35} /></span>
            <span className="orbit-item orbit-one"><Ruler size={17} /><em>Measure</em></span>
            <span className="orbit-item orbit-two"><ShieldCheck size={17} /><em>Check</em></span>
            <span className="orbit-item orbit-three"><Printer size={17} /><em>Prepare</em></span>
            <i className="orbit-ring ring-one" /><i className="orbit-ring ring-two" />
          </div>
        </section>

        <section className="overview-printer-card">
          <PrinterProfile nozzle={props.nozzle} plate={props.plate} />
          <div className="safe-defaults">
            <span><BadgeCheck size={18} /></span>
            <div><strong>Safe starting profile</strong><p>0.4 mm nozzle · 0.20 mm layer · PLA · {props.plate}</p></div>
          </div>
          <button className="text-link" onClick={() => props.onNavigate("settings")}>Review machine setup <ChevronRight size={15} /></button>
        </section>
      </div>

      <section className="gridfinity-popular page-card">
        <div className="card-heading-row">
          <div><span className="page-eyebrow">Popular customization</span><h2>Gridfinity for dimensions that do not divide evenly</h2><p>Use the 42 mm system where it helps, then solve the awkward leftover space deliberately.</p></div>
          <button className="text-link" onClick={() => props.onNavigate("library")}>See all Gridfinity options <ChevronRight size={15} /></button>
        </div>
        <div className="popular-template-row">
          <button onClick={() => props.onUseTemplate("grid-customizer")}><span className="popular-art grid-art"><LayoutGrid size={25} /></span><div><em>Most popular</em><strong>Custom drawer layout</strong><p>Full cells plus centered edge margins for an exact drawer footprint.</p><small><Ruler size={13} /> Starts from drawer width + depth</small></div><ArrowRight size={17} /></button>
          <button onClick={() => props.onUseTemplate("grid-edge-filler")}><span className="popular-art filler-art"><PanelsTopLeft size={25} /></span><div><em>Finishing piece</em><strong>Edge & corner fillers</strong><p>Purpose-built strips that stop the usable grid from sliding around.</p><small><PackageCheck size={13} /> 1–4 simple parts</small></div><ArrowRight size={17} /></button>
          <button onClick={() => props.onUseTemplate("grid-fractional-bin")}><span className="popular-art fraction-art"><Grid3X3 size={25} /></span><div><em>Flexible sizing</em><strong>Fractional bins</strong><p>Half- and quarter-width bins for spaces a standard cell cannot use.</p><small><Box size={13} /> Test fit included</small></div><ArrowRight size={17} /></button>
        </div>
      </section>

      <div className="overview-lower-grid">
        <section className="page-card recent-projects">
          <div className="card-heading-row"><div><span className="page-eyebrow">Your projects</span><h2>Pick up where you left off</h2></div><button className="text-link" onClick={() => props.onNavigate("projects")}>View all <ChevronRight size={15} /></button></div>
          <button className="recent-project-row" onClick={() => props.onNavigate("projects")}>
            <span className="project-cover-thumb"><img src="/projects/petal-twist-vase-aug-2026-product.png" alt="Rendered Petal Twist Vase" /></span>
            <div><strong>Petal Twist Vase</strong><small>245 mm tall · PETG · 2 saved versions</small></div>
            <span className="review-mini">Review draft</span>
            <ChevronRight size={17} />
          </button>
          <button className="recent-project-row" onClick={props.onOpenProject}>
            <span className="project-cover-thumb"><img src="/projects/drawer-gap-tray-aug-2026-product.png" alt="Rendered Drawer Gap Tray" /></span>
            <div><strong>Drawer Gap Tray</strong><small>254.4 × 39.4 × 49.4 mm · one part</small></div>
            <span className="completed-mini"><Check size={12} /> Completed</span>
            <ChevronRight size={17} />
          </button>
        </section>

        <section className="page-card compound-preview">
          <span className="page-eyebrow">When a project has many parts</span>
          <h2>You’ll get a plate-by-plate plan.</h2>
          <div className="mini-plates" aria-hidden="true"><span><i /><i /></span><span><i /><i /><i /></span><span><i /></span></div>
          <p>Every compound project will show part names, plate order, estimated time, assembly order, and a test-fit checkpoint.</p>
          <button className="text-link" onClick={() => props.onNavigate("projects")}>See the multi-part scaffold <ArrowRight size={15} /></button>
        </section>
      </div>
    </>
  );
}

function ProjectsPage(props: DashboardProps) {
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("all");
  const [selectedVaseId, setSelectedVaseId] = useState<VaseVersionId>(() => {
    try {
      return localStorage.getItem(SELECTED_VASE_VERSION_KEY) === "leaf-bloom" ? "leaf-bloom" : "petal-twist";
    } catch {
      return "petal-twist";
    }
  });
  const selectedVase = vaseVersions.find((version) => version.id === selectedVaseId) ?? vaseVersions[0];
  const filteredProjects = projectFilter === "all" ? projectCards : projectCards.filter((project) => project.filter === projectFilter);
  const filterOptions: Array<{ id: ProjectFilter; label: string; count: number }> = [
    { id: "all", label: "All projects", count: projectCards.length },
    { id: "progress", label: "In progress", count: projectCards.filter((project) => project.filter === "progress").length },
    { id: "ready", label: "Ready", count: projectCards.filter((project) => project.filter === "ready").length },
    { id: "completed", label: "Completed", count: projectCards.filter((project) => project.filter === "completed").length },
  ];
  const selectVase = (id: VaseVersionId) => {
    setSelectedVaseId(id);
    try { localStorage.setItem(SELECTED_VASE_VERSION_KEY, id); } catch { /* Local persistence is optional. */ }
    document.querySelector(".completed-project-feature")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <>
      <PageHeader
        eyebrow="My projects"
        title="Every print has a plan."
        description="Single parts stay simple. Compound projects are broken into plates, checkpoints, and assembly steps."
        action={<button className="primary-button page-action" onClick={props.onNewProject}><Plus size={17} /> New project</button>}
      />
      <section className="completed-project-feature design-review-feature page-card">
        <div className="completed-project-cover"><img src={selectedVase.image} alt={`Isometric render of the selected ${selectedVase.name} STL`} /></div>
        <div className="completed-project-copy">
          <span className="completion-kicker review">{selectedVase.id === "petal-twist" ? <Flower2 size={15} /> : <Sprout size={15} />} Selected design · Version {selectedVase.version}</span>
          <h2>{selectedVase.name}</h2>
          <p>{selectedVase.description} This selection controls the preview, download, and print approach shown here.</p>
          <div className="completed-project-facts">{selectedVase.facts.map(([value, label]) => <span key={label}><strong>{value}</strong><small>{label}</small></span>)}</div>
          <div className="completed-project-actions"><a className="primary-button" href={selectedVase.stl} download><Download size={16} /> Download selected STL</a><a className="secondary-button" href={selectedVase.guide} target="_blank" rel="noreferrer"><ShieldCheck size={16} /> Print approach</a></div>
        </div>
      </section>

      <section className="design-history page-card" aria-labelledby="vase-history-title">
        <div className="card-heading-row">
          <div><span className="page-eyebrow">Vase project · Design history</span><h2 id="vase-history-title">Every version stays in the record.</h2><p>New directions never replace earlier work. Each version keeps its preview, design notes, and printable STL.</p></div>
          <span className="version-count">2 saved versions</span>
        </div>
        <div className="design-version-grid">
          {vaseVersions.map((version) => {
            const selected = version.id === selectedVaseId;
            return <article className={`design-version-card ${selected ? "selected" : ""}`} key={version.id}>
              <div className="design-version-art"><img src={version.image} alt={`${version.name} version ${version.version}`} /></div>
              <div className="design-version-copy">
                <div className="design-version-meta"><span>Version {version.version} · Aug 2026</span><em className={selected ? "" : "experiment"}>{selected ? <><Check size={12} /> Selected</> : <><Sprout size={12} /> Saved design</>}</em></div>
                <h3>{version.name}</h3>
                <p>{version.historyNote}</p>
                <div className="design-version-facts"><span>{version.dimensions}</span><span>{version.opening}</span></div>
                <div className="design-version-actions"><button className={selected ? "selected-version-button" : "version-select-button"} onClick={() => selectVase(version.id)} disabled={selected}>{selected ? <><Check size={14} /> Currently selected</> : <>Select this version <ArrowRight size={14} /></>}</button><a className="version-download" href={version.stl} download><Download size={14} /> STL</a></div>
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="vase-inspiration page-card" aria-labelledby="vase-inspiration-title">
        <div className="card-heading-row">
          <div><span className="page-eyebrow">Thangs research · Original directions</span><h2 id="vase-inspiration-title">Four ideas worth translating—not copying.</h2><p>The strongest references combine one memorable silhouette with support-free surface rhythm. Any new PrintPath version will keep the 245 mm P1S height, a real-water wall, and its own geometry.</p></div>
          <span className="version-count">Inspiration board</span>
        </div>
        <div className="vase-inspiration-grid">
          <article><div className="vase-study-art spiral"><i /><i /><i /></div><span>01 · Quiet Spiral</span><h3>Fine ribs, wide base, calmer neck.</h3><p>The most natural evolution of Petal Twist: reduce the large flutes and let many subtle ribs catch light behind leafy stems.</p><a href="https://thangs.com/designer/Slimprint/post/New%20design%3A%20vase%20SUSAN-252156" target="_blank" rel="noreferrer">View Susan reference <ExternalLink size={13} /></a></article>
          <article><div className="vase-study-art fan"><i /><i /><i /><i /></div><span>02 · Fan Fold</span><h3>Pleats converge into an asymmetric crown.</h3><p>Strong with eucalyptus or pampas: architectural folds below, a playful serrated rim above, and a broad planted base.</p><a href="https://thangs.com/designer/Slimprint/post/New%20design%3A%20Vase%20SENSU-252432" target="_blank" rel="noreferrer">View Sensu reference <ExternalLink size={13} /></a></article>
          <article><div className="vase-study-art cloud"><i /><i /><i /></div><span>03 · Cloud Stack</span><h3>Soft rings with a structured silhouette.</h3><p>Friendly and tactile, with stacked rounded volumes that feel more playful than the current botanical versions.</p><a href="https://thangs.com/designer/Core%20Essentials/3d-model/Ona%20Vase-1461516" target="_blank" rel="noreferrer">View Ona reference <ExternalLink size={13} /></a></article>
          <article><div className="vase-study-art fold"><i /><i /></div><span>04 · Folded Sweep</span><h3>One dramatic fold and an offset rim.</h3><p>A statement-piece direction: asymmetric movement, a stable heavy-looking foot, and enough mouth area for a loose leafy bouquet.</p><a href="https://thangs.com/designer/DeskFormStudio/3d-model/Modern%20Organic%20Sculptural%20Vase%20-%20Fluid%20Geometric%20Folded%20Decor%20-%203D%20Printable%20Olive%20Green%20Vessel-1510401/memberships" target="_blank" rel="noreferrer">View folded reference <ExternalLink size={13} /></a></article>
        </div>
      </section>

      <div className="project-filter-row" aria-label="Filter projects">{filterOptions.map((filter) => <button className={projectFilter === filter.id ? "active" : ""} aria-pressed={projectFilter === filter.id} key={filter.id} onClick={() => setProjectFilter(filter.id)}>{filter.label} <span>{filter.count}</span></button>)}</div>
      <div className="project-estimate-key"><Gauge size={15} /><span><strong>Print planning facts</strong> Material is calculated only when geometry exists; concepts remain “Pending CAD.” Bambu Studio supplies the final time.</span></div>
      {filteredProjects.length > 0 ? <div className="project-card-grid">
        {filteredProjects.map((project) => (
          <button className="project-card" key={project.name} onClick={() => project.name === "Drawer Gap Tray" ? props.onOpenProject() : document.getElementById(project.target)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            <div className={`project-art project-art-${project.artIndex}`}>{project.cover ? <img src={project.cover} alt={`${project.name} cover`} /> : <span><Component size={30} /></span>}<em>{project.kind}</em></div>
            <div className="project-card-body">
              <div className="project-card-title"><h2>{project.name}</h2><span className={`status-chip ${project.statusClass}`}>{project.status}</span></div>
              <p>{project.parts}</p>
              <div className="project-print-facts" aria-label={`${project.name} print estimates`}>
                <span><Layers3 size={15} /><small>Plates</small><strong>{project.printFacts.plates}</strong></span>
                <span><Printer size={15} /><small>Prints</small><strong>{project.printFacts.prints}</strong></span>
                <span><Component size={15} /><small>Components</small><strong>{project.printFacts.components}</strong></span>
                <span><Box size={15} /><small>Material</small><strong>{project.printFacts.material}</strong></span>
                <span><Clock3 size={15} /><small>Time</small><strong>{project.printFacts.time}</strong></span>
              </div>
              <div className="project-estimate-note"><Gauge size={13} /><span>{project.estimateNote}</span></div>
              <div className="project-next"><span>Next step</span><strong>{project.next}</strong></div>
              <div className="confidence-meter"><span style={{ width: `${project.confidence}%` }} /><em>{project.confidence}% confidence</em></div>
            </div>
          </button>
        ))}
      </div> : <div className="project-empty-state"><PackageOpen size={24} /><div><strong>No {projectFilter === "ready" ? "ready-to-print" : projectFilter} projects yet.</strong><p>Projects will appear here as they move through the design and print checks.</p></div></div>}

      <section className="organizer-concept page-card" id="seven-wonders-organizer" aria-labelledby="organizer-title">
        <div className="card-heading-row"><div><span className="page-eyebrow">Board Games · Layout v1</span><h2 id="organizer-title">7 Wonders Duel organizer</h2><p>A concrete four-module reference layout for the base game, with measurements still acting as the final CAD gate.</p></div><span className="research-badge"><Gamepad2 size={14} /> Reference envelope</span></div>
        <div className="organizer-concept-grid">
          <div className="organizer-concept-art"><img src="/projects/seven-wonders-duel-organizer-concept.svg" alt="Four-module organizer concept for 7 Wonders Duel" /></div>
          <div className="organizer-concept-copy">
            <span className="recommendation-tag"><BadgeCheck size={14} /> 196 × 196 × 42 mm reference · P1S · 4 modules</span>
            <h3>The layout is assigned. Fit is the remaining question.</h3>
            <p>The 196 mm square reference is split by a 2 mm service gap. All four modules fit on one P1S plate, but two staged plates reduce the cost of a sleeve-clearance mistake.</p>
            <div className="organizer-module-grid">
              <span><CreditCard size={17} /><strong>Age card bank</strong><small>121.5 × 117.5 × 28 mm · two broad wells + dividers</small></span>
              <span><Gem size={17} /><strong>Wonder cradle</strong><small>72.5 × 117.5 × 28 mm · large cards + thumb ramp</small></span>
              <span><Coins size={17} /><strong>Coin bank</strong><small>121.5 × 76.5 × 28 mm · three table-ready wells</small></span>
              <span><Gamepad2 size={17} /><strong>Token caddy</strong><small>72.5 × 76.5 × 28 mm · Progress, Military, Conflict</small></span>
            </div>
            <div className="organizer-gates"><strong>Five checks before STL</strong><span>1. Box width + depth at two heights</span><span>2. Usable height under boards and rules</span><span>3. Thickest deck dimensions + sleeves</span><span>4. Base game or expansion reserve</span><span>5. Flat or vertical storage</span></div>
            <button className="primary-button organizer-start" onClick={() => props.onStartIdea("A modular 7 Wonders Duel box organizer for the base game with four lift-out zones: three Age decks plus Guild cards, the 12 Wonder cards, a three-value coin bank, and a token caddy for Progress, Military, and Conflict pieces. Confirm inside box dimensions, sleeves, expansions, and vertical storage before CAD.")}>Start measured organizer <ArrowRight size={16} /></button>
            <div className="organizer-sources"><span>Open:</span><a href="/projects/seven-wonders-duel-organizer-v1-aug-2026.md" target="_blank" rel="noreferrer">Layout packet</a><a href="https://sevenwondersduel.com/" target="_blank" rel="noreferrer">Official contents</a><a href="https://foldedspace.com/download/product/public/7-wonders-duel/file_65158f4e336c5.pdf" target="_blank" rel="noreferrer">Packing reference</a></div>
          </div>
        </div>
      </section>

      <section className="organizer-concept page-card cozy-organizer" id="cozy-stickerville-organizer" aria-labelledby="cozy-organizer-title">
        <div className="card-heading-row"><div><span className="page-eyebrow">Board Games · Campaign organizer</span><h2 id="cozy-organizer-title">Cozy Stickerville</h2><p>A campaign-state insert built around ten Event decks, an ordered Catalog, four shared resources, and the supplied save-game box.</p></div><span className="research-badge"><Sprout size={14} /> Web dimensions mapped</span></div>
        <div className="organizer-concept-grid">
          <div className="organizer-concept-art"><img src="/projects/cozy-stickerville-organizer-concept.svg?v=2" alt="Four-module Cozy Stickerville organizer concept" /></div>
          <div className="organizer-concept-copy">
            <span className="recommendation-tag"><BadgeCheck size={14} /> 305 × 225 × 51 mm box · 181 cards at 63 × 88 mm</span>
            <h3>Organize the campaign, not just the components.</h3>
            <p>The design separates archived years from the active year and turns the resource storage into four lift-out table bowls. The map, sticker book, and storybook stay as a supported flat layer.</p>
            <div className="organizer-module-grid">
              <span><Layers3 size={17} /><strong>Year Library</strong><small>120 cards · ten 12-card Event decks · 63 × 88 mm</small></span>
              <span><CreditCard size={17} /><strong>Catalog Library</strong><small>60 Catalog cards + reference · 63 × 88 mm</small></span>
              <span><Sprout size={17} /><strong>Resource Village</strong><small>Wood, Food, Gold, Ore, and die in lift-out bowls</small></span>
              <span><PackageCheck size={17} /><strong>Save-Game Dock</strong><small>Preserves the supplied box and current campaign state</small></span>
            </div>
            <div className="organizer-gates"><strong>Three physical checks before CAD</strong><span>1. Inside box width, depth, and usable height</span><span>2. Supplied save-game box outside size</span><span>3. Flat map/book stack thickness + storage orientation</span></div>
            <button className="primary-button organizer-start" onClick={() => props.onStartIdea("A Cozy Stickerville campaign organizer for the published 305 × 225 × 51 mm box and 181 unsleeved 63 × 88 mm cards, with a ten-deck Year Library, ordered Catalog Library, four lift-out resource bowls, a die home, a dock for the supplied save-game box, and a supported top layer for the map, sticker book, and storybook. Confirm only the inside box dimensions, supplied save box outside size, and flat stack thickness plus storage orientation before CAD.")}>Confirm Cozy fit <ArrowRight size={16} /></button>
            <div className="organizer-sources"><span>Open:</span><a href="/projects/cozy-stickerville-organizer-v1-aug-2026.md" target="_blank" rel="noreferrer">Campaign packet</a><a href="https://www.hugendubel.de/de/spielware/corey_konieczka-unexpected_games_cozy_stickerville-52767357-produkt-details.html" target="_blank" rel="noreferrer">Box dimensions</a><a href="https://fundas.online/juegos/cozy-stickerville" target="_blank" rel="noreferrer">Card dimensions</a><a href="https://www.asmodee.ca/en/product/cozy-stickerville/" target="_blank" rel="noreferrer">Official contents</a></div>
          </div>
        </div>
      </section>

      <section className="organizer-concept page-card magnetic-organizer" id="magnetic-token-system" aria-labelledby="magnetic-token-title">
        <div className="card-heading-row"><div><span className="page-eyebrow">Board Games · Printable alpha</span><h2 id="magnetic-token-title">Magnetic Hex Token Pods</h2><p>A reusable polygon tray system with optional one-, two-, and three-zone interiors plus replaceable 6 × 2 mm magnet cups.</p></div><span className="ready-project-badge"><PackageCheck size={14} /> Alpha STL ready</span></div>
        <div className="organizer-concept-grid">
          <div className="organizer-concept-art"><img src="/projects/magnetic-hex-token-system-concept.svg" alt="Three magnetically connected hex token trays" /></div>
          <div className="organizer-concept-copy">
            <div className="project-spec-strip">
              <span><Ruler size={16} /><small>Pod size</small><strong>96 × 83.1 × 22 mm</strong></span>
              <span><Printer size={16} /><small>Print setup</small><strong>P1S · one plate</strong></span>
              <span><Component size={16} /><small>Starter set</small><strong>1 pod · 6 cups</strong></span>
            </div>
            <h3>Print the magnet coupon before the tray.</h3>
            <p>The tray itself is a clean manifold shell. Separate glue-on magnet cups keep the first prototype support-free, repairable, and safer to iterate if your magnets measure differently.</p>
            <div className="project-primary-actions">
              <a className="primary-button" href="/projects/magnetic-hex-token-tray-fit-coupon-aug-2026.stl" download><Download size={16} /> Magnet coupon first</a>
              <a className="secondary-button" href="/projects/magnetic-hex-token-system-aug-2026-print-guide.md" target="_blank" rel="noreferrer">Print guide <ArrowRight size={15} /></a>
            </div>
            <details className="project-file-drawer">
              <summary><span>Tray variants and component files</span><small>4 additional STLs</small><ChevronRight size={16} /></summary>
              <div className="project-file-grid">
                <a href="/projects/magnetic-hex-token-tray-single-aug-2026.stl" download><Download size={15} /><span><strong>Single well</strong><small>General tokens</small></span></a>
                <a href="/projects/magnetic-hex-token-tray-split-aug-2026.stl" download><Download size={15} /><span><strong>Split well</strong><small>Two token groups</small></span></a>
                <a href="/projects/magnetic-hex-token-tray-triple-aug-2026.stl" download><Download size={15} /><span><strong>Triple well</strong><small>Three token groups</small></span></a>
                <a href="/projects/magnetic-hex-token-magnet-cup-6x2-aug-2026.stl" download><Download size={15} /><span><strong>Magnet cup</strong><small>6 × 2 mm magnet</small></span></a>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="next-project-section page-card">
        <div className="card-heading-row"><div><span className="page-eyebrow">What should we solve next?</span><h2>Three useful steps up from the gap tray</h2><p>Each option reuses the same measure → confirm → generate → handoff loop, with one new design challenge at a time.</p></div></div>
        <div className="next-project-grid">
          <button onClick={() => props.onStartIdea("A measured drawer-divider end cap that fills a leftover gap and stops an existing divider from shifting.")}><span><PanelsTopLeft size={20} /></span><div><em>Fastest follow-up</em><strong>Drawer divider end cap</strong><small>One fit surface · one part</small></div><ArrowRight size={16} /></button>
          <button onClick={() => props.onUseTemplate("token-tray")}><span><Coins size={20} /></span><div><em>Recommended</em><strong>Board-game token tray</strong><small>Add a pour corner and rounded well</small></div><ArrowRight size={16} /></button>
          <button onClick={() => props.onUseTemplate("card-holder")}><span><CreditCard size={20} /></span><div><em>New measurement skill</em><strong>Sleeved-card holder</strong><small>Fit a deck with finger access</small></div><ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="page-card assembly-scaffold">
        <div className="assembly-intro"><span className="page-eyebrow">7 Wonders Duel · Compound scaffold</span><h2>Four modules, staged across two P1S plates</h2><p>The inventory and module envelope are assigned; your physical box and thickest card deck are now the only safe fit gate.</p></div>
        <div className="assembly-flow">
          <div className="assembly-stage complete"><span><Check size={16} /></span><strong>Map objects</strong><small>Cards, coins, tokens, boards</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage complete"><span><Check size={16} /></span><strong>Assign layout</strong><small>196 mm reference · four modules</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage"><span>3</span><strong>Measure box</strong><small>Inside size + usable height</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage"><span>4</span><strong>Gauge cards</strong><small>Thickest sleeved deck first</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage"><span>5</span><strong>Print plates</strong><small>Labelled plate order</small></div>
        </div>
      </section>
    </>
  );
}

type CatalogCategory = "Kitchen" | "Bathroom" | "Bedroom" | "Board Games" | "Plants" | "Desk & Workshop";

const catalogCategories: Array<"Popular" | CatalogCategory> = ["Popular", "Kitchen", "Bathroom", "Bedroom", "Board Games", "Plants", "Desk & Workshop"];

const catalogTemplates: Array<{
  id: StarterTemplate;
  title: string;
  category: CatalogCategory;
  description: string;
  time: string;
  parts: string;
  input: string;
  icon: typeof Grid3X3;
  tone: string;
  popular?: boolean;
}> = [
  { id: "utensil-tray", title: "Custom utensil tray", category: "Kitchen", description: "Measured lanes for the utensils you actually use, sized around the drawer and its awkward edges.", time: "~3 hr", parts: "1–2 parts", input: "Drawer + utensil groups", icon: PanelsTopLeft, tone: "sand", popular: true },
  { id: "sink-caddy", title: "Ventilated sink caddy", category: "Kitchen", description: "Drainable storage for a sponge, brush, and cloth with removable wet-zone pieces.", time: "~2.4 hr", parts: "2 parts", input: "Sink edge + tools", icon: Droplets, tone: "aqua" },
  { id: "bag-clip", title: "Reusable bag clips", category: "Kitchen", description: "A small batch of flexible clips matched to common snack, coffee, and freezer bags.", time: "~28 min", parts: "6 clips", input: "Bag fold thickness", icon: PackageCheck, tone: "sand" },
  { id: "loose-tray", title: "Exact-fit pantry tray", category: "Kitchen", description: "A production-ready measured tray for packets, small jars, or other loose pantry items.", time: "~1.5 hr", parts: "1 part", input: "Outer W × D × H", icon: Box, tone: "sand", popular: true },
  { id: "grid-customizer", title: "Custom drawer grid", category: "Desk & Workshop", description: "Centers full 42 mm cells and turns the leftover width into intentional edge space.", time: "~2–6 hr", parts: "2–6 parts", input: "Drawer W × D", icon: LayoutGrid, tone: "mint", popular: true },
  { id: "grid-edge-filler", title: "Edge & corner fillers", category: "Desk & Workshop", description: "Measured strips and corners that lock a standard grid into an awkward drawer.", time: "~45 min", parts: "1–4 parts", input: "Remaining gap", icon: PanelsTopLeft, tone: "mint" },
  { id: "grid-fractional-bin", title: "Fractional-width bins", category: "Desk & Workshop", description: "Half- and quarter-width storage when a full cell wastes too much room.", time: "~1.2 hr", parts: "1 part", input: "Object width", icon: Grid3X3, tone: "mint", popular: true },
  { id: "token-tray", title: "Pourable token tray", category: "Board Games", description: "Rounded token wells with a low pouring corner for fast setup and cleanup.", time: "~1.4 hr", parts: "1 part", input: "Token count + size", icon: Coins, tone: "coral", popular: true },
  { id: "card-holder", title: "Sleeved card holder", category: "Board Games", description: "A leaning card well sized for sleeved or unsleeved decks with finger access.", time: "~1.8 hr", parts: "1–2 parts", input: "Deck W × D × H", icon: CreditCard, tone: "coral" },
  { id: "board-game-insert", title: "Full box organizer", category: "Board Games", description: "Maps cards, boards, tokens, and player pieces into labeled printable modules.", time: "~8–16 hr", parts: "4–8 parts", input: "Box + components", icon: Gamepad2, tone: "coral" },
  { id: "vanity-organizer", title: "Vanity drawer organizer", category: "Bathroom", description: "Custom compartments around pipes, drawer rails, cosmetics, and daily tools.", time: "~3.5 hr", parts: "1–3 parts", input: "Drawer + obstacles", icon: Bath, tone: "aqua", popular: true },
  { id: "toothbrush-dock", title: "Toothbrush & razor dock", category: "Bathroom", description: "Ventilated upright storage with removable drip cups for easier cleaning.", time: "~2.1 hr", parts: "2 parts", input: "Handle diameters", icon: Droplets, tone: "aqua" },
  { id: "nightstand-dock", title: "Nightstand charging dock", category: "Bedroom", description: "A phone rest with routed charging cable, watch space, and pocket tray.", time: "~2.8 hr", parts: "1–2 parts", input: "Phone + cable", icon: BedDouble, tone: "violet", popular: true },
  { id: "jewelry-tray", title: "Stackable jewelry tray", category: "Bedroom", description: "Soft-corner compartments with optional ring rows and stack alignment.", time: "~2.4 hr", parts: "1 part", input: "Drawer footprint", icon: Gem, tone: "violet" },
  { id: "plant-drip-tray", title: "Exact-fit drip tray", category: "Plants", description: "A low-profile waterproof saucer matched to a planter’s actual base shape.", time: "~1.7 hr", parts: "1 part", input: "Pot base + runoff", icon: Flower2, tone: "leaf", popular: true },
  { id: "trellis-clips", title: "Plant & trellis clips", category: "Plants", description: "Reusable clips tuned to a stem and trellis diameter without pinching growth.", time: "~22 min", parts: "6–12 clips", input: "Stem + rod diameter", icon: Sprout, tone: "leaf" },
  { id: "propagation-stand", title: "Propagation tube stand", category: "Plants", description: "Stable modular holder for glass tubes with a broad water-safe footprint.", time: "~2.2 hr", parts: "1–2 parts", input: "Tube diameter", icon: Flower2, tone: "leaf" },
  { id: "cable-guide", title: "Measured cable guide", category: "Desk & Workshop", description: "Snap-in routing matched to cable thickness and the edge it mounts beneath.", time: "~30 min", parts: "2–8 clips", input: "Cable + edge", icon: Cable, tone: "slate" },
  { id: "wall-hook", title: "Purpose-fit wall hook", category: "Desk & Workshop", description: "A load-aware hook shaped around the exact object and mounting method.", time: "~1.1 hr", parts: "1 part", input: "Object + fastener", icon: Wrench, tone: "slate" },
];

function LibraryPage(props: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<(typeof catalogCategories)[number]>("Popular");
  const visibleTemplates = useMemo(
    () => activeCategory === "Popular" ? catalogTemplates.filter((template) => template.popular) : catalogTemplates.filter((template) => template.category === activeCategory),
    [activeCategory],
  );
  return (
    <>
      <PageHeader eyebrow="Design library" title="Customize a useful starting point." description="Pick a familiar object, then change the dimensions, fit, and features for your exact space." />
      <section className="library-feature custom-grid-feature page-card">
        <div><span className="recommendation-tag"><LayoutGrid size={14} /> Popular · Gridfinity customization</span><h2>Keep the grid. Fix the awkward edges.</h2><p>Tell us the real drawer dimensions. We’ll calculate full 42 mm cells, remaining space, centered margins, and which pieces should share a print plate.</p><div className="feature-facts"><span><strong>42 mm</strong><small>standard cells</small></span><span><strong>Any size</strong><small>measured perimeter</small></span><span><strong>Plate plan</strong><small>split for P1S</small></span></div><button className="primary-button" onClick={() => props.onUseTemplate("grid-customizer")}>Customize my drawer <ArrowRight size={15} /></button></div>
        <div className="custom-grid-visual" aria-hidden="true"><span className="measure-top">287 mm</span><span className="measure-side">463 mm</span><div className="custom-grid-cells">{Array.from({length:24}).map((_, index) => <i key={index} className={index % 6 === 5 ? "remainder" : ""} />)}</div><em>17.5 mm remainder</em></div>
      </section>
      <div className="library-section-heading catalog-heading"><div><span className="page-eyebrow">Template catalog</span><h2>Designed around everyday jobs</h2></div><span className="profile-context"><Printer size={14} /> P1S · {props.nozzle} mm · {props.plate}</span></div>
      <div className="catalog-filters" aria-label="Template categories">{catalogCategories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}<span>{category === "Popular" ? catalogTemplates.filter((item) => item.popular).length : catalogTemplates.filter((item) => item.category === category).length}</span></button>)}</div>
      <div className="template-grid catalog-grid">
        {visibleTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <article className="template-card" key={template.id}>
              <div className={`template-art catalog-art tone-${template.tone}`}><span><Icon size={30} /></span><em>{template.category}</em><div className="object-sketch"><i /><i /><i /></div></div>
              <div className="template-body"><h3>{template.title}</h3><p>{template.description}</p><div className="template-input"><Ruler size={13} /><span><small>YOU PROVIDE</small>{template.input}</span></div><div className="template-facts"><span><Clock3 size={13} />{template.time}</span><span><PackageOpen size={13} />{template.parts}</span></div><button className="secondary-button" onClick={() => props.onUseTemplate(template.id)}>Customize template <ArrowRight size={15} /></button></div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function ProcessPage(props: DashboardProps) {
  const connected = props.bridgeStatus === "online";
  const processSteps = [
    { icon: Sparkles, label: "Describe", detail: "Start with the problem, object, and where it needs to fit." },
    { icon: Ruler, label: "Measure", detail: "Capture the available space, fit preference, and obstacles." },
    { icon: ShieldCheck, label: "Confirm", detail: "Review the exact outside size, printer limits, and design intent." },
    { icon: Printer, label: "Print", detail: "Create the file, inspect the slice in Bambu Studio, then send it." },
  ];
  return (
    <>
      <PageHeader
        eyebrow="How PrintPath works"
        title="From a rough idea to a confident print."
        description="One repeatable path keeps measurements, design decisions, and the final P1S handoff understandable."
        action={<button className="primary-button page-action" onClick={props.onNewProject}><Plus size={17} /> Start a design</button>}
      />

      <section className="page-card process-journey">
        <div className="process-journey-heading"><span className="page-eyebrow">The core loop</span><h2>Four clear stops, with a human check before printing.</h2></div>
        <div className="process-step-grid">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return <div className="process-step" key={step.label}><span><Icon size={19} /></span><em>0{index + 1}</em><strong>{step.label}</strong><p>{step.detail}</p>{index < processSteps.length - 1 && <i><ChevronRight size={16} /></i>}</div>;
          })}
        </div>
      </section>

      <div className="process-detail-grid">
        <section className="page-card process-detail-card handoff-card">
          <div className="process-card-heading"><span><Printer size={20} /></span><div><small>PRINT ON YOUR P1S</small><h2>Bambu Studio stays as the final checkpoint.</h2></div></div>
          <p>PrintPath creates the supported STL locally and opens it on this computer. Your Bambu login remains inside Bambu Studio, where you inspect the sliced plate and press Print.</p>
          <div className={`process-connection ${props.bridgeStatus}`}>
            {connected ? <Wifi size={17} /> : <WifiOff size={17} />}
            <span><strong>{props.bridgePaired ? "Ready on this computer" : connected ? "Helper found · pairing needed" : "Local helper not connected"}</strong><small>{props.bambuStudioDetected ? "Bambu Studio detected" : "Bambu Studio can be installed or opened separately"}</small></span>
          </div>
          {!props.bridgePaired && <div className="process-pairing"><input value={props.pairingCode} onChange={(event) => props.onPairingCodeChange(event.target.value.toUpperCase())} placeholder="PP-XXXX-XXXX-XXXX" aria-label="PrintPath Bridge pairing code" /><button className="secondary-button" onClick={props.onCheckBridge}>{connected ? "Pair" : "Check"}</button></div>}
          <div className="process-actions"><a className="secondary-button" href="/downloads/printpath-bridge-windows.zip" download><Download size={16} /> Get local helper</a><button className="text-link" onClick={props.onOpenProject}>Open active design <ArrowRight size={15} /></button></div>
        </section>

        <section className="page-card process-detail-card memory-card">
          <div className="process-card-heading"><span><HardDrive size={20} /></span><div><small>PROJECT MEMORY</small><h2>Your design history is saved automatically.</h2></div></div>
          <p>Drafts, approved versions, and completed designs stay in this browser today. A single shared sync layer can be added later without changing how you make things.</p>
          <div className="process-memory-facts"><span><strong>{Math.max(1, props.projectCount)}</strong><small>saved projects</small></span><span><strong>{props.versionCount}</strong><small>design checkpoints</small></span><span><strong>{props.projectCompleted ? "Completed" : props.projectApproved ? "Approved" : "Draft"}</strong><small>active design</small></span></div>
          <div className="process-note"><ShieldCheck size={16} /><span><strong>No Bambu credentials stored</strong><small>Account access and printing remain outside the website.</small></span></div>
        </section>
      </div>

      <section className="page-card process-guardrails">
        <div><span><Box size={18} /></span><strong>Fit first</strong><p>Every supported design shows finished outside dimensions and clearances.</p></div>
        <div><span><Layers3 size={18} /></span><strong>Plate aware</strong><p>The P1S build volume, nozzle, plate, and multi-part plan stay visible.</p></div>
        <div><span><Check size={18} /></span><strong>Review before print</strong><p>No automatic printing: Bambu Studio remains the final safety boundary.</p></div>
      </section>
    </>
  );
}

function SettingsPage(props: DashboardProps) {
  const nozzleNotes: Record<number, string> = {
    0.2: "Fine detail, slower prints, thinner minimum features",
    0.4: "Best general-purpose default for early projects",
    0.6: "Faster, stronger walls, less tiny detail",
    0.8: "Fastest large parts, coarse details",
  };
  return (
    <>
      <PageHeader eyebrow="Machine setup" title="Your P1S profile" description="One trusted machine profile keeps every project check consistent." />
      <div className="settings-grid">
        <section className="page-card machine-settings-card">
          <PrinterProfile nozzle={props.nozzle} plate={props.plate} compact />
          <div className="settings-form">
            <label><span>Printer</span><div className="locked-field"><Printer size={16} /> Bambu Lab P1S <BadgeCheck size={16} /></div><small>Other machines can be added later.</small></label>
            <label><span>Installed nozzle</span><select value={props.nozzle} onChange={(event) => props.onNozzleChange(Number(event.target.value))}><option value={0.2}>0.2 mm</option><option value={0.4}>0.4 mm — included/default</option><option value={0.6}>0.6 mm</option><option value={0.8}>0.8 mm</option></select><small>{nozzleNotes[props.nozzle]}</small></label>
            <label><span>Build plate</span><select value={props.plate} onChange={(event) => props.onPlateChange(event.target.value)}>{plateOptions.map((plate) => <option key={plate}>{plate}</option>)}</select><small>The project review will always show this plate explicitly.</small></label>
          </div>
        </section>
        <section className="page-card limit-card">
          <span className="page-eyebrow">Known limits</span><h2>What PrintPath checks</h2>
          <div className="limit-list">
            <div><span><Box size={18} /></span><div><strong>Build envelope</strong><p>256 × 256 × 256 mm before skirts, brims, and purge space.</p></div></div>
            <div><span><CircleDot size={18} /></span><div><strong>Nozzle-aware walls</strong><p>Flags walls below two nozzle widths as a starting safeguard.</p></div></div>
            <div><span><Layers3 size={18} /></span><div><strong>Plate awareness</strong><p>Shows the selected surface at review and export.</p></div></div>
            <div><span><ShieldCheck size={18} /></span><div><strong>Human slice review</strong><p>Bambu Studio remains the final authority before printing.</p></div></div>
          </div>
          <button className="secondary-button setup-handoff-link" onClick={() => props.onNavigate("process")}><Workflow size={16} /> View print process <ChevronRight size={15} /></button>
        </section>
      </div>
    </>
  );
}

function ControlTowerPage(props: DashboardProps) {
  return (
    <>
      <PageHeader
        eyebrow="Control tower"
        title="One design record, wherever it runs."
        description="PrintPath keeps projects local today and exposes one storage boundary for a future Convex workspace—without creating a second application database."
        action={<button className="primary-button page-action" onClick={props.onOpenProject}><Wrench size={17} /> Open active design</button>}
      />
      <section className="page-card control-hero">
        <div><span className="control-status"><CircleDot size={14} /> Local source active</span><h2>{props.storageProvider}</h2><p>Drafts and immutable checkpoints live in this browser’s IndexedDB. Cloudflare only hosts the application files.</p></div>
        <div className="control-metrics"><span><strong>{Math.max(1, props.projectCount)}</strong><small>projects</small></span><span><strong>{props.versionCount}</strong><small>checkpoints</small></span><span><strong>{props.projectCompleted ? "Completed" : props.projectApproved ? "Approved" : "Draft"}</strong><small>active state</small></span></div>
      </section>

      <div className="control-grid">
        <section className="page-card control-card">
          <div className="control-card-heading"><span><Database size={19} /></span><div><small>DATA ROUTING</small><strong>Convex is the planned shared store</strong></div></div>
          <div className="data-route"><span className="active"><HardDrive size={16} /><strong>IndexedDB</strong><small>Active · offline-first</small></span><i /><span><Database size={16} /><strong>Convex</strong><small>{props.syncTarget} · not connected</small></span></div>
          <p>When enabled, the Convex adapter will own projects, versions, profiles, approvals, and artifact metadata. The local store becomes an offline cache and outbox.</p>
          <div className="control-note"><ShieldCheck size={16} /><span><strong>No database sprawl</strong><small>No D1 project database and no Bambu credentials in either store.</small></span></div>
        </section>

        <section className="page-card control-card">
          <div className="control-card-heading"><span><Workflow size={19} /></span><div><small>ORCHESTRATION</small><strong>{props.orchestrationLabel}</strong></div></div>
          <p>{props.orchestrationDetail}. The selected route is recorded in the design packet so expensive reasoning only runs when it adds value.</p>
          <div className="routing-lanes"><span className={props.orchestrationAgents === 0 ? "active" : ""}><strong>0 agents</strong><small>Known template</small></span><span className={props.orchestrationAgents === 1 ? "active" : ""}><strong>1 agent</strong><small>Ambiguous intent</small></span><span className={props.orchestrationAgents >= 2 ? "active" : ""}><strong>2 agents</strong><small>Plan + review</small></span></div>
        </section>

        <section className="page-card control-card wide">
          <div className="control-card-heading"><span><GitBranch size={19} /></span><div><small>CANONICAL DESIGN PACKET</small><strong>What the website now gives a modeling workflow</strong></div></div>
          <div className="packet-grid"><span><Check size={15} /> Object intent</span><span><Check size={15} /> Dimension meaning</span><span><Check size={15} /> Grid relationship</span><span><Check size={15} /> Fit and allowances</span><span><Check size={15} /> Printer profile</span><span><Check size={15} /> Orchestration route</span><span><Check size={15} /> Approval state</span><span><Check size={15} /> Artifact handoff</span></div>
          <div className="project-identity"><span>Active project</span><code>{props.projectId}</code><small>{props.lastSavedAt ? `Last local save ${new Date(props.lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Waiting for first local save"}</small></div>
        </section>
      </div>
    </>
  );
}

function BridgePage(props: DashboardProps) {
  const connected = props.bridgeStatus === "online";
  return (
    <>
      <PageHeader
        eyebrow="Bambu handoff"
        title="Connect PrintPath to Bambu Studio."
        description="A small helper stays on this Windows computer so the website can create local files without ever receiving your Bambu credentials."
      />
      <section className="bridge-page-hero page-card">
        <div>
          <span className={`bridge-page-status ${props.bridgeStatus}`}>
            {connected ? <Wifi size={15} /> : <WifiOff size={15} />}
            {props.bridgeStatus === "checking" ? "Checking this computer" : connected ? `Bridge ${props.bridgeVersion || "online"}` : "Not connected yet"}
          </span>
          <h2>{props.bridgePaired ? "This browser is paired." : connected ? "Bridge found. Enter its pairing code." : "Start the bridge and allow local access."}</h2>
          <p>{props.bridgePaired ? "PrintPath can now save supported models locally and open them in Bambu Studio for your review." : connected ? "The helper only listens to this computer and never talks to your Bambu account." : "If the helper is already open, allow PrintPath to access local devices when your browser asks, then check again."}</p>
        </div>
        <div className="bridge-flow-visual" aria-hidden="true"><span><WandSparkles size={21} /></span><i /><span><HardDrive size={21} /></span><i /><span><Printer size={21} /></span></div>
      </section>

      <div className="bridge-page-grid">
        <section className="page-card bridge-install-card">
          <span className="page-eyebrow">One-time setup</span>
          <div className="install-step"><span>1</span><div><strong>Download the Windows bridge</strong><p>A small open-source ZIP containing the local helper and setup instructions.</p><a className="primary-button" href="/downloads/printpath-bridge-windows.zip" download><Download size={16} /> Download bridge</a></div></div>
          <div className="install-step"><span>2</span><div><strong>Extract it and start the helper</strong><p>Double-click <code>bridge/start-bridge.cmd</code>. Keep that window open while designing.</p></div></div>
          <div className="install-step"><span>3</span><div><strong>Allow local access, then pair</strong><p>Approve the browser’s local-device prompt and copy the helper code. It is local—not a Bambu password.</p><div className="page-pairing"><input value={props.pairingCode} onChange={(event) => props.onPairingCodeChange(event.target.value.toUpperCase())} placeholder="PP-XXXX-XXXX-XXXX" aria-label="PrintPath Bridge pairing code" /><button className="secondary-button" disabled={props.bridgeStatus === "checking"} onClick={props.onCheckBridge}><KeyRound size={15} /> {!connected ? "Check connection" : props.bridgePaired ? "Recheck" : "Pair"}</button></div></div></div>
        </section>

        <aside className="page-card bridge-trust-card">
          <span className="page-eyebrow">Safety boundary</span>
          <h2>Bambu stays in control.</h2>
          <div className="trust-list">
            <div><ShieldCheck size={17} /><span><strong>No account credentials</strong><small>Login remains inside Bambu Studio.</small></span></div>
            <div><HardDrive size={17} /><span><strong>Local files only</strong><small>Models stay under Documents/PrintPath Exports.</small></span></div>
            <div><Printer size={17} /><span><strong>No automatic print</strong><small>You inspect the sliced preview and press Print.</small></span></div>
          </div>
          <div className="studio-detection"><span className={!connected ? "pending" : props.bambuStudioDetected ? "detected" : "fallback"} /><div><strong>{!connected ? "Bambu detection pending" : props.bambuStudioDetected ? "Bambu Studio detected" : "Windows association fallback"}</strong><p>{!connected ? "Connect the helper before PrintPath checks this computer." : props.bambuStudioDetected ? "The bridge can launch it directly." : "The bridge will ask Windows to open the STL with its registered app."}</p></div></div>
          <a className="text-link bridge-source-link" href="https://github.com/WillyMLee/printpath/tree/codex/p1s-confidence-workflow/bridge" target="_blank" rel="noreferrer">Inspect the bridge source <ExternalLink size={14} /></a>
        </aside>
      </div>

      {props.bridgePaired && <section className="page-card bridge-ready-banner"><CircleDot size={18} /><div><strong>Ready for a supported design.</strong><p>Try the Exact-fit open tray, then use its Review step to create and open the STL.</p></div><button className="primary-button" onClick={() => props.onUseTemplate("loose-tray")}>Open starter template <ArrowRight size={15} /></button></section>}
      <section className="page-card print-runbook">
        <div className="runbook-heading"><span><PackageCheck size={20} /></span><div><small>SAFE PRINT RUNBOOK</small><h2>From approval to your P1S</h2><p>The bridge performs the file handoff. Bambu Studio remains the final safety stop.</p></div></div>
        <div className="runbook-columns">
          <div><strong>First print from this computer</strong><ol><li>Approve the intent statement in PrintPath.</li><li>Create the model and let it open in Bambu Studio.</li><li>Confirm P1S, 0.4 mm nozzle, Textured PEI Plate, and your loaded filament.</li><li>Click <b>Slice Plate</b>; inspect every layer for a continuous floor, walls, and no out-of-bounds warning.</li><li>Click <b>Print Plate</b>, select the P1S, and review the final confirmation.</li></ol></div>
          <div><strong><Smartphone size={16} /> Reprint from your phone</strong><ol><li>Keep the P1S bound to the same Bambu account used by Studio.</li><li>After the first cloud print, open Bambu Handy and look in your print history.</li><li>Select the approved job and use the app’s reprint flow, checking filament and plate again.</li></ol><p className="runbook-caution">PrintPath does not upload arbitrary files into Bambu Handy or store your Bambu login.</p></div>
        </div>
      </section>
    </>
  );
}

export default function Dashboard(props: DashboardProps) {
  return (
    <main className="workspace page-workspace">
      {props.page === "overview" && <OverviewPage {...props} />}
      {props.page === "projects" && <ProjectsPage {...props} />}
      {props.page === "library" && <LibraryPage {...props} />}
      {props.page === "process" && <ProcessPage {...props} />}
      {props.page === "settings" && <SettingsPage {...props} />}
    </main>
  );
}
