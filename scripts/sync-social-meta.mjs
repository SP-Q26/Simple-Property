#!/usr/bin/env node
/**
 * Inject canonical Open Graph + Twitter meta on marketing / drop pages and blog articles.
 * Run after copy changes: npm run sync:seo
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSocialMetaBlock,
  stripSocialMeta,
  injectSocialMetaAfterDescription,
  SITE,
} from "./lib/social-share.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const blogDir = join(web, "blog");

/** @type {Array<{ file: string; path: string; ogTitle: string; ogDescription: string; robots?: string; ogType?: string }>} */
const DROP_PAGES = [
  {
    file: "index.html",
    path: "/",
    ogTitle: "Avoid deposit penalties · dated records · Deposit Desk",
    ogDescription:
      "18 states + DC · deposit return clocks, itemization, print-ready packets. Free draft · per turn · Pro. Not legal advice.",
  },
  {
    file: "app.html",
    path: "/app",
    robots: "noindex,nofollow",
    ogTitle: "Start free deposit packet · Deposit Desk",
    ogDescription:
      "Five steps · statutory clock on screen · print-ready packet. 18 states + DC · free wizard · unlock per turn or Pro. Not legal advice.",
  },
  {
    file: "pricing.html",
    path: "/pricing",
    ogTitle: "Deposit Desk pricing · cheaper than one cleaning fee",
    ogDescription:
      "Free draft · $29/$49 per turn · Pro $22/mo or $99/yr · print packet · up to 40 units · 18 states + DC. Not legal advice.",
  },
  {
    file: "launch-stack.html",
    path: "/launch-stack",
    ogTitle: "Launch stack · landlord tools by door count",
    ogDescription:
      "What to deploy at 1–10, 10–20, and 20–40 doors: deposit compliance first. Midwest mom-and-pop. Not legal advice.",
  },
  {
    file: "feedback.html",
    path: "/feedback",
    ogTitle: "Suggest rulesets · Deposit Desk feedback",
    ogDescription:
      "New state rulesets, wizard fields, guides, or fixes. Midwest deposit documentation · not legal advice.",
  },
  {
    file: "logs.html",
    path: "/logs",
    robots: "noindex,nofollow",
    ogTitle: "Operator logs · Deposit Desk",
    ogDescription: "Maintenance and operator notes for Simple Property Tools · Deposit Desk.",
  },
  {
    file: "success.html",
    path: "/success",
    robots: "noindex,nofollow",
    ogTitle: "Payment confirmed · Deposit Desk Pro",
    ogDescription: "Thank you · manage billing anytime · print unlocked on your deposit packets.",
  },
  {
    file: "legal.html",
    path: "/legal",
    ogTitle: "Legal hub · Simple Property Tools",
    ogDescription: "Terms, privacy, and trust links for Deposit Desk · not legal advice.",
  },
  {
    file: "privacy.html",
    path: "/privacy",
    ogTitle: "Privacy Policy · Simple Property Tools",
    ogDescription: "How Deposit Desk handles data on simple-property.com.",
  },
  {
    file: "terms.html",
    path: "/terms",
    ogTitle: "Terms of Service · Simple Property Tools",
    ogDescription: "Deposit Desk terms · Midwest deposit documentation · not legal advice.",
  },
  {
    file: "blog/index.html",
    path: "/blog",
    ogTitle: "Deposit guides · 18 states + DC",
    ogDescription:
      "City guides, missed deadlines, disputes, fees, and state law for small landlords. Not legal advice.",
  },
];

function applyPage({ file, path, ogTitle, ogDescription, robots, ogType }) {
  const fullPath = join(web, file);
  let html = readFileSync(fullPath, "utf8");
  if (!html.includes('name="description"') && ogDescription) {
    html = html.replace(
      /<title>([^<]+)<\/title>/,
      `<title>$1</title>\n  <meta name="description" content="${ogDescription.replace(/"/g, "&quot;")}">`
    );
  }
  html = stripSocialMeta(html);
  html = html.replace(/\n?\s*<meta name="robots" content="[^"]*">\n?/g, "\n");
  const block = buildSocialMetaBlock({
    canonicalPath: path,
    ogTitle,
    ogDescription,
    robots,
    ogType,
  });
  html = injectSocialMetaAfterDescription(html, block);
  if (file === "app.html" && !html.includes('"@type": "WebApplication"')) {
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Deposit Desk",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${SITE}/app`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free draft wizard" },
    };
    html = html.replace(
      "</head>",
      `  <script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`
    );
  }
  writeFileSync(fullPath, html);
  console.log("social", file);
}

for (const page of DROP_PAGES) {
  applyPage(page);
}

for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const fullPath = join(blogDir, file);
  let html = readFileSync(fullPath, "utf8");
  const slug = file.replace(".html", "");
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/ · Simple Property Tools$/, "").trim() : slug;
  const descMatch = html.match(/name="description" content="([^"]+)"/);
  const desc = descMatch ? descMatch[1] : title;
  html = stripSocialMeta(html);
  const block = buildSocialMetaBlock({
    canonicalPath: `/blog/${slug}`,
    ogTitle: title,
    ogDescription: desc,
    ogType: "article",
  });
  html = injectSocialMetaAfterDescription(html, block);
  writeFileSync(fullPath, html);
  console.log("social blog", file);
}

console.log("sync-social-meta OK");
