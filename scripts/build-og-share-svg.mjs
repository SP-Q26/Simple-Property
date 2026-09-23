#!/usr/bin/env node
/**
 * OG link-preview art from deposit-rules (30/45 chips · 18 states + DC).
 * Run before export-og-share-images.mjs · npm run sync:seo
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATE_PACKS, SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";
import { STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";

const ogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "og");
const COVERAGE_LABEL = `${STATE_ONLY_COUNT} states + DC`;

function chipMarkup(x, y, code) {
  const pack = STATE_PACKS[code];
  const is45 = pack.returnDays === 45;
  const fill = is45 ? "#f3ecd4" : "#e6ebe0";
  const stroke = is45 ? "#b8911f" : "#5a7a52";
  const ink = is45 ? "#7a6218" : "#4a6741";
  const w = 40;
  const h = 40;
  return `<g class="coverage-chip" data-code="${code}">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>
  <text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${ink}">${code}</text>
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

function doorScene() {
  return `  <rect x="700" y="72" width="56" height="420" fill="#7a4038" fill-opacity="0.14" rx="3"/>
  <rect x="1044" y="72" width="56" height="420" fill="#7a4038" fill-opacity="0.14" rx="3"/>
  <rect x="756" y="104" width="288" height="360" rx="4" fill="#3d3429" fill-opacity="0.08"/>
  <rect x="768" y="116" width="120" height="336" rx="2" fill="url(#door-light)" stroke="#3d3429" stroke-width="2"/>
  <path d="M888 116 L888 452" stroke="#3d3429" stroke-width="2"/>
  <path d="M768 116 L888 184 L888 384 L768 452 Z" fill="#faf7f0" stroke="#3d3429" stroke-width="2" stroke-linejoin="round"/>
  <path d="M888 184 L1020 116 L1020 452 L888 384 Z" fill="#4a6741" fill-opacity="0.35" stroke="#3d3429" stroke-width="2"/>
  <text x="828" y="294" text-anchor="middle" fill="#3d3429" font-family="Georgia, serif" font-size="42" font-weight="600">SP</text>
  <circle cx="852" cy="324" r="5" fill="#c9a227" stroke="none"/>
  <path d="M888 116 L1020 116" stroke="#c9a227" stroke-width="3" stroke-linecap="round"/>`;
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

const defaultBody = `  <text x="72" y="118" fill="#3d3429" font-family="Georgia, serif" font-size="44" font-weight="600">Simple Property Tools</text>
  <text x="72" y="168" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="26">Itemize it. Date it. Keep the clock.</text>
  <path d="M72 188h440" stroke="#c9a227" stroke-width="4" stroke-linecap="round"/>
  <text x="72" y="228" fill="#3b5a78" font-family="system-ui,sans-serif" font-size="24" font-weight="600">Deposit Desk · ${COVERAGE_LABEL}</text>
  <text x="72" y="262" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="19">Founded in Chicago · deposit return clocks on screen</text>
${legend(72, 286)}
${chipGrid(72, 312, 10, 40, 6)}
${doorScene()}`;

const coverageBody = `  <text x="72" y="108" fill="#3d3429" font-family="Georgia, serif" font-size="40" font-weight="600">New state coverage</text>
  <text x="72" y="152" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="22">Thank you to clients and investors who sourced local regs</text>
  <text x="72" y="188" fill="#3b5a78" font-family="system-ui,sans-serif" font-size="21" font-weight="600">Deposit Desk · ${COVERAGE_LABEL} · iOS app incoming</text>
  <text x="72" y="218" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="17">Miami and Wisconsin on the roadmap · not legal advice</text>
${legend(72, 244)}
${chipGrid(72, 270, 10, 40, 6)}
${doorScene()}`;

const cardBody = `  <text x="88" y="148" fill="#3d3429" font-family="Georgia, serif" font-size="46" font-weight="600">Simple Property Tools</text>
  <text x="88" y="198" fill="#6b5c4a" font-family="system-ui,sans-serif" font-size="24">Deposit Desk · ${COVERAGE_LABEL}</text>
  <path d="M88 218h400" stroke="#c9a227" stroke-width="3" stroke-linecap="round"/>
${legend(88, 248)}
${chipGrid(88, 274, 8, 40, 6)}`;

writeFileSync(
  join(ogDir, "spt-share-door.svg"),
  shell({
    ariaLabel: `Simple Property Tools Deposit Desk · ${COVERAGE_LABEL} · coverage color bar`,
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
