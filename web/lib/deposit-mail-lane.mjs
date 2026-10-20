/**
 * C4 return/withhold letter draft · C5 certified-mail checklist (documentation only).
 */
import { formatUsDate } from "./deposit-rules.mjs";

export function buildC4ReturnLetterText(draft, deadline) {
  const d = draft || {};
  const prop = d.property || {};
  const tenant = d.tenant || {};
  const landlord = d.landlord || {};
  const dep = parseFloat(d.deposit?.amount) || 0;
  const deductions = Array.isArray(d.deductions) ? d.deductions : [];
  let withheld = 0;
  const lines = deductions
    .map((row) => {
      const amt = parseFloat(row.amount) || 0;
      withheld += amt;
      if (!row.description && !amt) return null;
      return `  · ${row.category || "Withhold"}: ${row.description || "(none)"} · $${amt.toFixed(2)}`;
    })
    .filter(Boolean);
  const returnAmt = Math.max(0, dep - withheld);
  const deadlineLine = deadline?.deadline
    ? formatUsDate(deadline.deadline)
    : "(add surrender date in wizard)";

  return [
    `${landlord.name || "[Landlord name]"}`,
    `${landlord.address || "[Landlord mailing address]"}`,
    "",
    formatUsDate(d.signatures?.date || new Date().toISOString().slice(0, 10)),
    "",
    `${tenant.name || "[Tenant name]"}`,
    `${prop.street || "[Property street]"}`,
    `${[prop.city, prop.state, prop.zip].filter(Boolean).join(" ") || "[City, ST ZIP]"}`,
    "",
    "RE: Security deposit return and itemization",
    "",
    `Tenant: ${tenant.name || "(add in wizard)"}`,
    `Premises: ${prop.street || "(add in wizard)"}`,
    `Surrender date: ${d.surrenderDate ? formatUsDate(d.surrenderDate) : "(add in wizard)"}`,
    `Deposit held: $${dep.toFixed(2)}`,
    "",
    `Pursuant to applicable deposit return rules (${deadline?.jurisdiction || "your state"}), this letter itemizes withholds and return amount. Statutory deadline reference: ${deadlineLine}.`,
    "",
    "Itemized withholds:",
    lines.length ? lines.join("\n") : "  · (none listed in wizard)",
    "",
    `Total withheld: $${withheld.toFixed(2)}`,
    `Amount returned: $${returnAmt.toFixed(2)}`,
    "",
    "Enclosures: move-in/move-out photos or album links as applicable.",
    "",
    "This draft is for operator documentation only · not legal advice · review with counsel before mailing.",
    "",
    `${landlord.name || "[Landlord printed name]"}`,
  ].join("\n");
}

export function renderC4C5MailLane(draft, deadline, esc) {
  const letter = buildC4ReturnLetterText(draft, deadline);
  return `<div class="form-panel mail-lane-panel" id="mail-lane-c4c5">
      <p class="section-label">C4 · Return / withhold letter (draft)</p>
      <p class="field-hint">Merge fields from your packet · copy into Word or print with your mail-ready PDF · not legal advice.</p>
      <pre class="c4-letter-preview" id="c4-letter-preview">${esc(letter)}</pre>
      <button type="button" class="btn btn-secondary no-print" id="btn-copy-c4-letter">Copy letter text</button>
      <p class="section-label" style="margin-top:1.25rem">C5 · Certified mail checklist</p>
      <ul class="cert-mail-checklist bullet-tight">
        <li>Forwarding address confirmed (tenant or last known)</li>
        <li>Itemization matches withhold lines in Deposit Desk</li>
        <li>Check amount (if any) matches return total</li>
        <li>Photos or album links referenced on itemization</li>
        <li>USPS certified (or courier) receipt saved below</li>
        <li>Tracking or certificate # logged before dispute</li>
      </ul>
    </div>`;
}
