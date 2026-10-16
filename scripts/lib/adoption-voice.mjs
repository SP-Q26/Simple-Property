/**
 * Operator adoption voice · phrase sweeps + blog defaults.
 * Canon: docs/DEPOSIT_DESK_OPERATOR_VOICE.md
 */

export const OPERATOR_TEAM_LINE = "Built for landlords who run the doors themselves.";

export const DEFAULT_PAIN_LEAD_HTML = `<p class="pain-solution-lead"><span class="ps-problem">When turnover stacks up, one missing surrender date or move-in photo becomes the story in a deposit dispute.</span> <span class="ps-fix">Use the facts below, then <strong>Open Deposit Desk</strong> for a dated packet you can print or hand to counsel. Documentation only · not legal advice.</span></p>`;

/** @deprecated leads replaced on sweep */
export const LEGACY_PAIN_SNIPPETS = [
  "Thin paperwork turns a routine turnover into a dispute.",
  "Use the facts below, then build a dated packet you can mail or email.",
];

/**
 * Safe replacements inside blog <main> only (order matters).
 * @type {[RegExp, string][]}
 */
export const BLOG_PHRASE_SWEEPS = [
  [/\bEnd users\b/gi, "Operators"],
  [/\bend user\b/gi, "operator"],
  [/\bthe platform\b/gi, "Deposit Desk"],
  [/\bUsers can\b/g, "You can"],
  [/\busers can\b/g, "you can"],
  [/\bunlock your\b/gi, "open your"],
  [/\bsupercharge\b/gi, "speed up"],
  [/\bleverage\b/gi, "use"],
  [/\bgame[- ]changer\b/gi, "useful tool"],
  [/\bStart free packet\b/g, "Open Deposit Desk"],
  [/\bRoom walkthroughs\b/g, "Condition hub walkthrough"],
  [/\bCustomer Portal\b/gi, "Manage billing on simple-property.com"],
];

export function sweepBlogMainHtml(mainHtml) {
  let html = mainHtml;
  for (const [re, repl] of BLOG_PHRASE_SWEEPS) {
    html = html.replace(re, repl);
  }
  for (const legacy of LEGACY_PAIN_SNIPPETS) {
    if (html.includes(legacy)) {
      html = html.replace(
        /<p class="pain-solution-lead">[\s\S]*?<\/p>/,
        DEFAULT_PAIN_LEAD_HTML
      );
      break;
    }
  }
  return html;
}
