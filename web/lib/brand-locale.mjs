/**
 * Customer-facing locale strings derived from deposit-rules.mjs (single source).
 */
import { SUPPORTED_STATES, STATE_PACKS } from "./deposit-rules.mjs";

export const PACK_COUNT = SUPPORTED_STATES.length;
export const STATE_ONLY_COUNT = SUPPORTED_STATES.filter((c) => c !== "DC").length;
export const BRAND_TAG = `Itemize it. Date it. Keep the clock. · ${STATE_ONLY_COUNT} states + DC · Chicago RLTO`;
export const HERO_EYEBROW = `Security deposit return · ${STATE_ONLY_COUNT} states + DC · up to 40 units`;
export const MARKETING_STATES_SHORT = `${STATE_ONLY_COUNT} states + DC (see wizard for list)`;

/** Nav pills · blog anchors use code only (guides may be Midwest-heavy until expanded). */
export function localeNavEntries() {
  return SUPPORTED_STATES.map((code) => ({
    code,
    name: STATE_PACKS[code].label,
    blog: `/blog#locale-${code}`,
    app: `/app?state=${code}`,
  }));
}
