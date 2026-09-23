#!/usr/bin/env node
/** Simple Property web · proud-ship audit (exit 1 on P0 fail) */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(path, label) {
  const p = join(web, path);
  if (!existsSync(p)) {
    console.error("MISSING", label, path);
    fail++;
    return "";
  }
  return readFileSync(p, "utf8");
}

const checks = [
  ["sitemap.xml", "SEO sitemap"],
  ["site.webmanifest", "PWA manifest"],
  ["spt-ai-bus.json", "AI agent bus"],
  ["launch-stack.html", "Launch stack page"],
  [".well-known/spt-gospel.json", "Agent gospel"],
  ["api/entitlement.js", "Stripe entitlement verify"],
  ["api/stripe/portal.js", "Stripe billing portal"],
  ["api/auth/magic-link.js", "Magic link restore"],
  ["api/reminders/subscribe.js", "Deadline email subscribe"],
  ["api/packet/email-tenant.js", "Tenant packet email (Pro)"],
  ["lib/operator-logs.mjs", "Operator log storage"],
  ["logs.html", "Operator logs page"],
  ["logs.js", "Maintenance · tickets · inspections UI"],
  ["lib/packet-email.mjs", "Tenant email body builder"],
  ["lib/entitlement-verify.mjs", "Pro entitlement verify"],
  ["api/cron/deadline-reminders.js", "Deadline reminder cron"],
  ["lib/kv-client.mjs", "KV client"],
  ["lib/subscription-store.mjs", "Subscription KV store"],
  ["lib/entitlement.mjs", "Entitlement signing"],
  ["lib/google-tools.mjs", "Google Calendar + Sheets export"],
  ["sp-billing.js", "Billing portal UI"],
  ["og/spt-card.svg", "OG card"],
  ["og/spt-share-door.svg", "OG share door art"],
  ["og/spt-share-door.png", "OG share door PNG (link previews)"],
  ["favicon.svg", "Product mark"],
  ["feedback.html", "Ruleset feedback page"],
  ["sp-feedback.js", "Feedback form client"],
  ["api/feedback.js", "Feedback API"],
];

for (const [path, label] of checks) need(path, label);

const nav = need("sp-nav.js", "locale bar nav");
if (nav && !nav.includes("locale-bar")) {
  console.error("FAIL sp-nav.js must inject locale bar");
  fail++;
}
const app = need("app.js", "app");
if (app && !app.includes("renderStep4") && !app.includes("deduction")) {
  console.error("FAIL app.js missing move-out itemization");
  fail++;
}
if (app && !app.includes("btn-email-tenant")) {
  console.error("FAIL app.js missing tenant email send");
  fail++;
}
if (app && !app.includes("prop-state")) {
  console.error("FAIL app.js missing state selector");
  fail++;
}

const success = need("success.html", "success");
if (success && !success.includes("sptRefreshEntitlement") && !success.includes("/api/entitlement")) {
  console.error("FAIL success.html must verify via /api/entitlement");
  fail++;
}

const privacy = need("privacy.html", "privacy");
if (privacy && privacy.split("\n").length < 20) {
  console.warn("WARN privacy.html still thin — expand before prod");
}

const robots = need("robots.txt", "robots");
const sitemap = need("sitemap.xml", "sitemap");
if (robots && sitemap && !existsSync(join(web, "sitemap.xml"))) {
  console.error("FAIL robots points to missing sitemap");
  fail++;
}

if (existsSync(join(web, "node_modules"))) {
  console.warn("WARN node_modules present — ensure .gitignore excludes it");
}

console.log(fail ? `Audit FAILED (${fail} P0)` : "Audit OK · proud-ship P0 gates pass");
if (!fail) {
  for (const script of ["audit-brand-shell.mjs", "audit-vercel-tracking.mjs", "audit-google-tools.mjs", "audit-blog-seo.mjs", "audit-discovery-seo.mjs", "audit-em-dash.mjs", "audit-visual-brand.mjs", "audit-mobile-responsive.mjs", "audit-pricing.mjs", "audit-swarm.mjs", "audit-links.mjs", "audit-customer-lane.mjs", "audit-legal-pages.mjs", "audit-svg-assets.mjs", "audit-branding-copy.mjs", "audit-social-share.mjs"]) {
    const r = spawnSync(process.execPath, [join(root, "scripts", script)], { stdio: "inherit" });
    if (r.status !== 0) process.exit(1);
  }
}
process.exit(fail ? 1 : 0);
