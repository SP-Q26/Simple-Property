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
