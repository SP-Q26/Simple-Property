import { STATE_PACKS } from "../../web/lib/deposit-rules.mjs";
import { STATUTE_URLS } from "../../web/lib/statute-urls.mjs";

export function citeLinkHtml(cite, appCode) {
  const code = appCode?.toUpperCase?.();
  const url = code ? STATUTE_URLS[code] : "";
  if (!url || !cite) return cite;
  if (cite.includes("<a ")) return cite;
  return `<a href="${url}" rel="noopener noreferrer" target="_blank">${cite}</a>`;
}

/** Replace plain cite in common fact-strip patterns when not already linked. */
export function linkifyCiteInHtml(html, code) {
  const pack = STATE_PACKS[code];
  if (!pack?.cite) return html;
  const cite = pack.cite;
  const linked = citeLinkHtml(cite, code);
  if (linked === cite) return html;
  if (html.includes(linked)) return html;
  const patterns = [
    `<dd>${cite}</dd>`,
    `<dd>${cite} ·`,
    `<p class="field-hint">${cite}</p>`,
    `(${cite})`,
    ` · ${cite}`,
  ];
  let next = html;
  for (const pat of patterns) {
    if (!next.includes(pat)) continue;
    next = next.split(pat).join(pat.replace(cite, linked));
  }
  if (next.includes(`>${cite}<`) && !next.includes(linked)) {
    next = next.split(`>${cite}<`).join(`>${linked}<`);
  }
  return next;
}
