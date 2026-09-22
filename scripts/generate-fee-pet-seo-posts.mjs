#!/usr/bin/env node
/**
 * Move-in/move-out fees · pets · application fees vs deposit (Midwest operators).
 * Run: node scripts/generate-fee-pet-seo-posts.mjs && npm run build-blog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-09-22";

const POSTS = [
  {
    slug: "move-in-move-out-fees-midwest-landlords",
    title: "Move-in and move-out fees vs the security deposit (Midwest)",
    description:
      "Cleaning fees, admin charges, and pass-through documentation costs. Keep them separate from the deposit ledger. IL · IN · OH · MI · IA · MO. Not legal advice.",
    category: "landlord",
    intent: "fees",
    states: ["IL", "IN", "OH", "MI", "IA", "MO"],
    body: `
      <p class="hero-eyebrow">Fees · turnover</p>
      <h1>Move-in and move-out fees are not the deposit</h1>
      <p>Searchers often mix three different buckets. Mixing them on one spreadsheet row is how disputes start.</p>
      <dl class="fact-strip">
        <div><dt>Security deposit</dt><dd>Held for damages and lawful withholds · return or itemize on the statute clock</dd></div>
        <div><dt>Move-in / move-out fee</dt><dd>Non-refundable service or admin charge if disclosed in the lease · not a substitute for itemization</dd></div>
        <div><dt>Documentation fee</dt><dd>Some operators pass through packet cost like screening · counsel on disclosure first</dd></div>
      </dl>
      <h2>Operator habits that reduce pain</h2>
      <ul>
        <li>Label ledger lines so tenants see which charge is which.</li>
        <li>Run deposit math only in Deposit Desk step 4 · fees live in lease or welcome letter copy.</li>
        <li>Chicago and other cities may cap or regulate certain fees · confirm locally.</li>
      </ul>
      <p>Related: <a href="/blog/pass-through-deposit-documentation-fee-illinois">pass-through documentation fee</a> · <a href="/blog/one-line-cleaning-fee-deposit-illinois">one-line cleaning on deposit return</a>.</p>
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app">Start packet</a> · <a href="/pricing">Pricing</a></p>`,
  },
  {
    slug: "pet-deposits-security-deposit-midwest",
    title: "Pet deposits, pet rent, and security deposit withholds",
    description:
      "Separate pet charges from damage deductions at move-out. Midwest small landlords. Not legal advice.",
    category: "landlord",
    intent: "fees",
    states: ["IL", "IN", "OH", "MI", "IA", "MO"],
    body: `
      <p class="hero-eyebrow">Pets · move-out</p>
      <h1>Pet money and the deposit fight</h1>
      <p>Tenants search when a pet deposit did not come back or when carpet damage gets blamed on the dog.</p>
      <h2>Keep categories separate</h2>
      <ul>
        <li><strong>Pet deposit or pet fee</strong> if the lease allows it · track balance apart from general deposit.</li>
        <li><strong>Damage withholds</strong> at move-out still need line items and proof · see <a href="/blog/normal-wear-vs-damage-illinois">wear vs damage</a> (Illinois example).</li>
        <li>Photos at move-in that show pre-existing carpet wear save you on the next dispute.</li>
      </ul>
      <p>Some cities limit pet rent or deposits · Evanston and Chicago operators should confirm with counsel.</p>
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app">Start packet</a> · <a href="/blog#guides-cities">City guides</a></p>`,
  },
  {
    slug: "application-fees-vs-security-deposit-midwest",
    title: "Application fees vs security deposits (Midwest renters and landlords)",
    description:
      "Screening charges before lease signing are not move-out deposit returns. Plain-language split for IL · IN · OH · MI · IA · MO. Not legal advice.",
    category: "renter",
    intent: "fees",
    states: ["IL", "IN", "OH", "MI", "IA", "MO"],
    body: `
      <p class="hero-eyebrow">Renters · fees</p>
      <h1>Application fee is not your security deposit</h1>
      <p>Renters search this when move-out arrives and they expect the screening fee back. Landlords search when they want to pass through costs fairly.</p>
      <ul>
        <li><strong>Application / screening fee</strong> · usually before move-in · governed by lease and state consumer rules · not returned like a deposit.</li>
        <li><strong>Security deposit</strong> · held during tenancy · return or itemized statement after surrender on the state clock.</li>
      </ul>
      <p>Operators: document move-in condition so the deposit conversation is about the unit, not the application from two years ago.</p>
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app">Deposit Desk</a> · <a href="/blog/illinois-renter-deposit-rights">Illinois renter deposit guide</a></p>`,
  },
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
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
      statutes: [],
    });
    slugs.add(post.slug);
  }
  console.log("wrote", post.slug);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
