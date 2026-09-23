#!/usr/bin/env node
/**
 * Pain-intent SEO posts · dispute, missed clock, spreadsheet traps.
 * Run: node scripts/generate-pain-seo-posts.mjs && npm run build-blog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-09-22";

function cta(state = "IL") {
  const name = state === "IL" ? "Illinois" : "your state";
  return `<p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=${state}">Start ${name} packet</a> · <a href="/blog/deposit-desk-vs-spreadsheet">Vs spreadsheet</a> · <a href="/pricing">Pricing</a></p>`;
}

function body(html) {
  return html;
}

const POSTS = [
  {
    slug: "missed-illinois-deposit-deadline-what-now",
    title: "Missed the Illinois deposit deadline  ·  what landlords do next",
    description:
      "Past 30 or 45 days after surrender? Practical documentation steps, not legal advice. 765 ILCS 715/ and Chicago RLTO context.",
    category: "pain",
    states: ["IL"],
    intent: "pain",
    statutes: ["765 ILCS 715/", "Chicago RLTO"],
    body: body(`
      <p class="hero-eyebrow">Illinois · when the clock already ran</p>
      <h1>Missed the deposit return deadline  ·  now what?</h1>
      <p>Operators call us when the tenant already asked for the check and the calendar says they are late. This is <strong>documentation hygiene</strong>, not a substitute for counsel on liability.</p>
      <h2>Stop digging the hole</h2>
      <ul>
        <li>Pick a <strong>surrender date</strong> you can defend (keys returned · unit vacant) and stick to it in writing.</li>
        <li>Build a <strong>line-item withhold</strong> list today  ·  not one lump “cleaning.”</li>
        <li>Gather move-in notes and photos if they still exist; label what is missing.</li>
      </ul>
      <h2>File the packet anyway</h2>
      <p>Late itemization is still better than silence. Deposit Desk gives you a dated export with deadline math and room tables so your next email or mail piece is coherent.</p>
      <p>Chicago RLTO often uses <strong>45 days</strong>; statewide Illinois uses <strong>30</strong> after surrender. Toggle Chicago on step 1 in the app.</p>
      ${cta("IL")}`),
  },
  {
    slug: "tenant-disputes-security-deposit-illinois",
    title: "Tenant disputes the security deposit withhold  ·  Illinois operators",
    description:
      "When the tenant says pre-existing damage or normal wear. Move-in proof, itemization, and surrender date. Not legal advice.",
    category: "pain",
    states: ["IL"],
    intent: "pain",
    statutes: ["765 ILCS 715/"],
    body: body(`
      <h1>Tenant disputes the withhold</h1>
      <p>The fight is rarely “who is right on the internet.” It is <strong>what you can show</strong>: move-in condition, move-out photos, and math that matches the statute clock.</p>
      <h2>What wins documentation (not court)</h2>
      <ul>
        <li>Room table at move-in with dated notes  ·  see <a href="/blog/move-in-inspection-checklist-illinois">move-in checklist</a>.</li>
        <li>Separate lines per withhold · see <a href="/blog/illinois-deposit-itemization">itemization</a>.</li>
        <li>Wear vs damage call  ·  <a href="/blog/normal-wear-vs-damage-illinois">guide</a>.</li>
      </ul>
      <p>If move-in proof never existed, you are negotiating from memory. That is the pain Deposit Desk is built to prevent on the <em>next</em> turn.</p>
      ${cta("IL")}`),
  },
  {
    slug: "one-line-cleaning-fee-deposit-illinois",
    title: "One-line “cleaning fee” on a deposit return  ·  why it fails in Illinois",
    description:
      "Single lump withhold vs itemized deductions under 765 ILCS 715/. Operator checklist. Not legal advice.",
    category: "pain",
    states: ["IL"],
    intent: "pain",
    statutes: ["765 ILCS 715/"],
    body: body(`
      <h1>One line that says “cleaning  ·  $400”</h1>
      <p>Spreadsheets make it easy to type one cell. Statutes and disputes expect <strong>description + amount per withhold</strong>, tied to condition at move-out.</p>
      <ul>
        <li>Split professional clean · carpet · paint touch-up · unpaid utilities if applicable.</li>
        <li>Attach invoice or estimate references in your notes column.</li>
        <li>Run totals in Deposit Desk step 4 so the print packet matches the letter.</li>
      </ul>
      ${cta("IL")}`),
  },
  {
    slug: "keys-not-returned-deposit-clock-illinois",
    title: "Lease ended but tenant still has keys  ·  when the deposit clock starts",
    description:
      "Surrender date vs lease end date for 30/45-day Illinois deposit returns. Not legal advice.",
    category: "pain",
    states: ["IL"],
    intent: "pain",
    statutes: ["765 ILCS 715/"],
    body: body(`
      <h1>Lease ended · keys not back yet</h1>
      <p>The deadline in Deposit Desk starts on <strong>surrender</strong> (vacant · keys returned), not the printed lease end date alone. Operators lose time waiting on a holdover tenant while the tenant thinks the clock started on the 31st.</p>
      <p>Log the actual key return date in step 2 · read <a href="/blog/surrender-date-illinois-deposit">surrender and the clock</a>.</p>
      ${cta("IL")}`),
  },
  {
    slug: "pass-through-deposit-documentation-fee-illinois",
    title: "Pass-through deposit documentation fee (like screening)  ·  Illinois landlords",
    description:
      "How operators line-item move-in/move-out packet fees on the ledger. Disclosure and counsel review required. Not legal advice.",
    category: "pain",
    states: ["IL"],
    intent: "pain",
    statutes: ["765 ILCS 715/"],
    body: body(`
      <h1>Charge the tenant for the packet like screening?</h1>
      <p>Many mom-and-pop landlords already pass through <strong>screening</strong> as a per-event fee. Deposit Desk is priced for the same mental bucket: <strong>per turn</strong>, not another PM subscription.</p>
      <p>Sample ledger copy for operators is in our per-turn pricing spec · confirm caps and disclosures with counsel before adding to a lease or welcome letter. Fee is <strong>not</strong> part of the security deposit.</p>
      <p><a href="/pricing">Per turn · Pro pricing</a></p>
      ${cta("IL")}`),
  },
  {
    slug: "excel-deposit-spreadsheet-mistakes-illinois",
    title: "Excel deposit tracker mistakes at turnover (Illinois)",
    description:
      "Wrong surrender cell, broken formulas, and no print packet when the tenant disputes. Not legal advice.",
    category: "pain",
    states: ["IL"],
    intent: "pain",
    statutes: ["765 ILCS 715/"],
    body: body(`
      <h1>Where spreadsheets break</h1>
      <ul>
        <li><strong>Surrender date</strong> in the wrong row after a burst of move-outs.</li>
        <li><strong>30 vs 45</strong> formula that does not know Chicago RLTO.</li>
        <li>Photos in Drive · story in email · numbers in a tab  ·  nothing mails as one file.</li>
      </ul>
      <p>Compare side by side: <a href="/blog/deposit-desk-vs-spreadsheet">Deposit Desk vs spreadsheet</a>.</p>
      ${cta("IL")}`),
  },
  {
    slug: "forgot-move-in-photos-deposit-dispute-illinois",
    title: "No move-in photos when the tenant fights the withhold  ·  Illinois",
    description:
      "Recovery steps when move-in documentation was skipped. Prevention for the next lease. Not legal advice.",
    category: "pain",
    states: ["IL"],
    intent: "pain",
    statutes: ["765 ILCS 715/"],
    body: body(`
      <h1>You did not document move-in</h1>
      <p>At move-out dispute time, you cannot time-travel. You can still:</p>
      <ul>
        <li>Itemize withholds with vendor proof from <em>this</em> turn.</li>
        <li>Write a clear surrender date and deadline letter today.</li>
        <li>Start move-in photos on the <strong>next</strong> tenant before keys  ·  step 3 in Deposit Desk.</li>
      </ul>
      ${cta("IL")}`),
  },
  {
    slug: "missed-deposit-deadline-small-landlord-multi-state",
    title: "Missed deposit deadline stress  ·  Indiana, Ohio, Michigan, and neighbors",
    description:
      "Small landlords across the Midwest confuse lease end with surrender. 30- and 45-day windows by state. Not legal advice.",
    category: "pain",
    states: ["IN", "OH", "MI", "IA", "MO"],
    intent: "pain",
    statutes: ["IC 32-31-3-12", "ORC 5321.16", "MCL 554.610"],
    body: body(`
      <h1>Same panic · different statute label</h1>
      <p>Deposit Desk defaults: <strong>Indiana 45 days</strong> · <strong>Ohio, Michigan, Iowa, Missouri 30 days</strong> after surrender (confirm locally).</p>
      <p>The operational pain is identical: wrong clock start, weak itemization, no filed packet. Pick your state in the app bar or open guides:</p>
      <ul>
        <li><a href="/blog/missed-illinois-deposit-deadline-what-now">Illinois missed deadline</a></li>
        <li><a href="/blog/indiana-45-day-deposit-deadline">Indiana 45-day</a></li>
        <li><a href="/blog/ohio-30-day-deposit-deadline">Ohio 30-day</a></li>
      </ul>
      <p><a class="btn btn-primary" href="/app">Start packet</a></p>
      <p class="disclaimer">Not legal advice.</p>`),
  },
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!manifest.categories.pain) {
  manifest.categories.pain = {
    label: "Pain and turnover",
    audience: "Missed clocks, disputes, spreadsheet traps",
  };
}

const slugs = new Set(manifest.posts.map((p) => p.slug));

for (const post of POSTS) {
  writeFileSync(
    join(blogDir, `${post.slug}.html`),
    articleShell({
      title: post.title,
      description: post.description,
      slug: post.slug,
      published: PUBLISHED,
      bodyHtml: post.body,
    })
  );
  if (!slugs.has(post.slug)) {
    manifest.posts.push({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      intent: post.intent,
      states: post.states,
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: post.statutes,
    });
    slugs.add(post.slug);
    console.log("+", post.slug);
  } else {
    console.log("html", post.slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("pain posts in manifest:", manifest.posts.filter((p) => p.intent === "pain").length);
