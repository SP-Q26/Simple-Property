#!/usr/bin/env node
/**
 * Major-city deposit guides · one per CITY_PRESETS entry with blogSlug (except Chicago, covered elsewhere).
 * Run: node scripts/generate-city-seo-posts.mjs && npm run build-blog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";
import { CITY_PRESETS } from "../web/lib/city-overlays.mjs";
import { STATE_PACKS } from "../web/lib/deposit-rules.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-09-22";

function cta(state, cityName) {
  return `<p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=${state}">Start ${cityName} packet</a> · <a href="/blog#guides-cities">All city guides</a></p>`;
}

function cityBody(preset) {
  const st = preset.state;
  const pack = STATE_PACKS[st];
  const days = preset.returnDays || pack.returnDays;
  const clockLine = preset.returnDays
    ? `<div><dt>Deposit clock in app</dt><dd><strong>${preset.returnDays} days</strong> after surrender · ${preset.jurisdiction || preset.label}</dd></div>`
    : `<div><dt>State default in app</dt><dd><strong>${pack.returnDays} days</strong> after surrender · ${pack.cite}</dd></div>`;

  const extra =
    preset.id === "evanston-il"
      ? `<p>Evanston operators often juggle local rental registration and habitability programs alongside the state deposit clock. Log surrender date and itemization in Deposit Desk even when other city deadlines run on separate calendars.</p>`
      : preset.id === "cleveland-oh"
        ? `<p>Cleveland landlords frequently track lead-safe and rental registration requirements that do not replace Ohio itemization rules but do add paperwork stress at turnover.</p>`
        : preset.id === "kansas-city-mo"
          ? `<p>Properties in Kansas City, Missouri use the Missouri wizard. Kansas-side addresses need Kansas counsel and are outside Deposit Desk today.</p>`
          : `<p>Turnover pain here is usually the same as the rest of ${pack.label}: wrong surrender date, weak move-in proof, and one-line withholds. The city dropdown in step 1 links your packet to this guide.</p>`;

  return `
      <p class="hero-eyebrow">${preset.cityName} · ${pack.label}</p>
      <h1>${preset.cityName} rental deposit documentation</h1>
      <p>Factual checklist for operators who need a calm packet when local rules get noisy. We do not replace counsel on city code.</p>
      <dl class="fact-strip">
        ${clockLine}
        <div><dt>Packet</dt><dd>Move-in rooms · move-out lines · print export in Deposit Desk</dd></div>
      </dl>
      ${extra}
      <h2>When city rules show up in search</h2>
      <ul>
        <li>Deposit <strong>return timing</strong> (state default unless Chicago RLTO or counsel says otherwise).</li>
        <li><strong>Move-in / move-out fees</strong> that are not part of the security deposit · see <a href="/blog/move-in-move-out-fees-midwest-landlords">fee guide</a>.</li>
        <li><strong>Pet deposits and pet rent</strong> · see <a href="/blog/pet-deposits-security-deposit-midwest">pet guide</a>.</li>
        <li>Registration or inspection programs that run on a different calendar than deposit return.</li>
      </ul>
      <p>Select <strong>${preset.cityName}</strong> in the major-city dropdown on step 1 so your deadline line matches this guide.</p>
      ${cta(st, preset.cityName)}`;
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!manifest.categories.city) {
  manifest.categories.city = {
    label: "Major cities",
    audience: "Local ordinances, RLTO, and turnover documentation",
  };
}

const slugs = new Set(manifest.posts.map((p) => p.slug));
const skipSlugs = new Set(["chicago-45-day-deposit-deadline"]);

for (const preset of CITY_PRESETS) {
  if (!preset.blogSlug || skipSlugs.has(preset.blogSlug)) continue;
  if (slugs.has(preset.blogSlug)) {
    const idx = manifest.posts.findIndex((p) => p.slug === preset.blogSlug);
    if (idx >= 0) {
      manifest.posts[idx].intent = "city";
      manifest.posts[idx].category = "city";
      manifest.posts[idx].cityPreset = preset.id;
      manifest.posts[idx].states = [preset.state];
    }
    continue;
  }

  const pack = STATE_PACKS[preset.state];
  const title = `${preset.cityName} deposit guide · ${pack.label} operators`;
  const description = `${preset.cityName} turnover: ${pack.returnDays}-day state default${preset.returnDays ? "" : ""}, local programs, and Deposit Desk packet habits. Not legal advice.`;

  writeFileSync(
    join(blogDir, `${preset.blogSlug}.html`),
    articleShell({
      title,
      description,
      slug: preset.blogSlug,
      published: PUBLISHED,
      bodyHtml: cityBody(preset),
    })
  );

  manifest.posts.push({
    slug: preset.blogSlug,
    title,
    description,
    category: "city",
    intent: "city",
    cityPreset: preset.id,
    states: [preset.state],
    published: PUBLISHED,
    updated: PUBLISHED,
    statutes: [pack.cite],
  });
  slugs.add(preset.blogSlug);
  console.log("wrote", preset.blogSlug);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest updated · city posts");
