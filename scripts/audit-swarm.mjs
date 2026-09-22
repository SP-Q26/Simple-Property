#!/usr/bin/env node
/**
 * Swarm audit · score /100 per lane · exit 1 if any metric < 95 after gate enabled.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const MIN = 95;

function read(rel) {
  const p = join(web, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

function blogPosts() {
  return readdirSync(join(web, "blog")).filter((f) => f.endsWith(".html") && f !== "index.html");
}

function scoreBrandShell() {
  let s = 100;
  const pages = ["index.html", "pricing.html", "app.html", ...blogPosts().map((f) => `blog/${f}`)];
  for (const p of pages) {
    const h = read(p);
    if (!h.includes("brand-mark")) s -= 8;
    if (!h.includes("simple-property.css?v=7")) s -= 5;
    if (!h.includes("Homestead")) s -= 5;
  }
  return Math.max(0, s);
}

function scoreVisual() {
  const css = read("simple-property.css");
  let s = 70;
  if (css.includes("product-proof")) s += 12;
  if (css.includes("--shadow-soft")) s += 5;
  if (css.includes("background-image: radial-gradient")) s += 5;
  if (read("index.html").includes("product-proof")) s += 10;
  return Math.min(100, s);
}

function scoreSeo() {
  let s = 60;
  if (read("robots.txt").includes("sitemap.xml")) s += 10;
  const sm = read("sitemap.xml");
  const posts = blogPosts();
  if (posts.every((f) => sm.includes(f.replace(".html", "")))) s += 10;
  for (const p of ["index.html", "pricing.html", "blog/index.html"]) {
    const h = read(p);
    if (h.includes('rel="canonical"')) s += 3;
    if (h.includes("og:image")) s += 3;
  }
  let art = 0;
  for (const f of posts) {
    if (read(`blog/${f}`).includes('"@type": "Article"')) art++;
  }
  s += Math.min(15, art * 3);
  return Math.min(100, s);
}

function scoreAgentLane() {
  let s = 50;
  if (read("llms.txt").includes("765 ILCS")) s += 15;
  if (existsSync(join(web, "spt-ai-bus.json"))) s += 15;
  if (existsSync(join(web, ".well-known/spt-gospel.json"))) s += 15;
  if (read("index.html").includes("spt-ai-bus.json")) s += 5;
  return Math.min(100, s);
}

function scoreProduct() {
  let s = 70;
  const app = read("app.js");
  if (app.includes("MAX_STEPS = 5") && app.includes("btn-remind")) s += 10;
  if (app.includes("buildDeadlineIcs")) s += 5;
  if (read("app.js").includes("saved_packets") || app.includes("PACKETS_KEY")) s += 5;
  if (read("success.html").includes("sptRefreshEntitlement")) s += 10;
  return Math.min(100, s);
}

function scoreBackend() {
  const apis = [
    "api/entitlement.js",
    "api/stripe/webhook.js",
    "api/stripe/portal.js",
    "api/auth/magic-link.js",
    "api/reminders/subscribe.js",
    "api/cron/deadline-reminders.js",
  ];
  let s = 100;
  for (const a of apis) if (!existsSync(join(web, a))) s -= 12;
  return Math.max(0, s);
}

function scoreLegal() {
  let s = 80;
  if (read("privacy.html").split("\n").length >= 35) s += 10;
  if (read("terms.html").split("\n").length >= 40) s += 10;
  return Math.min(100, s);
}

function scoreOps() {
  let s = 70;
  for (const script of ["audit-spt-web.mjs", "audit-brand-shell.mjs", "verify-stripe-catalog.mjs"]) {
    if (existsSync(join(root, "scripts", script))) s += 10;
  }
  return Math.min(100, s);
}

function scoreContentDepth() {
  const n = blogPosts().length;
  if (n >= 7) return 96;
  if (n >= 5) return 88;
  return 70;
}

const metrics = [
  ["Brand shell (mark · nav · v7)", scoreBrandShell],
  ["Visual system (tokens · proof)", scoreVisual],
  ["SEO (canonical · OG · Article)", scoreSeo],
  ["Agent lane (llms · bus · gospel)", scoreAgentLane],
  ["Product (wizard · Pro · reminders)", scoreProduct],
  ["Backend (Stripe · KV · email)", scoreBackend],
  ["Legal & trust", scoreLegal],
  ["Ops & audit gates", scoreOps],
  ["Content cluster depth", scoreContentDepth],
];

console.log("── Simple Property · swarm audit ──\n");
let fail = 0;
const rows = [];
for (const [name, fn] of metrics) {
  const score = fn();
  rows.push({ name, score });
  const ok = score >= MIN;
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${score.toString().padStart(3)}  ${name}`);
}
console.log(fail ? `\n${fail} metric(s) below ${MIN}` : `\nAll metrics ≥ ${MIN}`);
process.exit(fail ? 1 : 0);
