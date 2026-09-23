#!/usr/bin/env node
/** Build /legal/deposit-statutes.html from deposit-rules + statute-urls. */
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { STATUTE_URLS, CHICAGO_RLTO_URL } from "../web/lib/statute-urls.mjs";
import { BRAND_TAG, CSS_VERSION, FONT_GOOGLE } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
mkdirSync(join(web, "legal"), { recursive: true });
const atmosphereBlock = readFileSync(join(web, "brand/atmosphere.html"), "utf8").trimEnd();

const rows = SUPPORTED_STATES.map((code) => {
  const p = STATE_PACKS[code];
  const url = STATUTE_URLS[code];
  return `<tr>
          <td><strong>${code}</strong></td>
          <td>${p.label}</td>
          <td>${p.returnDays}-day default</td>
          <td><a href="${url}" rel="noopener noreferrer" target="_blank">${p.cite}</a></td>
          <td><a href="/app?state=${code}">Deposit Desk</a> · <a href="/blog#locale-${code}">Guides</a></td>
        </tr>`;
}).join("\n");

const chicagoRow = `<tr>
          <td>IL</td>
          <td>Chicago · RLTO overlay</td>
          <td>45-day default</td>
          <td><a href="${CHICAGO_RLTO_URL}" rel="noopener noreferrer" target="_blank">Chicago RLTO</a> · state <a href="${STATUTE_URLS.IL}" rel="noopener noreferrer" target="_blank">765 ILCS 715/</a></td>
          <td><a href="/blog/chicago-45-day-deposit-deadline">RLTO guide</a> · <a href="/app?state=IL">Desk (Chicago toggle)</a></td>
        </tr>`;

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Deposit return statutes index",
  description: "Security deposit return statute links for 18 states and DC",
  url: "https://simple-property.com/legal/deposit-statutes",
  isPartOf: { "@type": "WebSite", name: "Simple Property Tools", url: "https://simple-property.com" },
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Deposit return statutes · 18 states + DC · Simple Property Tools</title>
  <meta name="description" content="Official links to security deposit return statutes for every state in Deposit Desk. Wizard defaults from surrender. Not legal advice.">
  <link rel="canonical" href="https://simple-property.com/legal/deposit-statutes">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link href="${FONT_GOOGLE}" rel="stylesheet">
  <link rel="stylesheet" href="/simple-property.css?v=${CSS_VERSION}">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
${atmosphereBlock}
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <header class="site-header">
      <a class="brand-lockup" href="/">
        <img class="brand-mark" src="/favicon.svg" alt="" width="36" height="36">
        <span class="brand-text">
          <span class="brand-word">Simple Property Tools</span>
          <span class="brand-tag">${BRAND_TAG}</span>
        </span>
      </a>
      <nav class="header-nav" aria-label="Primary">
        <a href="/app">App</a><a href="/logs">Logs</a>
        <a href="/pricing">Pricing</a>
        <a href="/launch-stack">Stack</a>
        <a href="/blog">Guides</a>
      </nav>
    </header>
    <main id="main" class="prose-legal">
      <p class="section-label"><a href="/legal">Legal</a> · statutes</p>
      <h1>Deposit return statutes</h1>
      <p>Deposit Desk wizard defaults use <strong>30-</strong> or <strong>45-day</strong> return windows from <strong>surrender</strong> (keys back, unit vacant). Outbound links go to official or common codifier hosts · verify the section on the host site.</p>
      <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr><th>Code</th><th>Jurisdiction</th><th>Wizard default</th><th>Statute</th><th>Product</th></tr>
        </thead>
        <tbody>
${rows}
${chicagoRow}
        </tbody>
      </table>
      </div>
      <p class="disclaimer">Not legal advice. Local ordinances, lease terms, and program rules may change your deadline. Confirm with licensed counsel.</p>
    </main>
    <footer class="site-footer">
      <p class="footer-colophon">
        <img class="footer-mark" src="/favicon.svg" alt="" width="22" height="22">
        <span>Simple Property Tools · not legal advice</span>
      </p>
      <nav class="footer-links" aria-label="Footer">
        <a href="/app">App</a><a href="/pricing">Pricing</a><a href="/blog">Guides</a>
        <a href="/legal">Legal</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a>
      </nav>
    </footer>
  </div>
  <script src="/sp-nav.js" defer></script>
</body>
</html>
`;

writeFileSync(join(web, "legal/deposit-statutes.html"), html);
console.log("build-deposit-statutes-page · legal/deposit-statutes.html");
