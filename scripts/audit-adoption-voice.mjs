#!/usr/bin/env node
/**
 * Operator adoption voice · persona-aligned copy gates.
 * Canon: docs/DEPOSIT_DESK_OPERATOR_VOICE.md
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { OPERATOR_TEAM_LINE } from "./lib/adoption-voice.mjs";
import { DEFAULT_PAIN_LEAD_HTML } from "./lib/adoption-voice.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("ADOPTION VOICE FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

const index = read("index.html");
const modules = read("modules.html");
const blogIndex = read("blog/index.html");
const voiceDoc = readFileSync(join(web, "..", "docs", "DEPOSIT_DESK_OPERATOR_VOICE.md"), "utf8");

need("voice doc persona", voiceDoc.includes("Mom-and-pop operator"));
need("voice doc psychology", voiceDoc.includes("Psychology"));
need("index team line", index.includes(OPERATOR_TEAM_LINE));
need("modules team or built for", modules.includes("run the doors") || modules.includes(OPERATOR_TEAM_LINE));
need("blog index hub CTA", blogIndex.includes("/hub"));
need("app og Open Deposit Desk", read("app.html").includes("Open Deposit Desk"));
need("modules social block", read("modules.html").includes("<!-- spt-social -->"));
need("blog goal copy module mentions Deposit Desk", /Deposit Desk/i.test(DEFAULT_PAIN_LEAD_HTML));

const SAAS_HYPE = [
  /\bsupercharge\b/i,
  /\bgame[- ]changer\b/i,
  /\bleverage your\b/i,
  /\bunlock the power\b/i,
];
const core = ["index.html", "pricing.html", "modules.html", "app.html", "hub.html", "launch-stack.html"];
for (const page of core) {
  const visible = read(page).replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const re of SAAS_HYPE) {
    need(`${page} no SaaS hype`, !re.test(visible));
  }
  need(`${page} no Pain: label`, !/>\s*Pain:\s*</i.test(visible));
  need(`${page} no Customer Portal`, !/customer portal/i.test(visible));
}

/** Sample 12 manifest slugs for blog hype scan */
const manifest = JSON.parse(read("data/blog-manifest.json"));
const sample = manifest.posts.slice(0, 12);
for (const post of sample) {
  const html = read(`blog/${post.slug}.html`).replace(/<script[\s\S]*?<\/script>/gi, "");
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
  need(`${post.slug} no supercharge`, !/\bsupercharge\b/i.test(main));
  need(`${post.slug} guide CTA`, main.includes("spt-guide-cta"));
}

console.log(fail ? `\nAdoption voice audit FAILED (${fail})` : "\nAdoption voice audit OK");
process.exit(fail ? 1 : 0);
