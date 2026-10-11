/**
 * Court / docket pattern lines for SEO + blog rotation (not legal advice · patterns only).
 * Built to JSON via scripts/build-court-record-snippets.mjs
 */
import { SUPPORTED_STATES, STATE_PACKS } from "../../web/lib/deposit-rules.mjs";
import { STATUTE_URLS } from "../../web/lib/statute-urls.mjs";
import { CITY_PRESETS } from "../../web/lib/city-overlays.mjs";

/** Official court or agency self-help where we link out. */
export const COURT_SELF_HELP = {
  CA: {
    label: "California Courts · security deposits",
    url: "https://selfhelp.courts.ca.gov/guide-security-deposits-california",
  },
  HI: {
    label: "Hawaii Judiciary · security deposits",
    url: "https://www.courts.state.hi.us/self-help/landlord/security_deposits",
  },
  MN: {
    label: "Minnesota Revisor · 504B.178",
    url: "https://www.revisor.mn.gov/statutes/cite/504B.178",
  },
  IL: {
    label: "Illinois AG · renters",
    url: "https://www.illinoisattorneygeneral.gov/consumers/renters.html",
  },
  FL: {
    label: "Florida Statutes · § 83.49",
    url: "https://www.flsenate.gov/Laws/Statutes/2024/083.49",
  },
  CO: {
    label: "Colorado CRS · 38-12-103",
    url: "https://law.justia.com/codes/colorado/title-38/article-12/section-38-12-103/",
  },
  NC: {
    label: "N.C.G.S. § 42-52",
    url: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-52.html",
  },
};

/** @typedef {{ id: string, states: string[], metros: string[], home?: boolean, fallback?: boolean, text: string, sourceLabel: string, sourceUrl: string }} Snippet */

/** @type {Snippet[]} */
const METRO_SNIPPETS = [
  {
    id: "metro-tampa-fl-claim",
    states: ["FL"],
    metros: ["tampa-fl"],
    home: false,
    text: "Hillsborough and Pinellas turnover dockets still turn on Florida’s 15-day claim-notice fork before the 30-day balance and accounting.",
    sourceLabel: "Fla. Stat. § 83.49",
    sourceUrl: STATUTE_URLS.FL,
  },
  {
    id: "metro-orlando-fl-turn",
    states: ["FL"],
    metros: ["orlando-fl"],
    home: false,
    text: "Central Florida small claims calendars fill with operators who missed § 83.49 claim notice timing during compressed theme-park market turns.",
    sourceLabel: "Fla. Stat. § 83.49",
    sourceUrl: STATUTE_URLS.FL,
  },
  {
    id: "metro-jax-fl-mail",
    states: ["FL"],
    metros: ["jacksonville-fl"],
    home: false,
    text: "First Coast filings often ask whether claim notice and itemization left on time, not whether the withhold felt fair.",
    sourceLabel: "Fla. Stat. § 83.49",
    sourceUrl: STATUTE_URLS.FL,
  },
  {
    id: "metro-atlanta-ga-cleaning",
    states: ["GA"],
    metros: ["atlanta-ga"],
    home: false,
    text: "Metro Atlanta disposition hearings still punish one-line cleaning withholds without room-level move-in comparison.",
    sourceLabel: "O.C.G.A. 44-7-34",
    sourceUrl: STATUTE_URLS.GA,
  },
  {
    id: "metro-richmond-va-mail",
    states: ["VA"],
    metros: ["richmond-va"],
    home: false,
    text: "Richmond-area returns fail on day-44 mail without tracking as often as on the withhold math.",
    sourceLabel: "Va. Code § 55.1-1226",
    sourceUrl: STATUTE_URLS.VA,
  },
  {
    id: "metro-nova-va-belt",
    states: ["VA"],
    metros: ["northern-virginia-va"],
    home: false,
    text: "NoVA operators mixing DC and Maryland habits on the same spreadsheet still lose Virginia’s 45-day itemization discipline.",
    sourceLabel: "Va. Code § 55.1-1226",
    sourceUrl: STATUTE_URLS.VA,
  },
  {
    id: "metro-baltimore-md-45",
    states: ["MD"],
    metros: ["baltimore-md"],
    home: false,
    text: "Baltimore city registration calendars and Maryland’s 45-day deposit clock are different filings; dockets ask about the deposit packet dates.",
    sourceLabel: "Md. Real Prop. § 8-203",
    sourceUrl: STATUTE_URLS.MD,
  },
  {
    id: "metro-slc-ut-penalty",
    states: ["UT"],
    metros: ["salt-lake-city-ut"],
    home: false,
    text: "Wasatch Front tenants trigger penalty-track notices when the 30-day return line passes without a written itemization.",
    sourceLabel: "Utah Code § 57-17-3",
    sourceUrl: STATUTE_URLS.UT,
  },
  {
    id: "metro-nola-la-accounting",
    states: ["LA"],
    metros: ["new-orleans-la"],
    home: false,
    text: "Orleans Parish disputes still start with whether written accounting matched each withhold after humid-season turns.",
    sourceLabel: "La. R.S. 9:3251",
    sourceUrl: STATUTE_URLS.LA,
  },
  {
    id: "metro-seattle-wa-invoices",
    states: ["WA"],
    metros: ["seattle-wa"],
    home: false,
    text: "King County small claims expects invoice backup for withhold lines, not a spreadsheet label alone.",
    sourceLabel: "RCW 59.18.280",
    sourceUrl: STATUTE_URLS.WA,
  },
  {
    id: "metro-vegas-nv-same-mail",
    states: ["NV"],
    metros: ["las-vegas-nv"],
    home: false,
    text: "Clark County filings ask whether balance and itemization mailed together with proof, especially after HOA-heavy move-outs.",
    sourceLabel: "NRS 118A.242",
    sourceUrl: STATUTE_URLS.NV,
  },
  {
    id: "metro-miami-fl-condo",
    states: ["FL"],
    metros: ["miami-fl"],
    home: true,
    text: "Miami-Dade and Broward condo turnovers lose on the 15-day claim-notice fork as often as the 30-day balance.",
    sourceLabel: "Fla. Stat. § 83.49",
    sourceUrl: STATUTE_URLS.FL,
  },
  {
    id: "metro-chicago-rlto",
    states: ["IL"],
    metros: ["chicago-il"],
    home: true,
    text: "Cook County RLTO calendars still turn on 45-day return proof from surrender, not suburban 30-day habits.",
    sourceLabel: "765 ILCS 715/",
    sourceUrl: STATUTE_URLS.IL,
  },
];

function stateSnippets(code) {
  const pack = STATE_PACKS[code];
  const help = COURT_SELF_HELP[code];
  const citeUrl = STATUTE_URLS[code];
  const label = pack.label;
  const days = pack.returnDays;
  const home = ["IL", "FL", "DC", "GA", "CA", "NC", "OH", "MI"].includes(code);

  /** @type {Snippet[]} */
  const out = [
    {
      id: `${code}-clock-surrender`,
      states: [code],
      metros: [],
      home,
      text: `${label} disposition and small claims dockets still turn on the ${days}-day return or itemize window from surrender, not lease end on paper alone.`,
      sourceLabel: pack.cite,
      sourceUrl: citeUrl,
    },
    {
      id: `${code}-itemization-proof`,
      states: [code],
      metros: [],
      home,
      text: `${label} hearings still award tenants when move-in photos and dated withhold lines never made it into the mailed packet.`,
      sourceLabel: pack.cite,
      sourceUrl: citeUrl,
    },
  ];

  if (code === "CA") {
    out.push({
      id: "CA-selfhelp-21-bad-faith",
      states: ["CA"],
      metros: [],
      home: true,
      text: "California courts self-help: 21 days after move-out to return or itemize; bad-faith retention can mean up to twice the deposit in small claims.",
      sourceLabel: help.label,
      sourceUrl: help.url,
    });
  } else if (code === "MN") {
    out.push({
      id: "MN-address-three-weeks",
      states: ["MN"],
      metros: [],
      home: true,
      text: "Minnesota statute: three weeks after tenancy ends once the tenant’s mailing address is known; withholding without a written statement invites punitive damages.",
      sourceLabel: help.label,
      sourceUrl: help.url,
    });
  } else if (code === "HI") {
    out.push({
      id: "HI-14-forfeit",
      states: ["HI"],
      metros: [],
      home: true,
      text: "Hawaii Judiciary self-help: 14 days to return or explain withholds; missing the window can forfeit the right to keep any portion.",
      sourceLabel: help.label,
      sourceUrl: help.url,
    });
  } else if (code === "NC") {
    out.push({
      id: "NC-interim-60",
      states: ["NC"],
      metros: [],
      home: true,
      text: "North Carolina dockets still ask about 30-day accounting and 60-day final packets when repair scope was open at move-out.",
      sourceLabel: help.label,
      sourceUrl: help.url,
    });
  } else if (code === "CO") {
    out.push({
      id: "CO-30-60-lease",
      states: ["CO"],
      metros: [],
      home: true,
      text: "Colorado operators mix 30-day default returns with lease clauses up to 60 days; small claims looks at the written lease and mail dates.",
      sourceLabel: help.label,
      sourceUrl: help.url,
    });
  } else if (code === "FL") {
    out.push({
      id: "FL-83-49-two-step",
      states: ["FL"],
      metros: [],
      home: true,
      text: "Florida § 83.49: claim notice within 15 days or return the deposit; balance and accounting within 30 days after notice.",
      sourceLabel: help.label,
      sourceUrl: help.url,
    });
  } else if (help) {
    out.push({
      id: `${code}-selfhelp`,
      states: [code],
      metros: [],
      home,
      text: `${label} deposit return rules are summarized for operators on official sources; hearings still ask for dated itemization and mail proof.`,
      sourceLabel: help.label,
      sourceUrl: help.url,
    });
  } else {
    out.push({
      id: `${code}-statute-link`,
      states: [code],
      metros: [],
      home,
      text: `${label} small claims filings still turn on whether the statutory clock and itemized withhold lines were documented before dispute.`,
      sourceLabel: pack.cite,
      sourceUrl: citeUrl,
    });
  }

  if (code === "DC") {
    out[0].text =
      "DC RHCA rowhouses and English basements: 45-day mail proof and itemization beat memory at hearing.";
  }

  return out;
}

/** @type {Snippet[]} */
const FALLBACK = [
  {
    id: "fallback-late-itemize",
    states: [],
    metros: [],
    fallback: true,
    home: true,
    text: "Landlords still lose full deposits in small claims when the return deadline passes before a line-item letter goes out.",
    sourceLabel: "Deposit statutes index",
    sourceUrl: "https://simple-property.com/legal/deposit-statutes",
  },
  {
    id: "fallback-wear-photos",
    states: [],
    metros: [],
    fallback: true,
    home: true,
    text: "Hearings still turn on documented wear vs damage and a dated withhold list, not memory at the bench.",
    sourceLabel: "Guides by state",
    sourceUrl: "https://simple-property.com/blog",
  },
];

function metroSnippetsFromPresets() {
  const covered = new Set(METRO_SNIPPETS.flatMap((s) => s.metros || []));
  /** @type {Snippet[]} */
  const out = [];
  for (const row of CITY_PRESETS) {
    if (!row.id || covered.has(row.id)) continue;
    const pack = STATE_PACKS[row.state];
    if (!pack) continue;
    out.push({
      id: `metro-${row.id}-docket`,
      states: [row.state],
      metros: [row.id],
      home: row.id === "chicago-il" || row.id === "miami-fl",
      text: `${row.cityName || row.label} dockets still turn on ${pack.returnDays}-day return or itemize proof from surrender; local registration is a separate filing from the deposit packet.`,
      sourceLabel: pack.cite,
      sourceUrl: STATUTE_URLS[row.state],
    });
  }
  return out;
}

export function buildCourtRecordSnippets() {
  const snippets = [...FALLBACK];
  for (const code of SUPPORTED_STATES) {
    snippets.push(...stateSnippets(code));
  }
  snippets.push(...METRO_SNIPPETS);
  snippets.push(...metroSnippetsFromPresets());
  return {
    version: 1,
    updated: "2026-10-11",
    disclaimer: "Public docket patterns and court self-help summaries · not legal advice · confirm with counsel.",
    snippets,
  };
}
