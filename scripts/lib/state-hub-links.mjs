import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES } from "../../web/lib/deposit-rules.mjs";

const manifestPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "web", "data", "blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function postsFor(code) {
  return manifest.posts.filter((p) => Array.isArray(p.states) && p.states.includes(code));
}

function pickSlug(code, pred) {
  const hit = postsFor(code).find(pred);
  return hit?.slug;
}

/** @returns {Record<string, { deadline?: string, itemization?: string, checklist?: string, pain?: string }>} */
export function stateHubMap() {
  /** @type {Record<string, { deadline?: string, itemization?: string, checklist?: string, pain?: string }>} */
  const map = {};
  for (const code of SUPPORTED_STATES) {
    const posts = postsFor(code);
    map[code] = {
      deadline: posts.find((p) => /deadline|day-deposit|45-day|30-day/i.test(p.slug))?.slug,
      itemization: posts.find((p) => p.slug.includes("itemization"))?.slug,
      checklist: posts.find((p) => p.slug.includes("checklist"))?.slug,
      pain: posts.find((p) => p.intent === "pain" || p.category === "pain")?.slug,
    };
  }
  return map;
}

export function hubFooterHtml(code, label) {
  const hub = stateHubMap()[code];
  if (!hub) return "";
  const links = [];
  if (hub.deadline) links.push(`<a href="/blog/${hub.deadline}">${label} deposit deadline</a>`);
  if (hub.itemization) links.push(`<a href="/blog/${hub.itemization}">Itemization</a>`);
  if (hub.checklist) links.push(`<a href="/blog/${hub.checklist}">Checklist</a>`);
  if (hub.pain) links.push(`<a href="/blog/${hub.pain}">Operator pain guide</a>`);
  links.push(`<a href="/app?state=${code}">Deposit Desk · ${code}</a>`);
  links.push(`<a href="/blog#locale-${code}">All ${label} guides</a>`);
  if (links.length < 3) return "";
  return `<nav class="state-hub-links" aria-label="${label} deposit guides">
        <p class="section-label">More in ${label}</p>
        <p class="state-hub-links__row">${links.join(" · ")}</p>
      </nav>`;
}
