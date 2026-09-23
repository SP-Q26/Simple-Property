/**
 * Deposit return deadline helpers · supported states (alpha).
 * Not legal advice. Confirm statutes and local ordinances for each property.
 * Wisconsin deferred (forwarding-address clock · separate spec).
 */

import {
  cityPresetFromLegacy,
  inChicagoFromPreset,
  resolveCityOverlay,
} from "./city-overlays.mjs";

export { citySelectOptions, cityPresetHint, normalizeCityPresetId, inChicagoFromPreset } from "./city-overlays.mjs";

/** @typedef {{ code: string, label: string, returnDays: number, cite: string, chicagoOverlay?: boolean, isDistrict?: boolean }} StatePack */

/** @type {Record<string, StatePack>} */
export const STATE_PACKS = {
  DC: {
    code: "DC",
    label: "District of Columbia",
    returnDays: 45,
    cite: "D.C. Code § 42-3508.11",
    isDistrict: true,
  },
  GA: {
    code: "GA",
    label: "Georgia",
    returnDays: 30,
    cite: "O.C.G.A. 44-7-34",
  },
  IA: {
    code: "IA",
    label: "Iowa",
    returnDays: 30,
    cite: "Iowa Code 562A.12",
  },
  IL: {
    code: "IL",
    label: "Illinois",
    returnDays: 30,
    cite: "765 ILCS 715/",
    chicagoOverlay: true,
  },
  IN: {
    code: "IN",
    label: "Indiana",
    returnDays: 45,
    cite: "IC 32-31-3-12 et seq.",
  },
  LA: {
    code: "LA",
    label: "Louisiana",
    returnDays: 30,
    cite: "La. R.S. 9:3251",
  },
  MD: {
    code: "MD",
    label: "Maryland",
    returnDays: 45,
    cite: "Md. Real Prop. § 8-203",
  },
  MI: {
    code: "MI",
    label: "Michigan",
    returnDays: 30,
    cite: "MCL 554.610",
  },
  MO: {
    code: "MO",
    label: "Missouri",
    returnDays: 30,
    cite: "RSMo 535.300",
  },
  MS: {
    code: "MS",
    label: "Mississippi",
    returnDays: 45,
    cite: "Miss. Code § 89-8-21",
  },
  NC: {
    code: "NC",
    label: "North Carolina",
    returnDays: 30,
    cite: "N.C.G.S. § 42-52",
  },
  ND: {
    code: "ND",
    label: "North Dakota",
    returnDays: 30,
    cite: "N.D.C.C. § 47-16-07.1",
  },
  NH: {
    code: "NH",
    label: "New Hampshire",
    returnDays: 30,
    cite: "RSA 540-A:7",
  },
  NJ: {
    code: "NJ",
    label: "New Jersey",
    returnDays: 30,
    cite: "N.J.S.A. 46:8-21.1",
  },
  NV: {
    code: "NV",
    label: "Nevada",
    returnDays: 30,
    cite: "NRS 118A.242",
  },
  OH: {
    code: "OH",
    label: "Ohio",
    returnDays: 30,
    cite: "ORC 5321.16",
  },
  UT: {
    code: "UT",
    label: "Utah",
    returnDays: 30,
    cite: "Utah Code § 57-17-3",
  },
  VA: {
    code: "VA",
    label: "Virginia",
    returnDays: 45,
    cite: "Va. Code § 55.1-1226",
  },
  WA: {
    code: "WA",
    label: "Washington",
    returnDays: 30,
    cite: "RCW 59.18.280",
  },
};

export const SUPPORTED_STATES = Object.keys(STATE_PACKS).sort();

export const IL_STATE_RETURN_DAYS = STATE_PACKS.IL.returnDays;
export const CHICAGO_RETURN_DAYS = 45;

export function normalizeStateCode(raw) {
  const code = String(raw || "IL")
    .trim()
    .toUpperCase();
  return SUPPORTED_STATES.includes(code) ? code : "IL";
}

export function returnDeadlineDays({ state = "IL", inChicago = false, cityPreset = "" }) {
  const code = normalizeStateCode(state);
  const preset = cityPresetFromLegacy({ state: code, inChicago, cityPreset });
  const overlay = resolveCityOverlay(code, preset);
  if (overlay?.returnDays) return overlay.returnDays;
  const pack = STATE_PACKS[code];
  if (pack.chicagoOverlay && inChicagoFromPreset(preset)) return CHICAGO_RETURN_DAYS;
  if (pack.chicagoOverlay && inChicago) return CHICAGO_RETURN_DAYS;
  return pack.returnDays;
}

/** @param {string} isoDate YYYY-MM-DD surrender date */
export function addCalendarDays(isoDate, days) {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function jurisdictionLabel({ state = "IL", inChicago = false, cityPreset = "" }) {
  const code = normalizeStateCode(state);
  const preset = cityPresetFromLegacy({ state: code, inChicago, cityPreset });
  const overlay = resolveCityOverlay(code, preset);
  if (overlay?.jurisdiction) return overlay.jurisdiction;
  if (overlay?.returnDays && overlay.cityName) {
    return `${overlay.cityName} · ${overlay.returnDays}-day default (${STATE_PACKS[code].cite})`;
  }
  const pack = STATE_PACKS[code];
  if (pack.chicagoOverlay && (inChicagoFromPreset(preset) || inChicago)) return "Chicago RLTO";
  return `${pack.label} (${pack.cite})`;
}

export function computeDeadline({
  surrenderDate,
  state = "IL",
  inChicago = false,
  cityPreset = "",
}) {
  const code = normalizeStateCode(state);
  const preset = cityPresetFromLegacy({ state: code, inChicago, cityPreset });
  const days = returnDeadlineDays({ state: code, inChicago, cityPreset: preset });
  const deadline = addCalendarDays(surrenderDate, days);
  const reminders = deadline
    ? [7, 3, 1].map((n) => addCalendarDays(deadline, -n)).filter(Boolean)
    : [];
  return {
    state: code,
    days,
    deadline,
    reminders,
    jurisdiction: jurisdictionLabel({ state: code, inChicago, cityPreset: preset }),
    cityPreset: preset,
  };
}

export function formatUsDate(iso) {
  if (!iso) return "n/a";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function stateSelectOptions(selected = "IL") {
  const sel = normalizeStateCode(selected);
  return SUPPORTED_STATES.map(
    (code) =>
      `<option value="${code}"${code === sel ? " selected" : ""}>${STATE_PACKS[code].label} (${STATE_PACKS[code].returnDays}-day default${STATE_PACKS[code].chicagoOverlay ? " · Chicago 45" : ""})</option>`
  ).join("");
}
