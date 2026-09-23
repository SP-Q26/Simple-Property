/**
 * Official codifier URLs for deposit-return statutes (wizard cites in deposit-rules.mjs).
 * Not legal advice · verify section on the host site before relying on it.
 */
import { SUPPORTED_STATES } from "./deposit-rules.mjs";

/** @type {Record<string, string>} */
export const STATUTE_URLS = {
  DC: "https://code.dccouncil.gov/us/dc/council/code/sections/42-3508.11",
  GA: "https://law.justia.com/codes/georgia/title-44/chapter-7/section-44-7-34/",
  IA: "https://www.legis.iowa.gov/docs/code/562A.12",
  IL: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2065&ChapterID=57",
  IN: "https://iga.in.gov/statutes/ic/2024/titles/32/ar/t.32/ch.31",
  LA: "https://www.legis.la.gov/Legis/Law.aspx?d=78289",
  MD: "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gpr&section=8-203",
  MI: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-610",
  MO: "https://revisor.mo.gov/main/OneSection.aspx?section=535.300",
  MS: "https://law.justia.com/codes/mississippi/title-89/chapter-8/section-89-8-21/",
  NC: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-52.html",
  ND: "https://www.ndleg.gov/assembly/current-session/ncc/ncc/47-16-07-1.htm",
  NH: "https://www.gencourt.state.n.us/rsa/html/LIV/540-A/540-A-7.htm",
  NJ: "https://lis.njleg.gov/statute/N.J.S.A_46%3A8-21.1",
  NV: "https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec242",
  OH: "https://codes.ohio.gov/ohio-revised-code/section-5321.16",
  UT: "https://le.utah.gov/xcode/Title57/Chapter17/57-17-3.html",
  VA: "https://law.lis.virginia.gov/vacodefull/title55.1/chapter12/section55.1-1226/",
  WA: "https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.280",
};

for (const code of SUPPORTED_STATES) {
  if (!STATUTE_URLS[code]) {
    throw new Error(`statute-urls.mjs missing URL for ${code}`);
  }
}

export function statuteUrlFor(code) {
  return STATUTE_URLS[code] || "";
}
