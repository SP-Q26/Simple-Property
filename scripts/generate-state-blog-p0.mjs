#!/usr/bin/env node
/**
 * P0 state blog cluster from 2026-09-22 swarm audits.
 * Generates HTML + merges blog-manifest.json · then run build-blog-seo.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const manifestPath = join(web, "data", "blog-manifest.json");
const PUBLISHED = "2026-09-22";

function cta(stateName, app) {
  return `<p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=${app}">Start ${stateName} packet</a> · <a href="/blog#locale-${app}">More ${stateName} guides</a></p>`;
}

function itemizationBody({ stateName, cite, days, app, localNote = "" }) {
  return `
      <p class="hero-eyebrow">${stateName} · deposit desk</p>
      <h1>${stateName} deposit itemization</h1>
      <p>When you withhold any part of a security deposit, operators typically owe a <strong>written itemization</strong> that matches amounts returned or kept. Deposit Desk step 4 is built for line items that roll into your print packet and tenant email copy.</p>
      <dl class="fact-strip">
        <div><dt>Return window</dt><dd><strong>${days} days</strong> (Deposit Desk default from surrender)</dd></div>
        <div><dt>Citation</dt><dd>${cite}</dd></div>
        <div><dt>Practice</dt><dd>One line per withhold · description · amount · receipts when you have them</dd></div>
      </dl>
      <h2>What to log before move-out</h2>
      <ul>
        <li>Move-in condition notes and dated photos (same rooms at move-out).</li>
        <li>Vendor invoices or estimates tied to each withhold line.</li>
        <li>Surrender date (keys returned) for your deadline math.</li>
      </ul>
      ${localNote}
      ${cta(stateName, app)}`;
}

function checklistBody({ stateName, cite, days, app, localNote = "" }) {
  return `
      <p class="hero-eyebrow">${stateName} · operators</p>
      <h1>${stateName} security deposit checklist</h1>
      <p>A simple move-in through move-out checklist keeps ${days}-day math and itemization defensible. Use Deposit Desk for the packet; use <a href="/logs">operator logs</a> for maintenance and tickets between turns.</p>
      <h2>Move-in</h2>
      <ul>
        <li>Room-by-room condition · photos · tenant walkthrough when possible.</li>
        <li>Deposit amount and where it is held (ledger note).</li>
      </ul>
      <h2>During tenancy</h2>
      <ul>
        <li>Log maintenance and habitability issues (<a href="/logs#maintenance">maintenance log</a>).</li>
        <li>Keep entry and inspection notes (<a href="/logs#inspections">inspections &amp; complaints</a>).</li>
      </ul>
      <h2>Move-out</h2>
      <ul>
        <li>Record surrender date · start ${days}-day clock in Deposit Desk.</li>
        <li>Itemize withholds · mail or deliver remainder with proof.</li>
      </ul>
      <p class="field-hint">${cite} · confirm local ordinances and lease with counsel.</p>
      ${localNote}
      ${cta(stateName, app)}`;
}

function renterBody({ stateName, cite, days, app }) {
  return `
      <p class="hero-eyebrow">${stateName} · renters</p>
      <h1>${stateName} renters: security deposit timeline</h1>
      <p>Plain facts for tenants and roommates. This site is built for small landlords; renters search the same statutes.</p>
      <dl class="fact-strip">
        <div><dt>Typical window</dt><dd><strong>${days} days</strong> after surrender (keys and vacancy · confirm locally)</dd></div>
        <div><dt>Statute label</dt><dd>${cite}</dd></div>
      </dl>
      <h2>What to save at move-in</h2>
      <ul>
        <li>Your signed checklist or photos of existing damage.</li>
        <li>Forwarding address for mail after move-out.</li>
      </ul>
      <h2>If money is withheld</h2>
      <p>You should receive a written breakdown of deductions and any balance returned. Disputes are between you and your landlord or counsel · not something this tool resolves.</p>
      ${cta(stateName, app)}`;
}

function surrenderBody({ stateName, cite, days, app }) {
  return `
      <p class="hero-eyebrow">${stateName} · deposit clock</p>
      <h1>${stateName} surrender date and the ${days}-day deposit clock</h1>
      <p>The return timer in Deposit Desk starts on <strong>surrender</strong> (keys returned and unit vacated), not the lease end date on paper alone.</p>
      <dl class="fact-strip">
        <div><dt>${stateName}</dt><dd><strong>${days} days</strong> after surrender (wizard default)</dd></div>
        <div><dt>Citation</dt><dd>${cite}</dd></div>
      </dl>
      <p>Log the date keys changed hands · photograph the empty unit if useful · start your packet in the app the same day.</p>
      ${cta(stateName, app)}`;
}

const POSTS = [
  {
    slug: "illinois-30-day-deposit-deadline",
    title: "Illinois 30-day security deposit return",
    description: "Statewide Illinois return window after surrender · 765 ILCS 715/ · not Chicago RLTO. Not legal advice.",
    category: "law",
    states: ["IL"],
    statutes: ["765 ILCS 715/"],
    body: () => `
      <p class="hero-eyebrow">Illinois · outside Chicago RLTO</p>
      <h1>Illinois 30-day deposit clock (statewide)</h1>
      <p>Chicago RLTO uses 45 days · see <a href="/blog/chicago-45-day-deposit-deadline">Chicago guide</a>. Elsewhere in Illinois, Deposit Desk defaults to <strong>30 days</strong> from surrender under 765 ILCS 715/.</p>
      <dl class="fact-strip">
        <div><dt>Illinois statewide</dt><dd><strong>30 days</strong> after surrender</dd></div>
        <div><dt>Chicago RLTO</dt><dd><strong>45 days</strong> · toggle in app step 1</dd></div>
      </dl>
      ${cta("Illinois", "IL")}`,
  },
  {
    slug: "move-in-inspection-checklist-illinois",
    title: "Move-in inspection checklist for Illinois landlords",
    description: "Room condition, photos, and walkthrough habits that support later itemization · 765 ILCS 715/. Not legal advice.",
    category: "landlord",
    states: ["IL"],
    statutes: ["765 ILCS 715/", "Chicago RLTO"],
    body: () => checklistBody({
      stateName: "Illinois",
      cite: "765 ILCS 715/",
      days: "30",
      app: "IL",
      localNote: "<p>Chicago operators: RLTO record-keeping habits may exceed a bare statewide lease · confirm with counsel.</p>",
    }),
  },
  {
    slug: "illinois-return-and-itemization-letter",
    title: "Illinois deposit return and itemization letter",
    description: "Mail-ready structure for remainder, withhold lines, and proof log · 765 ILCS 715/. Not legal advice.",
    category: "landlord",
    states: ["IL"],
    statutes: ["765 ILCS 715/"],
    body: () => `
      <h1>Return and itemization letter (Illinois)</h1>
      <p>Export your Deposit Desk packet to PDF, then mail or deliver with tracking when required. Include: tenant name, address, surrender date, itemized withholds, balance due, and how you sent it.</p>
      <p>See also <a href="/blog/illinois-deposit-itemization">itemization</a> and <a href="/blog/illinois-deposit-return-by-mail">return by mail</a>.</p>
      ${cta("Illinois", "IL")}`,
  },
  {
    slug: "indiana-deposit-itemization",
    title: "Indiana security deposit itemization",
    description: "Written statement when withholding · typical 45-day window · IC 32-31-3-12. Not legal advice.",
    category: "law",
    states: ["IN"],
    statutes: ["IC 32-31-3-12"],
    body: () => itemizationBody({ stateName: "Indiana", cite: "IC 32-31-3-12 et seq.", days: "45", app: "IN" }),
  },
  {
    slug: "indiana-security-deposit-checklist",
    title: "Indiana security deposit checklist",
    description: "Move-in through move-out checklist for Indiana operators · IC 32-31-3-12. Not legal advice.",
    category: "landlord",
    states: ["IN"],
    statutes: ["IC 32-31-3-12"],
    body: () => checklistBody({ stateName: "Indiana", cite: "IC 32-31-3-12", days: "45", app: "IN" }),
  },
  {
    slug: "indiana-surrender-date-deposit",
    title: "Indiana surrender date and the 45-day deposit clock",
    description: "When the Indiana return timer starts · IC 32-31-3-12. Not legal advice.",
    category: "law",
    states: ["IN"],
    statutes: ["IC 32-31-3-12"],
    body: () => surrenderBody({ stateName: "Indiana", cite: "IC 32-31-3-12", days: "45", app: "IN" }),
  },
  {
    slug: "ohio-deposit-itemization",
    title: "Ohio deposit itemization after move-out",
    description: "Written deductions and balance habits · ORC 5321.16 · 30-day window. Not legal advice.",
    category: "law",
    states: ["OH"],
    statutes: ["ORC 5321.16"],
    body: () => itemizationBody({ stateName: "Ohio", cite: "ORC 5321.16", days: "30", app: "OH" }),
  },
  {
    slug: "ohio-renter-deposit-rights",
    title: "Ohio renter guide: security deposits",
    description: "Plain facts on 30-day return, itemization, and move-in records · ORC 5321.16. Not legal advice.",
    category: "renter",
    states: ["OH"],
    statutes: ["ORC 5321.16"],
    body: () => renterBody({ stateName: "Ohio", cite: "ORC 5321.16", days: "30", app: "OH" }),
  },
  {
    slug: "ohio-security-deposit-checklist",
    title: "Ohio security deposit checklist",
    description: "Move-in through move-out for ORC 5321.16 timing and documentation. Not legal advice.",
    category: "landlord",
    states: ["OH"],
    statutes: ["ORC 5321.16"],
    body: () => checklistBody({ stateName: "Ohio", cite: "ORC 5321.16", days: "30", app: "OH" }),
  },
  {
    slug: "michigan-deposit-itemization",
    title: "Michigan deposit itemization",
    description: "Move-out accounting and withhold lines · MCL 554.610 · 30 days. Not legal advice.",
    category: "law",
    states: ["MI"],
    statutes: ["MCL 554.610"],
    body: () =>
      itemizationBody({
        stateName: "Michigan",
        cite: "MCL 554.610",
        days: "30",
        app: "MI",
        localNote:
          "<p class=\"field-hint\">Detroit and other cities may add registration or habitability duties · confirm locally.</p>",
      }),
  },
  {
    slug: "michigan-renter-deposit-rights",
    title: "Michigan renter guide: security deposits",
    description: "30-day return window and move-in records · MCL 554.610. Not legal advice.",
    category: "renter",
    states: ["MI"],
    statutes: ["MCL 554.610"],
    body: () => renterBody({ stateName: "Michigan", cite: "MCL 554.610", days: "30", app: "MI" }),
  },
  {
    slug: "michigan-security-deposit-checklist",
    title: "Michigan security deposit checklist",
    description: "Operator checklist aligned with MCL 554.610 and Deposit Desk. Not legal advice.",
    category: "landlord",
    states: ["MI"],
    statutes: ["MCL 554.610"],
    body: () => checklistBody({ stateName: "Michigan", cite: "MCL 554.610", days: "30", app: "MI" }),
  },
  {
    slug: "iowa-deposit-itemization",
    title: "Iowa deposit itemization when you withhold",
    description: "Written breakdown habits · Iowa Code 562A.12 · 30-day window. Not legal advice.",
    category: "law",
    states: ["IA"],
    statutes: ["Iowa Code 562A.12"],
    body: () => itemizationBody({ stateName: "Iowa", cite: "Iowa Code 562A.12", days: "30", app: "IA" }),
  },
  {
    slug: "iowa-renter-deposit-timeline",
    title: "Iowa renters: security deposit return timeline",
    description: "Plain facts on 30-day return and move-in proof · Iowa Code 562A.12. Not legal advice.",
    category: "renter",
    states: ["IA"],
    statutes: ["Iowa Code 562A.12"],
    body: () => renterBody({ stateName: "Iowa", cite: "Iowa Code 562A.12", days: "30", app: "IA" }),
  },
  {
    slug: "iowa-security-deposit-checklist",
    title: "Iowa security deposit checklist for landlords",
    description: "Move-in through move-out · Iowa Code 562A.12. Not legal advice.",
    category: "landlord",
    states: ["IA"],
    statutes: ["Iowa Code 562A.12"],
    body: () => checklistBody({ stateName: "Iowa", cite: "Iowa Code 562A.12", days: "30", app: "IA" }),
  },
  {
    slug: "missouri-deposit-itemization",
    title: "Missouri deposit itemization after move-out",
    description: "Withhold lines and mailing habits · RSMo 535.300 · 30 days. Not legal advice.",
    category: "law",
    states: ["MO"],
    statutes: ["RSMo 535.300"],
    body: () =>
      itemizationBody({
        stateName: "Missouri",
        cite: "RSMo 535.300",
        days: "30",
        app: "MO",
        localNote:
          "<p class=\"field-hint\">St. Louis and Kansas City may add local rental rules · Deposit Desk uses statewide 30-day default only.</p>",
      }),
  },
  {
    slug: "missouri-renter-deposit-rights",
    title: "Missouri renter guide: security deposits",
    description: "30-day window, itemization, and move-in records · RSMo 535.300. Not legal advice.",
    category: "renter",
    states: ["MO"],
    statutes: ["RSMo 535.300"],
    body: () => renterBody({ stateName: "Missouri", cite: "RSMo 535.300", days: "30", app: "MO" }),
  },
  {
    slug: "missouri-security-deposit-checklist",
    title: "Missouri security deposit checklist",
    description: "Move-in through move-out for RSMo 535.300 discipline. Not legal advice.",
    category: "landlord",
    states: ["MO"],
    statutes: ["RSMo 535.300"],
    body: () => checklistBody({ stateName: "Missouri", cite: "RSMo 535.300", days: "30", app: "MO" }),
  },
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const slugs = new Set(manifest.posts.map((p) => p.slug));

for (const post of POSTS) {
  const html = articleShell({
    title: post.title,
    description: post.description,
    slug: post.slug,
    published: PUBLISHED,
    bodyHtml: post.body(),
  });
  writeFileSync(join(blogDir, `${post.slug}.html`), html);
  if (!slugs.has(post.slug)) {
    manifest.posts.push({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      states: post.states,
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: post.statutes,
    });
    slugs.add(post.slug);
    console.log("manifest+", post.slug);
  } else {
    console.log("html only", post.slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest total", manifest.posts.length);
