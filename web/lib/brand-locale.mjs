/**
 * Customer-facing locale strings derived from deposit-rules.mjs (single source).
 */
import { SUPPORTED_STATES, STATE_PACKS } from "./deposit-rules.mjs";
import { STATUTE_URLS } from "./statute-urls.mjs";

export const PACK_COUNT = SUPPORTED_STATES.length;
export const STATE_ONLY_COUNT = SUPPORTED_STATES.filter((c) => c !== "DC").length;
/** Three-beat tagline · penalty avoidance, not clock wordplay. */
export const BRAND_TAGLINE = "Itemize it. Date it. Never pay the fees.";
export const BRAND_TAG = `${BRAND_TAGLINE} · Founded in Chicago · ${STATE_ONLY_COUNT} states + DC`;
/** Shorter lockup line for phone and tablet header. */
export const BRAND_TAG_SHORT = `${BRAND_TAGLINE} · ${STATE_ONLY_COUNT} states + DC`;
export const BRAND_TAG_HTML = `<span class="brand-tag"><span class="brand-tag__desktop">${BRAND_TAG}</span><span class="brand-tag__mobile">${BRAND_TAG_SHORT}</span></span>`;
export const HERO_EYEBROW = `Security deposit return · ${STATE_ONLY_COUNT} states + DC · up to 40 units`;
export const PRICING_EYEBROW = `Pricing · small landlords · Chicago HQ`;
export const MARKETING_STATES_SHORT = `${STATE_ONLY_COUNT} states + DC (see wizard for list)`;
export const CSS_VERSION = 59;
export const WIZARD_TURNOVER_PARAMS = "turnover=1&step=2";

/** Deep link for move-out-first wizard entry. */
export function appWizardHref(state, cityPreset = "") {
  const q = new URLSearchParams({ state, turnover: "1", step: "2" });
  if (cityPreset) q.set("city", cityPreset);
  return `/app?${q.toString()}`;
}
export const FONT_GOOGLE =
  "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;0,8..60,700;1,8..60,600&display=swap";
export const FONT_LINK_HTML = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONT_GOOGLE}" rel="stylesheet">`;

/** Approximate map coordinates · viewBox 0 0 200 120 (not geographic survey). */
export const COVERAGE_MAP_XY = {
  AR: [108, 68],
  CA: [18, 52],
  CO: [72, 48],
  CT: [180, 38],
  DC: [178, 52],
  DE: [176, 50],
  GA: [168, 78],
  HI: [8, 82],
  KY: [140, 58],
  MN: [108, 28],
  NE: [92, 42],
  RI: [184, 36],
  SD: [92, 32],
  VT: [180, 26],
  WV: [158, 54],
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
  FL: [168, 88],
};

/** Header metro shortcuts · distinct colors in CSS (tone). */
export const METRO_NAV = [
  {
    short: "Chi",
    state: "IL",
    city: "chicago-il",
    label: "Chicago · RLTO",
    href: appWizardHref("IL", "chicago-il"),
    tone: "chi",
  },
  { short: "DC", state: "DC", city: "", label: "Washington DC · RHCA", href: appWizardHref("DC"), tone: "dc" },
  {
    short: "Mia",
    state: "FL",
    city: "miami-fl",
    label: "Miami · Florida § 83.49",
    href: appWizardHref("FL", "miami-fl"),
    tone: "mia",
  },
  {
    short: "Tpa",
    state: "FL",
    city: "tampa-fl",
    label: "Tampa · Florida § 83.49",
    href: appWizardHref("FL", "tampa-fl"),
    tone: "tpa",
  },
  {
    short: "ATL",
    state: "GA",
    city: "atlanta-ga",
    label: "Atlanta · Georgia",
    href: appWizardHref("GA", "atlanta-ga"),
    tone: "atl",
  },
];

/** Compact header metros (overflow menu). */
export const METRO_NAV_MORE = [
  {
    short: "Sea",
    state: "WA",
    city: "seattle-wa",
    label: "Seattle · Washington",
    href: appWizardHref("WA", "seattle-wa"),
    tone: "sea",
  },
  {
    short: "LV",
    state: "NV",
    city: "las-vegas-nv",
    label: "Las Vegas · Nevada",
    href: appWizardHref("NV", "las-vegas-nv"),
    tone: "lv",
  },
  {
    short: "NOLA",
    state: "LA",
    city: "new-orleans-la",
    label: "New Orleans · Louisiana",
    href: appWizardHref("LA", "new-orleans-la"),
    tone: "nola",
  },
  {
    short: "BWI",
    state: "MD",
    city: "baltimore-md",
    label: "Baltimore · Maryland",
    href: appWizardHref("MD", "baltimore-md"),
    tone: "bwi",
  },
  {
    short: "RVA",
    state: "VA",
    city: "richmond-va",
    label: "Richmond · Virginia",
    href: appWizardHref("VA", "richmond-va"),
    tone: "rva",
  },
  {
    short: "ORL",
    state: "FL",
    city: "orlando-fl",
    label: "Orlando · Florida",
    href: appWizardHref("FL", "orlando-fl"),
    tone: "orl",
  },
];

/** Nav · blog anchors use state code only. */
export function localeNavEntries() {
  return SUPPORTED_STATES.map((code) => ({
    code,
    name: STATE_PACKS[code].label,
    returnDays: STATE_PACKS[code].returnDays,
    cite: STATE_PACKS[code].cite,
    statuteUrl: STATUTE_URLS[code],
    blog: `/blog#locale-${code}`,
    app: appWizardHref(code),
  }));
}
