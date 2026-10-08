import { STATE_PACKS } from "../../web/lib/deposit-rules.mjs";
import { stateHubMap } from "./state-hub-links.mjs";

const MARKER_START = "<!-- spt-guide-warning -->";
const MARKER_END = "<!-- /spt-guide-warning -->";

/** Operator-story seeds per state (risk + because + canonical pain slug). */
export const STORY_BY_STATE = {
  DC: {
    painSlug: "dc-rhca-deposit-clock-rowhouse-investor",
    risk: "RHCA timing gets argued when surrender and mail proof do not match the rowhouse turn.",
    story: "one spreadsheet tracked Maryland and DC units on the same deadline cell",
  },
  FL: {
    painSlug: "florida-missed-15-day-claim-notice-deposit",
    risk: "You miss the 15-day notice fork or the follow-up accounting after a claim.",
    story: "operators treated Florida like a single 30-day state without the two-step mail habit",
  },
  GA: {
    painSlug: "georgia-cleaning-fee-lump-sum-deposit",
    risk: "A tenant disputes a lump-sum cleaning withhold with no line items.",
    story: "vendor quotes became one spreadsheet cell instead of described withholds",
  },
  IA: {
    painSlug: "iowa-rural-turnover-surrender-date-gap",
    risk: "The clock argument starts when surrender was never written down on key handoff.",
    story: "rural porch handoffs never hit the spreadsheet the same day",
  },
  IL: {
    painSlug: "tenant-disputes-security-deposit-illinois",
    risk: "A tenant disputes the withhold or says the return clock never started.",
    story: "move-in proof lived in a camera roll while withholds were one cleaning line",
  },
  IN: {
    painSlug: "indiana-45-day-clock-forwarding-address-confusion",
    risk: "Mail and clock fights start when possession date and forwarding address disagree.",
    story: "lease end was logged but keys and mail were still in flux",
  },
  LA: {
    painSlug: "louisiana-withhold-without-itemized-accounting",
    risk: "Partial refunds without a written accounting invite disputes.",
    story: "operators refunded the remainder but skipped line-by-line withhold descriptions",
  },
  MD: {
    painSlug: "maryland-45-day-belt-investor-missed-clock",
    risk: "A 45-day Maryland clock is missed when another property in the portfolio uses 30.",
    story: "belt investors stacked states on one tab with the wrong default",
  },
  MI: {
    painSlug: "michigan-detroit-normal-wear-deposit-fight",
    risk: "Wear vs damage gets litigated when move-in condition was never documented.",
    story: "Detroit turns blended carpet wear into a single damage withhold",
  },
  MO: {
    painSlug: "missouri-stl-kc-deposit-clock-two-market",
    risk: "One missed clock when St. Louis and Kansas City units share a broken formula.",
    story: "two markets on one sheet shared one surrender cell",
  },
  MS: {
    painSlug: "mississippi-possession-still-occupied-deposit",
    risk: "Possession disputes start when stuff remains but lease end is already on the calendar.",
    story: "move-out day was logged before the unit was actually vacant",
  },
  NC: {
    painSlug: "north-carolina-interim-30-final-60-deposit",
    risk: "Interim accounting is challenged when the first 30 days pass without a written update.",
    story: "operators waited for final contractor bids and went silent at 30 days",
  },
  ND: {
    painSlug: "north-dakota-pet-deposit-vs-security-deposit",
    risk: "Pet fees and the security deposit ledger get mixed in a dispute.",
    story: "small portfolios tracked pet charges in the same cell as the main deposit",
  },
  NH: {
    painSlug: "new-hampshire-deposit-interest-itemization",
    risk: "Interest and itemization questions land when only principal was returned.",
    story: "operators returned principal minus cleaning without the full accounting habit",
  },
  NJ: {
    painSlug: "new-jersey-disclosure-clock-vs-return-clock",
    risk: "Return timing gets argued when move-in disclosure habits blur into move-out mail.",
    story: "disclosure paperwork was filed but surrender was never logged for the return clock",
  },
  NV: {
    painSlug: "nevada-return-and-itemization-same-mailing",
    risk: "Balance and accounting disputes start when mail pieces do not match.",
    story: "check and itemization left on different days without shared proof",
  },
  OH: {
    painSlug: "ohio-cleveland-columbus-turnover-mail-delay",
    risk: "Day-thirty mail slips when surrender was never logged at key pickup.",
    story: "vendor backlog pushed mail while the spreadsheet still showed lease end",
  },
  UT: {
    painSlug: "utah-missed-deposit-deadline-penalty-track",
    risk: "Penalty track letters arrive when the on-screen return line was never logged.",
    story: "operators waited on paint while surrender stayed blank",
  },
  VA: {
    painSlug: "virginia-45-day-itemization-mail-proof",
    risk: "Day-forty-four mail without tracking becomes a dispute story.",
    story: "out-of-state investors mailed late with no certificate logged",
  },
  WA: {
    painSlug: "washington-deposit-invoices-substantiation",
    risk: "Each withhold line is challenged when invoices do not match the packet.",
    story: "operators named fees without substantiation ready at export",
  },
};

export function stripGuideWarning(html) {
  const re = new RegExp(`\\s*${MARKER_START}[\\s\\S]*?${MARKER_END}\\s*`, "g");
  return html.replace(re, "\n");
}

export function guideWarningBlock({ risk, story, painSlug, painTitle }) {
  return `${MARKER_START}
      <aside class="product-proof" role="note">
        <p class="product-proof-kicker">Operator story</p>
        <p><strong>This could happen:</strong> ${risk}</p>
        <p><strong>Because:</strong> ${story} Read the <a href="/blog/${painSlug}">${painTitle}</a> story guide.</p>
      </aside>
${MARKER_END}`;
}

export function disputeGuideRefsBlock(code, label) {
  const hub = stateHubMap()[code] || {};
  const links = [];
  if (hub.deadline) links.push(`<a href="/blog/${hub.deadline}">${label} deadline guide</a>`);
  if (hub.itemization) links.push(`<a href="/blog/${hub.itemization}">itemization guide</a>`);
  if (hub.checklist) links.push(`<a href="/blog/${hub.checklist}">checklist</a>`);
  const story = STORY_BY_STATE[code];
  if (story?.painSlug && story.painSlug !== hub.pain) {
    links.push(`<a href="/blog/${story.painSlug}">dispute story</a>`);
  } else if (hub.pain) {
    links.push(`<a href="/blog/${hub.pain}">operator pain guide</a>`);
  }
  if (!links.length) return "";
  return `${MARKER_START}
      <aside class="product-proof" role="note">
        <p class="product-proof-kicker">Guide references</p>
        <p>Before you mail: ${links.join(" · ")}. Not legal advice.</p>
      </aside>
${MARKER_END}`;
}

export function insertAfterFirstH1(mainHtml, block) {
  if (!block) return mainHtml;
  const idx = mainHtml.search(/<h1[\s>]/i);
  if (idx < 0) return mainHtml;
  const close = mainHtml.indexOf("</h1>", idx);
  if (close < 0) return mainHtml;
  return `${mainHtml.slice(0, close + 5)}\n${block}${mainHtml.slice(close + 5)}`;
}

export function stateLabel(code) {
  return STATE_PACKS[code]?.label || code;
}

export function isCanonicalGuide(post) {
  if (!post?.slug) return false;
  return (
    /-(deadline|itemization|checklist)$/.test(post.slug) ||
    /-operator-deposit-packet-sep-2026$/.test(post.slug) ||
    post.slug === "deposit-desk-vs-spreadsheet"
  );
}

export function isDisputeLane(post) {
  if (!post) return false;
  return (
    post.intent === "pain" ||
    post.category === "pain" ||
    post.lawWatch ||
    post.category === "news" ||
    (post.category === "city" && /deposit|surrender|clock|withhold/i.test(post.slug || "")) ||
    post.slug?.includes("dispute") ||
    post.slug?.includes("missed-")
  );
}
