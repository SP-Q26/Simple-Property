/**
 * Goal-oriented copy blocks for blog guides · pain → fix → CTA.
 */
import { DEFAULT_PAIN_LEAD_HTML } from "./adoption-voice.mjs";

const CTA_MARKERS = /<!-- spt-guide-cta -->[\s\S]*?<!-- \/spt-guide-cta -->/;

export function defaultPainLeadHtml() {
  return DEFAULT_PAIN_LEAD_HTML;
}

export function hasPainFraming(html) {
  return (
    html.includes("ps-problem") ||
    html.includes("pain-solution-lead") ||
    /This could happen:/i.test(html)
  );
}

/**
 * @param {{ stateCode?: string, stateLabel?: string }} opts
 */
export function guideCtaHtml({ stateCode = "", stateLabel = "" } = {}) {
  const primaryHref = stateCode ? `/app?state=${stateCode}` : "/app";
  const primaryLabel = stateCode && stateLabel ? `Open ${stateLabel} packet` : "Open Deposit Desk";
  return `<!-- spt-guide-cta -->
<section class="guide-cta" aria-label="Next step">
  <p class="disclaimer">Not legal advice. Confirm facts and deadlines with qualified counsel.</p>
  <p class="hero-actions">
    <a class="btn btn-primary" href="${primaryHref}">${primaryLabel}</a>
    <a class="btn btn-secondary" href="/hub?ref=guide">Condition hub walkthrough</a>
    <a class="btn btn-secondary" href="/pricing">See pricing</a>
  </p>
</section>
<!-- /spt-guide-cta -->`;
}

/** Remove legacy inline CTAs so we do not duplicate buttons. */
export function stripLegacyInlineCta(html) {
  return html
    .replace(
      /\n?\s*<p class="disclaimer">Not legal advice\.[^<]*<\/p>\s*\n?\s*<p><a class="btn btn-primary"[\s\S]*?<\/p>\s*/gi,
      "\n"
    )
    .replace(/\n?\s*<p><a class="btn btn-primary"[^>]*href="\/app[^"]*"[^>]*>[\s\S]*?<\/p>\s*/gi, "\n");
}

/**
 * @param {string} bodyHtml
 * @param {{ states?: string[], stateLabels?: Record<string, string> }} post
 */
export function ensureBlogGoalCopy(bodyHtml, post = {}) {
  let html = bodyHtml.trim();
  const states = post.states || [];
  const stateCode = states[0] || "";
  const stateLabel = stateCode && post.stateLabels ? post.stateLabels[stateCode] || stateCode : "";

  if (!hasPainFraming(html)) {
    const h1End = html.indexOf("</h1>");
    if (h1End !== -1) {
      const insertAt = h1End + "</h1>".length;
      html = `${html.slice(0, insertAt)}\n      ${defaultPainLeadHtml()}\n${html.slice(insertAt)}`;
    }
  }

  html = stripLegacyInlineCta(html);

  if (!CTA_MARKERS.test(html)) {
    const cta = guideCtaHtml({ stateCode, stateLabel });
    const hubNav = html.match(/<nav class="state-hub-links"[\s\S]*?<\/nav>/);
    if (hubNav) {
      const idx = html.indexOf(hubNav[0]) + hubNav[0].length;
      html = `${html.slice(0, idx)}\n\n      ${cta}\n${html.slice(idx)}`;
    } else {
      html = `${html}\n\n      ${cta}`;
    }
  } else {
    html = html.replace(CTA_MARKERS, guideCtaHtml({ stateCode, stateLabel }));
  }

  return html.trim();
}
