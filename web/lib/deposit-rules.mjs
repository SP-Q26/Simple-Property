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

export const SUPPORTED_STATES = ["IL", "IN", "OH", "MI", "IA", "MO"];

/** @typedef {{ code: string, label: string, returnDays: number, cite: string, chicagoOverlay?: boolean }} StatePack */

/** @type {Record<string, StatePack>} */
export const STATE_PACKS = {
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
  OH: {
    code: "OH",
    label: "Ohio",
    returnDays: 30,
    cite: "ORC 5321.16",
  },
  MI: {
    code: "MI",
    label: "Michigan",
    returnDays: 30,
    cite: "MCL 554.610",
  },
  IA: {
    code: "IA",
    label: "Iowa",
    returnDays: 30,
    cite: "Iowa Code 562A.12",
  },
  MO: {
    code: "MO",
    label: "Missouri",
    returnDays: 30,
    cite: "RSMo 535.300",
  },
};

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
