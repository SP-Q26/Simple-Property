#!/usr/bin/env node
/**
 * Metro local guides · Oct 2026 expansion.
 * Run: node scripts/generate-metro-expansion-oct-2026.mjs && npm run build-blog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";
import { hubFooterHtml } from "./lib/state-hub-links.mjs";
import { citeLinkHtml } from "./lib/cite-link-html.mjs";
import { STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { appWizardHref } from "../web/lib/brand-locale.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-10-11";

/** @type {Array<{ slug: string, title: string, description: string, state: string, cityPreset: string, cityName: string, dek: string, bullets: string[] }>} */
const METROS = [
  {
    slug: "tampa-florida-deposit-local-guide",
    title: "Tampa security deposit local guide",
    description: "Florida § 83.49 turnover habits for Tampa operators. Not legal advice.",
    state: "FL",
    cityPreset: "tampa-fl",
    cityName: "Tampa",
    dek: "Bay-area turns mix HOA handoffs with the statewide 15-day claim fork.",
    bullets: [
      "Log surrender when keys and vacant unit align, not lease end alone.",
      "<a href=\"/blog/florida-83-49-two-step-miami-condo-deposit\">Florida two-step guide</a> for claim notice vs full return.",
      "<a href=\"/blog/florida-deposit-itemization\">Itemization</a> before you mail balance.",
    ],
  },
  {
    slug: "orlando-florida-deposit-local-guide",
    title: "Orlando security deposit local guide",
    description: "Central Florida deposit packet habits. Fla. Stat. § 83.49. Not legal advice.",
    state: "FL",
    cityPreset: "orlando-fl",
    cityName: "Orlando",
    dek: "Theme-park market turnovers compress vendor schedules against the claim-notice window.",
    bullets: [
      "Export before the on-screen 30-day discipline line from surrender.",
      "<a href=\"/blog/florida-missed-15-day-claim-notice-deposit\">Missed claim notice guide</a>.",
      "Archive PDF and mail proof in <a href=\"/logs\">operator logs</a>.",
    ],
  },
  {
    slug: "jacksonville-florida-deposit-local-guide",
    title: "Jacksonville security deposit local guide",
    description: "Northeast Florida deposit return habits. Not legal advice.",
    state: "FL",
    cityPreset: "jacksonville-fl",
    cityName: "Jacksonville",
    dek: "Spreadsheet operators along the First Coast still owe Florida’s two-step documentation.",
    bullets: [
      "<a href=\"/blog/florida-30-day-deposit-deadline\">Florida deadline guide</a>.",
      "Room-level move-in photos for withhold lines.",
      "<a href=\"/blog/florida-security-deposit-checklist\">Checklist</a> each turn.",
    ],
  },
  {
    slug: "atlanta-georgia-deposit-local-guide",
    title: "Atlanta security deposit local guide",
    description: "Metro Atlanta deposit clocks and itemization. O.C.G.A. 44-7-34. Not legal advice.",
    state: "GA",
    cityPreset: "atlanta-ga",
    cityName: "Atlanta",
    dek: "Intown and perimeter turns need surrender dated the day keys return.",
    bullets: [
      "<a href=\"/blog/georgia-30-day-deposit-deadline\">Georgia deadline guide</a>.",
      "<a href=\"/blog/georgia-cleaning-fee-lump-sum-deposit\">Lump-sum cleaning pain story</a>.",
      "Separate wear from damage with move-in notes.",
    ],
  },
  {
    slug: "richmond-virginia-deposit-local-guide",
    title: "Richmond security deposit local guide",
    description: "Richmond metro deposit mail and itemization. Va. Code § 55.1-1226. Not legal advice.",
    state: "VA",
    cityPreset: "richmond-va",
    cityName: "Richmond",
    dek: "Forty-five days from surrender leaves room for procrastination until mail proof is missing.",
    bullets: [
      "<a href=\"/blog/virginia-45-day-deposit-deadline\">Virginia deadline guide</a>.",
      "<a href=\"/blog/virginia-45-day-itemization-mail-proof\">Mail proof pain guide</a>.",
      "Track certified mail in operator logs.",
    ],
  },
  {
    slug: "northern-virginia-deposit-local-guide",
    title: "Northern Virginia security deposit local guide",
    description: "NoVA belt investor deposit clocks. Not legal advice.",
    state: "VA",
    cityPreset: "northern-virginia-va",
    cityName: "Northern Virginia",
    dek: "Mixing DC, Maryland, and Virginia on one tab breaks day-count math.",
    bullets: [
      "Pick Virginia on step 1 for VA units.",
      "<a href=\"/blog/shaw-carriage-house-belt-investor-dc-clock\">Belt investor story</a> for cross-jurisdiction habits.",
      "<a href=\"/blog/virginia-deposit-itemization\">Itemization guide</a>.",
    ],
  },
  {
    slug: "baltimore-maryland-deposit-local-guide",
    title: "Baltimore security deposit local guide",
    description: "Baltimore city deposit return habits. Md. Real Prop. § 8-203. Not legal advice.",
    state: "MD",
    cityPreset: "baltimore-md",
    cityName: "Baltimore",
    dek: "Forty-five-day Maryland clock plus city registration habits run on different calendars.",
    bullets: [
      "<a href=\"/blog/maryland-45-day-deposit-deadline\">Maryland deadline guide</a>.",
      "<a href=\"/blog/maryland-45-day-belt-investor-missed-clock\">Belt investor pain story</a>.",
      "Export packet before day 45 on screen.",
    ],
  },
  {
    slug: "salt-lake-city-utah-deposit-local-guide",
    title: "Salt Lake City security deposit local guide",
    description: "Wasatch Front deposit discipline. Utah Code § 57-17-3. Not legal advice.",
    state: "UT",
    cityPreset: "salt-lake-city-ut",
    cityName: "Salt Lake City",
    dek: "Thirty-day default punishes operators who wait on ski-season wear disputes without photos.",
    bullets: [
      "<a href=\"/blog/utah-30-day-deposit-deadline\">Utah deadline guide</a>.",
      "<a href=\"/blog/utah-missed-deposit-deadline-penalty-track\">Penalty track pain story</a>.",
      "Log surrender at key return.",
    ],
  },
  {
    slug: "new-orleans-louisiana-deposit-local-guide",
    title: "New Orleans security deposit local guide",
    description: "Orleans Parish turnover and deposit accounting. La. R.S. 9:3251. Not legal advice.",
    state: "LA",
    cityPreset: "new-orleans-la",
    cityName: "New Orleans",
    dek: "Humidity, storms, and short-term turnover stress itemized accounting lines.",
    bullets: [
      "<a href=\"/blog/louisiana-30-day-deposit-deadline\">Louisiana deadline guide</a>.",
      "<a href=\"/blog/louisiana-withhold-without-itemized-accounting\">Accounting pain story</a>.",
      "Date photos after major weather events.",
    ],
  },
  {
    slug: "seattle-washington-deposit-local-guide",
    title: "Seattle security deposit local guide",
    description: "Seattle metro substantiation habits. RCW 59.18.280. Not legal advice.",
    state: "WA",
    cityPreset: "seattle-wa",
    cityName: "Seattle",
    dek: "Each withhold needs backup in the file, not just a spreadsheet label.",
    bullets: [
      "<a href=\"/blog/washington-30-day-deposit-deadline\">Washington deadline guide</a>.",
      "<a href=\"/blog/washington-deposit-invoices-substantiation\">Invoice substantiation pain story</a>.",
      "Link vendor invoices in the packet export.",
    ],
  },
  {
    slug: "las-vegas-nevada-deposit-local-guide",
    title: "Las Vegas security deposit local guide",
    description: "Clark County turnover deposit mail habits. NRS 118A.242. Not legal advice.",
    state: "NV",
    cityPreset: "las-vegas-nv",
    cityName: "Las Vegas",
    dek: "Return and itemization should leave together with tracking logged.",
    bullets: [
      "<a href=\"/blog/nevada-30-day-deposit-deadline\">Nevada deadline guide</a>.",
      "<a href=\"/blog/nevada-return-and-itemization-same-mailing\">Same mailing pain story</a>.",
      "HOA move-out photos separate from unit withhold lines.",
    ],
  },
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const slugs = new Set(manifest.posts.map((p) => p.slug));
let added = 0;

for (const m of METROS) {
  const pack = STATE_PACKS[m.state];
  const cite = citeLinkHtml(pack.cite, m.state);
  const bodyHtml = `
      <p class="hero-eyebrow">${m.cityName} · ${pack.label}</p>
      <h1>${m.title.replace(" local guide", "")}</h1>
      <p>${m.dek}</p>
      <dl class="fact-strip">
        <div><dt>State default</dt><dd><strong>${pack.returnDays} days</strong> from surrender</dd></div>
        <div><dt>Statute</dt><dd>${cite}</dd></div>
      </dl>
      <ul>
        ${m.bullets.map((b) => `<li>${b}</li>`).join("\n        ")}
      </ul>
      ${hubFooterHtml(m.state, pack.label)}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="${appWizardHref(m.state, m.cityPreset)}">Start ${m.cityName} packet</a></p>`;

  const html = articleShell({
    title: m.title,
    description: m.description,
    slug: m.slug,
    published: PUBLISHED,
    bodyHtml,
  });
  writeFileSync(join(blogDir, `${m.slug}.html`), html);

  if (!slugs.has(m.slug)) {
    manifest.posts.push({
      slug: m.slug,
      title: m.title,
      description: m.description,
      category: "city",
      intent: "city",
      states: [m.state],
      cityPreset: m.cityPreset,
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: [pack.cite],
    });
    slugs.add(m.slug);
    added++;
    console.log("manifest+", m.slug);
  } else {
    console.log("html refresh", m.slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("metro expansion · added", added);
