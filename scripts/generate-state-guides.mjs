#!/usr/bin/env node
/** Write localized state deposit deadline guides (run once or when adding states). */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");

const guides = [
  {
    slug: "indiana-45-day-deposit-deadline",
    title: "Indiana 45-day security deposit return",
    description: "Indiana landlords: typical 45-day return window after tenancy ends · IC 32-31-3-12. Not legal advice.",
    published: "2026-09-21",
    days: "45",
    cite: "IC 32-31-3-12 et seq.",
    state: "Indiana",
    app: "IN",
  },
  {
    slug: "ohio-30-day-deposit-deadline",
    title: "Ohio 30-day security deposit return",
    description: "Ohio return and itemization habits · ORC 5321.16. Not legal advice.",
    published: "2026-09-21",
    days: "30",
    cite: "ORC 5321.16",
    state: "Ohio",
    app: "OH",
  },
  {
    slug: "michigan-30-day-deposit-deadline",
    title: "Michigan 30-day security deposit return",
    description: "Michigan move-out statement timing · MCL 554.610. Not legal advice.",
    published: "2026-09-21",
    days: "30",
    cite: "MCL 554.610",
    state: "Michigan",
    app: "MI",
  },
  {
    slug: "iowa-30-day-deposit-deadline",
    title: "Iowa 30-day security deposit return",
    description: "Iowa deposit return after rental ends · Iowa Code 562A.12. Not legal advice.",
    published: "2026-09-21",
    days: "30",
    cite: "Iowa Code 562A.12",
    state: "Iowa",
    app: "IA",
  },
  {
    slug: "missouri-30-day-deposit-deadline",
    title: "Missouri 30-day security deposit return",
    description: "Missouri withholding and return timing · RSMo 535.300. Not legal advice.",
    published: "2026-09-21",
    days: "30",
    cite: "RSMo 535.300",
    state: "Missouri",
    app: "MO",
  },
];

for (const g of guides) {
  const bodyHtml = `
      <p class="hero-eyebrow">${g.state} · deposit desk</p>
      <h1>${g.title}</h1>
      <dl class="fact-strip">
        <div><dt>${g.state}</dt><dd><strong>${g.days} days</strong> (typical statutory default in Deposit Desk)</dd></div>
        <div><dt>Citation</dt><dd>${g.cite}</dd></div>
        <div><dt>Start</dt><dd>Surrender · keys returned and unit vacated (confirm locally)</dd></div>
      </dl>
      <p>Deposit Desk counts from the <strong>surrender date</strong> you enter in the wizard, then adds ${g.days} calendar days for ${g.state}. Local ordinances and lease terms can change your facts · verify with counsel.</p>
      <h2>What to document</h2>
      <ul>
        <li>Move-in condition notes and dated photos before turnover disputes.</li>
        <li>Written itemization when you withhold any portion of the deposit.</li>
        <li>Proof of mailing or delivery if you return balance by mail.</li>
      </ul>
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=${g.app}">Start ${g.state} packet</a> · <a href="/blog#locale-${g.app}">More ${g.state} guides</a></p>`;
  const html = articleShell({
    title: g.title,
    description: g.description,
    slug: g.slug,
    published: g.published,
    bodyHtml,
  });
  writeFileSync(join(web, `${g.slug}.html`), html);
  console.log("wrote", g.slug);
}
