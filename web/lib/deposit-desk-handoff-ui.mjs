/**
 * Condition hub → Desk UI helpers (keeps app.js under perf budget).
 */
import {
  readHubDeskHandoff,
  clearHubDeskHandoff,
  applyHubDeskHandoffToDraft,
} from "./hub-desk-handoff.mjs";
import { trackIsles, DEPOSIT_DESK_TEMPLATE_ID } from "./spt-telemetry.mjs";
import { formatUsDate } from "./deposit-rules.mjs";

export function consumeConditionHubHandoff(ctx) {
  const { draft, saveDraft, enableTurnoverMode, getStep, setStep } = ctx;
  const handoff = readHubDeskHandoff();
  if (!handoff) return;
  const applied = applyHubDeskHandoffToDraft(draft, handoff);
  if (applied.length) {
    if (draft.turnoverMode) {
      enableTurnoverMode({ minStep: 2 });
    } else {
      saveDraft(draft);
    }
    trackIsles("spt_hub_handoff_applied", {
      template_id: handoff.templateId || DEPOSIT_DESK_TEMPLATE_ID,
      field_count: applied.length,
    });
    ctx.setStatusMsg(
      "Condition hub handed off property and turnover dates · confirm steps 1–2, then itemize withholds."
    );
    if (applied.includes("surrenderDate") || applied.includes("turnoverMode")) {
      setStep(Math.max(getStep(), 2));
    }
  }
  clearHubDeskHandoff();
}

export function renderPmTurnoverHandoffSheet(draft, esc) {
  const d = draft;
  return `<div class="form-panel pm-handoff-sheet" id="pm-handoff-sheet">
      <p class="section-label">PM / bookkeeper handoff (print)</p>
      <p class="field-hint">One page for your property manager or spouse · not mailed to tenant · not legal advice.</p>
      <table class="handoff-sheet-table">
        <tbody>
          <tr><th scope="row">Property</th><td>${esc(d.property.street)} · ${esc(d.property.city)} ${esc(d.property.state)} ${esc(d.property.zip)}</td></tr>
          <tr><th scope="row">Tenant</th><td>${esc(d.tenant.name)}</td></tr>
          <tr><th scope="row">Deposit held</th><td>$${esc(d.deposit.amount || "0")}</td></tr>
          <tr><th scope="row">Surrender date</th><td>${esc(d.surrenderDate ? formatUsDate(d.surrenderDate) : "n/a")}</td></tr>
          <tr><th scope="row">Lease end</th><td>${esc(d.lease.end ? formatUsDate(d.lease.end) : "n/a")}</td></tr>
          <tr><th scope="row">Landlord of record</th><td>${esc(d.landlord.name)} · ${esc(d.landlord.email)}</td></tr>
        </tbody>
      </table>
      <p class="field-hint no-print">Use browser print · choose this section or full packet after unlock.</p>
      <button type="button" class="btn btn-secondary no-print" id="btn-print-pm-handoff">Print handoff sheet</button>
    </div>`;
}
