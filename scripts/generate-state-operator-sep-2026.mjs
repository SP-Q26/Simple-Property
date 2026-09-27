#!/usr/bin/env node
/**
 * One September 2026 operator guide per wizard state · Simple Property Tools voice.
 * Run: node scripts/generate-state-operator-sep-2026.mjs && node scripts/build-blog-seo.mjs && node scripts/sync-social-meta.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATE_PACKS, SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";
import { articleShell } from "./lib/blog-article-shell.mjs";
import { citeLinkHtml } from "./lib/cite-link-html.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const manifestPath = join(web, "data", "blog-manifest.json");
const PUBLISHED = "2026-09-26";

const SLUG_PREFIX = {
  DC: "dc",
  GA: "georgia",
  IA: "iowa",
  IL: "illinois",
  IN: "indiana",
  LA: "louisiana",
  MD: "maryland",
  MI: "michigan",
  MO: "missouri",
  MS: "mississippi",
  NC: "north-carolina",
  ND: "north-dakota",
  NH: "new-hampshire",
  NJ: "new-jersey",
  NV: "nevada",
  OH: "ohio",
  UT: "utah",
  VA: "virginia",
  WA: "washington",
};

/** One line of local deposit culture per state (operator voice · not legal advice). */
const LOCAL_CULTURE = {
  DC:
    "Rowhouses and small ADUs often share one operator spreadsheet with Maryland units. RHCA timing deserves its own surrender date and packet.",
  GA:
    "Turnover vendors quote cleaning as one lump sum. Tenants push back when withhold lines do not match move-in photos room by room.",
  IA:
    "Rural handoffs still happen on a counter or porch. Write down the surrender date the same day keys change hands.",
  IL:
    "Chicago RLTO runs a longer clock than statewide Illinois. Pick the city toggle on step 1 when the unit is in Chicago.",
  IN:
    "Forty-five days feels generous until a dispute asks when possession actually returned, not when the lease ended.",
  LA:
    "Partial refunds without a written accounting line for each withhold invite phone calls you cannot replay from memory.",
  MD:
    "Belt investors stack DC, Maryland, and Virginia. Maryland’s forty-five day habit is easy to miss if another property uses thirty.",
  MI:
    "Detroit and Grand Rapids turns blur normal wear and damage on the withhold sheet without move-in walkthrough proof.",
  MO:
    "St. Louis and Kansas City units on the same tab share one broken deadline cell. One surrender date per unit, every turn.",
  MS:
    "Possession disputes start when stuff is still in the unit but the lease says move-out day. Vacant and keys returned matter.",
  NC:
    "Heavy repair turns may need interim accounting at thirty days even when final work runs longer. Do not go silent.",
  ND:
    "Pet fees and the main deposit ledger get mixed in small portfolios. Keep the security deposit packet clean on its own.",
  NH:
    "Tenants expect interest-aware returns with itemization, not just principal minus cleaning.",
  NJ:
    "Move-in disclosure paperwork and the move-out return clock are different habits. At turnover, run the return clock from surrender.",
  NV:
    "Balance and written accounting should leave in one coordinated mailing with proof logged.",
  OH:
    "Cleveland and Columbus vendor backlog pushes mail past day thirty when surrender was never logged at key pickup.",
  UT:
    "Missing the on-screen return line can trigger tenant penalty notices. Log surrender before you wait on the painter.",
  VA:
    "Out-of-state mail on day forty-four without tracking is a common belt investor pain point.",
  WA:
    "Each withhold line needs substantiation in the file, not just a label on a spreadsheet row.",
};

function slugFor(code) {
  const pre = SLUG_PREFIX[code] || code.toLowerCase();
  return `${pre}-operator-deposit-packet-sep-2026`;
}

function bodyFor(code, primaryPainSlug) {
  const pack = STATE_PACKS[code];
  const days = String(pack.returnDays);
  const name = pack.label;
  const local = LOCAL_CULTURE[code] || "";
  const painLink = primaryPainSlug
    ? `<p>When something already went wrong, start with <a href="/blog/${primaryPainSlug}">our ${name} operator pain guide</a>.</p>`
    : "";

  return `
      <p class="hero-eyebrow">${name} · Simple Property Tools</p>
      <h1>${name} operators: deposit packet habits · September 2026</h1>
      <p>Simple Property Tools is built for small landlords who itemize withholds, date surrender, and export before the clock on screen wins. ${local}</p>
      <dl class="fact-strip">
        <div><dt>Return default</dt><dd><strong>${days} days</strong> from surrender (keys back · unit vacant)</dd></div>
        <div><dt>Statute label</dt><dd>${citeLinkHtml(pack.cite, code)}</dd></div>
        <div><dt>Practice</dt><dd>One line per withhold · dated photos · proof of mail when you send balance</dd></div>
      </dl>
      <h2>Before you print or email</h2>
      <ul>
        <li>Log surrender the day possession returns, not the lease end date on paper alone.</li>
        <li>Match move-in notes to move-out withhold descriptions.</li>
        <li>Archive the PDF export and tracking number in <a href="/logs">operator logs</a>.</li>
      </ul>
      ${painLink}
      <p class="disclaimer">Not legal advice. Confirm ordinances and lease terms with counsel.</p>
      <p><a class="btn btn-primary" href="/app?state=${code}">Start ${name} packet</a> · <a href="/blog#locale-${code}">More ${name} guides</a></p>`;
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const slugs = new Set(manifest.posts.map((p) => p.slug));
let added = 0;

for (const code of SUPPORTED_STATES) {
  const pack = STATE_PACKS[code];
  const slug = slugFor(code);
  const title = `${pack.label} operators: deposit packet habits · September 2026`;
  const description = `${pack.returnDays}-day return default from surrender · ${pack.cite}. Local turnover habits for ${pack.label} operators. Not legal advice.`;

  const html = articleShell({
    title,
    description,
    slug,
    published: PUBLISHED,
    bodyHtml: bodyFor(code, manifest.primaryPainByState?.[code]),
  });
  writeFileSync(join(blogDir, `${slug}.html`), html);

  if (!slugs.has(slug)) {
    manifest.posts.push({
      slug,
      title,
      description,
      category: "landlord",
      intent: "operator",
      states: [code],
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: [pack.cite],
    });
    slugs.add(slug);
    added++;
    console.log("manifest+", slug);
  } else {
    console.log("refresh", slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("operator sep-2026 · states", SUPPORTED_STATES.length, "new rows", added);
