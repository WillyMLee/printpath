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
};

const plateOptions = [
  "Textured PEI Plate",
  "Smooth PEI / High Temp Plate",
  "Cool Plate",
  "Engineering Plate",
];

const projectCards = [
  {
    name: "Drawer Gap Tray",
    kind: "Custom-fit gap solution",
    status: "Completed",
    statusClass: "complete",
    parts: "1 part · 1 plate",
    next: "Ready to reprint",
    confidence: 100,
    cover: "/projects/drawer-gap-tray-aug-2026-cover.png",
  },
  {
    name: "Under-desk headphone hanger",
    kind: "Single part",
    status: "In progress",
    statusClass: "progress",
    parts: "1 part · 1 plate",
    next: "Confirm measurements",
    confidence: 72,
  },
  {
    name: "Board game organizer",
    kind: "Compound object",
    status: "Later",
    statusClass: "later",
    parts: "6 parts · 3 plates",
    next: "Map components first",
    confidence: 28,
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
  const suggestions = ["A holder for…", "An organizer that fits…", "A replacement for…"];
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
                <button className="primary-button" disabled={!idea.trim()} onClick={() => props.onStartIdea(idea.trim())}>Start designing <ArrowRight size={16} /></button>
              </div>
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
          <button className="recent-project-row" onClick={props.onOpenProject}>
            <span className="project-cover-thumb"><img src="/projects/drawer-gap-tray-aug-2026-cover.png" alt="Rendered Drawer Gap Tray" /></span>
            <div><strong>Drawer Gap Tray</strong><small>254.4 × 39.4 × 49.4 mm · one part</small></div>
            <span className="completed-mini"><Check size={12} /> Completed</span>
            <ChevronRight size={17} />
          </button>
          <button className="recent-project-row" onClick={() => props.onUseTemplate("grid-customizer")}>
            <span className="project-symbol coral"><Grid3X3 size={20} /></span>
            <div><strong>Custom drawer Gridfinity</strong><small>Popular · measured system</small></div>
            <span className="recommended-mini">Recommended</span>
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
  return (
    <>
      <PageHeader
        eyebrow="My projects"
        title="Every print has a plan."
        description="Single parts stay simple. Compound projects are broken into plates, checkpoints, and assembly steps."
        action={<button className="primary-button page-action" onClick={props.onNewProject}><Plus size={17} /> New project</button>}
      />
      <section className="completed-project-feature page-card">
        <div className="completed-project-cover"><img src="/projects/drawer-gap-tray-aug-2026-cover.png" alt="Isometric render of the approved Drawer Gap Tray STL" /></div>
        <div className="completed-project-copy">
          <span className="completion-kicker"><BadgeCheck size={15} /> Completed design · Aug 2026</span>
          <h2>Drawer Gap Tray</h2>
          <p>One uninterrupted compartment for the narrow leftover zone beside the existing Gridfinity layout. The cover is rendered from the approved watertight STL.</p>
          <div className="completed-project-facts"><span><strong>254.4 × 39.4 × 49.4 mm</strong><small>printed outside</small></span><span><strong>1 part</strong><small>single P1S plate</small></span><span><strong>0.4 mm</strong><small>nozzle profile</small></span></div>
          <div className="completed-project-actions"><button className="primary-button" onClick={props.onOpenProject}>Open design <ArrowRight size={16} /></button><button className="secondary-button" onClick={() => props.onNavigate("process")}><Smartphone size={16} /> Reprint workflow</button></div>
        </div>
      </section>

      <div className="project-filter-row"><button className="active">All projects <span>3</span></button><button>In progress <span>1</span></button><button>Ready to print <span>0</span></button><button>Completed <span>1</span></button></div>
      <div className="project-card-grid">
        {projectCards.map((project, index) => (
          <button className="project-card" key={project.name} onClick={index === 0 ? props.onOpenProject : undefined}>
            <div className={`project-art project-art-${index + 1}`}>{project.cover ? <img src={project.cover} alt="Drawer Gap Tray cover" /> : <span>{index === 1 ? <Wrench size={28} /> : <Component size={30} />}</span>}<em>{project.kind}</em></div>
            <div className="project-card-body">
              <div className="project-card-title"><h2>{project.name}</h2><span className={`status-chip ${project.statusClass}`}>{project.status}</span></div>
              <p>{project.parts}</p>
              <div className="project-next"><span>Next step</span><strong>{project.next}</strong></div>
              <div className="confidence-meter"><span style={{ width: `${project.confidence}%` }} /><em>{project.confidence}% confidence</em></div>
            </div>
          </button>
        ))}
      </div>

      <section className="next-project-section page-card">
        <div className="card-heading-row"><div><span className="page-eyebrow">What should we solve next?</span><h2>Three useful steps up from the gap tray</h2><p>Each option reuses the same measure → confirm → generate → handoff loop, with one new design challenge at a time.</p></div></div>
        <div className="next-project-grid">
          <button onClick={() => props.onStartIdea("A measured drawer-divider end cap that fills a leftover gap and stops an existing divider from shifting.")}><span><PanelsTopLeft size={20} /></span><div><em>Fastest follow-up</em><strong>Drawer divider end cap</strong><small>One fit surface · one part</small></div><ArrowRight size={16} /></button>
          <button onClick={() => props.onUseTemplate("token-tray")}><span><Coins size={20} /></span><div><em>Recommended</em><strong>Board-game token tray</strong><small>Add a pour corner and rounded well</small></div><ArrowRight size={16} /></button>
          <button onClick={() => props.onUseTemplate("card-holder")}><span><CreditCard size={20} /></span><div><em>New measurement skill</em><strong>Sleeved-card holder</strong><small>Fit a deck with finger access</small></div><ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="page-card assembly-scaffold">
        <div className="assembly-intro"><span className="page-eyebrow">Compound-object scaffold</span><h2>Board game organizer · 6 parts</h2><p>This is how PrintPath will keep a complex build understandable.</p></div>
        <div className="assembly-flow">
          <div className="assembly-stage complete"><span><Check size={16} /></span><strong>Map objects</strong><small>Cards, tokens, board</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage"><span>2</span><strong>Assign parts</strong><small>One job per insert</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage"><span>3</span><strong>Arrange plates</strong><small>3 labeled plates</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage"><span>4</span><strong>Test fit</strong><small>Stop before full run</small></div>
          <ChevronRight size={18} />
          <div className="assembly-stage"><span>5</span><strong>Assemble</strong><small>Order + hardware</small></div>
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
