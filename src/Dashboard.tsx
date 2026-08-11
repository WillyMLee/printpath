import {
  ArrowRight,
  BadgeCheck,
  Box,
  Boxes,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Component,
  Gauge,
  Grid3X3,
  Layers3,
  PackageCheck,
  Plus,
  Printer,
  Ruler,
  Settings,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

export type AppPage = "overview" | "projects" | "library" | "workbench" | "settings";

export type StarterTemplate = "grid-fit-tile" | "loose-tray" | "drawer-strip" | "blank";

type DashboardProps = {
  page: Exclude<AppPage, "workbench">;
  activeProjectName: string;
  nozzle: number;
  plate: string;
  onNavigate: (page: AppPage) => void;
  onOpenProject: () => void;
  onNewProject: () => void;
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
    name: "Gridfinity fit tile",
    kind: "Confidence print",
    status: "Recommended",
    statusClass: "ready",
    parts: "1 part · 1 plate",
    next: "Print the 42 mm test",
    confidence: 88,
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

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
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
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Let’s build confidence first."
        description="Start with a small proof print, learn what fits your P1S, then graduate to larger and multi-part projects."
        action={<button className="primary-button page-action" onClick={props.onNewProject}><Plus size={17} /> New project</button>}
      />

      <div className="overview-grid">
        <section className="confidence-hero">
          <div className="confidence-copy">
            <span className="recommendation-tag"><Sparkles size={14} /> Best next print</span>
            <span className="page-eyebrow">Gridfinity confidence series · 1 of 3</span>
            <h2>Start with one fit tile.</h2>
            <p>A single 42 mm tile checks scale, first-layer grip, nozzle choice, and how the grid feels—before you commit a drawer to it.</p>
            <div className="hero-facts">
              <span><Clock3 size={15} /><strong>~18 min</strong><small>quick feedback</small></span>
              <span><Layers3 size={15} /><strong>~4 g</strong><small>low material risk</small></span>
              <span><PackageCheck size={15} /><strong>1 part</strong><small>no assembly</small></span>
            </div>
            <button className="primary-button" onClick={() => props.onUseTemplate("grid-fit-tile")}>Start the fit tile <ArrowRight size={16} /></button>
          </div>
          <GridTileGraphic />
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

      <section className="confidence-path page-card">
        <div className="card-heading-row">
          <div><span className="page-eyebrow">Confidence path</span><h2>Small proof before a long print</h2></div>
          <span className="subtle-label">P1S workflow</span>
        </div>
        <div className="confidence-steps">
          <div className="confidence-step active"><span>1</span><div><strong>Prove the fit</strong><p>Print the smallest mating surface or grid cell.</p></div><em>Next</em></div>
          <div className="confidence-step"><span>2</span><div><strong>Prove the function</strong><p>Try one useful bin, hook, or holder.</p></div></div>
          <div className="confidence-step"><span>3</span><div><strong>Prove the system</strong><p>Repeat across a plate with labels and orientation.</p></div></div>
          <div className="confidence-step"><span>4</span><div><strong>Build the compound object</strong><p>Split, print, test-fit, then assemble.</p></div></div>
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
          <button className="recent-project-row" onClick={() => props.onUseTemplate("grid-fit-tile")}>
            <span className="project-symbol coral"><Grid3X3 size={20} /></span>
            <div><strong>Gridfinity fit tile</strong><small>Starter · confidence print</small></div>
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
          <button className="project-card" key={project.name} onClick={index === 0 ? props.onOpenProject : index === 1 ? () => props.onUseTemplate("grid-fit-tile") : undefined}>
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

const starterTemplates: Array<{ id: StarterTemplate; title: string; stage: string; description: string; time: string; material: string; icon: typeof Grid3X3 }> = [
  { id: "grid-fit-tile", title: "42 mm fit tile", stage: "Confidence 1", description: "Validate scale, plate grip, and grid feel with almost no waste.", time: "~18 min", material: "~4 g", icon: Grid3X3 },
  { id: "loose-tray", title: "Loose-fit 2×2 tray", stage: "Confidence 2", description: "A useful open tray that does not lock you into a whole drawer system.", time: "~1.4 hr", material: "~24 g", icon: Box },
  { id: "drawer-strip", title: "Custom drawer strip", stage: "Confidence 3", description: "Test a measured strip before filling the drawer with a full baseplate.", time: "~2.1 hr", material: "~36 g", icon: Ruler },
];

function LibraryPage(props: DashboardProps) {
  return (
    <>
      <PageHeader eyebrow="Design library" title="Start from something proven." description="Templates are organized by confidence level, not just by object type." />
      <section className="library-feature page-card">
        <div><span className="recommendation-tag"><ShieldCheck size={14} /> Recommended starting collection</span><h2>Gridfinity, without the leap of faith.</h2><p>Three deliberate prints take you from one cell to a custom drawer span. You can stop after any step and adjust.</p></div>
        <GridTileGraphic />
      </section>
      <div className="library-section-heading"><div><span className="page-eyebrow">P1S starter series</span><h2>Build confidence in three prints</h2></div><span className="profile-context"><Printer size={14} /> P1S · {props.nozzle} mm · {props.plate}</span></div>
      <div className="template-grid">
        {starterTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <article className="template-card" key={template.id}>
              <div className="template-art"><span><Icon size={30} /></span><em>{template.stage}</em></div>
              <div className="template-body"><h3>{template.title}</h3><p>{template.description}</p><div className="template-facts"><span><Clock3 size={13} />{template.time}</span><span><Layers3 size={13} />{template.material}</span><span><PackageCheck size={13} />1 part</span></div><button className="secondary-button" onClick={() => props.onUseTemplate(template.id)}>Use template <ArrowRight size={15} /></button></div>
            </article>
          );
        })}
      </div>
      <div className="library-section-heading general"><div><span className="page-eyebrow">General starters</span><h2>Simple, single-part wins</h2></div></div>
      <div className="simple-template-row">
        <button onClick={() => props.onUseTemplate("blank")}><span><Wrench size={20} /></span><div><strong>Wall mount</strong><small>Measured holder · 1 part</small></div><ChevronRight size={16} /></button>
        <button onClick={() => props.onUseTemplate("blank")}><span><Box size={20} /></span><div><strong>Open organizer</strong><small>Custom footprint · 1 part</small></div><ChevronRight size={16} /></button>
        <button onClick={() => props.onUseTemplate("blank")}><span><Gauge size={20} /></span><div><strong>Fit gauge</strong><small>Clearance test · 1 part</small></div><ChevronRight size={16} /></button>
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
