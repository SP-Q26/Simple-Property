/**
 * Customer-facing locale strings derived from deposit-rules.mjs (single source).
 */
import { SUPPORTED_STATES, STATE_PACKS } from "./deposit-rules.mjs";
import { STATUTE_URLS } from "./statute-urls.mjs";

export const PACK_COUNT = SUPPORTED_STATES.length;
export const STATE_ONLY_COUNT = SUPPORTED_STATES.filter((c) => c !== "DC").length;
export const BRAND_TAG = `Itemize it. Date it. Keep the clock. · Founded in Chicago · ${STATE_ONLY_COUNT} states + DC`;
export const HERO_EYEBROW = `Security deposit return · ${STATE_ONLY_COUNT} states + DC · up to 40 units`;
export const PRICING_EYEBROW = `Pricing · small landlords · Chicago HQ`;
export const MARKETING_STATES_SHORT = `${STATE_ONLY_COUNT} states + DC (see wizard for list)`;
export const CSS_VERSION = 39;
export const FONT_GOOGLE =
  "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;0,8..60,700;1,8..60,600&display=swap";
export const FONT_LINK_HTML = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONT_GOOGLE}" rel="stylesheet">`;

/** Approximate map coordinates · viewBox 0 0 200 120 (not geographic survey). */
export const COVERAGE_MAP_XY = {
  DC: [178, 52],
  GA: [168, 78],
  IA: [108, 42],
  IL: [118, 44],
  IN: [124, 44],
  LA: [112, 82],
  MD: [172, 54],
  MI: [126, 32],
  MO: [108, 52],
  MS: [122, 74],
  NC: [168, 62],
  ND: [98, 22],
  NH: [182, 28],
  NJ: [174, 48],
  NV: [42, 48],
  OH: [136, 44],
  UT: [52, 44],
  VA: [166, 58],
  WA: [28, 18],
};

/** Nav · blog anchors use state code only. */
export function localeNavEntries() {
  return SUPPORTED_STATES.map((code) => ({
    code,
    name: STATE_PACKS[code].label,
    returnDays: STATE_PACKS[code].returnDays,
    cite: STATE_PACKS[code].cite,
    statuteUrl: STATUTE_URLS[code],
    blog: `/blog#locale-${code}`,
    app: `/app?state=${code}`,
  }));
}
