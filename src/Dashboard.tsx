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
  Coins,
  Component,
  CreditCard,
  Database,
  Download,
  Droplets,
  ExternalLink,
  Flower2,
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

type VaseVersionId = "petal-twist" | "leaf-bloom" | "porcelain-reed";
type PhoneOceanVersionId = "tidepool-buddy" | "capiz-cove" | "cozy-harvest";
type ConceptProjectId =
  | "pottery-stamps" | "perfume-susan" | "phone-stands" | "ceramic-risers" | "film-camera-tools"
  | "token-upgrades" | "magnetic-island" | "steam-controller-dock" | "quiet-utility-kit"
  | "sink-rack-drain-bridge" | "retainer-drying-dock" | "shower-tool-rail";
type ProjectSelection = "drawer-gap" | "vase" | "seven-wonders" | "cozy" | "magnetic" | ConceptProjectId;

const SELECTED_VASE_VERSION_KEY = "printpath-selected-vase-version-v2";
const SELECTED_PHONE_VERSION_KEY = "printpath-selected-phone-ocean-version-v2";

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
  {
    id: "porcelain-reed" as const,
    version: 3,
    name: "Porcelain Reed Vase",
    image: "/projects/porcelain-reed-vase-aug-2026-product.png",
    stl: "/projects/porcelain-reed-vase-aug-2026.stl",
    guide: "/projects/porcelain-reed-vase-aug-2026-print-guide.md",
    dimensions: "116.7 × 116.7 × 245 mm",
    opening: "≈91 mm opening",
    description: "A quiet white vessel with 36 fine vertical ribs, a softly planted foot, and a clean round rim for real or printed flowers.",
    historyNote: "Fine porcelain-like ribs and a restrained taper based on the new white-vase reference, paired with the modular Evergarden bouquet study.",
    facts: [["116.7 × 116.7 × 245 mm", "P1S-safe size"], ["≈9–11 hr", "Planning estimate"], ["≈275 g PETG", "Geometry-based material"]],
  },
];

const phoneOceanVersions = [
  {
    id: "tidepool-buddy" as const,
    version: 3,
    name: "Tidepool Buddy",
    image: "/projects/ocean-nature-phone-stand-concept.svg",
    label: "Manta + wave",
    summary: "A broad manta-like base, curling wave support, and white foam accents in the original ocean palette.",
    thesis: "Make the ocean shape do the structural work, then let the cute details stay light and replaceable.",
    description: "A dark-blue manta-like base resists tipping, a light-blue curling wave supports the phone, and white snap-in foam pieces soften the silhouette. A centered cable canyon keeps wired charging open. Each color prints as a separate flat-oriented part, so AMS remains optional.",
    facts: [["3 colors", "Separate snap-fit parts"], ["Manta stance", "Wide anti-tip footprint"], ["1 coupon", "Case + angle test first"]] as Array<[string, string]>,
    modules: [["Manta base", "Dark blue · optional hidden washer pockets"], ["Curling wave", "Light blue · structural back support"], ["Foam accents", "White · replaceable crest and front lip"], ["Cable canyon", "Centered path for wired charging"]] as Array<[string, string]>,
    prompt: "Design version 3 of the saved phone-stand project as an original Tidepool Buddy ocean stand. Use a broad dark-blue manta-like base for stability, a light-blue curling wave as the structural phone support, and separate white snap-in sea-foam accents plus a soft front-lip shell. Preserve a centered charging-cable path, target support-free P1S printing, and keep each color as a separately printable part so AMS is optional. Confirm the exact phone and case envelope, camera bump, portrait-versus-landscape use, preferred viewing angle, and wired-versus-MagSafe charging; print a lip-depth and angle coupon first.",
    sources: [["Wave geometry", "https://thangs.com/designer/Bamingo%20Design/3d-model/Wave%20Phone%20Stand-1564576"], ["Manta stability", "https://thangs.com/bundle/designer/Decorartor/3d-model/Manta%20Ray%20Ramp%20Phone%20Stand%20with%20Swirl%20Patterns-1528958"]] as Array<[string, string]>,
  },
  {
    id: "capiz-cove" as const,
    version: 4,
    name: "Capiz Cove",
    image: "/projects/capiz-cove-phone-stand-concept.svg",
    label: "Filipino shell study",
    summary: "A Filipino-first shell stand with pearlescent capiz-pane rhythm, a scalloped reef base, and tide-blue cradle.",
    thesis: "Use capiz as a light-and-geometry reference—not a pasted-on symbol.",
    description: "The phone leans against a structural fan of white, softly translucent shell panes arranged like a compact capiz window. A dark-blue scallop base supplies the load-bearing ribs, while a light-blue tide cradle and cable notch handle the actual phone fit. The shell fan, base, and cradle print separately, keeping the light blue, dark blue, and white palette practical on a single-nozzle P1S.",
    facts: [["3 parts", "Shell / reef / cradle"], ["Capiz rhythm", "Pearlescent pane geometry"], ["No AMS", "Separate-color assembly"]] as Array<[string, string]>,
    modules: [["Capiz fan", "White · repeating shell panes with light-catching ribs"], ["Scallop reef", "Dark blue · radial structure and anti-tip footprint"], ["Tide cradle", "Light blue · measured case lip and cable notch"], ["Fit coupon", "Two lip depths plus 55° and 65° viewing tests"]] as Array<[string, string]>,
    prompt: "Design version 4 of the saved phone-stand project as an original Filipino-first Capiz Cove shell stand. Use a white structural fan of softly translucent capiz-pane-inspired geometry, a dark-blue scallop reef base with radial load-bearing ribs, and a separate light-blue tide cradle with a centered charging notch. Treat capiz as a documented Filipino art and architectural material reference without copying a historical window panel or claiming a traditional symbol. Keep all three colors as separately printable support-free P1S parts. Confirm the exact phone and case envelope, camera bump, portrait-versus-landscape use, preferred viewing angle, and wired-versus-MagSafe charging; print a lip-depth and angle coupon first.",
    sources: [["National Museum capiz exhibition", "https://www.nationalmuseum.gov.ph/exhibitions/fine-arts/gallery-20/"], ["Capiz architectural precedent", "https://www.nationalmuseum.gov.ph/2023/02/16/built-tradition-of-the-aduana-building-in-cebu-city/"], ["Separate color-insert precedent", "https://makerworld.com/en/models/739533-phone-stand-01-by-teeti3d"]] as Array<[string, string]>,
  },
  {
    id: "cozy-harvest" as const,
    version: 5,
    name: "Cozy Harvest Dock",
    image: "/projects/cozy-harvest-phone-stand-concept.svg",
    label: "Pixel farm study",
    summary: "An original cozy-farming stand with a terraced field base, structural barn roof, stone-bridge lip, and seasonal crop tiles.",
    thesis: "Let the farm scene carry the phone instead of decorating a generic stand afterward.",
    description: "A wide terraced field forms the anti-tip base, while a cream barn wall and clay-red roof hide the structural back support. The phone rests on a gray stone-bridge lip with a blue cable channel underneath. Small crop tiles snap into the field so the scene can change by season without reprinting the load-bearing parts. The pixel-block language evokes cozy farming games without reproducing Stardew Valley sprites, logos, or characters.",
    facts: [["4 parts", "Field / barn / bridge / tiles"], ["Seasonal", "Replaceable crop details"], ["AMS optional", "Separate-color assembly"]] as Array<[string, string]>,
    modules: [["Terraced field", "Forest green · wide anti-tip footprint"], ["Barn support", "Cream + clay · concealed structural back"], ["Stone bridge", "Gray lip · centered blue cable route"], ["Crop tiles", "Gold, green, or coral · replaceable pixel inserts"]] as Array<[string, string]>,
    prompt: "Design version 5 of the saved phone-stand project as an original cozy pixel-farm stand inspired by the mood of Stardew Valley without copying its sprites, logo, characters, or map. Use a wide forest-green terraced field as the anti-tip base, a cream barn wall with a clay-red roof as the structural back support, a gray stone-bridge front lip with a centered blue charging channel, and small replaceable seasonal crop tiles. Keep the load-bearing parts support-free and separately printable on a Bambu Lab P1S so an AMS is optional. Confirm the exact phone and case envelope, camera bump, portrait-versus-landscape use, preferred viewing angle, and wired-versus-MagSafe charging; print a lip-depth and angle coupon first.",
    sources: [["Mood reference", "https://www.stardewvalley.net/"]] as Array<[string, string]>,
  },
];

const conceptProjects: Array<{
  id: ConceptProjectId;
  title: string;
  category: string;
  status: string;
  image: string;
  summary: string;
  thesis: string;
  description: string;
  facts: Array<[string, string]>;
  modules: Array<[string, string]>;
  questions: string[];
  prompt: string;
  sources?: Array<[string, string]>;
}> = [
  {
    id: "sink-rack-drain-bridge",
    title: "Sink Rack Drain Bridge",
    category: "Bathroom",
    status: "Priority · Fit coupon first",
    image: "/projects/sink-rack-drain-bridge-concept.svg",
    summary: "A removable, low-profile drain extension that lets the drying rack sit level beside the sink.",
    thesis: "Bring the water to the sink—not the rack—and keep the counter setup level.",
    description: "The recommended direction is a two-piece PETG bridge: a shallow catch adapter clips beneath the rack's existing drain, then a measured slide-out channel reaches past the sink lip with a positive slope. A small outlet-and-slope coupon proves the clip, clearance, and drainage before the full bridge is printed. The channel lifts off for cleaning and never relies on a permanent counter adhesive.",
    facts: [["2 parts", "Adapter + channel"], ["PETG", "Wet-area starting material"], ["Coupon first", "Clip + slope test"]],
    modules: [["Catch adapter", "Fits below the rack outlet without lifting the rack"], ["Drain bridge", "Measured reach with ribs that preserve a steady fall"], ["Sink lip", "Wide spill-safe nose projects past the inner sink edge"], ["Clean-out stop", "Slide lock releases without tools for washing"]],
    questions: ["Rack outlet width, depth, and underside clearance?", "Horizontal gap from outlet to the inside sink edge?", "Vertical drop available across that gap, plus a side photo of the setup?"],
    prompt: "Design a removable two-piece PETG drain bridge for a bathroom sink drying rack so the rack can remain level. Use a fitted catch adapter beneath the existing rack drain and a slide-out channel that crosses the measured counter gap with positive fall, ends past the inside sink edge, and lifts off for cleaning. Start with a compact outlet-and-slope coupon before the full bridge. Confirm the outlet width and depth, underside clearance, horizontal reach to the inner sink edge, available vertical drop, and attachment preference from a straight side photo before CAD.",
    sources: [["Removable swivel-spout precedent", "https://www.simplehuman.com/pages/indepth-dishrack"], ["Bambu PETG water resistance", "https://eu.store.bambulab.com/en-mt/products/petg-hf"]],
  },
  {
    id: "retainer-drying-dock",
    title: "Retainer Drying Dock",
    category: "Bathroom",
    status: "Ventilated case outlined",
    image: "/projects/retainer-drying-dock-concept.svg",
    summary: "A compact, protected home for a night guard or retainer with real airflow and a washable drip insert.",
    thesis: "Give the dental appliance a clean visual home without sealing dampness inside it.",
    description: "A small clamshell-style dock keeps the appliance off the counter, while offset vents allow air to pass without leaving it exposed to splashes. The curved insert lifts out for washing and the lower tray catches drips. The dock is storage only: care and cleaning still follow the appliance maker or dental provider's instructions.",
    facts: [["3 parts", "Shell / insert / tray"], ["Ventilated", "Air path on both sides"], ["PETG", "Washable prototype"]],
    modules: [["Vent shell", "Splash-shielded slots and a quiet hinged or lift-off lid"], ["Guard cradle", "Rounded removable insert with no sharp contact points"], ["Drip tray", "Shallow pull-out base for quick rinsing"], ["Name tile", "Optional subtle label for two-person bathrooms"]],
    questions: ["Night guard, clear retainer, or both—and its outside envelope?", "One appliance or a paired his-and-hers dock?", "Countertop, medicine cabinet, or wall location?"],
    prompt: "Design a compact ventilated drying dock for a measured night guard or retainer. Use a splash-shielded outer shell, removable rounded cradle, and shallow washable drip tray; keep air paths open and avoid sharp contact points. Treat it as storage only and do not make hygiene or medical claims. Confirm the appliance type and outside dimensions, one-versus-two-person capacity, and countertop, cabinet, or wall location before CAD.",
    sources: [["AAO retainer storage guidance", "https://aaoinfo.org/resources/faqs/"], ["AAO case-care guidance", "https://aaoinfo.org/whats-trending/taking-care-of-retainers/"]],
  },
  {
    id: "shower-tool-rail",
    title: "Low-Profile Shower Tool Rail",
    category: "Bathroom",
    status: "Three-tool rail outlined",
    image: "/projects/shower-tool-rail-concept.svg",
    summary: "A narrow, removable rail for a squeegee, loofah, and scrub brush that drains instead of becoming a shelf.",
    thesis: "Organize the wet tools already in the shower without adding another bulky caddy.",
    description: "The rail uses one slim backplate and three lift-off tool clips rather than a basket. Drip noses hold each item away from the tile, open bottoms drain freely, and the mounting plate can be sized for bathroom-rated removable strips or screws. Each clip is independently replaceable when a handle size changes.",
    facts: [["1 rail", "Three modular clips"], ["No shelf", "Open drainage"], ["PETG", "Wet-area prototype"]],
    modules: [["Squeegee cradle", "Two-point support that avoids the flexible blade"], ["Loop hook", "Open hook for a loofah or wash cloth"], ["Brush clip", "Measured snap coupon before the full rail"], ["Mounting plate", "Separate adhesive-strip or screw-backed version"]],
    questions: ["Which three shower tools and their handle or loop dimensions?", "Available tile width and grout-line locations?", "Bathroom-rated adhesive strips, screws, or an over-door mount?"],
    prompt: "Design a low-profile modular shower-tool rail for a squeegee, loofah or wash cloth, and scrub brush. Use one narrow backplate, open-draining lift-off clips, replaceable tool modules, and no basket or shelf. Confirm each tool's handle or loop dimensions, available tile width and grout lines, and whether the mount uses bathroom-rated removable strips, screws, or an over-door adapter. Print one clip and mounting coupon before the full rail.",
    sources: [["3M bathroom-strip conditions", "https://www.3m.com/3M/en_US/p/d/b5005604003/"], ["Squeegee storage precedent", "https://www.3m.com/3M/en_US/p/c/cleaning-supplies/equipment/squeegees/b/command/i/consumer/"]],
  },
  {
    id: "pottery-stamps",
    title: "Jessa + Willy Pottery Stamps",
    category: "Ceramics",
    status: "Two marks outlined",
    image: "/projects/pottery-signature-stamps-concept.svg",
    summary: "Two related English-name signature stamps with restrained Japanese seal composition.",
    thesis: "One visual family, two clearly personal maker marks.",
    description: "Jessa Parayno gets a vertical, botanical seal with a softer frame; Willy Lee gets a compact geometric seal with a calmer monogram. Both use mirrored relief, a depth-stop shoulder, and a broad thumb grip so the mark lands evenly in leather-hard clay.",
    facts: [["2 stamps", "Separate names"], ["1 plate", "Grip + test tiles"], ["PLA first", "PETG after approval"]],
    modules: [["Jessa seal", "Full name or JP monogram · botanical border"], ["Willy seal", "Full name or WL monogram · geometric border"], ["Depth-stop grip", "Even pressure without over-driving the mark"], ["Test matrix", "Three relief depths and two mark sizes"]],
    questions: ["Full names, initials, or one of each?", "Preferred finished mark width: roughly 18, 22, or 26 mm?", "Is the clay usually soft, firm, or leather hard when signed?"],
    prompt: "Design a paired pottery signature-stamp family for Jessa Parayno and Willy Lee. Use English lettering in a restrained Japanese seal-inspired composition without copying kanji or a traditional crest. Each stamp needs mirrored raised geometry, a broad ergonomic grip, a depth-stop shoulder, and a small test tile with multiple relief depths. Confirm full-name versus initials, preferred finished mark width, and clay firmness before CAD.",
    sources: [["3D-printed clay stamp practice", "https://ceramicartsnetwork.org/daily/article/Custom-Clay-Stamps-for-the-21st-Century"], ["Reverse-image reminder", "https://ceramicartsnetwork.org/daily/article/Rolling-Rolling-Rolling-Making-Roulettes-to-Add-Texture-and-Depth-to-Your-Pottery"]],
  },
  {
    id: "perfume-susan",
    title: "Perfume Lazy Susan",
    category: "Bedroom",
    status: "Mechanism outlined",
    image: "/projects/perfume-lazy-susan-concept.svg",
    summary: "A low, quiet rotating perfume display with a removable tier and bottle-safe rail.",
    thesis: "Make every bottle visible without turning the organizer into a bulky carousel.",
    description: "The P1S-friendly direction uses a 220 mm base, a replaceable center bearing module, a shallow outer rail, and an optional half-moon riser for shorter bottles. The rotating mechanism remains isolated from the display tray so the top can be redesigned without rebuilding the bearing fit.",
    facts: [["≤220 mm", "One-piece top"], ["608 bearing", "8 × 22 × 7 mm"], ["2–4 parts", "Modular assembly"]],
    modules: [["Display platter", "Non-slip bottle zones and a low spill rail"], ["Half-moon riser", "Elevates shorter bottles without hiding tall ones"], ["Bearing cassette", "Replaceable fit around a common 608 bearing"], ["Weighted base", "Wide footprint with optional steel-washer pockets"]],
    questions: ["Shelf or dresser maximum width and depth?", "Bottle count plus the widest and tallest bottle?", "Do you prefer one flat level or a removable rear tier?"],
    prompt: "Design a P1S-printable lazy Susan for perfume bottles with a target maximum platter diameter of 220 mm, a low bottle-safe rail, a removable rear half-moon riser, and a replaceable bearing cassette around a measured 608 bearing. Confirm available footprint, bottle count, widest bottle, tallest bottle, and preferred one-level versus tiered layout before CAD.",
    sources: [["608 bearing dimensions", "https://cdn.skfmediahub.skf.com/api/public/094abc84edb75bdd/pdf_preview_medium/094abc84edb75bdd_pdf_preview_medium.pdf"]],
  },
  {
    id: "phone-stands",
    title: "Ocean Nature Phone Stands",
    category: "Desk & Bedroom",
    status: "5 directions · 3 featured studies",
    image: "/projects/cozy-harvest-phone-stand-concept.svg",
    summary: "Three selectable studies—Tidepool Buddy, Filipino-first Capiz Cove, and Cozy Harvest—plus the preserved forest and fern concepts.",
    thesis: "Choose the emotional silhouette first; the same measured phone fit can serve every saved shell.",
    description: "The featured branch now contains two ocean directions and one cozy pixel-farm direction. Tidepool Buddy uses a manta stance and curling wave; Capiz Cove uses pearlescent shell-pane rhythm and a scalloped reef base; Cozy Harvest turns the structural support into a terraced field, barn, and cable bridge. The earlier forest guardian and fern cradle remain preserved rather than being replaced.",
    facts: [["3 featured versions", "Selectable below"], ["5 directions", "One project history"], ["1 shared coupon", "Case + angle test"]],
    modules: [["Tidepool Buddy", "Manta stance · curling wave · foam accents"], ["Capiz Cove", "Filipino shell panes · scallop reef · tide cradle"], ["Cozy Harvest", "Pixel field · barn support · cable bridge"], ["Shared fit core", "One phone envelope and charging route"]],
    questions: ["Exact phone model and case thickness, including any camera bump?", "Portrait and landscape, or portrait only—and preferred viewing angle?", "Wired charging, MagSafe, or both while the phone is docked?"],
    prompt: phoneOceanVersions[2].prompt,
    sources: phoneOceanVersions[2].sources,
  },
  {
    id: "ceramic-risers",
    title: "Ceramic Cabinet Risers",
    category: "Kitchen",
    status: "Layout outlined",
    image: "/projects/ceramic-cabinet-risers-concept.svg",
    summary: "Modular platforms that separate plates, bowls, and serving ceramics without wasting shelf height.",
    thesis: "Treat the cabinet as a small vertical room, not a pile of dishes.",
    description: "The starting system uses two bridge-style risers, a narrow corner step, and optional plate dividers. Open sides keep pieces visible and easy to lift, while ribbed feet spread weight and allow each module to print flat without support.",
    facts: [["3 modules", "Small / medium / corner"], ["1–2 plates", "Likely print plan"], ["PLA or PETG", "Dry cabinet use"]],
    modules: [["Low bridge", "Cups or small bowls above plates"], ["Tall bridge", "Serving pieces above everyday stacks"], ["Corner step", "Uses the awkward rear cabinet zone"], ["Plate dividers", "Optional vertical lanes for platters and lids"]],
    questions: ["Inside shelf width, depth, and clear height?", "Largest plate, bowl, and serving-piece diameters?", "Maximum stack weight and preferred shelf arrangement?"],
    prompt: "Design a modular ceramic cabinet-riser system for a Bambu Lab P1S: low and tall bridge platforms, a rear corner step, and optional vertical plate dividers. Open sides should preserve visibility and hand access, feet should spread load, and every module should print flat without support. Confirm inside shelf dimensions, ceramic diameters, stack heights, and approximate maximum load before CAD.",
  },
  {
    id: "film-camera-tools",
    title: "Film Camera Toolkit",
    category: "Photography",
    status: "System outlined",
    image: "/projects/film-camera-tools-concept.svg",
    summary: "Measured lens caps, camera docks, display stands, and small-parts organizers as one expandable system.",
    thesis: "Start with harmless fit coupons before anything touches vintage camera threads or finishes.",
    description: "The first collection separates soft-contact display hardware from precision lens accessories. A snap-cap test ring verifies diameter and flex before a cap is printed; camera docks use felt or TPU contact strips; labeled organizers keep batteries, rolls, caps, and adapters together without forcing one camera system into another.",
    facts: [["4 tool families", "Caps / docks / stands / trays"], ["Coupon first", "No forced lens fit"], ["Model-specific", "Measure each camera"]],
    modules: [["Lens-cap coupons", "Diameter, snap flex, and tab clearance"], ["Camera dock", "Soft-contact home for one body and mounted lens"], ["Display stand", "Stable presentation with strap and lens clearance"], ["Parts organizer", "Film rolls, batteries, caps, adapters, and tools"]],
    questions: ["Exact camera bodies and mounted lens combinations?", "Filter-thread or outside-barrel diameter for each cap?", "Display orientation, strap storage, and shelf footprint?"],
    prompt: "Outline a modular film-camera tool system with model-specific lens-cap fit coupons, soft-contact camera docks, display stands, and labeled organizers for film rolls, batteries, caps, and adapters. Never force a printed part onto a vintage lens: confirm each camera model, mounted-lens envelope, filter-thread or outside-barrel diameter, strap arrangement, and display footprint before CAD.",
    sources: [["Nikon cap and filter size examples", "https://www.nikonusa.com/accessories/dslr-lens-accessories"], ["Canon lens compatibility chart", "https://www.canon-europe.com/media/Lens_Accessory_Compatibility_Chart_1H17_tcm13-1169764.pdf"]],
  },
  {
    id: "token-upgrades",
    title: "Board Game Token Upgrade Studio",
    category: "Board Games",
    status: "Kit system outlined",
    image: "/projects/board-game-token-upgrades-concept.svg",
    summary: "Original replacement-token families that can be tuned to different games without copying logos or artwork.",
    thesis: "Upgrade table feel with one reusable design language, then tailor counts and symbols per game.",
    description: "The studio starts with four tactile token archetypes—resources, currency, status markers, and round or first-player markers. Each game receives its own inventory sheet, original geometric icon set, color plan, and storage footprint. A single sampler plate proves size, edge feel, stackability, and color contrast before a complete token batch is generated.",
    facts: [["4 archetypes", "Reusable token grammar"], ["1 sampler", "Coupon before batches"], ["Game-specific", "Counts after inventory"]],
    modules: [["Resource set", "Distinct silhouettes that remain readable without color"], ["Currency + score", "Stackable coins and high-value markers"], ["Status markers", "Condition, damage, charge, or action states"], ["Round marker", "Large table-visible anchor with original iconography"]],
    questions: ["Which two games should receive the first replacement kits?", "Exact token inventory, maximum footprint, and storage-box limits?", "Single-color, manual color swaps, or AMS-ready face inlays?"],
    prompt: "Create a board-game token replacement studio with original, logo-free iconography and four reusable token archetypes: resources, currency or score, status markers, and a large round or first-player marker. Start each game with a component inventory and storage-footprint check, then print one sampler plate to test size, edge feel, stackability, and color contrast before generating a full batch. Ask which two games come first, their exact token counts and storage limits, and whether printing is single-color, manual-swap, or AMS-ready.",
  },
  {
    id: "magnetic-island",
    title: "Magnetic 3D Island Board",
    category: "Board Games",
    status: "Five-plate scaffold",
    image: "/projects/magnetic-3d-island-board-concept.svg",
    summary: "A terrain-rich 19-hex island compatible with a standard CATAN base set, staged into smaller P1S prints.",
    thesis: "Build a dramatic 3D board that packs flat, assembles predictably, and never depends on loose exposed magnets.",
    description: "Nineteen original terrain tiles form the island, with six low shoreline-frame groups and keyed number-token nests. The planning split is three terrain plates, one coast-and-connector plate, and one player-piece test plate. Captured magnets connect the board; steel inserts in roads and buildings can provide gentle placement assistance without adding a second magnet to every small piece.",
    facts: [["19 hexes", "Official base-set count"], ["5 plates", "Planning estimate"], ["Captured only", "No loose magnets"]],
    modules: [["Terrain tiles", "Forest, field, pasture, hill, mountain, and desert forms"], ["Coast frame", "Six low-profile groups that square the assembled island"], ["Number nests", "Keyed recesses preserve random setup without magnets"], ["Piece anchors", "Steel-assisted roads, settlements, and cities where useful"]],
    questions: ["Use your current cardboard hex footprint or a new compact tile size?", "Which expansions, if any, must fit the first version?", "Preferred magnet size and whether children ever access the game?"],
    prompt: "Design an original magnetic 3D island board compatible with a standard 19-hex CATAN base set without copying published terrain art, logos, or sculpted assets. Stage it for a Bambu Lab P1S as three terrain plates, one coast-and-connector plate, and one player-piece test plate. Use permanently captured board magnets, a polarity jig, keyed number-token nests, and ferrous inserts rather than second magnets in small roads and buildings where practical. Confirm the user's hex footprint, expansion scope, chosen magnet dimensions, and whether children can access the game before CAD.",
    sources: [["Official base-game component count", "https://www.catan.com/sites/default/files/2021-06/catan_base_rules_2020_200707.pdf"], ["Official 3D-edition structure", "https://www.catan.com/sites/default/files/2024-01/Rules%203D-CATAN.pdf"], ["Magnet safety", "https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Magnets"]],
  },
  {
    id: "steam-controller-dock",
    title: "Steam Controller + Puck Dock",
    category: "Living Room",
    status: "Official CAD located",
    image: "/projects/steam-controller-dock-concept.svg",
    summary: "A controller-first dock with a dedicated Puck bay, cable routing, and desk or wall mounting.",
    thesis: "Use Valve's released shell geometry so the holder disappears around the hardware instead of guessing the fit.",
    description: "The first direction is a soft-contact cradle that supports the controller beneath the grips, leaves buttons and status areas clear, and routes the charging lead through the rear. A replaceable base converts between tabletop, wall, and under-shelf use; the Puck gets its own ventilated bay rather than becoming loose desk clutter.",
    facts: [["Official CAD", "STP + STL reference"], ["3 mounts", "Desk / wall / shelf"], ["2–3 parts", "Replaceable base"]],
    modules: [["Controller cradle", "Grip support with TPU or felt contact pads"], ["Puck bay", "Ventilated home with cable and antenna keep-outs"], ["Cable spine", "Rear routing with strain-relief space"], ["Mounting base", "Interchangeable tabletop, screw, or adhesive plate"]],
    questions: ["New 2026 Steam Controller, original 2015 model, or another gamepad?", "Tabletop, wall, under-shelf, or a convertible mount?", "Should the controller charge while stored, and where does the Puck sit?"],
    prompt: "Design a minimal Steam Controller and Puck dock using Valve's official released CAD and engineering keep-out drawings as the fit authority. The cradle should support the controller beneath the grips with soft contact pads, preserve controls, LEDs, antennas, ventilation, and charging access, and use an interchangeable tabletop, wall, or under-shelf base. Confirm whether this is the new 2026 Steam Controller or the original 2015 model, the mounting location, charging behavior, and Puck placement before CAD.",
    sources: [["Valve controller + Puck CAD release", "https://steamcommunity.com/groups/steam_hardware/announcements/detail/702141174212723353"], ["Official CAD repository", "https://gitlab.steamos.cloud/SteamHardware/SteamController"]],
  },
  {
    id: "quiet-utility-kit",
    title: "Apartment Quiet Utility Kit",
    category: "Apartment",
    status: "Four low-clutter ideas",
    image: "/projects/apartment-quiet-utility-concept.svg",
    summary: "A coordinated set of small organizers that use dead space and visually recede into the apartment.",
    thesis: "Every part should remove visible clutter, occupy no new floor area, and earn its place in one daily motion.",
    description: "The starter kit combines a shallow entry ledge, a couch-side remote rail, an under-shelf charging bridge, and a narrow cleaning-tool clip rail. Shared edge radii, hidden fasteners, and two neutral colorways keep the pieces feeling architectural rather than gadget-like. Each module remains optional and is sized only after photographing the actual location.",
    facts: [["4 modules", "One visual family"], ["0 floor area", "Uses walls + shelves"], ["Reversible", "Low-damage mounting"]],
    modules: [["Entry ledge", "Keys, wallet, and one mail slot without a catch-all bowl"], ["Remote rail", "Slim couch-side home for remotes and one controller"], ["Charging bridge", "Under-shelf phone shelf with hidden cable slack"], ["Tool clip rail", "Broom, duster, or vacuum tools in a narrow service zone"]],
    questions: ["Which three items are most often left without a home?", "Where are screw holes acceptable versus removable adhesive only?", "Wall, cabinet, and furniture colors to match or intentionally contrast?"],
    prompt: "Design a coordinated apartment quiet-utility kit that removes visible clutter without taking floor space: a shallow entry ledge, couch-side remote rail, under-shelf charging bridge, and narrow cleaning-tool clip rail. Use shared edge radii, hidden fasteners, reversible mounting options, and neutral finishes. Before CAD, ask which items lack a home, photograph and measure each exact location, identify screw-safe versus adhesive-only surfaces, and choose match-versus-contrast colors.",
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

      <div className="overview-lower-grid">
        <section className="page-card recent-projects">
          <div className="card-heading-row"><div><span className="page-eyebrow">Your projects</span><h2>Pick up where you left off</h2></div><button className="text-link" onClick={() => props.onNavigate("projects")}>View all <ChevronRight size={15} /></button></div>
          <button className="recent-project-row" onClick={() => props.onNavigate("projects")}>
            <span className="project-cover-thumb"><img src="/projects/porcelain-reed-vase-aug-2026-product.png" alt="Rendered Porcelain Reed Vase" /></span>
            <div><strong>Porcelain Reed Vase</strong><small>≈9–11 hr · ≈275 g PETG · 3 saved versions</small></div>
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

function ConceptProjectDetail({ project, onStart }: { project: (typeof conceptProjects)[number]; onStart: (idea: string) => void }) {
  return (
    <section className="organizer-concept concept-project-detail page-card" aria-labelledby={`${project.id}-title`}>
      <div className="card-heading-row">
        <div><span className="page-eyebrow">{project.category} · Concept queue</span><h2 id={`${project.id}-title`}>{project.title}</h2><p>{project.summary}</p></div>
        <span className="research-badge"><Sparkles size={14} /> {project.status}</span>
      </div>
      <div className="organizer-concept-grid">
        <div className="organizer-concept-art"><img src={project.image} alt={`${project.title} concept diagram`} /></div>
        <div className="organizer-concept-copy">
          <span className="recommendation-tag"><BadgeCheck size={14} /> P1S-aware starting direction · dimensions still required</span>
          <h3>{project.thesis}</h3>
          <p>{project.description}</p>
          <div className="project-spec-strip concept-facts">
            {project.facts.map(([value, label]) => <span key={label}><Ruler size={16} /><small>{label}</small><strong>{value}</strong></span>)}
          </div>
          <div className="organizer-module-grid concept-module-grid">
            {project.modules.map(([name, detail]) => <span key={name}><Box size={17} /><strong>{name}</strong><small>{detail}</small></span>)}
          </div>
          <div className="concept-question-list"><strong>Three answers unlock CAD</strong>{project.questions.map((question, index) => <span key={question}><b>{index + 1}</b>{question}</span>)}</div>
          <button className="primary-button organizer-start" onClick={() => onStart(project.prompt)}>Start measurements <ArrowRight size={16} /></button>
          {project.sources && <div className="organizer-sources"><span>Research:</span>{project.sources.map(([label, url]) => <a href={url} target="_blank" rel="noreferrer" key={url}>{label}</a>)}</div>}
        </div>
      </div>
    </section>
  );
}

function PhoneStandProjectDetail({
  project,
  selectedVersion,
  onSelect,
  onStart,
}: {
  project: (typeof conceptProjects)[number];
  selectedVersion: (typeof phoneOceanVersions)[number];
  onSelect: (id: PhoneOceanVersionId) => void;
  onStart: (idea: string) => void;
}) {
  return (
    <section className="organizer-concept concept-project-detail phone-stand-detail page-card" aria-labelledby="phone-stands-title">
      <div className="card-heading-row">
        <div><span className="page-eyebrow">{project.category} · Saved design study</span><h2 id="phone-stands-title">{project.title}</h2><p>{project.summary}</p></div>
        <span className="research-badge"><Sparkles size={14} /> {project.status}</span>
      </div>
      <div className="phone-version-switcher" aria-label="Ocean phone stand versions">
        {phoneOceanVersions.map((version) => {
          const selected = selectedVersion.id === version.id;
          return <button className={`phone-version-button ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={() => onSelect(version.id)} key={version.id}>
            <span className="phone-version-thumb"><img src={version.image} alt="" /></span>
            <span><small>Version {version.version} · {version.label}</small><strong>{version.name}</strong><em>{selected ? <><Check size={12} /> Selected</> : "View direction"}</em></span>
          </button>;
        })}
      </div>
      <div className="organizer-concept-grid phone-selected-version">
        <div className="organizer-concept-art"><img src={selectedVersion.image} alt={`${selectedVersion.name} phone stand concept diagram`} /></div>
        <div className="organizer-concept-copy">
          <span className="recommendation-tag"><BadgeCheck size={14} /> Selected · Version {selectedVersion.version} · dimensions still required</span>
          <h3>{selectedVersion.thesis}</h3>
          <p>{selectedVersion.description}</p>
          <div className="project-spec-strip concept-facts">
            {selectedVersion.facts.map(([value, label]) => <span key={label}><Ruler size={16} /><small>{label}</small><strong>{value}</strong></span>)}
          </div>
          <div className="organizer-module-grid concept-module-grid">
            {selectedVersion.modules.map(([name, detail]) => <span key={name}><Box size={17} /><strong>{name}</strong><small>{detail}</small></span>)}
          </div>
          <div className="concept-question-list"><strong>Three answers unlock shared fit CAD</strong>{project.questions.map((question, index) => <span key={question}><b>{index + 1}</b>{question}</span>)}</div>
          <button className="primary-button organizer-start" onClick={() => onStart(selectedVersion.prompt)}>Start {selectedVersion.name} measurements <ArrowRight size={16} /></button>
          <div className="organizer-sources"><span>Research:</span>{selectedVersion.sources.map(([label, url]) => <a href={url} target="_blank" rel="noreferrer" key={url}>{label}</a>)}</div>
        </div>
      </div>
    </section>
  );
}

function ProjectsPage(props: DashboardProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectSelection>("vase");
  const [selectedVaseId, setSelectedVaseId] = useState<VaseVersionId>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_VASE_VERSION_KEY);
      return saved === "petal-twist" || saved === "leaf-bloom" || saved === "porcelain-reed" ? saved : "porcelain-reed";
    } catch {
      return "porcelain-reed";
    }
  });
  const selectedVase = vaseVersions.find((version) => version.id === selectedVaseId) ?? vaseVersions[2];
  const [selectedPhoneVersionId, setSelectedPhoneVersionId] = useState<PhoneOceanVersionId>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_PHONE_VERSION_KEY);
      return saved === "tidepool-buddy" || saved === "capiz-cove" || saved === "cozy-harvest" ? saved : "cozy-harvest";
    } catch {
      return "cozy-harvest";
    }
  });
  const selectedPhoneVersion = phoneOceanVersions.find((version) => version.id === selectedPhoneVersionId) ?? phoneOceanVersions[2];
  const phoneStandProject = conceptProjects.find((project) => project.id === "phone-stands") ?? conceptProjects[0];
  const chooseProject = (id: ProjectSelection) => {
    setSelectedProject(id);
    requestAnimationFrame(() => document.getElementById("selected-project-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const selectVase = (id: VaseVersionId) => {
    setSelectedProject("vase");
    setSelectedVaseId(id);
    try { localStorage.setItem(SELECTED_VASE_VERSION_KEY, id); } catch { /* Local persistence is optional. */ }
    requestAnimationFrame(() => document.getElementById("selected-project-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const selectPhoneVersion = (id: PhoneOceanVersionId) => {
    setSelectedProject("phone-stands");
    setSelectedPhoneVersionId(id);
    try { localStorage.setItem(SELECTED_PHONE_VERSION_KEY, id); } catch { /* Local persistence is optional. */ }
  };
  return (
    <>
      <PageHeader
        eyebrow="My projects"
        title="Every print has a plan."
        description="Single parts stay simple. Compound projects are broken into plates, checkpoints, and assembly steps."
        action={<button className="primary-button page-action" onClick={props.onNewProject}><Plus size={17} /> New project</button>}
      />

      <section className="project-index-section" aria-labelledby="completed-projects-title">
        <div className="project-index-heading">
          <div><span className="page-eyebrow">Completed</span><h2 id="completed-projects-title">Ready whenever you need them</h2></div>
          <span>1 project</span>
        </div>
        <div className="project-index-grid">
          <button className={`project-index-card ${selectedProject === "drawer-gap" ? "selected" : ""}`} aria-pressed={selectedProject === "drawer-gap"} onClick={() => chooseProject("drawer-gap")}>
            <span className="project-index-art"><img src="/projects/drawer-gap-tray-aug-2026-product.png" alt="Drawer Gap Tray render" /><em className="project-index-badge complete"><Check size={12} /> Completed</em></span>
            <span className="project-index-copy"><span><strong>Drawer Gap Tray</strong><small>Ready to reprint</small></span><ChevronRight size={18} /></span>
          </button>
        </div>
      </section>

      <section className="project-index-section" aria-labelledby="active-projects-title">
        <div className="project-index-heading">
          <div><span className="page-eyebrow">Active projects</span><h2 id="active-projects-title">Continue your latest work</h2></div>
          <span>4 projects</span>
        </div>
        <div className="project-index-grid">
          <button className={`project-index-card ${selectedProject === "vase" ? "selected" : ""}`} aria-pressed={selectedProject === "vase"} onClick={() => chooseProject("vase")}>
            <span className="project-index-art"><img src="/projects/porcelain-reed-vase-aug-2026-product.png" alt="Porcelain Reed Vase render" /><em className="project-index-badge recent">Most recent</em></span>
            <span className="project-index-copy"><span><strong>Porcelain Reed Vase</strong><small>Vase STL ready · bouquet study</small></span><ChevronRight size={18} /></span>
          </button>
          <button className={`project-index-card ${selectedProject === "seven-wonders" ? "selected" : ""}`} aria-pressed={selectedProject === "seven-wonders"} onClick={() => chooseProject("seven-wonders")}>
            <span className="project-index-art"><img src="/projects/seven-wonders-duel-organizer-concept.svg?v=2" alt="7 Wonders Duel organizer concept" /><em className="project-index-badge">Fit check</em></span>
            <span className="project-index-copy"><span><strong>7 Wonders Duel</strong><small>Confirm box and sleeves</small></span><ChevronRight size={18} /></span>
          </button>
          <button className={`project-index-card ${selectedProject === "cozy" ? "selected" : ""}`} aria-pressed={selectedProject === "cozy"} onClick={() => chooseProject("cozy")}>
            <span className="project-index-art"><img src="/projects/cozy-stickerville-organizer-concept.svg?v=2" alt="Cozy Stickerville organizer concept" /><em className="project-index-badge">Fit check</em></span>
            <span className="project-index-copy"><span><strong>Cozy Stickerville</strong><small>Confirm box and save box</small></span><ChevronRight size={18} /></span>
          </button>
          <button className={`project-index-card ${selectedProject === "magnetic" ? "selected" : ""}`} aria-pressed={selectedProject === "magnetic"} onClick={() => chooseProject("magnetic")}>
            <span className="project-index-art"><img src="/projects/magnetic-hex-token-two-pod-starter-kit-aug-2026-product.png?v=1" alt="Magnetic Hex Token Pods render" /><em className="project-index-badge ready">STL ready</em></span>
            <span className="project-index-copy"><span><strong>Magnetic Hex Token Pods</strong><small>Print the fit coupon first</small></span><ChevronRight size={18} /></span>
          </button>
        </div>
      </section>

      <section className="project-index-section concept-index-section" aria-labelledby="concept-projects-title">
        <div className="project-index-heading">
          <div><span className="page-eyebrow">Concept queue</span><h2 id="concept-projects-title">New projects to measure and shape</h2></div>
          <span>{conceptProjects.length} projects</span>
        </div>
        <div className="project-index-grid concept-index-grid">
          {conceptProjects.map((project) => <button className={`project-index-card ${selectedProject === project.id ? "selected" : ""}`} aria-pressed={selectedProject === project.id} onClick={() => chooseProject(project.id)} key={project.id}>
            <span className="project-index-art"><img src={project.image} alt={`${project.title} concept`} /><em className="project-index-badge concept">Concept</em></span>
            <span className="project-index-copy"><span><strong>{project.title}</strong><small>{project.status}</small></span><ChevronRight size={18} /></span>
          </button>)}
        </div>
      </section>

      <div className="project-detail-heading" id="selected-project-detail">
        <span className="page-eyebrow">Selected project</span>
        <h2>Quick overview, diagram, and print details</h2>
      </div>

      {selectedProject === "vase" && <>
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
          <span className="version-count">3 saved versions</span>
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

      {selectedVase.id === "porcelain-reed" && <section className="organizer-concept vase-bouquet-plan page-card" aria-labelledby="bouquet-plan-title">
        <div className="card-heading-row">
          <div><span className="page-eyebrow">Companion project · Printable flowers</span><h2 id="bouquet-plan-title">Build one bouquet that can keep changing.</h2><p>The vase body is printable now. The coordinated flower system is staged as interchangeable heads, flat-print stems, leaves, color centers, and a removable arrangement grid.</p></div>
          <span className="research-badge"><Flower2 size={14} /> Bouquet · design review</span>
        </div>
        <div className="organizer-concept-grid">
          <div className="organizer-concept-art"><img src="/projects/porcelain-reed-bouquet-concept.svg" alt="Porcelain Reed vase with modular printable flowers" /></div>
          <div className="organizer-concept-copy">
            <span className="recommendation-tag"><BadgeCheck size={14} /> White vase · reusable dry arrangement</span>
            <h3>Use one universal stem connection across every flower.</h3>
            <p>Three flower silhouettes keep the bouquet varied without creating a pile of one-off parts. Heads, centers, stems, and leaves separate by color; a hidden grid under the rim keeps the arrangement open and balanced.</p>
            <div className="project-spec-strip concept-facts">
              <span><Layers3 size={16} /><small>Estimated plan</small><strong>Vase + 3 plates</strong></span>
              <span><Component size={16} /><small>Starter bouquet</small><strong>7 stems</strong></span>
              <span><Printer size={16} /><small>Color changes</small><strong>No AMS required</strong></span>
            </div>
            <div className="organizer-module-grid concept-module-grid">
              <span><Flower2 size={17} /><strong>Hero blooms</strong><small>Six-petal, eight-petal, and star silhouettes</small></span>
              <span><Sprout size={17} /><strong>Stems + leaves</strong><small>Flat-print profiles with keyed snap joints</small></span>
              <span><CircleDot size={17} /><strong>Color centers</strong><small>Small replaceable inserts for palette changes</small></span>
              <span><Grid3X3 size={17} /><strong>Stem grid</strong><small>Removable insert sized to the 91 mm opening</small></span>
            </div>
            <button className="primary-button organizer-start" onClick={() => props.onStartIdea("Continue the Porcelain Reed Evergarden bouquet. Keep the approved 245 mm white fine-fluted vase. Design seven reusable 3D-printed flowers using three original head silhouettes, one universal keyed stem joint, flat-print stems and leaves, separate snap-fit color centers, and a removable arrangement grid for the approximately 91 mm vase opening. Keep every part support-free for a Bambu Lab P1S with a 0.4 mm nozzle and split the bouquet into practical color plates without requiring an AMS.")}>Continue the flower kit <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>}

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

      </>}

      {selectedProject === "seven-wonders" &&
      <section className="organizer-concept page-card seven-wonders-organizer" id="seven-wonders-organizer" aria-labelledby="organizer-title">
        <div className="card-heading-row"><div><span className="page-eyebrow">Board Games · Layout pipeline</span><h2 id="organizer-title">7 Wonders Duel organizer</h2><p>A four-module base-game plan with published card dimensions mapped and three physical fit checks remaining.</p></div><span className="research-badge"><Gamepad2 size={14} /> Web dimensions mapped</span></div>
        <div className="organizer-concept-grid">
          <div className="organizer-concept-art"><img src="/projects/seven-wonders-duel-organizer-concept.svg?v=2" alt="Exploded four-module organizer plan for 7 Wonders Duel" /></div>
          <div className="organizer-concept-copy">
            <span className="recommendation-tag"><BadgeCheck size={14} /> 205–208 mm box family · 73 small + 12 Wonder cards</span>
            <h3>The component map is known. Your copy sets the final fit.</h3>
            <p>Published outer boxes vary slightly by printing. The current plan keeps a conservative 196 mm prototype envelope and stages the card modules first, so sleeve clearance is approved before the loose-piece plate.</p>
            <div className="organizer-module-grid">
              <span><CreditCard size={17} /><strong>Age card bank</strong><small>73 cards · 44 × 68 mm · Ages I–III + Guilds</small></span>
              <span><Gem size={17} /><strong>Wonder cradle</strong><small>12 cards · 65 × 100 mm · wide thumb ramp</small></span>
              <span><Coins size={17} /><strong>Coin bank</strong><small>121.5 × 76.5 × 28 mm · three table-ready wells</small></span>
              <span><Gamepad2 size={17} /><strong>Token caddy</strong><small>72.5 × 76.5 × 28 mm · Progress, Military, Conflict</small></span>
            </div>
            <div className="organizer-gates"><strong>Three physical checks before CAD</strong><span>1. Inside box width, depth, and usable height</span><span>2. Unsleeved or sleeve brand + expansion scope</span><span>3. Board/rule stack thickness + storage orientation</span></div>
            <button className="primary-button organizer-start" onClick={() => props.onStartIdea("A responsive four-module 7 Wonders Duel organizer for the base game: an Age card bank for 73 cards at 44 × 68 mm, a Wonder cradle for 12 cards at 65 × 100 mm, a three-value coin bank, and a token caddy for Progress, Military, and Conflict pieces. Published outer boxes vary around 205–208 mm square; confirm only the inside box dimensions and usable height, sleeve brand or unsleeved plus expansion scope, and board/rule stack thickness plus storage orientation before CAD.")}>Confirm 7 Wonders fit <ArrowRight size={16} /></button>
            <div className="organizer-sources"><span>Open:</span><a href="/projects/seven-wonders-duel-organizer-v1-aug-2026.md" target="_blank" rel="noreferrer">Layout packet</a><a href="https://www.asmodee.co.uk/products/asm7du-en01-7-wonders-duel" target="_blank" rel="noreferrer">Box dimensions</a><a href="https://www.rykergames.com/products/7-wonders-duel-card-sleeve-kit" target="_blank" rel="noreferrer">Card dimensions</a><a href="https://sevenwondersduel.com/" target="_blank" rel="noreferrer">Official contents</a></div>
          </div>
        </div>
      </section>}

      {selectedProject === "cozy" &&
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
      </section>}

      {selectedProject === "magnetic" &&
      <section className="organizer-concept page-card magnetic-organizer" id="magnetic-token-system" aria-labelledby="magnetic-token-title">
        <div className="card-heading-row"><div><span className="page-eyebrow">Board Games · Printable alpha</span><h2 id="magnetic-token-title">Magnetic Hex Token Pods</h2><p>A reusable polygon tray system with optional one-, two-, and three-zone interiors plus replaceable 6 × 2 mm magnet cups.</p></div><span className="ready-project-badge"><PackageCheck size={14} /> Alpha STL ready</span></div>
        <div className="organizer-concept-grid">
          <div className="organizer-concept-art"><img src="/projects/magnetic-hex-token-two-pod-starter-kit-aug-2026-product.png?v=1" alt="Actual STL render of two magnetic hex token pods and twelve removable magnet cups" /></div>
          <div className="organizer-concept-copy">
            <div className="project-spec-strip">
              <span><Ruler size={16} /><small>Pod size</small><strong>96 × 83.1 × 22 mm</strong></span>
              <span><Printer size={16} /><small>Print setup</small><strong>P1S · one plate</strong></span>
              <span><Component size={16} /><small>Starter set</small><strong>2 pods · 12 cups</strong></span>
            </div>
            <h3>Print the magnet coupon before the tray.</h3>
            <p>The tray itself is a clean manifold shell. Separate glue-on magnet cups keep the first prototype support-free, repairable, and safer to iterate if your magnets measure differently. The starter plate now includes two pods so the first full print can actually prove connection strength and polarity.</p>
            <div className="magnetic-prototype-path" aria-label="Magnetic token pod prototype sequence">
              <span><b>1</b><strong>Fit</strong><small>Choose the 6.20, 6.35, or 6.50 mm magnet pocket.</small></span>
              <span><b>2</b><strong>Connect</strong><small>Print two pods and twelve cups on one P1S plate.</small></span>
              <span><b>3</b><strong>Batch</strong><small>Then choose single, split, or triple wells.</small></span>
            </div>
            <div className="project-primary-actions">
              <a className="primary-button" href="/projects/magnetic-hex-token-tray-fit-coupon-aug-2026.stl" download><Download size={16} /> 1 · Magnet coupon</a>
              <a className="secondary-button" href="/projects/magnetic-hex-token-two-pod-starter-kit-aug-2026.stl" download><Download size={16} /> 2 · Two-pod starter</a>
              <a className="text-link" href="/projects/magnetic-hex-token-system-aug-2026-print-guide.md" target="_blank" rel="noreferrer">Print guide <ArrowRight size={15} /></a>
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
      </section>}

      {selectedProject === "drawer-gap" &&
      <section className="completed-project-feature project-completed-feature page-card" id="drawer-gap-tray">
        <div className="completed-project-cover"><img src="/projects/drawer-gap-tray-aug-2026-product.png" alt="Actual STL render of the completed Drawer Gap Tray" /></div>
        <div className="completed-project-copy">
          <span className="completion-kicker"><Check size={15} /> Completed · Aug 2026</span>
          <h2>Drawer Gap Tray</h2>
          <p>The approved one-compartment tray fills the narrow zone beside the existing Gridfinity layout and remains ready for reprint or revision.</p>
          <div className="completed-project-facts"><span><strong>254.4 × 39.4 × 49.4 mm</strong><small>Final outside size</small></span><span><strong>1 plate</strong><small>Single part</small></span><span><strong>≈111 g PLA</strong><small>Planning estimate</small></span></div>
          <div className="completed-project-actions"><button className="primary-button" onClick={props.onOpenProject}><PackageCheck size={16} /> Open completed project</button></div>
        </div>
      </section>}

      {selectedProject === "phone-stands" && <PhoneStandProjectDetail project={phoneStandProject} selectedVersion={selectedPhoneVersion} onSelect={selectPhoneVersion} onStart={props.onStartIdea} />}
      {conceptProjects.map((project) => selectedProject === project.id && project.id !== "phone-stands" ? <ConceptProjectDetail project={project} onStart={props.onStartIdea} key={project.id} /> : null)}

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
      <PageHeader eyebrow="Design library" title="Start with something familiar." description="Choose a simple pattern, then PrintPath will ask only for the dimensions and decisions that change the result." />
      <section className="minimal-library page-card">
        <div className="minimal-library-heading">
          <div><span className="page-eyebrow">Templates</span><h2>{activeCategory === "Popular" ? "Useful starting points" : activeCategory}</h2><p>{visibleTemplates.length} focused options · select one to begin the measured setup.</p></div>
          <span className="profile-context"><Printer size={14} /> P1S · {props.nozzle} mm · {props.plate}</span>
        </div>
        <div className="catalog-filters minimal-catalog-filters" aria-label="Template categories">{catalogCategories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}<span>{category === "Popular" ? catalogTemplates.filter((item) => item.popular).length : catalogTemplates.filter((item) => item.category === category).length}</span></button>)}</div>
        <div className="minimal-template-list">
          {visibleTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button className="minimal-template-item" key={template.id} onClick={() => props.onUseTemplate(template.id)}>
                <span className={`minimal-template-icon tone-${template.tone}`}><Icon size={20} /></span>
                <span className="minimal-template-copy"><em>{template.category}</em><strong>{template.title}</strong><small>{template.description}</small></span>
                <span className="minimal-template-meta"><small>You provide</small><strong>{template.input}</strong></span>
                <ArrowRight size={17} />
              </button>
            );
          })}
        </div>
      </section>
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
