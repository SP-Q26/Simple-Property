#!/usr/bin/env node
/**
 * Statute authority series · 5 guides → /legal/deposit-statutes + /app?state=
 * Run: node scripts/generate-route-series-statutes-oct-2026.mjs && npm run apply:blog-goal-copy && npm run build-blog
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-10-23";

function section(title, paras) {
  const ps = paras.map((p) => `<p>${p}</p>`).join("\n      ");
  return `<h2>${title}</h2>\n      ${ps}`;
}

function post({ slug, title, description, states, bodySections }) {
  const lead = `<p class="pain-solution-lead"><span class="ps-problem">${bodySections.problem}</span> <span class="ps-fix">${bodySections.fix}</span></p>`;
  const sections = bodySections.sections.map((s) => section(s.h, s.p)).join("\n      ");
  const body = `${lead}\n      <h1>${title}</h1>\n      ${sections}`;
  return { slug, title, description, routeSeries: "deposit-statutes", states, body };
}

const POSTS = [
  post({
    slug: "deposit-statute-index-how-to-use",
    title: "How to use the deposit statute index",
    description:
      "Official outbound links per wizard state · surrender clocks · not legal advice.",
    states: [],
    bodySections: {
      problem: "Operators google random blog posts instead of the statute text.",
      fix: "Start from <a href=\"/legal/deposit-statutes\">deposit statutes</a> · open your state · jump into <a href=\"/app\">Deposit Desk</a>.",
      sections: [
        {
          h: "What the index covers",
          p: [
            "32 states plus DC with default return windows in the wizard.",
            "Chicago RLTO toggle on Illinois when the building fits.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "surrender-date-statute-clock-starts",
    title: "When the deposit return clock starts by statute",
    description: "Surrender vs lease end · keys · vacancy · documentation habits. Not legal advice.",
    states: [],
    bodySections: {
      problem: "Using lease end on paper alone misses the statutory trigger.",
      fix: "Record surrender in step 1 · deadline math follows in the wizard.",
      sections: [
        {
          h: "Practice",
          p: [
            "Note keys returned, unit vacant, and how you learned the forwarding address.",
            "Pair with move-in proof in <a href=\"/hub?ref=statute-guide\">Condition hub</a> when you have it.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "itemization-statute-requirements-overview",
    title: "Itemization requirements · statute overview",
    description: "Line items, amounts, and mail proof fields operators forget. Not legal advice.",
    states: [],
    bodySections: {
      problem: "Lump-sum withholds without line items invite disputes.",
      fix: "Use step 3 withhold lines · export matches what you mail.",
      sections: [
        {
          h: "Wizard discipline",
          p: [
            "Categories, descriptions, and amounts export to PDF and packet JSON.",
            "Counsel organizes faster when the packet is already line-itemed.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "multi-state-statute-packs-small-landlord",
    title: "Multi-state statute packs for small landlords",
    description: "One operator · several states · separate clocks per property. Not legal advice.",
    states: [],
    bodySections: {
      problem: "Spreadsheets mix states on one tab.",
      fix: "One packet per property · state selected on step 1.",
      sections: [
        {
          h: "Scale",
          p: [
            "Pro covers up to 40 units · per-turn unlock when you only need one export.",
            "See <a href=\"/pricing\">pricing</a> for turnover economics.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "statute-links-vs-legal-advice-deposit-desk",
    title: "Statute links are not legal advice",
    description: "How Deposit Desk uses outbound statute URLs · operator responsibility. Not legal advice.",
    states: [],
    bodySections: {
      problem: "Software cannot replace counsel on edge cases.",
      fix: "We link statutes · you confirm facts · export is documentation only.",
      sections: [
        {
          h: "Honest limits",
          p: [
            "Read <a href=\"/legal\">legal</a> · suggest rulesets via <a href=\"/feedback\">feedback</a>.",
            "Stack with Innago or Avail for rent · use Deposit Desk at turnover.",
          ],
        },
      ],
    },
  }),
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!manifest.categories.route) {
  manifest.categories.route = { label: "Product routes", audience: "SEO clusters" };
}

const slugs = new Set(manifest.posts.map((p) => p.slug));
let added = 0;

for (const p of POSTS) {
  writeFileSync(
    join(blogDir, `${p.slug}.html`),
    articleShell({
      title: p.title,
      description: p.description,
      slug: p.slug,
      published: PUBLISHED,
      bodyHtml: p.body,
      states: p.states,
      stateLabels: manifest.stateLabels,
    })
  );
  if (!slugs.has(p.slug)) {
    manifest.posts.push({
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: "route",
      intent: "route",
      routeSeries: p.routeSeries,
      states: p.states,
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: [],
    });
    slugs.add(p.slug);
    added++;
    console.log("+", p.slug);
  } else {
    const row = manifest.posts.find((x) => x.slug === p.slug);
    if (row) row.routeSeries = "deposit-statutes";
    console.log("exists", p.slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Statutes series: ${POSTS.length} · ${added} new · total ${manifest.posts.length}`);
