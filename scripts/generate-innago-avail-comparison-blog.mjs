#!/usr/bin/env node
/**
 * Phase 4 compare post · Deposit Desk vs Innago/Avail at turnover.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { guideCtaHtml, defaultPainLeadHtml } from "./lib/blog-goal-copy.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const slug = "deposit-desk-vs-innago-avail-turnover";
const title = "Deposit Desk vs Innago and Avail at turnover";
const description =
  "Rent tools run the lease month · Deposit Desk runs surrender week · itemization, clock, and mail-ready packet. Not legal advice.";

const body = `
<p class="hero-eyebrow">Operators · stack handoff</p>
      <h1>Innago and Avail vs Deposit Desk at turnover</h1>
      ${defaultPainLeadHtml()}
<p>Innago and Avail are strong for rent collection, leases, and tenant messaging. They are not built around <strong>surrender week</strong>: statutory clocks, line-item withholds, and a mail-ready deposit packet when keys come back.</p>
      <p class="field-hint">We complement those stacks · we do not replace rent month · see <a href="/launch-stack">launch stack</a>.</p>

      <h2>What rent tools do well</h2>
      <ul class="bullet-tight">
        <li>Collect rent and track ledger lines</li>
        <li>Lease templates and tenant portal habits</li>
        <li>Screening and onboarding at move-in</li>
      </ul>

      <h2>Where turnover gaps show up</h2>
      <ul class="bullet-tight">
        <li><strong>Surrender date</strong> that starts the clock · not lease end alone · <a href="/blog/surrender-date-illinois-deposit">surrender guide</a></li>
        <li><strong>Line-item withholds</strong> with move-in proof attached · <a href="/blog/deposit-desk-vs-spreadsheet">vs spreadsheet</a></li>
        <li>One <strong>print-ready packet</strong> for tenant mail and counsel · <a href="/blog/deposit-desk-vs-leaserooster-deposits">vs LeaseRooster</a></li>
      </ul>

      <h2>What Deposit Desk adds beside Innago or Avail</h2>
      <ul class="bullet-tight">
        <li>Five-step wizard · deadline math from surrender · Chicago RLTO toggle</li>
        <li>Watermarked preview free · unlock mail-ready PDF per turn or Pro</li>
        <li>Packet <code>.json</code> export for handoff · <a href="/blog/modules-google-calendar-sheets-handoff">Calendar and Sheets</a></li>
        <li><a href="/hub?ref=guide">Condition hub</a> walkthrough proof pairs with move-out itemization (alpha)</li>
      </ul>

      <h2>When to stay in your rent tool only</h2>
      <p>If you only need a ledger line and one cleaning fee with no dispute risk, your rent stack may be enough. When a tenant pushes back or counsel asks for dates and photos, a dedicated deposit packet usually pays for itself · see <a href="/pricing">pricing</a>.</p>

      ${guideCtaHtml()}
`;

const template = readFileSync(join(web, "blog/deposit-desk-vs-leaserooster-deposits.html"), "utf8");
let html = template
  .replace(/deposit-desk-vs-leaserooster-deposits/g, slug)
  .replace(/Deposit Desk vs LeaseRooster on deposits/g, title)
  .replace(
    /Both focus on deposit lifecycle; compare IL depth, pricing, and packet export\. Not legal advice\./g,
    description
  )
  .replace(/<main id="main" class="prose">[\s\S]*?<\/main>/, `<main id="main" class="prose">\n${body}\n    </main>`);

writeFileSync(join(web, "blog", `${slug}.html`), html);

const manifestPath = join(web, "data/blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!manifest.posts.some((p) => p.slug === slug)) {
  manifest.posts.push({
    slug,
    title,
    description,
    category: "route",
    intent: "route",
    routeSeries: "deposit-desk",
    states: [],
    published: "2026-10-15",
    updated: "2026-10-15",
    statutes: [],
  });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log("Wrote", slug);
