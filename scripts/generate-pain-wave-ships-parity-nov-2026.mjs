#!/usr/bin/env node
/**
 * Pain wave · ships.one parity · high-intent SEO → /app?turnover=1&ref=pain-*
 * Run: node scripts/generate-pain-wave-ships-parity-nov-2026.mjs && npm run apply:blog-goal-copy && npm run build-blog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-10-25";

function cta(state = "", ref = "pain-wave") {
  const q = new URLSearchParams({ turnover: "1", ref });
  if (state) q.set("state", state);
  return `<p class="hero-actions"><a class="btn btn-primary" href="/app?${q}">Open Deposit Desk</a> <a class="btn btn-secondary" href="/pain">Pain hub</a> <a class="btn btn-secondary" href="/pricing">Pricing</a></p>
      <p class="disclaimer">Not legal advice. Confirm deadlines with licensed counsel.</p>`;
}

const POSTS = [
  {
    slug: "tenant-wont-give-forwarding-address-deposit",
    title: "Tenant won't give a forwarding address for the deposit",
    description:
      "Clocks that wait on written address · what operators document anyway. Not legal advice.",
    states: [],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">No address means operators stall while the statute may not.</span> <span class="ps-fix">Record attempts · lock surrender · itemize · mail to last known.</span></p>
      <h1>No forwarding address · deposit still due</h1>
      <p>Connecticut, Rhode Island, and several states use <strong>later-of</strong> clocks when a forwarding address arrives late. Other states still expect return or itemization on surrender timelines. See <a href="/blog/connecticut-forwarding-address-later-of-clock">Connecticut later-of</a> and <a href="/blog/indiana-45-day-clock-forwarding-address-confusion">Indiana forwarding confusion</a>.</p>
      <h2>Document anyway</h2>
      <ul class="bullet-tight">
        <li>Email and text asking for a mailing address · save screenshots.</li>
        <li>Surrender date · keys · vacancy · <a href="/blog/surrender-date-statute-clock-starts">when the clock starts</a>.</li>
        <li>Line-item withholds in <a href="/app?turnover=1&amp;ref=pain-forwarding">Deposit Desk</a> before you mail to last known.</li>
      </ul>
      ${cta("", "pain-forwarding")}`,
  },
  {
    slug: "landlord-app-no-deposit-itemization-letter",
    title: "Your landlord app has no deposit itemization letter",
    description:
      "Innago, Avail, TurboTenant, and suites stop at the ledger · finish the packet at turnover. Not legal advice.",
    states: [],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">Rent apps export ledgers, not statutory mailings.</span> <span class="ps-fix">Dual stack · copy dates into Deposit Desk · print the letter.</span></p>
      <h1>PM app cannot print your deposit return</h1>
      <p>Compare stacks: <a href="/blog/deposit-desk-vs-innago-avail-turnover">Innago/Avail</a> · <a href="/blog/deposit-desk-vs-turbotenant-tenantcloud-turnover">TurboTenant/TenantCloud</a> · <a href="/blog/deposit-desk-vs-simplifyem-turnover">SimplifyEm</a> · <a href="/blog/competitor-pm-software-deposit-gaps">suite gaps</a>.</p>
      <h2>Weekend handoff</h2>
      <ol class="bullet-tight">
        <li>Copy surrender, deposit held, and forwarding address from the PM screen.</li>
        <li>Run withhold lines · export PDF · file in the same tenant folder.</li>
      </ol>
      ${cta("", "pain-pm-app")}`,
  },
  {
    slug: "lease-ended-tenant-still-in-unit-deposit-clock",
    title: "Lease ended but tenant still in the unit · deposit clock",
    description:
      "Surrender vs holdover · why lease end on paper is not enough. Not legal advice.",
    states: [],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">Lease end date on PDF ≠ keys back.</span> <span class="ps-fix">Record actual surrender before deadline math.</span></p>
      <h1>Holdover and the deposit return</h1>
      <p>Statutes usually key off <strong>surrender</strong> or <strong>possession</strong>, not the printed lease end. See <a href="/blog/keys-not-returned-deposit-clock-illinois">keys not returned</a> and <a href="/blog/mississippi-possession-still-occupied-deposit">still occupied</a>.</p>
      <p>Counsel on eviction holdovers · Deposit Desk for the dated packet once vacancy is real.</p>
      ${cta("IL", "pain-holdover")}`,
  },
  {
    slug: "tenant-texted-where-is-my-deposit-check",
    title: "Tenant texted: where is my deposit check?",
    description:
      "First reply habits · itemization before excuses · export proof. Not legal advice.",
    states: [],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">Panic replies without line items dig the hole deeper.</span> <span class="ps-fix">Send dated itemization + return math in one PDF.</span></p>
      <h1>“Where is my deposit?”</h1>
      <ul class="bullet-tight">
        <li>Confirm surrender date you are using · <a href="/blog/tenant-disputes-security-deposit-illinois">dispute guide</a>.</li>
        <li>Replace lump “cleaning” with lines · <a href="/blog/one-line-cleaning-fee-deposit-illinois">one-line cleaning trap</a>.</li>
        <li>Attach move-in proof if you have it · <a href="/hub?ref=pain-text">Condition hub</a>.</li>
      </ul>
      ${cta("IL", "pain-where-check")}`,
  },
  {
    slug: "texas-security-deposit-return-30-day-packet",
    title: "Texas 30-day security deposit return packet",
    description:
      "Surrender clock · itemized deductions · mail habits for Texas operators. Not legal advice.",
    states: ["TX"],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">Texas landlords google the deadline the week after move-out.</span> <span class="ps-fix">Pick TX on step 1 · export before day 30.</span></p>
      <h1>Texas deposit return discipline</h1>
      <p>Wizard cites and <a href="/legal/deposit-statutes">statute index</a> for Texas · confirm with Texas counsel on commercial and edge cases.</p>
      <p>Multi-door operators: <a href="/blog/missed-deposit-deadline-small-landlord-multi-state">multi-state roundup</a> · <a href="/blog/eight-unit-multi-state-deposit-stack">eight-unit stack</a>.</p>
      ${cta("TX", "pain-tx-30")}`,
  },
  {
    slug: "california-21-day-deposit-late-still-itemize",
    title: "California 21-day deposit deadline · late but itemize now",
    description:
      "Forfeit fear vs silent landlords · line items and mail proof. Not legal advice.",
    states: ["CA"],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">California operators fear total forfeit more than they fear bad math.</span> <span class="ps-fix">Itemize today · dated export beats silence.</span></p>
      <h1>Past 21 days · still organize</h1>
      <p>See <a href="/blog/california-21-day-deposit-deadline">21-day deadline</a> · <a href="/blog/california-21-day-deposit-itemization-forfeit">forfeit context</a> · counsel on liability.</p>
      ${cta("CA", "pain-ca-21")}`,
  },
  {
    slug: "zillow-rental-manager-deposit-return-gap",
    title: "Zillow Rental Manager and the deposit return gap",
    description:
      "Listings and rent collection vs move-out itemization letter. Not legal advice.",
    states: [],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">Marketplace tools optimize listing velocity, not statutory mailings.</span> <span class="ps-fix">Keep Zillow for leads · Deposit Desk at turnover.</span></p>
      <h1>Zillow stack at move-out</h1>
      <p>Same pattern as <a href="/blog/landlord-app-no-deposit-itemization-letter">landlord apps without letters</a> and <a href="/blog/deposit-desk-vs-spreadsheet">spreadsheet traps</a>.</p>
      ${cta("", "pain-zillow")}`,
  },
  {
    slug: "roommate-moved-out-deposit-split-landlord",
    title: "One roommate moved out · split the deposit?",
    description:
      "Partial turnover documentation when co-tenants change. Not legal advice.",
    states: [],
    body: `
<p class="pain-solution-lead"><span class="ps-problem">Roommate drama becomes a deposit fight without room notes.</span> <span class="ps-fix">Document unit condition · one packet per turnover event.</span></p>
      <h1>Roommate turnover</h1>
      <p>Lease structure decides who gets the check · software only helps you <strong>itemize and date</strong> what you withhold from the shared deposit.</p>
      <p>Illinois operators: <a href="/blog/hyde-park-vintage-flat-normal-wear-deposit">wear vs damage</a> · <a href="/blog/move-in-inspection-checklist-illinois">move-in checklist</a>.</p>
      ${cta("IL", "pain-roommate")}`,
  },
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const slugs = new Set(manifest.posts.map((p) => p.slug));
let added = 0;

for (const p of POSTS) {
  writeFileSync(
    join(blogDir, `${p.slug}.html`),
    articleShell({
      title: p.title,
      description: p.description,
      slug: p.slug,
      published: PUBLISHED,
      bodyHtml: p.body.trim(),
      states: p.states || [],
      stateLabels: manifest.stateLabels,
    })
  );
  const row = {
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: "pain",
    intent: "pain",
    states: p.states || [],
    published: PUBLISHED,
    updated: PUBLISHED,
    statutes: [],
    painWave: true,
  };
  if (!slugs.has(p.slug)) {
    manifest.posts.push(row);
    slugs.add(p.slug);
    added++;
    console.log("+", p.slug);
  } else {
    const existing = manifest.posts.find((x) => x.slug === p.slug);
    Object.assign(existing, row);
    console.log("refresh", p.slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Pain wave: ${POSTS.length} guides · ${added} new · total ${manifest.posts.length}`);
