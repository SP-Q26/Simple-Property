/**
 * Major-city presets for Deposit Desk step 1.
 * Only entries with returnDays change deadline math today (Chicago RLTO 45).
 * Other cities: documentation + guide links when local fees or ordinances may apply.
 * Not legal advice.
 */

/** @typedef {{ id: string, label: string, state: string, cityName: string, returnDays?: number, jurisdiction?: string, blogSlug?: string, hint?: string }} CityPreset */

/** @type {CityPreset[]} */
export const CITY_PRESETS = [
  {
    id: "",
    label: "Other city or suburb (state default clock)",
    state: "*",
    cityName: "",
    hint: "Use state return window unless counsel confirms a local ordinance.",
  },
  {
    id: "chicago-il",
    label: "Chicago · RLTO 45-day deposit clock",
    state: "IL",
    cityName: "Chicago",
    returnDays: 45,
    jurisdiction: "Chicago RLTO",
    blogSlug: "chicago-45-day-deposit-deadline",
    hint: "Chicago RLTO: 45 days after surrender. Rest of Illinois: 30 days (765 ILCS 715/).",
  },
  {
    id: "evanston-il",
    label: "Evanston",
    state: "IL",
    cityName: "Evanston",
    blogSlug: "evanston-illinois-rental-deposit-guide",
    hint: "Evanston has local rental rules beyond state defaults. Confirm deposit timing with counsel.",
  },
  {
    id: "indianapolis-in",
    label: "Indianapolis",
    state: "IN",
    cityName: "Indianapolis",
    blogSlug: "indianapolis-indiana-deposit-local-guide",
    hint: "Indiana statewide default: 45 days after surrender (IC 32-31-3-12). Marion County may add registration or habitability programs.",
  },
  {
    id: "fort-wayne-in",
    label: "Fort Wayne",
    state: "IN",
    cityName: "Fort Wayne",
    blogSlug: "fort-wayne-indiana-deposit-local-guide",
    hint: "State 45-day clock applies unless local counsel says otherwise.",
  },
  {
    id: "columbus-oh",
    label: "Columbus",
    state: "OH",
    cityName: "Columbus",
    blogSlug: "columbus-ohio-deposit-local-guide",
    hint: "Ohio default: 30 days after surrender (ORC 5321.16). City registration or code enforcement may apply separately.",
  },
  {
    id: "cleveland-oh",
    label: "Cleveland",
    state: "OH",
    cityName: "Cleveland",
    blogSlug: "cleveland-ohio-deposit-local-guide",
    hint: "Ohio 30-day return default. Cleveland operators often track lead and rental registration outside the deposit packet.",
  },
  {
    id: "cincinnati-oh",
    label: "Cincinnati",
    state: "OH",
    cityName: "Cincinnati",
    blogSlug: "cincinnati-ohio-deposit-local-guide",
    hint: "Ohio 30-day clock · confirm any city rental certificate requirements with counsel.",
  },
  {
    id: "detroit-mi",
    label: "Detroit",
    state: "MI",
    cityName: "Detroit",
    blogSlug: "detroit-michigan-deposit-local-guide",
    hint: "Michigan default: 30 days after surrender (MCL 554.610). Detroit may require property registration unrelated to itemization lines.",
  },
  {
    id: "grand-rapids-mi",
    label: "Grand Rapids",
    state: "MI",
    cityName: "Grand Rapids",
    blogSlug: "grand-rapids-michigan-deposit-local-guide",
    hint: "State 30-day deposit window · verify Kent County or city rental programs with counsel.",
  },
  {
    id: "des-moines-ia",
    label: "Des Moines",
    state: "IA",
    cityName: "Des Moines",
    blogSlug: "des-moines-iowa-deposit-local-guide",
    hint: "Iowa default: 30 days after surrender (Iowa Code 562A.12).",
  },
  {
    id: "iowa-city-ia",
    label: "Iowa City",
    state: "IA",
    cityName: "Iowa City",
    blogSlug: "iowa-city-iowa-deposit-local-guide",
    hint: "University-town turnover: same state clock · heavy move-in/move-out documentation habits help disputes.",
  },
  {
    id: "kansas-city-mo",
    label: "Kansas City",
    state: "MO",
    cityName: "Kansas City",
    blogSlug: "kansas-city-missouri-deposit-local-guide",
    hint: "Missouri default: 30 days after surrender (RSMo 535.300). Kansas City spans two states on the map · pick Missouri in the wizard for MO properties.",
  },
  {
    id: "st-louis-mo",
    label: "St. Louis",
    state: "MO",
    cityName: "St. Louis",
    blogSlug: "st-louis-missouri-deposit-local-guide",
    hint: "Missouri 30-day clock · city occupancy or rental inspection rules may run on a separate calendar from deposit return.",
  },
  {
    id: "miami-fl",
    label: "Miami · Fla. Stat. § 83.49 two-step",
    state: "FL",
    cityName: "Miami",
    blogSlug: "florida-83-49-two-step-miami-condo-deposit",
    hint:
      "Florida: within 15 days after termination and possession, return the full deposit or send written claim notice · then 30 days after notice for balance and accounting. See metro guide · confirm with counsel.",
  },
  {
    id: "tampa-fl",
    label: "Tampa",
    state: "FL",
    cityName: "Tampa",
    blogSlug: "tampa-florida-deposit-local-guide",
    hint: "Florida § 83.49 two-step habits apply statewide · Tampa registration or code programs may run separately from deposit itemization.",
  },
  {
    id: "orlando-fl",
    label: "Orlando",
    state: "FL",
    cityName: "Orlando",
    blogSlug: "orlando-florida-deposit-local-guide",
    hint: "Same Florida claim-notice fork as other metros · log surrender when keys and vacant unit align.",
  },
  {
    id: "jacksonville-fl",
    label: "Jacksonville",
    state: "FL",
    cityName: "Jacksonville",
    blogSlug: "jacksonville-florida-deposit-local-guide",
    hint: "Florida statewide clock · confirm Duval registration habits with counsel if applicable.",
  },
  {
    id: "atlanta-ga",
    label: "Atlanta",
    state: "GA",
    cityName: "Atlanta",
    blogSlug: "atlanta-georgia-deposit-local-guide",
    hint: "Georgia default: 30 days after surrender (O.C.G.A. 44-7-34). City rental registration may apply separately.",
  },
  {
    id: "richmond-va",
    label: "Richmond",
    state: "VA",
    cityName: "Richmond",
    blogSlug: "richmond-virginia-deposit-local-guide",
    hint: "Virginia 45-day default from surrender · itemization and mail proof discipline.",
  },
  {
    id: "northern-virginia-va",
    label: "Northern Virginia",
    state: "VA",
    cityName: "Northern Virginia",
    blogSlug: "northern-virginia-deposit-local-guide",
    hint: "Belt investors mix DC, Maryland, and Virginia clocks. Pick Virginia for VA properties on step 1.",
  },
  {
    id: "baltimore-md",
    label: "Baltimore",
    state: "MD",
    cityName: "Baltimore",
    blogSlug: "baltimore-maryland-deposit-local-guide",
    hint: "Maryland 45-day return default · Baltimore rental registration is separate from deposit packet lines.",
  },
  {
    id: "salt-lake-city-ut",
    label: "Salt Lake City",
    state: "UT",
    cityName: "Salt Lake City",
    blogSlug: "salt-lake-city-utah-deposit-local-guide",
    hint: "Utah 30-day default from surrender · penalty track if you miss the on-screen line.",
  },
  {
    id: "new-orleans-la",
    label: "New Orleans",
    state: "LA",
    cityName: "New Orleans",
    blogSlug: "new-orleans-louisiana-deposit-local-guide",
    hint: "Louisiana 30-day default · hurricane-season turns need dated photos and itemized accounting.",
  },
  {
    id: "seattle-wa",
    label: "Seattle",
    state: "WA",
    cityName: "Seattle",
    blogSlug: "seattle-washington-deposit-local-guide",
    hint: "Washington substantiation habits · tie each withhold to invoices or backup in the packet.",
  },
  {
    id: "las-vegas-nv",
    label: "Las Vegas",
    state: "NV",
    cityName: "Las Vegas",
    blogSlug: "las-vegas-nevada-deposit-local-guide",
    hint: "Nevada expects return and itemization in one coordinated mailing · log tracking in operator logs.",
  },
];

export function normalizeCityPresetId(raw) {
  const id = String(raw || "").trim();
  if (!id) return "";
  return CITY_PRESETS.some((c) => c.id === id) ? id : "";
}

export function presetsForState(stateCode) {
  const code = String(stateCode || "IL").toUpperCase();
  return CITY_PRESETS.filter((c) => c.state === "*" || c.state === code);
}

export function resolveCityOverlay(stateCode, cityPresetId) {
  const id = normalizeCityPresetId(cityPresetId);
  if (!id) return null;
  const row = CITY_PRESETS.find((c) => c.id === id);
  if (!row || row.state === "*") return null;
  if (row.state !== String(stateCode || "").toUpperCase()) return null;
  return row;
}

/** Legacy checkbox maps to Chicago preset */
export function cityPresetFromLegacy({ state, inChicago, cityPreset }) {
  const preset = normalizeCityPresetId(cityPreset);
  if (preset) return preset;
  if (state === "IL" && inChicago) return "chicago-il";
  return "";
}

export function inChicagoFromPreset(cityPresetId) {
  return normalizeCityPresetId(cityPresetId) === "chicago-il";
}

export function citySelectOptions(stateCode, selectedId = "") {
  const sel = normalizeCityPresetId(selectedId);
  const list = presetsForState(stateCode);
  return list
    .map((c) => {
      const value = c.id;
      const picked = value === sel ? " selected" : "";
      return `<option value="${value}"${picked}>${c.label}</option>`;
    })
    .join("");
}

export function cityPresetHint(stateCode, cityPresetId) {
  const row = resolveCityOverlay(stateCode, cityPresetId) || presetsForState(stateCode).find((c) => c.id === "");
  return row?.hint || "Confirm local ordinances with counsel.";
}
