/**
 * Official codifier URLs for deposit-return statutes (wizard cites in deposit-rules.mjs).
 * Not legal advice · verify section on the host site before relying on it.
 */
import { SUPPORTED_STATES } from "./deposit-rules.mjs";

/** @type {Record<string, string>} */
export const STATUTE_URLS = {
  AR: "https://www.arkleg.state.ar.us/ArkansasCode/Sections/DisplaySection?code=18-16-305",
  CA: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5",
  CO: "https://law.justia.com/codes/colorado/title-38/article-12/section-38-12-103/",
  CT: "https://www.cga.ct.gov/current/pub/chap_831.htm#sec_47a-21",
  DC: "https://code.dccouncil.gov/us/dc/council/code/sections/42-3502.17",
  DE: "https://delcode.delaware.gov/title25/c055/#5514",
  FL: "https://www.flsenate.gov/Laws/Statutes/2024/083.49",
  GA: "https://law.justia.com/codes/georgia/title-44/chapter-7/section-44-7-34/",
  HI: "https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0038.htm",
  IA: "https://www.legis.iowa.gov/law/iowaCode/sections?codeChapter=562A&codeSection=562A.12",
  IL: "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2065&ChapterID=57",
  IN: "https://iga.in.gov/statutes/ic/2024/titles/32/ar/t.32/ch.31",
  KY: "https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35733",
  LA: "https://www.legis.la.gov/Legis/Law.aspx?d=78289",
  MD: "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gpr&section=8-203",
  MI: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-610",
  MN: "https://www.revisor.mn.gov/statutes/cite/504B.178",
  MO: "https://revisor.mo.gov/main/OneSection.aspx?section=535.300",
  MS: "https://law.justia.com/codes/mississippi/title-89/chapter-8/section-89-8-21/",
  NC: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-52.html",
  ND: "https://www.ndleg.gov/assembly/current-session/ncc/ncc/47-16-07-1.htm",
  NE: "https://nebraskalegislature.gov/laws/statutes.php?statute=76-1416",
  NH: "https://www.gencourt.state.n.us/rsa/html/LIV/540-A/540-A-7.htm",
  NJ: "https://lis.njleg.gov/statute/N.J.S.A_46%3A8-21.1",
  NV: "https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec242",
  RI: "https://webserver.rilegislature.gov/Statutes/title34/34-18/34-18-19.htm",
  OH: "https://codes.ohio.gov/ohio-revised-code/section-5321.16",
  SD: "https://sdlegislature.gov/statutes/DisplayStatute/?Type=Statute&Statute=43-32-24",
  UT: "https://le.utah.gov/xcode/Title57/Chapter17/57-17-3.html",
  VA: "https://law.lis.virginia.gov/vacodefull/title55.1/chapter12/section55.1-1226/",
  VT: "https://legislature.vermont.gov/statutes/section/09/137/04461",
  WA: "https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.280",
  WV: "https://code.wvlegislature.gov/37-6A-2/",
};

/** Chicago RLTO · deposit return overlay (city law · not ILGA). */
export const CHICAGO_RLTO_URL =
  "https://www.chicago.gov/city/en/depts/doh/provdrs/landlords/svcs/residential-landlord-and-tenant-ordinance.html";

for (const code of SUPPORTED_STATES) {
  if (!STATUTE_URLS[code]) {
    throw new Error(`statute-urls.mjs missing URL for ${code}`);
  }
}

export function statuteUrlFor(code) {
  return STATUTE_URLS[code] || "";
}
