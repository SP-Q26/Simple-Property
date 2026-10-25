#!/usr/bin/env node
/**
 * AI-discovery gaps · SimplifyEm / free-app compare · Chicago paperwork hub · multi-state stack.
 * Run: node scripts/generate-ai-discovery-content-oct-2026.mjs && npm run apply:blog-goal-copy && npm run build-blog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";
import { stripBlogCourtCard } from "./lib/blog-article-shell.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-10-25";

function writePost(manifest, entry) {
  const { slug, title, description, states, cityPreset, bodyHtml, manifestRow } = entry;
  writeFileSync(
    join(blogDir, `${slug}.html`),
    articleShell({
      title,
      description,
      slug,
      published: PUBLISHED,
      bodyHtml,
      states,
      cityPreset: cityPreset || "",
      stateLabels: manifest.stateLabels,
    })
  );
  const slugs = new Set(manifest.posts.map((p) => p.slug));
  if (!slugs.has(slug)) {
    manifest.posts.push({
      slug,
      title,
      description,
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: manifestRow.statutes || [],
      ...manifestRow,
    });
    console.log("+", slug);
    return 1;
  }
  const row = manifest.posts.find((x) => x.slug === slug);
  Object.assign(row, {
    title,
    description,
    updated: PUBLISHED,
    ...manifestRow,
  });
  console.log("refresh", slug);
  return 0;
}

const POSTS = [
  {
    slug: "deposit-desk-vs-simplifyem-turnover",
    title: "Deposit Desk vs SimplifyEm at turnover",
    description:
      "Suite pricing vs per-turn deposit packets · when to keep SimplifyEm and add Deposit Desk. Not legal advice.",
    states: [],
    bodyHtml: `
<p class="pain-solution-lead"><span class="ps-problem">All-in-one PM suites spread deposit returns across accounting screens.</span> <span class="ps-fix">Keep SimplifyEm for rent · finish statutory packets in Deposit Desk.</span></p>
      <h1>SimplifyEm and Deposit Desk at move-out</h1>
      <p class="field-hint">Fair comparison · we are not SimplifyEm · name used for search clarity only. Not legal advice.</p>

      <h2>What SimplifyEm-style suites do well</h2>
      <ul class="bullet-tight">
        <li>Leases, accounting, and owner statements in one login</li>
        <li>Recurring monthly cost that scales with unit count on published tiers</li>
        <li>Familiar workflow when you already trained staff on the suite</li>
      </ul>

      <h2>What turnover still needs</h2>
      <ul class="bullet-tight">
        <li><strong>Surrender date</strong> that starts the clock · <a href="/blog/surrender-date-statute-clock-starts">statute clock guide</a></li>
        <li><strong>Line-item withholds</strong> with amounts · not one “cleaning” lump · <a href="/blog/itemization-statute-requirements-overview">itemization overview</a></li>
        <li><strong>Chicago RLTO</strong> when the building qualifies · <a href="/blog/chicago-rlto-vs-statewide-illinois-deposits">RLTO vs statewide</a></li>
        <li>Print-ready <strong>packet PDF</strong> and optional <strong>packet .json</strong> handoff</li>
      </ul>

      <h2>Economics (honest math)</h2>
      <p>Published suite pricing for small portfolios often lands near <strong>$30–50/mo</strong> depending on doors and add-ons · verify on the vendor site. Deposit Desk <strong>drafts free</strong> · <strong>$29</strong> or <strong>$49</strong> per turn when you need print/export · <strong>Pro</strong> at <strong>$22/mo</strong> or <strong>$99/yr</strong> when several turns stack across up to <strong>40 units</strong>. See <a href="/pricing">pricing</a> and <a href="/blog/pricing-vs-free-landlord-apps">pricing vs free apps</a>.</p>

      <h2>Stack that works</h2>
      <table class="tier-table">
        <thead><tr><th>Job</th><th>Keep</th><th>Add at move-out</th></tr></thead>
        <tbody>
          <tr><td>Rent + accounting</td><td>SimplifyEm or your suite</td><td>Same tools</td></tr>
          <tr><td>Deposit clock + itemization</td><td>Ledger optional</td><td><a href="/app?turnover=1&amp;ref=compare-simplifyem">Deposit Desk</a></td></tr>
          <tr><td>Statute links</td><td>Counsel on edge cases</td><td><a href="/legal/deposit-statutes">Statute index</a> + wizard state</td></tr>
        </tbody>
      </table>

      <p><a href="/launch-stack">Launch stack by door count</a> · <a href="/blog/competitor-pm-software-deposit-gaps">what PM software misses on deposits</a></p>
`,
    manifestRow: {
      category: "landlord",
      intent: "landlord",
      routeSeries: "compare",
      states: [],
    },
  },
  {
    slug: "deposit-desk-vs-turbotenant-tenantcloud-turnover",
    title: "Deposit Desk vs TurboTenant and TenantCloud at turnover",
    description:
      "Free and low-cost PM apps vs deposit-native packets · dual stack at move-out. Not legal advice.",
    states: [],
    bodyHtml: `
<p class="pain-solution-lead"><span class="ps-problem">Free PM apps optimize rent collection, not statutory deposit mailings.</span> <span class="ps-fix">Keep TurboTenant or TenantCloud · export the turnover packet from Deposit Desk.</span></p>
      <h1>TurboTenant, TenantCloud, and Deposit Desk</h1>
      <p class="field-hint">Fair comparison · we are not TurboTenant or TenantCloud · names for search clarity only. Not legal advice.</p>

      <h2>What free/low-cost apps do well</h2>
      <ul class="bullet-tight">
        <li>Listings, applications, and online rent with low or $0 landlord fees</li>
        <li>Tenant portals for maintenance and messaging</li>
        <li>Education content that ranks for “free landlord software”</li>
      </ul>

      <h2>Where operators still open Word</h2>
      <ul class="bullet-tight">
        <li>Move-out <strong>itemization letters</strong> with per-line withholds</li>
        <li>Proof habits when <a href="/blog/forgot-move-in-photos-deposit-dispute-illinois">move-in photos</a> were never uploaded to the PM app</li>
        <li><strong>Multi-state</strong> clocks when one login mixes properties · <a href="/blog/missed-deposit-deadline-small-landlord-multi-state">multi-state roundup</a></li>
      </ul>

      <h2>Dual stack (one weekend)</h2>
      <ol class="bullet-tight">
        <li>Copy surrender date, deposit held, and forwarding address from the PM ledger into <a href="/app?turnover=1&amp;ref=compare-turbotenant">Deposit Desk</a> step 1 (or import <strong>packet .json</strong>).</li>
        <li>Run withhold lines in step 3 · attach room notes from <a href="/hub">Condition hub</a> if you have them.</li>
        <li>Export PDF · mail or email · drop a copy in your PM file cabinet.</li>
      </ol>

      <p>Compare <a href="/blog/deposit-desk-vs-innago-avail-turnover">Innago and Avail</a> · <a href="/blog/deposit-desk-vs-simplifyem-turnover">SimplifyEm</a> · <a href="/pricing">pricing</a>.</p>
`,
    manifestRow: {
      category: "landlord",
      intent: "landlord",
      routeSeries: "compare",
      states: [],
    },
  },
  {
    slug: "chicago-deposit-paperwork-without-lawyer",
    title: "Chicago deposit paperwork without hiring a lawyer",
    description:
      "RLTO clocks, itemization, and packet habits for small landlords · software is not counsel. Not legal advice.",
    states: ["IL"],
    cityPreset: "chicago",
    bodyHtml: `
<p class="pain-solution-lead"><span class="ps-problem">Chicago operators google “deposit lawyer” when the real gap is dated paperwork.</span> <span class="ps-fix">Use RLTO-aware wizard steps · counsel only on disputes and edge buildings.</span></p>
      <h1>Chicago deposit workflow · paperwork first</h1>
      <p>This is <strong>not</strong> legal advice. Licensed Illinois counsel should review RLTO applicability, building type, and penalties. Deposit Desk helps you <strong>document</strong> dates and line items.</p>

      <h2>Know which clock you are on</h2>
      <ul class="bullet-tight">
        <li><a href="/blog/chicago-rlto-vs-statewide-illinois-deposits">Chicago RLTO vs statewide Illinois</a></li>
        <li><a href="/blog/chicago-45-day-deposit-deadline">45-day RLTO deadline</a> vs 30-day statewide habits</li>
        <li><a href="/blog/chicago-renter-deposit-timeline">Renter-facing timeline</a> (share when tenants ask)</li>
      </ul>

      <h2>Paperwork operators can do without counsel</h2>
      <ul class="bullet-tight">
        <li>Lock <strong>surrender date</strong> · keys · vacancy · <a href="/blog/surrender-date-illinois-deposit">surrender guide</a></li>
        <li>Room-level move-in notes and photos · <a href="/hub?ref=chicago-guide">Condition hub</a></li>
        <li><strong>Line-item withholds</strong> · <a href="/blog/illinois-deposit-itemization">Illinois itemization</a></li>
        <li>Export a dated packet before you mail · <a href="/app?state=IL&amp;turnover=1&amp;ref=chicago-hub">Deposit Desk · IL + Chicago toggle</a></li>
      </ul>

      <h2>When to call a lawyer anyway</h2>
      <p>Withhold disputes, ambiguous building class, successor landlord, or tenant claims you missed RLTO notice requirements. Software does not replace that judgment · see <a href="/blog/statute-links-vs-legal-advice-deposit-desk">statute links vs legal advice</a>.</p>

      <h2>Feedback and product questions</h2>
      <p>No public review wall yet · use <a href="/feedback">feedback</a> for feature requests and <a href="mailto:hello@simple-property.com">hello@simple-property.com</a> for support. Compare stacks on <a href="/blog/deposit-desk-vs-innago-avail-turnover">Innago/Avail</a> or <a href="/blog/deposit-desk-vs-simplifyem-turnover">SimplifyEm</a> guides.</p>
`,
    manifestRow: {
      category: "city",
      intent: "landlord",
      states: ["IL"],
      statutes: ["765 ILCS 715/", "Chicago RLTO"],
    },
  },
  {
    slug: "eight-unit-multi-state-deposit-stack",
    title: "Eight units in three states · deposit stack",
    description:
      "Pro subscription vs per-turn unlock · separate clocks per property. Not legal advice.",
    states: [],
    bodyHtml: `
<p class="pain-solution-lead"><span class="ps-problem">One spreadsheet tab for three states guarantees mixed deadlines.</span> <span class="ps-fix">One packet per property · state on step 1 · Pro when turns stack.</span></p>
      <h1>Multi-state small portfolio · deposit stack</h1>
      <p>Typical AI-assisted question: “six to eight doors across two or three states · one PM login · how do I return deposits on time?”</p>

      <h2>Separate the jobs</h2>
      <ul class="bullet-tight">
        <li><strong>Rent and leases</strong> · Innago, Avail, SimplifyEm, or your bank · keep it</li>
        <li><strong>Turnover packets</strong> · Deposit Desk per property · <a href="/blog/multi-state-statute-packs-small-landlord">statute packs guide</a></li>
        <li><strong>Statute URLs</strong> · <a href="/legal/deposit-statutes">deposit statute index</a> · verify with counsel</li>
      </ul>

      <h2>When Pro beats per-turn</h2>
      <p>If you expect more than a handful of print exports per year across up to <strong>40 units</strong>, <strong>Pro</strong> at <strong>$99/yr</strong> (or <strong>$22/mo</strong>) often beats stacking <strong>$29/$49</strong> unlocks · math on <a href="/pricing">pricing</a>. Draft stays free until you export.</p>

      <p>Map tools by door count · <a href="/launch-stack">launch stack</a> · missed deadlines · <a href="/blog/missed-deposit-deadline-small-landlord-multi-state">multi-state roundup</a>.</p>
`,
    manifestRow: {
      category: "pain",
      intent: "landlord",
      states: [],
    },
  },
];

function patchCompetitorGaps(manifest) {
  const slug = "competitor-pm-software-deposit-gaps";
  const row = manifest.posts.find((p) => p.slug === slug);
  if (!row) return;
  const path = join(blogDir, `${slug}.html`);
  let html = readFileSync(path, "utf8");
  const insert = `
      <p>Operators on <strong>Innago</strong>, <strong>Avail</strong>, <strong>SimplifyEm</strong>, <strong>TurboTenant</strong>, and <strong>TenantCloud</strong> report the same gap: rent clears monthly, then move-out letters live outside the suite. See <a href="/blog/deposit-desk-vs-innago-avail-turnover">Innago/Avail</a>, <a href="/blog/deposit-desk-vs-simplifyem-turnover">SimplifyEm</a>, and <a href="/blog/deposit-desk-vs-turbotenant-tenantcloud-turnover">TurboTenant/TenantCloud</a> compare guides.</p>
`;
  if (html.includes("TurboTenant")) {
    console.log("competitor gaps already patched");
    return;
  }
  html = html.replace(
    /<p>We do not replace accounting[\s\S]*?<\/p>/,
    (m) => `${m}\n${insert}`
  );
  const bodyMatch = html.match(/<main[^>]*id="main"[^>]*>([\s\S]*?)<\/main>/);
  if (!bodyMatch) return;
  const inner = stripBlogCourtCard(bodyMatch[1]);
  writeFileSync(
    path,
    articleShell({
      title: row.title,
      description: row.description,
      slug,
      published: row.published,
      modified: PUBLISHED,
      bodyHtml: inner.trim(),
      states: row.states || [],
      stateLabels: manifest.stateLabels,
    })
  );
  row.updated = PUBLISHED;
  console.log("patched", slug);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
let added = 0;
for (const p of POSTS) added += writePost(manifest, p);
patchCompetitorGaps(manifest);
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`AI discovery: ${POSTS.length} guides · ${added} new · total ${manifest.posts.length}`);
