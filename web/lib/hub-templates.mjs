/**
 * Module registry · template_id → wizard config (P1 live in alpha; rest documented stubs).
 */

export const CONDITION_OPTIONS = [
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair / wear" },
  { value: "poor", label: "Damage / repair" },
  { value: "na", label: "N/A" },
];

const DEFAULT_ROOMS = [
  { key: "entry", label: "Entry / foyer" },
  { key: "living", label: "Living room" },
  { key: "kitchen", label: "Kitchen" },
  { key: "bath_main", label: "Main bath" },
  { key: "bed_primary", label: "Primary bedroom" },
  { key: "bed_2", label: "Bedroom 2" },
  { key: "hall", label: "Hall / stairs" },
  { key: "exterior", label: "Exterior / porch" },
];

function sectionsFromRooms(rooms) {
  return rooms.map((r) => ({
    key: r.key,
    label: r.label,
    condition: "good",
    notes: "",
    photoUrl: "",
  }));
}

/** @type {Record<string, { id: string, phase: string, label: string, blurb: string, p1: boolean, defaultRooms: typeof DEFAULT_ROOMS }>} */
export const RECEIPT_TEMPLATES = {
  move_in_baseline: {
    id: "move_in_baseline",
    phase: "P1",
    label: "Move-in baseline",
    blurb: "Room-by-room condition at lease start · pairs with move-out for compare.",
    p1: true,
    defaultRooms: DEFAULT_ROOMS,
  },
  move_out_condition: {
    id: "move_out_condition",
    phase: "P1",
    label: "Move-out condition",
    blurb: "Same room list at surrender · feeds compare and deposit exhibit.",
    p1: true,
    defaultRooms: DEFAULT_ROOMS,
  },
  deposit_deduction_exhibit: {
    id: "deposit_deduction_exhibit",
    phase: "P2",
    label: "Deposit deduction exhibit",
    blurb: "Line items mapped from Deposit Desk withhold step.",
    p1: false,
    defaultRooms: [],
  },
  key_fob_handoff: {
    id: "key_fob_handoff",
    phase: "P2",
    label: "Key / fob handoff",
    blurb: "Counts, photos, optional signatures.",
    p1: false,
    defaultRooms: [{ key: "keys", label: "Keys & access" }],
  },
  compare_report: {
    id: "compare_report",
    phase: "P2",
    label: "Move-in vs move-out compare",
    blurb: "Derived export · not a separate capture wizard.",
    p1: false,
    defaultRooms: [],
  },
  maintenance_visit: {
    id: "maintenance_visit",
    phase: "P3",
    label: "Maintenance visit",
    blurb: "Vendor note + photos.",
    p1: false,
    defaultRooms: [{ key: "visit", label: "Visit summary" }],
  },
  entry_notice: {
    id: "entry_notice",
    phase: "P3",
    label: "Entry notice",
    blurb: "Documentation of notice · not legal service.",
    p1: false,
    defaultRooms: [],
  },
  periodic_inspection: {
    id: "periodic_inspection",
    phase: "P3",
    label: "Periodic inspection",
    blurb: "Quarterly or annual walk.",
    p1: false,
    defaultRooms: DEFAULT_ROOMS,
  },
  str_turnover: {
    id: "str_turnover",
    phase: "P4",
    label: "STR turnover",
    blurb: "Checklist + linens / amenities.",
    p1: false,
    defaultRooms: [],
  },
  str_damage_claim: {
    id: "str_damage_claim",
    phase: "P4",
    label: "STR damage claim pack",
    blurb: "Evidence bundle for platform dispute.",
    p1: false,
    defaultRooms: [],
  },
  water_48h: {
    id: "water_48h",
    phase: "P5",
    label: "Water 48h",
    blurb: "Chicago / local compliance capture.",
    p1: false,
    defaultRooms: [],
  },
  contents_inventory: {
    id: "contents_inventory",
    phase: "P5",
    label: "Contents inventory",
    blurb: "Room list + serials.",
    p1: false,
    defaultRooms: [],
  },
  str_license_manifest: {
    id: "str_license_manifest",
    phase: "P5",
    label: "STR license manifest",
    blurb: "Jurisdiction-specific fields.",
    p1: false,
    defaultRooms: [],
  },
  owner_job_diary: {
    id: "owner_job_diary",
    phase: "P6",
    label: "Owner job diary",
    blurb: "Vendor work log · extends /logs concept.",
    p1: false,
    defaultRooms: [],
  },
};

export function listTemplates({ p1Only = false } = {}) {
  return Object.values(RECEIPT_TEMPLATES).filter((t) => !p1Only || t.p1);
}

export function getTemplate(templateId) {
  return RECEIPT_TEMPLATES[templateId] || null;
}

export function defaultSectionsForTemplate(templateId) {
  const t = getTemplate(templateId);
  if (!t || !t.defaultRooms?.length) return [];
  return sectionsFromRooms(t.defaultRooms);
}
