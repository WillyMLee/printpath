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
  Droplets,
  Flower2,
  Gauge,
  Gamepad2,
  Gem,
  Grid3X3,
  Layers3,
  LayoutGrid,
  PackageCheck,
  PackageOpen,
  PanelsTopLeft,
  Plus,
  Printer,
  Ruler,
  ShieldCheck,
  Sparkles,
  Sprout,
  WandSparkles,
  Wrench,
} from "lucide-react";

export type AppPage = "overview" | "projects" | "library" | "workbench" | "settings";

export type StarterTemplate =
  | "grid-fit-tile" | "loose-tray" | "drawer-strip" | "grid-customizer" | "grid-edge-filler" | "grid-fractional-bin"
  | "token-tray" | "card-holder" | "board-game-insert"
  | "vanity-organizer" | "toothbrush-dock"
  | "nightstand-dock" | "jewelry-tray"
  | "plant-drip-tray" | "trellis-clips" | "propagation-stand"
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
};

const plateOptions = [
  "Textured PEI Plate",
  "Smooth PEI / High Temp Plate",
  "Cool Plate",
  "Engineering Plate",
];

const projectCards = [
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
    name: "Custom drawer Gridfinity",
    kind: "Custom-fit system",
    status: "Recommended",
    statusClass: "ready",
    parts: "2 parts · 1 plate",
    next: "Enter drawer dimensions",
    confidence: 65,
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
            <span className="project-symbol mint"><Wrench size={20} /></span>
            <div><strong>{props.activeProjectName || "Under-desk headphone hanger"}</strong><small>Measurements · single part</small></div>
            <span className="progress-ring">72%</span>
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
      <div className="project-filter-row"><button className="active">All projects <span>3</span></button><button>In progress <span>1</span></button><button>Ready to print <span>0</span></button><button>Completed <span>0</span></button></div>
      <div className="project-card-grid">
        {projectCards.map((project, index) => (
          <button className="project-card" key={project.name} onClick={index === 0 ? props.onOpenProject : index === 1 ? () => props.onUseTemplate("grid-customizer") : undefined}>
            <div className={`project-art project-art-${index + 1}`}><span>{index === 0 ? <Wrench size={28} /> : index === 1 ? <Grid3X3 size={30} /> : <Component size={30} />}</span><em>{project.kind}</em></div>
            <div className="project-card-body">
              <div className="project-card-title"><h2>{project.name}</h2><span className={`status-chip ${project.statusClass}`}>{project.status}</span></div>
              <p>{project.parts}</p>
              <div className="project-next"><span>Next step</span><strong>{project.next}</strong></div>
              <div className="confidence-meter"><span style={{ width: `${project.confidence}%` }} /><em>{project.confidence}% confidence</em></div>
            </div>
          </button>
        ))}
      </div>

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

type CatalogCategory = "Gridfinity" | "Board games" | "Bathroom" | "Bedroom" | "Plants" | "Everyday";

const catalogCategories: Array<"Popular" | CatalogCategory> = ["Popular", "Gridfinity", "Board games", "Bathroom", "Bedroom", "Plants", "Everyday"];

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
  { id: "loose-tray", title: "Exact-fit open tray", category: "Everyday", description: "A production-ready first generator for a measured, square-corner tray with uniform walls.", time: "~1.5 hr", parts: "1 part", input: "Outer W × D × H", icon: Box, tone: "slate", popular: true },
  { id: "grid-customizer", title: "Custom drawer grid", category: "Gridfinity", description: "Centers full 42 mm cells and turns the leftover width into intentional edge space.", time: "~2–6 hr", parts: "2–6 parts", input: "Drawer W × D", icon: LayoutGrid, tone: "mint", popular: true },
  { id: "grid-edge-filler", title: "Edge & corner fillers", category: "Gridfinity", description: "Measured strips and corners that lock a standard grid into an awkward drawer.", time: "~45 min", parts: "1–4 parts", input: "Remaining gap", icon: PanelsTopLeft, tone: "mint" },
  { id: "grid-fractional-bin", title: "Fractional-width bins", category: "Gridfinity", description: "Half- and quarter-width storage when a full cell wastes too much room.", time: "~1.2 hr", parts: "1 part", input: "Object width", icon: Grid3X3, tone: "mint", popular: true },
  { id: "token-tray", title: "Pourable token tray", category: "Board games", description: "Rounded token wells with a low pouring corner for fast setup and cleanup.", time: "~1.4 hr", parts: "1 part", input: "Token count + size", icon: Coins, tone: "coral", popular: true },
  { id: "card-holder", title: "Sleeved card holder", category: "Board games", description: "A leaning card well sized for sleeved or unsleeved decks with finger access.", time: "~1.8 hr", parts: "1–2 parts", input: "Deck W × D × H", icon: CreditCard, tone: "coral" },
  { id: "board-game-insert", title: "Full box organizer", category: "Board games", description: "Maps cards, boards, tokens, and player pieces into labeled printable modules.", time: "~8–16 hr", parts: "4–8 parts", input: "Box + components", icon: Gamepad2, tone: "coral" },
  { id: "vanity-organizer", title: "Vanity drawer organizer", category: "Bathroom", description: "Custom compartments around pipes, drawer rails, cosmetics, and daily tools.", time: "~3.5 hr", parts: "1–3 parts", input: "Drawer + obstacles", icon: Bath, tone: "aqua", popular: true },
  { id: "toothbrush-dock", title: "Toothbrush & razor dock", category: "Bathroom", description: "Ventilated upright storage with removable drip cups for easier cleaning.", time: "~2.1 hr", parts: "2 parts", input: "Handle diameters", icon: Droplets, tone: "aqua" },
  { id: "nightstand-dock", title: "Nightstand charging dock", category: "Bedroom", description: "A phone rest with routed charging cable, watch space, and pocket tray.", time: "~2.8 hr", parts: "1–2 parts", input: "Phone + cable", icon: BedDouble, tone: "violet", popular: true },
  { id: "jewelry-tray", title: "Stackable jewelry tray", category: "Bedroom", description: "Soft-corner compartments with optional ring rows and stack alignment.", time: "~2.4 hr", parts: "1 part", input: "Drawer footprint", icon: Gem, tone: "violet" },
  { id: "plant-drip-tray", title: "Exact-fit drip tray", category: "Plants", description: "A low-profile waterproof saucer matched to a planter’s actual base shape.", time: "~1.7 hr", parts: "1 part", input: "Pot base + runoff", icon: Flower2, tone: "leaf", popular: true },
  { id: "trellis-clips", title: "Plant & trellis clips", category: "Plants", description: "Reusable clips tuned to a stem and trellis diameter without pinching growth.", time: "~22 min", parts: "6–12 clips", input: "Stem + rod diameter", icon: Sprout, tone: "leaf" },
  { id: "propagation-stand", title: "Propagation tube stand", category: "Plants", description: "Stable modular holder for glass tubes with a broad water-safe footprint.", time: "~2.2 hr", parts: "1–2 parts", input: "Tube diameter", icon: Flower2, tone: "leaf" },
  { id: "cable-guide", title: "Measured cable guide", category: "Everyday", description: "Snap-in routing matched to cable thickness and the edge it mounts beneath.", time: "~30 min", parts: "2–8 clips", input: "Cable + edge", icon: Cable, tone: "slate" },
  { id: "wall-hook", title: "Purpose-fit wall hook", category: "Everyday", description: "A load-aware hook shaped around the exact object and mounting method.", time: "~1.1 hr", parts: "1 part", input: "Object + fastener", icon: Wrench, tone: "slate" },
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
        </section>
      </div>
    </>
  );
}

export default function Dashboard(props: DashboardProps) {
  return (
    <main className="workspace page-workspace">
      {props.page === "overview" && <OverviewPage {...props} />}
      {props.page === "projects" && <ProjectsPage {...props} />}
      {props.page === "library" && <LibraryPage {...props} />}
      {props.page === "settings" && <SettingsPage {...props} />}
    </main>
  );
}
