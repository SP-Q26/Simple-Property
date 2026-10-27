#!/usr/bin/env node
/**
 * OG link-preview art from deposit-rules (30/45 chips · all wizard states + DC).
 * Run before export-og-share-images.mjs · npm run sync:seo
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATE_PACKS, SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";
import { BRAND_TAGLINE, STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";

const ogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "og");
const brandPng = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "brand", "spt-logo-mark-256.png");
const LOGO_B64 = readFileSync(brandPng).toString("base64");
const COVERAGE_LABEL = `${STATE_ONLY_COUNT} states + DC`;

function chipMarkup(x, y, code) {
  const pack = STATE_PACKS[code];
  const is45 = pack.returnDays === 45;
  const fill = is45 ? "#f3ecd4" : "#e6ebe0";
  const stroke = is45 ? "#b8911f" : "#5a7a52";
  const ink = is45 ? "#7a6218" : "#4a6741";
  const w = 36;
  const h = 36;
  return `<g class="coverage-chip" data-code="${code}">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>
  <text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${ink}">${code}</text>
</g>`;
}

function chipGrid(startX, startY, cols, chipW, gap) {
  const step = chipW + gap;
  let out = "";
  SUPPORTED_STATES.forEach((code, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out += chipMarkup(startX + col * step, startY + row * step, code);
  });
  return out;
}

/** Artist door-notebook mark (import-brand-logo.mjs). */
function logoMarkBlock() {
  return `  <image href="data:image/png;base64,${LOGO_B64}" x="748" y="88" width="340" height="340" preserveAspectRatio="xMidYMid meet"/>`;
}

/** Highlight box with even padding (OG safe zone). */
function highlightPill(x, y, w, lines) {
  const padX = 28;
  const padTop = 22;
  const padBottom = 22;
  const lineSpecs = [
    { size: 22, weight: 700, fill: "#3d3429", lead: 30 },
    { size: 17, weight: 400, fill: "#6b5c4a", lead: 26 },
  ];
  const used = lines.slice(0, 2);
  const innerH = used.reduce((acc, _, i) => acc + (lineSpecs[i]?.lead || 26), 0);
  const h = padTop + innerH + padBottom;
  let baseline = y + padTop + lineSpecs[0].size;
  const lineEls = used
    .map((line, i) => {
      const s = lineSpecs[i] || lineSpecs[1];
      if (i > 0) baseline = y + padTop + lineSpecs[0].lead + s.size;
      const el = `<text x="${x + padX}" y="${baseline}" fill="${s.fill}" font-family="system-ui,sans-serif" font-size="${s.size}" font-weight="${s.weight}">${line}</text>`;
      return el;
    })
    .join("\n");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fffef8" stroke="#c9a227" stroke-width="2.5"/>
${lineEls}`;
}

function featuredMetroChips(y) {
  const chipH = 56;
  const metros = [
    { code: "IL", label: "Chicago", x: 72 },
    { code: "FL", label: "Tampa", x: 156 },
    { code: "GA", label: "Atlanta", x: 240 },
    { code: "DC", label: "DC", x: 324 },
    { code: "CA", label: "California", x: 408 },
  ];
  return metros
    .map(
      (m) =>
        `<g>
  <rect x="${m.x}" y="${y}" width="76" height="${chipH}" rx="8" fill="#e6ebe0" stroke="#5a7a52" stroke-width="1.6"/>
  <text x="${m.x + 38}" y="${y + 26}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#4a6741">${m.code}</text>
  <text x="${m.x + 38}" y="${y + 44}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#6b5c4a">${m.label}</text>
</g>`
    )
    .join("\n");
}

function defsBlock() {
  return `  <defs>
    <linearGradient id="share-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#faf7f0"/>
      <stop offset="1" stop-color="#e8eef4"/>
    </linearGradient>
    <linearGradient id="door-light" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fffef8"/>
      <stop offset="1" stop-color="#d4e4d0"/>
    </linearGradient>
  </defs>`;
}

function legend(x, y) {
  return `  <g font-family="system-ui,sans-serif" font-size="16" fill="#6b5c4a">
  <circle cx="${x}" cy="${y}" r="7" fill="#e6ebe0" stroke="#5a7a52" stroke-width="1.2"/>
  <text x="${x + 14}" y="${y + 5}">30-day</text>
  <circle cx="${x + 88}" cy="${y}" r="7" fill="#f3ecd4" stroke="#b8911f" stroke-width="1.2"/>
  <text x="${x + 102}" y="${y + 5}">45-day</text>
  <text x="${x + 188}" y="${y + 5}" fill="#3b5a78">Tap your state</text>
</g>`;
}

function shell({ ariaLabel, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${ariaLabel}">
${defsBlock()}
  <rect width="1200" height="630" fill="url(#share-bg)"/>
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="#f4f0e6" stroke="#d9d0c0" stroke-width="1.5"/>
${body}
  <text x="960" y="548" text-anchor="middle" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="18">simple-property.com</text>
</svg>
`;
}

const defaultBody = `  <text x="72" y="108" fill="#3d3429" font-family="Georgia, serif" font-size="38" font-weight="600">Simple Property Tools</text>
  <text x="72" y="148" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="24">${BRAND_TAGLINE}</text>
  <path d="M72 162h520" stroke="#c9a227" stroke-width="4" stroke-linecap="round"/>
  <text x="72" y="192" fill="#3b5a78" font-family="system-ui,sans-serif" font-size="21" font-weight="600">Deposit Desk · Founded in Chicago · ${COVERAGE_LABEL}</text>
${highlightPill(72, 212, 580, ["Paperwork ready.", "Lower cleanup cost if counsel gets involved."])}
${featuredMetroChips(326)}
  <text x="72" y="400" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="16">Surrender · deadline · itemize · preview free · mail-ready PDF</text>
  <text x="72" y="428" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="14">Not legal advice · documentation only</text>
${logoMarkBlock()}`;

const coverageBody = `  <text x="72" y="108" fill="#3d3429" font-family="Georgia, serif" font-size="40" font-weight="600">${COVERAGE_LABEL}</text>
  <text x="72" y="152" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="22">New metros: Tampa · Atlanta · Seattle · Vegas · DMV · more</text>
  <text x="72" y="178" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="18">Thank you to operators who sourced local regs</text>
  <text x="72" y="204" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="19">${BRAND_TAGLINE}</text>
  <text x="72" y="232" fill="#3b5a78" font-family="system-ui,sans-serif" font-size="20" font-weight="600">Deposit Desk · 32 states + DC · CA · CO · FL · HI · MN in wizard</text>
  <text x="72" y="258" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="16">Not legal advice · documentation only</text>
${legend(72, 278)}
${chipGrid(72, 302, 11, 36, 5)}
${logoMarkBlock()}`;

const cardBody = `  <text x="88" y="148" fill="#3d3429" font-family="Georgia, serif" font-size="46" font-weight="600">Simple Property Tools</text>
  <text x="88" y="198" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="24">Deposit Desk · ${COVERAGE_LABEL}</text>
  <path d="M88 218h400" stroke="#c9a227" stroke-width="3" stroke-linecap="round"/>
${legend(88, 248)}
${chipGrid(88, 274, 11, 36, 5)}`;

writeFileSync(
  join(ogDir, "spt-share-door.svg"),
  shell({
    ariaLabel: `Deposit Desk · paperwork ready · Founded in Chicago · ${COVERAGE_LABEL}`,
    body: defaultBody,
  })
);

writeFileSync(
  join(ogDir, "spt-share-coverage-expansion.svg"),
  shell({
    ariaLabel: `Deposit Desk new state coverage · ${COVERAGE_LABEL} · thank you`,
    body: coverageBody,
  })
);

writeFileSync(
  join(ogDir, "spt-card.svg"),
  shell({
    ariaLabel: `Simple Property Tools Deposit Desk · ${COVERAGE_LABEL}`,
    body: cardBody,
  })
);

console.log(`build-og-share-svg · ${SUPPORTED_STATES.length} chips · ${COVERAGE_LABEL}`);
