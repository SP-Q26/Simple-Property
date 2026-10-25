#!/usr/bin/env node
/** Tag canonical compare cluster posts for route audit + hub filter. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "web/data/blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const COMPARE_SLUGS = [
  "deposit-desk-vs-spreadsheet",
  "deposit-desk-vs-inspection-apps",
  "deposit-desk-vs-innago-avail-turnover",
  "deposit-desk-vs-leaserooster-deposits",
  "deposit-desk-vs-deposit-software",
  "deposit-desk-vs-simplifyem-turnover",
  "deposit-desk-vs-turbotenant-tenantcloud-turnover",
];

const HOME_SLUGS = [
  "small-landlord-deposit-deadlines-beat-fees",
  "why-spreadsheets-fail-deposit-returns",
  "deposit-documentation-1-to-40-units",
  "chicago-rlto-vs-statewide-illinois-deposits",
  "competitor-pm-software-deposit-gaps",
];

const DEPOSIT_DESK_SLUGS = [
  "deposit-desk-five-step-wizard-overview",
  "deposit-desk-move-in-checklist-export",
  "deposit-desk-itemization-step-four",
  "deposit-desk-multistate-32-plus-dc",
  "deposit-desk-new-states-thanks-oct-2026",
];

let n = 0;
for (const post of manifest.posts) {
  if (!COMPARE_SLUGS.includes(post.slug)) continue;
  if (post.routeSeries !== "compare") {
    post.routeSeries = "compare";
    n++;
  }
}

if (!manifest.categories.compare) {
  manifest.categories.compare = {
    label: "Compare · turnover tools",
    audience: "Deposit Desk vs spreadsheet, PM apps, inspection apps, deposit software · FB objection handling",
  };
}

let h = 0;
for (const post of manifest.posts) {
  if (!HOME_SLUGS.includes(post.slug)) continue;
  if (post.routeSeries !== "home") {
    post.routeSeries = "home";
    h++;
  }
}

let d = 0;
for (const post of manifest.posts) {
  if (!DEPOSIT_DESK_SLUGS.includes(post.slug)) continue;
  if (post.routeSeries !== "deposit-desk") {
    post.routeSeries = "deposit-desk";
    d++;
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `compare ${COMPARE_SLUGS.length} · ${n} updated · home ${HOME_SLUGS.length} · ${h} fixed · deposit-desk ${d} fixed`,
);
