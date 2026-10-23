import {
  computeDeadline,
  exportDeadlineUrgency,
  formatUsDate,
  normalizeStateCode,
  stateSelectOptions,
  citySelectOptions,
  cityPresetHint,
  normalizeCityPresetId,
  inChicagoFromPreset,
  STATE_PACKS,
} from "./lib/deposit-rules.mjs";
import { resolveCityOverlay } from "./lib/city-overlays.mjs";
import { buildDeadlineIcs, downloadIcs } from "./lib/deadline-ics.mjs";
import {
  buildPacketSheetsCsv,
  downloadCsv,
  googleCalendarAddUrl,
  googleCalendarReminderUrls,
  openGoogleCalendar,
} from "./lib/google-tools.mjs";
import { buildPacketAiReport, copyTextForAi, buildPrintPacketInnerHtml } from "./lib/packet-report.mjs";
import {
  bindPacketBar,
  buildDepositDeskPbsRow,
  depositDeskVerdict,
  renderPacketBarHtml,
} from "./lib/packet-bar.mjs";
import {
  trackIsles,
  trackPacketBar,
  hashReceiptId,
  DEPOSIT_DESK_TEMPLATE_ID,
  doorBand,
} from "./lib/spt-telemetry.mjs";
import {
  buildWizardAgentSnapshot,
  publishWizardAgentSnapshot,
  WIZARD_STEPS,
} from "./lib/wizard-agent-snapshot.mjs";
import { PRO_UNITS_MAX, parseUnitCount, unitsWithinProCap } from "./lib/pro-limits.mjs";
import { STATUTE_URLS, CHICAGO_RLTO_URL } from "./lib/statute-urls.mjs";
import {
  consumeConditionHubHandoff,
  renderPmTurnoverHandoffSheet,
} from "./lib/deposit-desk-handoff-ui.mjs";
import {
  PACKET_BACKUP_SCHEMA,
  validatePacketImport,
  formatImportWarnings,
} from "./lib/packet-backup.mjs";
import { renderC4C5MailLane, buildC4ReturnLetterText } from "./lib/deposit-mail-lane.mjs";

const DRAFT_KEY = "spt_draft";
const PACKETS_KEY = "spt_saved_packets";
const TURNOVER_MODE_KEY = "spt_turnover_mode";
const MAX_STEPS = 5;
const MAX_PHOTO_BYTES = 400_000;
const MAX_PHOTOS_TOTAL = 1_200_000;

function citeLink(code, cite, opts) {
  const url =
    opts?.rlto && code === "IL" ? CHICAGO_RLTO_URL : STATUTE_URLS[code] || "";
  if (!url) return esc(cite);
  return `<a href="${esc(url)}" rel="noopener noreferrer" target="_blank">${esc(cite)}</a>`;
}

const DEFAULT_ROOMS = [
  "Living room",
  "Kitchen",
  "Bedroom 1",
  "Bedroom 2",
  "Bathroom",
  "Hall / entry",
];

const TURNOVER_ROOM_NAMES = ["Living room", "Kitchen", "Bedroom"];

function normalizeRoom(r) {
  return {
    name: r?.name || "Room",
    condition: r?.condition || "Good",
    notes: r?.notes || "",
    photo: r?.photo || null,
    photoLink: r?.photoLink || "",
    photoFileName: r?.photoFileName || "",
    photoCapturedAt: r?.photoCapturedAt || "",
  };
}

function emptyDraft() {
  return {
    id: crypto.randomUUID?.() || "pkt-" + Date.now(),
    landlord: { name: "", email: "", address: "" },
    property: {
      street: "",
      city: "",
      zip: "",
      state: "IL",
      inChicago: false,
      cityPreset: "",
      unitCount: 1,
    },
    tenant: { name: "", email: "" },
    lease: { start: "", end: "" },
    deposit: { amount: "", heldAt: "" },
    surrenderDate: "",
    photoAlbumLink: "",
    rooms: DEFAULT_ROOMS.map((name) => ({
      name,
      condition: "Good",
      notes: "",
      photo: null,
      photoLink: "",
      photoFileName: "",
      photoCapturedAt: "",
    })),
    deductions: [{ category: "Unpaid rent", description: "", amount: "" }],
    signatures: { landlordPrinted: "", tenantPrinted: "", date: new Date().toISOString().slice(0, 10) },
    mailProof: { mailedAt: "", tracking: "", method: "" },
    reminders: { usePmEmail: false, pmEmail: "" },
    turnoverMode: false,
    wizardMaxStep: 1,
  };
}

function normalizeReminders(r) {
  return {
    usePmEmail: Boolean(r?.usePmEmail),
    pmEmail: String(r?.pmEmail || "").trim(),
  };
}

/** Email address for deadline reminder API (landlord vs PM). */
function reminderDeliveryEmailFromDom() {
  const usePm = Boolean(document.getElementById("rem-use-pm")?.checked);
  if (usePm) {
    return document.getElementById("rem-pm-email")?.value?.trim() || draft.reminders?.pmEmail || "";
  }
  return document.getElementById("ll-email")?.value?.trim() || draft.landlord.email || "";
}

function compactRoomsForTurnover() {
  const byName = new Map(draft.rooms.map((r) => [r.name, r]));
  draft.rooms = TURNOVER_ROOM_NAMES.map((name) => normalizeRoom(byName.get(name) || { name }));
}

function isTurnoverQuery(params) {
  const t = params.get("turnover");
  return t === "1" || t === "true";
}

function enableTurnoverMode(opts = {}) {
  draft.turnoverMode = true;
  try {
    sessionStorage.setItem(TURNOVER_MODE_KEY, "1");
  } catch {
    /* ignore */
  }
  if (opts.compactRooms !== false) compactRoomsForTurnover();
  const minStep = opts.minStep || 2;
  draft.wizardMaxStep = Math.max(draft.wizardMaxStep || 1, minStep);
  saveDraft(draft);
}

async function copyPlainText(text) {
  if (typeof copyTextForAi === "function") {
    try {
      await copyTextForAi(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function packetReturnUrl() {
  const u = new URL(location.origin + "/app");
  u.searchParams.set("packet_id", draft.id);
  u.searchParams.set("step", "5");
  return u.toString();
}

function buildOperatorLogsHandoffUrl(d) {
  const u = new URL("/logs", location.origin);
  if (d?.id) u.searchParams.set("packet_id", d.id);
  if (d?.surrenderDate) u.searchParams.set("surrender", d.surrenderDate);
  const dep = d?.deposit?.amount;
  if (dep) u.searchParams.set("deposit", String(dep));
  return `${u.pathname}${u.search}`;
}

function buildPacketBackup() {
  readStepIntoDraft();
  return {
    schema: PACKET_BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    product: "Deposit Desk",
    data: JSON.parse(JSON.stringify(draft)),
  };
}

function downloadPacketBackup() {
  const payload = buildPacketBackup();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deposit-desk-packet-${slugStreet(draft.property.street)}-${draft.id.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (els.status) {
    els.status.textContent =
      "Packet file downloaded · move to another device with Import packet file (photos included if embedded).";
  }
}

function importPacketBackupObject(imported) {
  if (!imported || typeof imported !== "object") {
    throw new Error("invalid_schema");
  }
  draft = {
    ...emptyDraft(),
    ...imported,
    id: imported.id || emptyDraft().id,
    property: { ...emptyDraft().property, ...imported.property },
    landlord: { ...emptyDraft().landlord, ...imported.landlord },
    tenant: { ...emptyDraft().tenant, ...imported.tenant },
    lease: { ...emptyDraft().lease, ...imported.lease },
    deposit: { ...emptyDraft().deposit, ...imported.deposit },
    signatures: { ...emptyDraft().signatures, ...imported.signatures },
    mailProof: { ...emptyDraft().mailProof, ...imported.mailProof },
    reminders: normalizeReminders(imported.reminders),
    deductions: imported.deductions?.length ? imported.deductions : emptyDraft().deductions,
    rooms: imported.rooms?.length ? imported.rooms.map(normalizeRoom) : emptyDraft().rooms,
  };
  draft.property.state = normalizeStateCode(draft.property.state);
  draft.property.cityPreset = normalizeCityPresetId(draft.property.cityPreset);
  draft.wizardMaxStep = Math.max(inferWizardMaxStep(draft), imported.wizardMaxStep || 1, 5);
  syncChicagoFromPreset();
  saveDraft(draft);
  step = Math.min(MAX_STEPS, Math.max(1, parseInt(imported.wizardMaxStep, 10) || 5));
  render();
  saveCurrentToLibrary();
  focusStepTitle();
  if (els.status) els.status.textContent = "Packet imported · review export step before you mail.";
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw);
    const merged = {
      ...emptyDraft(),
      ...parsed,
      property: {
        ...emptyDraft().property,
        ...parsed.property,
        state: normalizeStateCode(parsed.property?.state || "IL"),
        cityPreset: normalizeCityPresetId(parsed.property?.cityPreset),
      },
      deductions: parsed.deductions?.length ? parsed.deductions : emptyDraft().deductions,
      rooms: parsed.rooms?.length ? parsed.rooms.map(normalizeRoom) : emptyDraft().rooms,
      photoAlbumLink: parsed.photoAlbumLink || "",
      wizardMaxStep: inferWizardMaxStep({
        ...emptyDraft(),
        ...parsed,
        property: { ...emptyDraft().property, ...parsed.property },
      }),
    };
    merged.wizardMaxStep = Math.max(
      merged.wizardMaxStep,
      inferWizardMaxStep(merged),
      Math.min(MAX_STEPS, Math.max(1, parseInt(parsed.wizardMaxStep, 10) || 1))
    );
    if (!merged.property.cityPreset && merged.property.inChicago && merged.property.state === "IL") {
      merged.property.cityPreset = "chicago-il";
    }
    merged.mailProof = { ...emptyDraft().mailProof, ...parsed.mailProof };
    merged.reminders = normalizeReminders(parsed.reminders);
    merged.turnoverMode = Boolean(parsed.turnoverMode);
    try {
      if (sessionStorage.getItem(TURNOVER_MODE_KEY) === "1") merged.turnoverMode = true;
    } catch {
      /* ignore */
    }
    return merged;
  } catch {
    return emptyDraft();
  }
}

function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function listSavedPackets() {
  try {
    return JSON.parse(localStorage.getItem(PACKETS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCurrentToLibrary() {
  readStepIntoDraft();
  const list = listSavedPackets();
  const label = [draft.property.street, draft.tenant.name].filter(Boolean).join(" · ") || "Packet " + new Date().toLocaleDateString();
  const entry = { id: draft.id, label, updatedAt: new Date().toISOString(), data: draft };
  const idx = list.findIndex((p) => p.id === draft.id);
  if (idx >= 0) list[idx] = entry;
  else list.unshift(entry);
  localStorage.setItem(PACKETS_KEY, JSON.stringify(list.slice(0, 20)));
  refreshPacketSelect();
  if (els.status) els.status.textContent = "Saved to this browser (“" + label + "”).";
}

function loadPacketById(id) {
  const found = listSavedPackets().find((p) => p.id === id);
  if (!found) return;
  draft = { ...emptyDraft(), ...found.data, id: found.id };
  draft.wizardMaxStep = MAX_STEPS;
  saveDraft(draft);
  step = 1;
  render();
}

function duplicateFromLastPacket() {
  readStepIntoDraft();
  const list = listSavedPackets();
  if (!list.length) {
    if (els.status) els.status.textContent = "No saved packets yet · save one from export step.";
    return;
  }
  const src = list[0].data || {};
  draft = {
    ...emptyDraft(),
    id: crypto.randomUUID?.() || "pkt-" + Date.now(),
    landlord: { ...emptyDraft().landlord, ...src.landlord },
    property: { ...emptyDraft().property, ...src.property },
    deposit: {
      amount: src.deposit?.amount || "",
      heldAt: src.deposit?.heldAt || "",
    },
    wizardMaxStep: 2,
  };
  syncChicagoFromPreset();
  saveDraft(draft);
  step = 2;
  if (els.status) els.status.textContent = "Duplicated property & landlord · enter new tenant and surrender.";
  render();
}

function refreshPacketSelect() {
  const sel = document.getElementById("packet-select");
  if (!sel) return;
  const list = listSavedPackets();
  sel.innerHTML =
    '<option value="">Current draft</option>' +
    list.map((p) => `<option value="${esc(p.id)}">${esc(p.label)}</option>`).join("");
}

function isSubscribed() {
  if (typeof window.sptIsDemoPro === "function" && window.sptIsDemoPro()) return true;
  return typeof window.sptIsSubscribed === "function" && window.sptIsSubscribed();
}

function hasTurnUnlock() {
  if (typeof window.sptHasTurnUnlock === "function") {
    return window.sptHasTurnUnlock(draft.id);
  }
  return false;
}

/** Subscription Pro within unit cap, or per-turn unlock for this packet. */
function canExportPro() {
  if (typeof window.sptIsDemoPro === "function" && window.sptIsDemoPro()) return true;
  if (hasTurnUnlock()) return true;
  return isSubscribed() && unitsWithinProCap(draft.property.unitCount);
}

function isProSubscription() {
  return isSubscribed() && unitsWithinProCap(draft.property.unitCount);
}

function sptTrack(name, data) {
  trackIsles(name, {
    ...(data || {}),
    door_band: doorBand(draft.property?.unitCount),
  });
}

function trackWizardStep() {
  const stepDef = WIZARD_STEPS.find((s) => s.n === step);
  trackIsles("sp_wizard_step", {
    step_id: stepDef?.key || String(step),
    index: step,
  });
}

function paywallActionsHtml() {
  return `<p class="field-hint paywall-economics">One missed deadline or weak itemization often costs more than $29–49 · counsel organize-the-packet time runs ~$350/hr in major markets.</p>
      <div class="paywall-actions">
        <button type="button" class="btn btn-primary spt-checkout" data-sku="turn_move_out" data-packet-id="${esc(draft.id)}">Unlock this turn · $29</button>
        <button type="button" class="btn btn-secondary spt-checkout" data-sku="turn_full" data-packet-id="${esc(draft.id)}">Full tenancy · $49</button>
        <a class="btn btn-secondary" href="/pricing">Pro · $22/mo</a>
        <button type="button" class="btn btn-secondary" id="btn-copy-return-link">Copy return link (this browser)</button>
        <button type="button" class="btn btn-secondary" id="btn-copy-unlock-note">Copy unlock note (tenant pays)</button>
      </div>`;
}

function proBlockMessage(opts = {}) {
  if (canExportPro()) return "";
  if (isSubscribed() && !unitsWithinProCap(draft.property.unitCount)) {
    return `<div class="paywall paywall--streamlined" role="status"><strong>Pro covers up to ${PRO_UNITS_MAX} units.</strong> Lower “units you manage” on step 1, use <strong>Duplicate last</strong> per building batch, or <a href="mailto:hello@simple-property.com">email us</a> for larger portfolios.</div>`;
  }
  const urgency = opts.urgency;
  const deadlineIso = opts.deadlineIso || "";
  const daysLeft = typeof opts.daysLeft === "number" ? opts.daysLeft : null;
  if (urgency && deadlineIso) {
    const clockLabel = formatUsDate(deadlineIso);
    const daysLine =
      daysLeft === null
        ? ""
        : daysLeft < 0
          ? `<p class="export-urgency__days">Deadline passed ${Math.abs(daysLeft)} day(s) ago · mail your packet now.</p>`
          : daysLeft === 0
            ? `<p class="export-urgency__days"><strong>Due today.</strong> Unlock before you mail the tenant.</p>`
            : `<p class="export-urgency__days"><strong>${daysLeft} day(s) left.</strong> Unlock before you mail the tenant.</p>`;
    return `<div class="paywall paywall--urgency" id="export-paywall" role="status">
      <p class="export-urgency__headline"><strong>Mail-ready PDF</strong> · clock ends ${esc(clockLabel)}</p>
      ${daysLine}
      ${paywallActionsHtml()}
      <p class="field-hint export-urgency__hint">Watermarked preview stays free · unlock for tenant mail · <a href="/pricing">plans</a></p>
    </div>`;
  }
  return `<div class="paywall paywall--streamlined" id="export-paywall" role="status">
      <strong>Unlock mail-ready PDF</strong> · dated packet for tenant mail.
      <p class="field-hint" style="margin:0.5rem 0 0">Free: deadline · calendar · .ics · Sheets · watermarked preview · Pro adds tenant email copy · <a href="/pricing">plans</a></p>
      ${paywallActionsHtml()}
    </div>`;
}

function renderMailReadyRoute() {
  const mp = draft.mailProof || emptyDraft().mailProof;
  return `<div class="mail-route-panel form-panel" id="mail-ready-route">
      <p class="section-label">Mail packet</p>
      <ol class="mail-route-list">
        <li>Confirm addresses, surrender date, and withhold lines.</li>
        <li>Preview watermarked · unlock · print or Save as PDF.</li>
        <li>Mail check and itemization · log tracking below.</li>
      </ol>
      <div class="form-grid two mail-proof-grid">
        <div><label for="mail-mailed">Date mailed to tenant</label><input id="mail-mailed" type="date" value="${esc(mp.mailedAt)}" /></div>
        <div><label for="mail-method">Mail method</label><input id="mail-method" type="text" value="${esc(mp.method)}" placeholder="USPS certified, courier, hand delivery" /></div>
        <div style="grid-column:1/-1"><label for="mail-tracking">Tracking or certificate #</label><input id="mail-tracking" type="text" value="${esc(mp.tracking)}" autocomplete="off" /></div>
      </div>
      <p class="field-hint">Saved in this browser · prints on your packet when filled.</p>
    </div>`;
}

function syncChicagoFromPreset() {
  draft.property.inChicago =
    draft.property.state === "IL" && inChicagoFromPreset(draft.property.cityPreset);
}

function deadlineInput() {
  syncChicagoFromPreset();
  return {
    surrenderDate: draft.surrenderDate,
    state: draft.property.state,
    inChicago: draft.property.inChicago,
    cityPreset: draft.property.cityPreset,
  };
}

function parseSubEntitlement() {
  try {
    return JSON.parse(localStorage.getItem("spt_subscription") || "null");
  } catch {
    return null;
  }
}

function buildPacketEmailSummary(deadline) {
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  return {
    propertyStreet: draft.property.street,
    propertyCity: draft.property.city,
    propertyZip: draft.property.zip,
    tenantName: draft.tenant.name,
    landlordName: draft.landlord.name || draft.signatures.landlordPrinted,
    depositAmount: draft.deposit.amount,
    withheldTotal: withheld.toFixed(2),
    returnAmount: Math.max(0, dep - withheld).toFixed(2),
    surrenderDate: draft.surrenderDate,
    deadline: deadline?.deadline,
    jurisdiction: deadline?.jurisdiction,
    documentDate: draft.signatures.date,
    deductions: draft.deductions.map((d) => ({
      category: d.category,
      description: d.description,
      amount: d.amount,
    })),
    rooms: draft.rooms.map((r) => ({ name: r.name, condition: r.condition })),
  };
}

function sumDeductions(list) {
  return list.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
}

function photoBytesTotal(rooms) {
  return rooms.reduce((acc, r) => acc + (r.photo?.length || 0), 0);
}

function slugStreet(street) {
  return (street || "unit").replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "unit";
}

function buildPhotoFileName(street, roomName, originalName) {
  const ext = (originalName?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const room = (roomName || "room").replace(/[^\w]+/g, "-").slice(0, 20);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${slugStreet(street)}_${room}_move-in_${stamp}.${ext}`;
}

function surrenderLeaseHint(leaseEnd, surrender) {
  if (!surrender) {
    return "Statutory clock usually starts at surrender (keys back / vacant unit), not lease end alone.";
  }
  if (!leaseEnd) return "Log lease end too · compare both dates in disputes.";
  if (surrender < leaseEnd) {
    return "Surrender is before lease end · clock still runs from surrender if possession ended. Confirm with counsel.";
  }
  if (surrender > leaseEnd) {
    return "Surrender is after lease end · common with holdover or slow turnover. Document keys returned.";
  }
  return "Surrender matches lease end · still note keys returned and unit vacant.";
}

function wearDamageGuideHref(state) {
  const st = normalizeStateCode(state);
  if (st === "IL") return "/blog/normal-wear-vs-damage-illinois.html";
  if (st === "MI") return "/blog/michigan-detroit-normal-wear-deposit-fight.html";
  return "/blog/deposit-desk-vs-spreadsheet.html";
}

function exportStatusLine() {
  const parts = [];
  if (hasTurnUnlock()) parts.push("Turn unlock active for this packet");
  if (isProSubscription()) parts.push(`Pro active · up to ${PRO_UNITS_MAX} units`);
  return parts.length ? parts.join(" · ") + " ·" : "";
}

function renderScreenPacketPreview() {
  const deadline = computeDeadline(deadlineInput());
  const inner = buildPrintPacketHtml();
  const badge = canExportPro()
    ? ""
    : `<p class="packet-screen-preview__badge" role="status">Preview is blurred and watermarked on screen and in print until you unlock · not for tenant mail</p>`;
  const lockClass = canExportPro() ? "" : " print-packet--preview spt-preview-locked";
  return `<section class="packet-screen-preview" id="packet-screen-preview" aria-labelledby="packet-screen-preview-title">
    <h3 class="section-label" id="packet-screen-preview-title">Full packet preview</h3>
    <p class="field-hint">Live packet from steps 1–4 and the fields above · ${deadline.deadline ? `deadline ${formatUsDate(deadline.deadline)}` : "add surrender on step 2 for deadline"}</p>
    ${badge}
    <div class="packet-screen-preview__body print-packet print-packet--screen${lockClass}" data-spt-preview-body aria-hidden="false"><div class="print-packet__inner">${inner}</div></div>
  </section>`;
}

/** Keep export-step previews in sync while editing landlord / signature / mail fields. */
function refreshExportStepPreviews() {
  if (step !== MAX_STEPS) return;
  readStepIntoDraft();
  const body = document.querySelector("[data-spt-preview-body]");
  if (body) {
    const inner = buildPrintPacketHtml();
    const wrap = body.querySelector(".print-packet__inner");
    if (wrap) wrap.innerHTML = inner;
    else body.innerHTML = `<div class="print-packet__inner">${inner}</div>`;
    body.classList.toggle("print-packet--preview", !canExportPro());
    body.classList.toggle("spt-preview-locked", !canExportPro());
  }
  const item = document.querySelector(".itemization-preview");
  if (item) {
    const next = document.createElement("div");
    next.innerHTML = renderItemizationPreview(false);
    const replacement = next.firstElementChild;
    if (replacement) item.replaceWith(replacement);
  }
}

function bindExportStepPreviewRefresh() {
  const handler = () => refreshExportStepPreviews();
  for (const id of [
    "ll-name",
    "ll-email",
    "ll-addr",
    "sig-ll",
    "sig-tn",
    "sig-date",
    "mail-mailed",
    "mail-tracking",
    "mail-method",
  ]) {
    document.getElementById(id)?.addEventListener("input", handler);
    document.getElementById(id)?.addEventListener("change", handler);
  }
}

function renderItemizationPreview(lockedPreview) {
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  const lockClass = lockedPreview && !canExportPro() ? " itemization-preview--locked" : "";
  const dedRows = draft.deductions
    .filter((d) => d.amount || d.description)
    .map(
      (d) =>
        `<tr><td>${esc(d.category)}</td><td>${esc(d.description) || "-"}</td><td>$${esc(d.amount) || "0.00"}</td></tr>`
    )
    .join("");
  return `
    <div class="itemization-preview product-proof${lockClass}" style="margin-top:1rem">
      <p class="section-label">Statement preview</p>
      <p class="field-hint">Totals your printable packet will carry · review before you unlock export.</p>
      <table class="product-proof-table">
        <thead><tr><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
        <tbody>${dedRows || `<tr><td colspan="3">Add move-out lines on step 3</td></tr>`}</tbody>
      </table>
      <p class="deposit-receipt__totals"><strong>Deposit:</strong> $${dep.toFixed(2)} · <strong>Withheld:</strong> $${withheld.toFixed(2)} · <strong>Return:</strong> $${Math.max(0, dep - withheld).toFixed(2)}</p>
    </div>`;
}

function exportEntitlementSection() {
  if (!canExportPro()) {
    return "";
  }
  const tenantEmailBlock = isProSubscription()
    ? `<div class="form-panel" style="margin-top:1rem;border-style:dashed">
        <p class="section-label" style="margin-bottom:0.5rem">Email copy to tenant</p>
        <p class="field-hint">Sends a plain-language statement summary (not photos). BCCs your landlord email when checked.</p>
        <div class="form-grid two">
          <div><label for="tenant-email-send">Tenant email</label><input id="tenant-email-send" type="email" value="${esc(draft.tenant.email)}" autocomplete="email" /></div>
          <div style="align-self:end;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
            <label><input id="tenant-email-bcc" type="checkbox" checked /> BCC me (${esc(draft.landlord.email) || "landlord email on export step"})</label>
            <button type="button" class="btn btn-secondary" id="btn-email-tenant">Send tenant copy</button>
          </div>
        </div>
        <p class="field-hint" id="tenant-email-status" aria-live="polite"></p>
      </div>`
    : "";
  return `
    <p class="field-hint export-status" role="status">${exportStatusLine()} Print / Save as PDF using the button below.</p>
    <p style="margin-top:0.75rem"><button type="button" class="btn btn-secondary" id="btn-proof-manifest">Download photo proof manifest (.json)</button></p>
    ${tenantEmailBlock}`;
}

function buildProofManifest() {
  return {
    packetId: draft.id,
    property: {
      street: draft.property.street,
      city: draft.property.city,
      state: draft.property.state,
      zip: draft.property.zip,
    },
    tenant: draft.tenant.name,
    surrenderDate: draft.surrenderDate,
    photoAlbumLink: draft.photoAlbumLink,
    generatedAt: new Date().toISOString(),
    rooms: draft.rooms.map((r) => ({
      name: r.name,
      condition: r.condition,
      photoFileName: r.photoFileName || null,
      photoCapturedAt: r.photoCapturedAt || null,
      photoLink: r.photoLink || null,
      hasEmbeddedPhoto: Boolean(r.photo),
      embeddedPhotoBytes: r.photo?.length || 0,
    })),
  };
}

function downloadProofManifest() {
  readStepIntoDraft();
  const json = JSON.stringify(buildProofManifest(), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deposit-proof-${slugStreet(draft.property.street)}-${draft.id.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (els.status) els.status.textContent = "Photo proof manifest downloaded (metadata + links, not image bytes).";
}

function initFromQuery() {
  const params = new URLSearchParams(location.search);
  let stepParam = parseInt(params.get("step") || "0", 10);
  if (isTurnoverQuery(params)) {
    enableTurnoverMode({ minStep: 2 });
    if (!(stepParam >= 1 && stepParam <= MAX_STEPS)) stepParam = 2;
  }
  if (stepParam >= 1 && stepParam <= MAX_STEPS) step = stepParam;
  const packetId = params.get("packet_id");
  if (packetId && packetId !== draft.id) {
    const found = listSavedPackets().find((p) => p.id === packetId);
    if (found) {
      draft = { ...emptyDraft(), ...found.data, id: found.id };
      draft.wizardMaxStep = Math.max(draft.wizardMaxStep || 1, step);
      saveDraft(draft);
    } else {
      window.__sptStatusMsg =
        "Packet id not in this browser · use Import packet file from the toolbar, or pick a saved packet.";
    }
  }
  if (params.get("checkout") === "cancel") {
    window.__sptStatusMsg = "Checkout canceled · draft still saved · unlock anytime from step 5.";
  }
  if (params.get("checkout") === "success") {
    window.__sptStatusMsg = "Payment received · if export is still locked, refresh once or re-open this packet.";
  }
}

let step = 1;
let draft = loadDraft();

function applyPresetStateFromUrl() {
  const params = new URLSearchParams(location.search);
  const urlState = params.get("state");
  let code = urlState;
  const utmContent = params.get("utm_content");
  if (!code && utmContent && /^[A-Za-z]{2}$/.test(utmContent)) {
    code = utmContent;
  }
  try {
    if (!code) code = sessionStorage.getItem("spt_preset_state");
  } catch {
    /* ignore */
  }
  if (!code) return;
  const normalized = normalizeStateCode(code);
  if (!STATE_PACKS[normalized]) return;
  const forceFromUrl = Boolean(urlState);
  if (!forceFromUrl && draft.property.state === normalized && !params.get("city")) return;
  draft.property.state = normalized;
  if (normalized !== "IL") {
    draft.property.inChicago = false;
    if (resolveCityOverlay(normalized, draft.property.cityPreset)?.state !== normalized) {
      draft.property.cityPreset = "";
    }
  }
  const cityParam = params.get("city");
  if (cityParam) {
    const preset = normalizeCityPresetId(cityParam);
    if (preset && resolveCityOverlay(normalized, preset)) {
      draft.property.cityPreset = preset;
      const row = resolveCityOverlay(normalized, preset);
      if (row?.cityName) draft.property.city = row.cityName;
      syncChicagoFromPreset();
    }
  }
  saveDraft(draft);
  try {
    sessionStorage.removeItem("spt_preset_state");
  } catch {
    /* ignore */
  }
}

applyPresetStateFromUrl();
window.addEventListener("spt-preset-state", (e) => {
  const code = normalizeStateCode(e.detail?.state);
  if (!STATE_PACKS[code]) return;
  draft.property.state = code;
  const cityPreset = normalizeCityPresetId(e.detail?.city || "");
  if (cityPreset && resolveCityOverlay(code, cityPreset)) {
    draft.property.cityPreset = cityPreset;
    const row = resolveCityOverlay(code, cityPreset);
    if (row?.cityName) draft.property.city = row.cityName;
    syncChicagoFromPreset();
  } else {
    draft.property.cityPreset = "";
    draft.property.inChicago = false;
  }
  saveDraft(draft);
  if (step === 1) render();
  else {
    step = 1;
    render();
  }
});

const els = {
  steps: document.getElementById("wizard-step-labels"),
  panel: document.getElementById("wizard-panel"),
  prev: document.getElementById("btn-prev"),
  next: document.getElementById("btn-next"),
  printPreview: document.getElementById("btn-print-preview"),
  print: document.getElementById("btn-print-final"),
  printRoot: document.getElementById("print-packet"),
  status: document.getElementById("wizard-status"),
};

function maxWizardStep() {
  return Math.min(MAX_STEPS, Math.max(1, draft.wizardMaxStep || 1));
}

function bumpWizardMaxStep() {
  draft.wizardMaxStep = Math.max(maxWizardStep(), step);
  saveDraft(draft);
}

function focusStepTitle() {
  focusStepField();
}

function focusStepField() {
  requestAnimationFrame(() => {
    const pick =
      {
        1: "#prop-street, #prop-state",
        2: "#surrender",
        3: ".ded-amt, .ded-desc, .ded-cat",
        4: "#photo-album",
        5: "#ll-name, #ll-email",
      }[step] || "#step-title";
    const el = document.querySelector(pick);
    if (el && typeof el.focus === "function") el.focus({ preventScroll: false });
    else document.getElementById("step-title")?.focus({ preventScroll: false });
  });
}

function inferWizardMaxStep(d) {
  let n = 1;
  const st = normalizeStateCode(d?.property?.state || "IL");
  if (STATE_PACKS[st] && (d?.property?.street || "").trim()) n = 2;
  if ((d?.surrenderDate || "").trim()) n = Math.max(n, 2);
  if ((d?.tenant?.name || "").trim() && (d?.deposit?.amount || "").toString().trim()) n = Math.max(n, 3);
  const hasDed = (d?.deductions || []).some((row) => row.amount || row.description);
  if (hasDed || n >= 3) n = Math.max(n, 3);
  if ((d?.photoAlbumLink || "").trim() || (d?.rooms || []).some((r) => r.photoLink || r.notes || r.photo)) {
    n = Math.max(n, 4);
  }
  if ((d?.landlord?.name || "").trim() && (d?.landlord?.email || "").trim()) n = Math.max(n, 5);
  return Math.min(MAX_STEPS, n);
}

function advanceWizard() {
  readStepIntoDraft();
  if (step >= MAX_STEPS) return false;
  bumpWizardMaxStep();
  step += 1;
  draft.wizardMaxStep = Math.max(maxWizardStep(), step);
  saveDraft(draft);
  render();
  focusStepField();
  return true;
}

function finishWizard() {
  readStepIntoDraft();
  saveDraft(draft);
  window.__sptStatusMsg =
    "Packet saved in this browser · use Preview or Unlock below, or Save packet.";
  render();
  const focus =
    document.getElementById("btn-print-preview") ||
    document.getElementById("export-paywall") ||
    document.getElementById("packet-screen-preview") ||
    document.getElementById("btn-save-packet");
  focus?.scrollIntoView({ behavior: "smooth", block: "center" });
  trackIsles("sp_finalize_attempt", { verdict: depositDeskVerdict(draft) });
}

function bindWizardKeyboard() {
  if (document.body.dataset.sptWizardKeys === "1") return;
  document.body.dataset.sptWizardKeys = "1";
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const t = e.target;
    if (!t || !els.panel?.contains(t)) return;
    const tag = t.tagName;
    if (tag === "TEXTAREA" || tag === "BUTTON" || tag === "SELECT") return;
    e.preventDefault();
    if (step >= MAX_STEPS) {
      finishWizard();
      return;
    }
    advanceWizard();
  });
}

function goToStep(n) {
  const target = Math.min(MAX_STEPS, Math.max(1, n));
  if (target > maxWizardStep() && target !== step) return;
  readStepIntoDraft();
  step = target;
  render();
  focusStepTitle();
}

function setStepLabels() {
  if (!els.steps) return;
  const max = maxWizardStep();
  els.steps.querySelectorAll("[data-step]").forEach((el) => {
    const n = parseInt(el.getAttribute("data-step"), 10);
    const def = WIZARD_STEPS.find((s) => s.n === n);
    const isActive = n === step;
    const isDone = n < step;
    const isLocked = n > max;
    const isUpcoming = !isDone && !isActive && !isLocked;
    el.classList.toggle("active", isActive);
    el.classList.toggle("done", isDone);
    el.classList.toggle("upcoming", isUpcoming);
    el.classList.toggle("locked", isLocked);
    el.setAttribute("aria-selected", isActive ? "true" : "false");
    el.disabled = isLocked;
    el.setAttribute("aria-disabled", isLocked ? "true" : "false");
    if (def) {
      el.setAttribute("aria-label", `Step ${n} of ${MAX_STEPS}: ${def.label}`);
      el.setAttribute("data-step-key", def.key);
    }
  });
  const fill = document.getElementById("wizard-progress-fill");
  const bar = document.getElementById("wizard-progress");
  if (fill) {
    const pct = MAX_STEPS <= 1 ? 100 : ((step - 1) / (MAX_STEPS - 1)) * 100;
    fill.style.width = `${pct}%`;
  }
  if (bar) {
    bar.setAttribute("data-wizard-step", String(step));
    bar.setAttribute("aria-valuenow", String(step));
    bar.setAttribute("aria-valuemax", String(MAX_STEPS));
    const def = WIZARD_STEPS.find((s) => s.n === step);
    bar.setAttribute(
      "aria-label",
      def ? `Wizard progress: step ${step} of ${MAX_STEPS}, ${def.label}` : `Wizard progress: step ${step} of ${MAX_STEPS}`
    );
  }
}

function wizardStepHead(title, subtitle, options = {}) {
  const def = WIZARD_STEPS.find((s) => s.n === step) || WIZARD_STEPS[0];
  const hint = subtitle || def.focus;
  const bannerUrgent = options.bannerUrgent ? String(options.bannerUrgent) : "";
  const bannerClass = bannerUrgent ? " wizard-step-banner--urgent" : "";
  const urgentHtml = bannerUrgent
    ? `<span class="wizard-step-banner__urgent">${esc(bannerUrgent)}</span>`
    : "";
  return `<header class="wizard-step-head">
    <p class="wizard-step-banner${bannerClass}" role="status">
      <span class="wizard-step-banner__seq">Step ${step} of ${MAX_STEPS}</span>
      <span class="wizard-step-banner__label">${esc(def.label)}</span>
      <span class="wizard-step-banner__key" data-spt-step-key="${esc(def.key)}">${esc(def.key)}</span>
      ${urgentHtml}
    </p>
    <h2 id="step-title" tabindex="-1">${esc(title)}</h2>
    <p class="wizard-step-focus field-hint">${esc(hint)}</p>
  </header>`;
}

function wizardFlowStatusLine() {
  const def = WIZARD_STEPS.find((s) => s.n === step);
  if (!def) return "Autosaved in this browser.";
  return `Step ${step} of ${MAX_STEPS} · ${def.label} · autosaved.`;
}

function bindWizardStepNav() {
  if (!els.steps || els.steps.dataset.navBound === "1") return;
  els.steps.dataset.navBound = "1";
  els.steps.querySelectorAll("[data-step]").forEach((el) => {
    el.addEventListener("click", () => {
      const n = parseInt(el.getAttribute("data-step"), 10);
      if (Number.isNaN(n) || el.disabled) return;
      goToStep(n);
    });
  });
}

function statuteClockInner(st, pack, preset) {
  if (preset === "chicago-il") {
    return `<p class="field-hint">Chicago <strong>45 days</strong> · Illinois <strong>30 days</strong> after surrender · <a href="/blog/chicago-45-day-deposit-deadline">RLTO guide</a>.</p>`;
  }
  if (st === "NC") {
    return `<p class="field-hint"><strong>30-day</strong> interim · <strong>60-day</strong> final when repairs open · <a href="/blog/north-carolina-interim-30-final-60-deposit">NC guide</a>.</p>`;
  }
  if (st === "CO") {
    return `<p class="field-hint">Default <strong>30 days</strong> · lease may allow up to <strong>60</strong> · <a href="/blog/colorado-30-vs-60-day-lease-deposit-clock">CO guide</a>.</p>`;
  }
  if (st === "KY") {
    return `<p class="field-hint">URLTA markets: accounting + damage lists · <strong>${pack.returnDays}-day</strong> export line · <a href="/blog/kentucky-urlta-deposit-demand-and-damage-lists">KY guide</a>.</p>`;
  }
  if (st === "FL") {
    return `<p class="field-hint">§ 83.49 two-step: 15-day notice or return · then 30-day balance · <a href="/blog/florida-83-49-two-step-miami-condo-deposit">FL guide</a>.</p>`;
  }
  return `<p class="field-hint"><strong>${pack.returnDays} days</strong> after surrender (${citeLink(st, pack.cite)}).</p>`;
}

function statuteClockDetails(st, pack, preset) {
  const guideLink = overlayGuideLink(st, preset);
  const inner = statuteClockInner(st, pack, preset);
  return `<details class="statute-details"><summary>${esc(pack.label)} deposit clock (${pack.returnDays}-day default)</summary>${inner}${guideLink}</details>`;
}

function overlayGuideLink(st, preset) {
  const overlay = resolveCityOverlay(st, preset);
  if (overlay?.blogSlug) {
    return `<p class="field-hint"><a href="/blog/${overlay.blogSlug}">City guide</a></p>`;
  }
  if (preset === "chicago-il") {
    return `<p class="field-hint"><a href="/blog/chicago-45-day-deposit-deadline">Chicago RLTO guide</a></p>`;
  }
  return "";
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function renderStep1() {
  const d = draft;
  const st = normalizeStateCode(d.property.state);
  const pack = STATE_PACKS[st];
  const preset = normalizeCityPresetId(d.property.cityPreset);
  const cityBlock = `
      <div style="grid-column:1/-1">
        <label for="prop-city-preset">Major city (if local rules may apply)</label>
        <select id="prop-city-preset">${citySelectOptions(st, preset)}</select>
        <p class="field-hint" id="prop-city-hint">${cityPresetHint(st, preset)}</p>
      </div>`;
  return `
    ${wizardStepHead("Rental property", "Unit, state, and city preset · landlord block on export.")}
    <div class="form-grid two wizard-flow-grid">
      <div><label for="prop-state">State</label><select id="prop-state">${stateSelectOptions(st)}</select></div>
      ${cityBlock}
      <div style="grid-column:1/-1"><label for="prop-street">Rental street address</label><input id="prop-street" type="text" value="${esc(d.property.street)}" autocomplete="street-address" /></div>
      <div><label for="prop-city">City</label><input id="prop-city" type="text" value="${esc(d.property.city)}" autocomplete="address-level2" /></div>
      <div><label for="prop-zip">ZIP</label><input id="prop-zip" type="text" value="${esc(d.property.zip)}" autocomplete="postal-code" inputmode="numeric" /></div>
      <div><label for="prop-units">Units you manage</label><input id="prop-units" type="number" min="1" max="99" value="${esc(d.property.unitCount)}" aria-describedby="prop-units-hint" /></div>
      <p class="field-hint" id="prop-units-hint" style="grid-column:1/-1">Pro license: up to <strong>${PRO_UNITS_MAX} units</strong> per subscription.</p>
      ${statuteClockDetails(st, pack, preset)}
    </div>`;
}

function renderStep2() {
  const d = draft;
  const deadline = computeDeadline(deadlineInput());
  const clockLine = deadline.deadline
    ? `<p class="deadline-box deadline-box--inline" role="status"><strong>Return / itemize by:</strong> ${formatUsDate(deadline.deadline)} · ${deadline.days} days (${esc(deadline.jurisdiction)})</p>`
    : `<p class="field-hint" role="status">Add surrender below to see your statutory clock.</p>`;
  return `
    ${wizardStepHead("Turnover & clock", "Surrender drives the deadline · deposit and tenant ID the packet.")}
    ${clockLine}
    <div class="form-grid two wizard-flow-grid">
      <div class="turnover-priority field-with-action" style="grid-column:1/-1">
        <label for="surrender">Surrender date (keys returned)</label>
        <div class="field-action-row">
          <input id="surrender" type="date" value="${esc(d.surrenderDate)}" />
          <button type="button" class="btn btn-secondary" id="btn-surrender-today">Today</button>
        </div>
      </div>
      <div><label for="dep-amt">Security deposit ($)</label><input id="dep-amt" type="number" min="0" step="0.01" value="${esc(d.deposit.amount)}" inputmode="decimal" /></div>
      <div><label for="dep-held">Deposit held at (bank note)</label><input id="dep-held" type="text" value="${esc(d.deposit.heldAt)}" /></div>
      <div><label for="tn-name">Tenant name</label><input id="tn-name" type="text" value="${esc(d.tenant.name)}" autocomplete="name" /></div>
      <div><label for="tn-email">Tenant email</label><input id="tn-email" type="email" value="${esc(d.tenant.email)}" autocomplete="email" /><p class="field-hint">Pro can email the statement on export.</p></div>
      <div><label for="lease-start">Lease start</label><input id="lease-start" type="date" value="${esc(d.lease.start)}" /></div>
      <div><label for="lease-end">Lease end</label><input id="lease-end" type="date" value="${esc(d.lease.end)}" /></div>
    </div>
    <p class="field-hint surrender-hint" id="surrender-hint" role="status">${esc(surrenderLeaseHint(d.lease.end, d.surrenderDate))}</p>`;
}

function renderStep3() {
  const rows = draft.deductions
    .map(
      (r) => `
    <div class="room-row deduction-row">
      <div><label>Category</label><input type="text" class="ded-cat" value="${esc(r.category)}" placeholder="Damage / Cleaning" /></div>
      <div><label>Description</label><input type="text" class="ded-desc" value="${esc(r.description)}" /></div>
      <div><label>Amount ($)</label><input type="number" class="ded-amt" min="0" step="0.01" value="${esc(r.amount)}" inputmode="decimal" /></div>
    </div>`
    )
    .join("");
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  const guide = wearDamageGuideHref(draft.property.state);
  return `
    ${wizardStepHead(
      "Move-out itemization",
      "Line items for your written statement · do this before move-in proof when you are at move-out."
    )}
    <p class="field-hint" style="margin-top:0"><a href="${guide}">Wear vs damage guide</a></p>
    <div class="wizard-speed-row">
      <button type="button" class="btn btn-primary" id="btn-full-return">Full deposit return</button>
      <span class="field-hint">No withholds · jumps to export · tab 4 if you add move-in proof</span>
    </div>
    <div class="ded-quick-add" role="group" aria-label="Quick withhold lines">
      <button type="button" class="btn btn-secondary ded-quick" data-cat="Cleaning">+ Cleaning</button>
      <button type="button" class="btn btn-secondary ded-quick" data-cat="Damage">+ Damage</button>
      <button type="button" class="btn btn-secondary ded-quick" data-cat="Unpaid rent">+ Unpaid rent</button>
    </div>
    ${rows}
    <button type="button" class="btn btn-secondary" id="btn-add-ded">Add line item</button>
    <div class="deadline-box" style="margin-top:1rem">
      Deposit $${dep.toFixed(2)} · Withheld $${withheld.toFixed(2)} ·
      Return $${Math.max(0, dep - withheld).toFixed(2)}
    </div>`;
}

function renderStep4() {
  const rows = draft.rooms
    .map(
      (r, i) => `
    <div class="room-row room-row-photos" data-room-index="${i}">
      <div><label>Room</label><input type="text" class="room-name" value="${esc(r.name)}" /></div>
      <div><label>Move-in condition</label>
        <select class="room-condition">
          <option ${r.condition === "Good" ? "selected" : ""}>Good</option>
          <option ${r.condition === "Fair" ? "selected" : ""}>Fair</option>
          <option ${r.condition === "Poor" ? "selected" : ""}>Poor</option>
          <option ${r.condition === "N/A" ? "selected" : ""}>N/A</option>
        </select>
      </div>
      <div><label>Notes / existing damage</label><textarea class="room-notes" placeholder="Scratches, prior repairs, tenant acknowledgment…">${esc(r.notes)}</textarea></div>
      <div class="photo-cell"><label>Photo upload (optional)</label>
        <input type="file" class="room-photo" accept="image/jpeg,image/png,image/webp" />
        ${r.photo ? `<img class="photo-thumb" src="${r.photo}" alt="" />` : ""}
        ${
          r.photoFileName
            ? `<p class="field-hint photo-meta">${esc(r.photoFileName)}${r.photoCapturedAt ? ` · captured ${esc(r.photoCapturedAt.slice(0, 10))}` : ""}</p>`
            : ""
        }
      </div>
      <div class="room-photo-links">
        <label>Photo link (Dropbox, Google Drive, iCloud share URL)</label>
        <input type="url" class="room-photo-link external-photo-link" value="${esc(r.photoLink)}" placeholder="https://…" inputmode="url" autocomplete="off" />
      </div>
    </div>`
    )
    .join("");
  const hasRoomDetail = draft.rooms.some(
    (r) => r.notes || r.photo || r.photoLink || r.condition !== "Good"
  );
  const roomsOpen = !draft.turnoverMode && (hasRoomDetail || Boolean(draft.photoAlbumLink));
  return `
    ${wizardStepHead(
      "Move-in proof (optional)",
      `Fast path: paste one folder link · skip room grid if you already have cloud proof.${draft.turnoverMode ? " Turnover mode uses a 3-room checklist." : ""}`
    )}
    <div class="photo-album-panel">
      <label for="photo-album">Whole-unit photo folder</label>
      <input id="photo-album" class="external-photo-link" type="url" value="${esc(draft.photoAlbumLink)}" placeholder="Dropbox or Google Drive folder link" inputmode="url" autocomplete="off" />
      <p class="field-hint">View-only share link · stays in this browser · we do not upload files.</p>
    </div>
    <details class="move-in-rooms" ${roomsOpen ? "open" : ""}>
      <summary>Room-by-room checklist</summary>
      <p class="field-hint">Per-room notes · ~400KB upload or cloud link each.</p>
      ${rows}
      <button type="button" class="btn btn-secondary" id="btn-add-room">Add room</button>
    </details>
    <p style="margin-top:var(--space-4)">
      <button type="button" class="btn btn-primary" id="btn-skip-move-in">Skip to export</button>
    </p>`;
}

function renderStep5() {
  const deadline = computeDeadline(deadlineInput());
  const urgency = exportDeadlineUrgency(draft.surrenderDate, deadline);
  const showUrgentPaywall = urgency.urgent && !canExportPro();
  const reminderLines = deadline.reminders
    .map((d) => `<li>${formatUsDate(d)}</li>`)
    .join("");
  const d = draft;
  const rem = normalizeReminders(d.reminders);
  const stepHeadSubtitle = showUrgentPaywall
    ? "Unlock mail-ready PDF before you mail · landlord details and signatures below."
    : "Landlord mail, deadline tools, print unlock, and signatures.";
  const bannerUrgent =
    showUrgentPaywall && deadline.deadline
      ? `Mail-ready PDF · clock ends ${formatUsDate(deadline.deadline)}`
      : "";
  const packetBar = renderPacketBarHtml({
    showIcs: Boolean(deadline.deadline),
    printLocked: !canExportPro(),
  });
  return `
    ${wizardStepHead("Review & export", stepHeadSubtitle, { bannerUrgent })}
    ${packetBar}
    ${
      showUrgentPaywall
        ? proBlockMessage({
            urgency: true,
            deadlineIso: urgency.deadlineIso,
            daysLeft: urgency.daysLeft,
          })
        : ""
    }
    <p><strong>${esc(d.property.street)}</strong> · ${esc(d.tenant.name)} · Deposit $${esc(d.deposit.amount || "0")}</p>
    <div class="form-grid two wizard-flow-grid landlord-export-block">
      <div><label for="ll-name">Landlord name (for packet)</label><input id="ll-name" type="text" value="${esc(d.landlord.name)}" autocomplete="name" /></div>
      <div><label for="ll-email">Landlord email</label><input id="ll-email" type="email" value="${esc(d.landlord.email)}" autocomplete="email" /></div>
      <div style="grid-column:1/-1"><label for="ll-addr">Landlord mailing address</label><input id="ll-addr" type="text" value="${esc(d.landlord.address)}" autocomplete="street-address" /></div>
    </div>
    ${
      deadline.deadline
        ? `<div class="deadline-box"><strong>Return / itemize by:</strong> ${formatUsDate(deadline.deadline)} · ${deadline.days} days (${esc(deadline.jurisdiction)}).
        ${reminderLines ? `<ul class="reminder-list">${reminderLines}</ul>` : ""}
        <div class="calendar-actions" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.75rem">
          <button type="button" class="btn btn-secondary" id="btn-google-cal">Add to Google Calendar</button>
          <button type="button" class="btn btn-secondary" id="btn-ics">Download .ics (import to Google)</button>
          <button type="button" class="btn btn-secondary" id="btn-sheets-csv">Export row for Google Sheets</button>
        </div>
        <p class="field-hint">Opens Google in your browser. We do not connect to your Google account on our servers.</p></div>`
        : `<div class="deadline-box">Add surrender date on step 2 to calculate deadline.</div>`
    }
    ${renderPmTurnoverHandoffSheet(draft, esc)}
    ${renderC4C5MailLane(draft, deadline, esc)}
    ${renderMailReadyRoute()}
    ${renderItemizationPreview(false)}
    ${renderScreenPacketPreview()}
    ${canExportPro() ? exportEntitlementSection() : showUrgentPaywall ? "" : proBlockMessage()}
    <p style="margin:var(--space-4) 0 var(--space-2)">
      <button type="button" class="btn btn-secondary" id="btn-copy-ai">Copy for AI assistant</button>
    </p>
    <p class="field-hint">Markdown summary · photo links included · paste into your AI tool.</p>
    <div class="form-grid two">
      <div><label for="sig-ll">Landlord printed name</label><input id="sig-ll" type="text" value="${esc(draft.signatures.landlordPrinted)}" /></div>
      <div><label for="sig-tn">Tenant printed name</label><input id="sig-tn" type="text" value="${esc(draft.signatures.tenantPrinted)}" /></div>
      <div><label for="sig-date">Document date</label><input id="sig-date" type="date" value="${esc(draft.signatures.date)}" /></div>
    </div>
    <button type="button" class="btn btn-secondary" id="btn-save-packet">Save packet to this browser</button>
    <p class="field-hint"><a href="${esc(buildOperatorLogsHandoffUrl(draft))}">Log this turnover in Operator logs</a> · packet ID flows to CSV export</p>
    ${
      deadline.deadline
        ? `<div class="form-panel reminder-panel${urgency.urgent ? " reminder-panel--urgent" : ""}" style="margin-top:1rem;border-style:dashed">
        <p class="section-label" style="margin-bottom:0.5rem">Email reminders</p>
        ${
          urgency.urgent
            ? `<p class="field-hint reminder-urgent-hint" role="status"><strong>Clock is tight.</strong> Schedule reminder emails before you unlock the mail-ready PDF.</p>`
            : ""
        }
        <p class="field-hint">7 days and 1 day before deadline · Pro on <a href="/pricing">pricing</a>.</p>
        <label class="reminder-pm-toggle field-hint">
          <input type="checkbox" id="rem-use-pm" ${rem.usePmEmail ? "checked" : ""} />
          Property managed · send reminders to PM / property manager email (not landlord above)
        </label>
        <div id="rem-pm-panel" class="form-grid two" style="margin-top:0.75rem;${rem.usePmEmail ? "" : "display:none"}">
          <div style="grid-column:1/-1">
            <label for="rem-pm-email">PM email</label>
            <input id="rem-pm-email" type="email" value="${esc(rem.pmEmail)}" autocomplete="email" placeholder="pm@company.com" />
          </div>
        </div>
        <div class="form-grid two" style="margin-top:0.75rem">
          <div style="align-self:end"><button type="button" class="btn btn-secondary" id="btn-remind">Schedule emails</button></div>
        </div>
        <p class="field-hint" id="rem-status" aria-live="polite"></p>
      </div>`
        : ""
    }`;
}

function readStepIntoDraft() {
  if (step === 1) {
    draft.property.street = document.getElementById("prop-street")?.value?.trim() || "";
    draft.property.city = document.getElementById("prop-city")?.value?.trim() || "";
    draft.property.zip = document.getElementById("prop-zip")?.value?.trim() || "";
    draft.property.state = normalizeStateCode(document.getElementById("prop-state")?.value);
    draft.property.unitCount = parseUnitCount(document.getElementById("prop-units")?.value);
    draft.property.cityPreset = normalizeCityPresetId(document.getElementById("prop-city-preset")?.value);
    syncChicagoFromPreset();
  }
  if (step === 2) {
    draft.tenant.name = document.getElementById("tn-name")?.value?.trim() || "";
    draft.tenant.email = document.getElementById("tn-email")?.value?.trim() || "";
    draft.lease.start = document.getElementById("lease-start")?.value || "";
    draft.lease.end = document.getElementById("lease-end")?.value || "";
    draft.deposit.amount = document.getElementById("dep-amt")?.value || "";
    draft.deposit.heldAt = document.getElementById("dep-held")?.value?.trim() || "";
    draft.surrenderDate = document.getElementById("surrender")?.value || "";
  }
  if (step === 3) {
    draft.deductions = [...document.querySelectorAll(".deduction-row")].map((row) => ({
      category: row.querySelector(".ded-cat")?.value?.trim() || "Item",
      description: row.querySelector(".ded-desc")?.value?.trim() || "",
      amount: row.querySelector(".ded-amt")?.value || "",
    }));
  }
  if (step === 4) {
    draft.photoAlbumLink = document.getElementById("photo-album")?.value?.trim() || "";
    draft.rooms = [...document.querySelectorAll(".room-row-photos")].map((row, i) => ({
      name: row.querySelector(".room-name")?.value?.trim() || "Room",
      condition: row.querySelector(".room-condition")?.value || "Good",
      notes: row.querySelector(".room-notes")?.value?.trim() || "",
      photoLink: row.querySelector(".room-photo-link")?.value?.trim() || "",
      photo: draft.rooms[i]?.photo || null,
      photoFileName: draft.rooms[i]?.photoFileName || "",
      photoCapturedAt: draft.rooms[i]?.photoCapturedAt || "",
    }));
  }
  if (step === 5) {
    draft.landlord.name = document.getElementById("ll-name")?.value?.trim() || "";
    draft.landlord.email = document.getElementById("ll-email")?.value?.trim() || "";
    draft.landlord.address = document.getElementById("ll-addr")?.value?.trim() || "";
    draft.signatures.landlordPrinted = document.getElementById("sig-ll")?.value?.trim() || "";
    draft.signatures.tenantPrinted = document.getElementById("sig-tn")?.value?.trim() || "";
    draft.signatures.date = document.getElementById("sig-date")?.value || draft.signatures.date;
    draft.mailProof = {
      mailedAt: document.getElementById("mail-mailed")?.value || "",
      tracking: document.getElementById("mail-tracking")?.value?.trim() || "",
      method: document.getElementById("mail-method")?.value?.trim() || "",
    };
    draft.reminders = normalizeReminders({
      usePmEmail: document.getElementById("rem-use-pm")?.checked,
      pmEmail: document.getElementById("rem-pm-email")?.value,
    });
  }
  saveDraft(draft);
}

function bindStep2Events() {
  document.getElementById("btn-surrender-today")?.addEventListener("click", () => {
    const input = document.getElementById("surrender");
    if (!input) return;
    input.value = new Date().toISOString().slice(0, 10);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  });
  const update = () => {
    const el = document.getElementById("surrender-hint");
    if (!el) return;
    const leaseEnd = document.getElementById("lease-end")?.value || "";
    const surrender = document.getElementById("surrender")?.value || "";
    el.textContent = surrenderLeaseHint(leaseEnd, surrender);
    const clock = document.querySelector(".deadline-box--inline");
    if (clock) {
      if (!surrender) {
        clock.outerHTML = `<p class="field-hint" role="status">Add surrender below to see your statutory clock.</p>`;
        return;
      }
      syncChicagoFromPreset();
      const deadline = computeDeadline({
        surrenderDate: surrender,
        state: draft.property.state,
        inChicago: draft.property.inChicago,
        cityPreset: draft.property.cityPreset,
      });
      if (deadline.deadline) {
        clock.innerHTML = `<strong>Return / itemize by:</strong> ${formatUsDate(deadline.deadline)} · ${deadline.days} days (${esc(deadline.jurisdiction)})`;
      }
    }
  };
  document.getElementById("lease-end")?.addEventListener("input", update);
  document.getElementById("surrender")?.addEventListener("input", update);
  document.getElementById("dep-amt")?.addEventListener("input", update);
  update();
}

function bindStep1Events() {
  document.getElementById("prop-state")?.addEventListener("change", () => {
    readStepIntoDraft();
    draft.property.cityPreset = "";
    draft.property.inChicago = false;
    saveDraft(draft);
    render();
  });
  document.getElementById("prop-city-preset")?.addEventListener("change", () => {
    readStepIntoDraft();
    const st = draft.property.state;
    const preset = draft.property.cityPreset;
    const row = resolveCityOverlay(st, preset);
    if (row?.cityName) draft.property.city = row.cityName;
    syncChicagoFromPreset();
    saveDraft(draft);
    render();
  });
}

function bindStepEvents() {
  document.getElementById("btn-full-return")?.addEventListener("click", () => {
    readStepIntoDraft();
    draft.deductions = [{ category: "Return", description: "Full deposit to tenant", amount: "0" }];
    draft.wizardMaxStep = MAX_STEPS;
    saveDraft(draft);
    step = MAX_STEPS;
    render();
    focusStepTitle();
    if (els.status) {
      els.status.textContent =
        "Full return noted · on export step · open tab 4 anytime if you add move-in proof.";
    }
  });
  document.querySelectorAll(".ded-quick").forEach((btn) => {
    btn.addEventListener("click", () => {
      readStepIntoDraft();
      const cat = btn.getAttribute("data-cat") || "Item";
      draft.deductions.push({ category: cat, description: "", amount: "" });
      saveDraft(draft);
      render();
      const rows = document.querySelectorAll(".deduction-row");
      const last = rows[rows.length - 1];
      last?.querySelector(".ded-amt, .ded-desc")?.focus();
    });
  });
  document.getElementById("btn-skip-move-in")?.addEventListener("click", () => {
    readStepIntoDraft();
    bumpWizardMaxStep();
    step = MAX_STEPS;
    draft.wizardMaxStep = MAX_STEPS;
    saveDraft(draft);
    render();
    focusStepTitle();
  });
  document.getElementById("btn-add-room")?.addEventListener("click", () => {
    readStepIntoDraft();
    draft.rooms.push({
      name: "Other",
      condition: "Good",
      notes: "",
      photo: null,
      photoLink: "",
      photoFileName: "",
      photoCapturedAt: "",
    });
    render();
  });
  document.getElementById("btn-add-ded")?.addEventListener("click", () => {
    readStepIntoDraft();
    draft.deductions.push({ category: "Damage", description: "", amount: "" });
    render();
  });
  document.querySelectorAll(".room-photo").forEach((input) => {
    input.addEventListener("change", async () => {
      const row = input.closest(".room-row-photos");
      const i = parseInt(row?.getAttribute("data-room-index") || "0", 10);
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > MAX_PHOTO_BYTES) {
        alert("Photo too large  ·  use a smaller image (max ~400KB).");
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        draft.rooms[i] = draft.rooms[i] || {
          name: "Room",
          condition: "Good",
          notes: "",
          photo: null,
          photoLink: "",
          photoFileName: "",
          photoCapturedAt: "",
        };
        const nextTotal = photoBytesTotal(draft.rooms) - (draft.rooms[i].photo?.length || 0) + dataUrl.length;
        if (nextTotal > MAX_PHOTOS_TOTAL) {
          alert("Total photo storage cap reached for this packet.");
          return;
        }
        readStepIntoDraft();
        const roomName = draft.rooms[i].name;
        draft.rooms[i].photo = dataUrl;
        draft.rooms[i].photoFileName = buildPhotoFileName(draft.property.street, roomName, file.name);
        draft.rooms[i].photoCapturedAt = new Date().toISOString();
        saveDraft(draft);
        render();
      };
      reader.readAsDataURL(file);
    });
  });
  document.getElementById("btn-google-cal")?.addEventListener("click", () => {
    readStepIntoDraft();
    const deadline = computeDeadline(deadlineInput());
    if (!deadline.deadline) return;
    const addr = [draft.property.street, draft.property.city].filter(Boolean).join(", ");
    const url = googleCalendarAddUrl({
      title: `Deposit return/itemize · ${draft.property.street || "rental"}`,
      startIso: deadline.deadline,
      location: addr,
      details: `${deadline.jurisdiction}. Surrender ${draft.surrenderDate || "n/a"}. Deposit Desk. Not legal advice.`,
    });
    openGoogleCalendar(url);
    const reminders = googleCalendarReminderUrls({
      titleBase: `Deposit deadline · ${draft.property.street || "rental"}`,
      deadlineIso: deadline.deadline,
    });
    if (reminders.length && els.status) {
      els.status.textContent =
        "Main deadline opened in Google Calendar. Use Download .ics for 7/3/1-day reminders in one file.";
    }
  });
  document.getElementById("btn-sheets-csv")?.addEventListener("click", () => {
    readStepIntoDraft();
    const deadline = computeDeadline(deadlineInput());
    const csv = buildPacketSheetsCsv(draft, deadline);
    const slug = (draft.property.street || "unit").replace(/[^\w]+/g, "-").slice(0, 40);
    downloadCsv(`deposit-desk-${slug}.csv`, csv);
    if (els.status) els.status.textContent = "CSV saved · Google Sheets → File → Import → Upload.";
  });
  document.getElementById("btn-copy-ai")?.addEventListener("click", async () => {
    readStepIntoDraft();
    const deadline = computeDeadline(deadlineInput());
    const text = buildPacketAiReport(draft, deadline);
    try {
      const ok = await copyTextForAi(text);
      if (els.status) {
        els.status.textContent = ok
          ? "Copied for AI · paste into ChatGPT, Claude, or your assistant."
          : "Copy failed · select text manually from print preview.";
      }
    } catch {
      if (els.status) els.status.textContent = "Clipboard blocked · allow paste or use Print / PDF.";
    }
  });
  document.getElementById("btn-copy-c4-letter")?.addEventListener("click", async () => {
    readStepIntoDraft();
    const deadline = computeDeadline(deadlineInput());
    const text = buildC4ReturnLetterText(draft, deadline);
    try {
      const ok = await copyTextForAi(text);
      if (els.status) {
        els.status.textContent = ok
          ? "C4 letter draft copied · paste into your mail template."
          : "Copy failed · select text from the letter box.";
      }
    } catch {
      if (els.status) els.status.textContent = "Clipboard blocked · select letter text manually.";
    }
  });
  document.getElementById("btn-ics")?.addEventListener("click", () => {
    readStepIntoDraft();
    const deadline = computeDeadline(deadlineInput());
    const ics = buildDeadlineIcs({
      title: `Deposit deadline · ${draft.property.street || "rental"}`,
      deadlineIso: deadline.deadline,
    });
    if (!ics) return;
    downloadIcs("deposit-deadline.ics", ics);
  });
  document.getElementById("btn-save-packet")?.addEventListener("click", saveCurrentToLibrary);
  document.getElementById("btn-proof-manifest")?.addEventListener("click", () => {
    if (!canExportPro()) return;
    downloadProofManifest();
  });
  const bindReminderPmToggle = () => {
    const box = document.getElementById("rem-use-pm");
    const panel = document.getElementById("rem-pm-panel");
    if (!box || !panel || box.dataset.bound === "1") return;
    box.dataset.bound = "1";
    const sync = () => {
      panel.style.display = box.checked ? "" : "none";
      if (box.checked) document.getElementById("rem-pm-email")?.focus();
    };
    box.addEventListener("change", sync);
    sync();
  };
  bindReminderPmToggle();
  bindExportStepPreviewRefresh();
  bindPacketBarFinalize();

  document.getElementById("btn-print-pm-handoff")?.addEventListener("click", () => {
    const sheet = document.getElementById("pm-handoff-sheet");
    if (!sheet) return;
    document.body.classList.add("spt-print-pm-handoff");
    window.print();
    document.body.classList.remove("spt-print-pm-handoff");
  });

  document.getElementById("btn-remind")?.addEventListener("click", async () => {
    readStepIntoDraft();
    const deadline = computeDeadline(deadlineInput());
    const usePm = Boolean(draft.reminders?.usePmEmail);
    const email = reminderDeliveryEmailFromDom();
    const status = document.getElementById("rem-status");
    if (!deadline.deadline || !email?.includes("@")) {
      if (status) {
        status.textContent = usePm
          ? "Add surrender date and PM email, or uncheck managed property."
          : "Add surrender date and landlord email above.";
      }
      return;
    }
    if (status) status.textContent = "Scheduling…";
    try {
      const res = await fetch("/api/reminders/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          deadline: deadline.deadline,
          label: draft.property.street || "Deposit deadline",
          jurisdiction: deadline.jurisdiction,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (status) {
          const msg =
            data.error === "email_not_configured"
              ? "Email reminders not enabled on this host yet (Resend)."
              : data.error === "reminders_storage_not_configured"
                ? "Reminder queue not configured on this host (KV)."
                : data.error === "reminders_storage_failed"
                  ? "Reminder queue write failed · try again in a moment."
                  : "Could not schedule  ·  check deadline and email.";
          status.textContent = msg;
        }
        return;
      }
      if (status) status.textContent = `Scheduled ${data.scheduled} reminder(s).`;
    } catch {
      if (status) status.textContent = "Network error  ·  try again.";
    }
  });
  document.getElementById("btn-email-tenant")?.addEventListener("click", async () => {
    readStepIntoDraft();
    if (!canExportPro()) return;
    const deadline = computeDeadline(deadlineInput());
    const to = document.getElementById("tenant-email-send")?.value?.trim() || draft.tenant.email;
    const status = document.getElementById("tenant-email-status");
    const ent = parseSubEntitlement();
    if (!to?.includes("@")) {
      if (status) status.textContent = "Add tenant email on step 2 or above.";
      return;
    }
    if (!ent?.stripe_customer || !ent?.sig) {
      if (status) status.textContent = "Pro subscription not verified in this browser. Open /pricing or use magic link.";
      return;
    }
    if (status) status.textContent = "Sending…";
    const ccLandlord = Boolean(document.getElementById("tenant-email-bcc")?.checked);
    try {
      const res = await fetch("/api/packet/email-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          ccLandlord,
          landlordEmail: draft.landlord.email,
          packet: buildPacketEmailSummary(deadline),
          entitlement: {
            product: ent.product || "Simple Property Tools",
            plan: ent.plan,
            valid_until: ent.valid_until,
            stripe_session: ent.stripe_session,
            stripe_subscription: ent.stripe_subscription,
            stripe_customer: ent.stripe_customer,
            issued_at: ent.issued_at,
            sig: ent.sig,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (status) {
          status.textContent =
            data.error === "email_not_configured"
              ? "Email not enabled on this host yet."
              : data.error === "subscription_inactive"
                ? "Pro inactive · renew on pricing."
                : "Could not send · check email and try again.";
        }
        return;
      }
      if (status) status.textContent = "Tenant copy sent.";
      trackPacketBar("email_tenant");
      draft.tenant.email = to;
      saveDraft(draft);
    } catch {
      if (status) status.textContent = "Network error  ·  try again.";
    }
  });
  document.querySelectorAll(".spt-checkout").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (typeof window.sptStartCheckout === "function") window.sptStartCheckout(btn);
    });
  });
  document.getElementById("btn-copy-return-link")?.addEventListener("click", async () => {
    readStepIntoDraft();
    saveCurrentToLibrary();
    const ok = await copyPlainText(packetReturnUrl());
    if (els.status) {
      els.status.textContent = ok
        ? "Return link copied · opens this packet on step 5 in the same browser profile."
        : "Could not copy · save packet and bookmark /app?packet_id=" + draft.id.slice(0, 8) + "…";
    }
  });
  document.getElementById("btn-copy-unlock-note")?.addEventListener("click", async () => {
    readStepIntoDraft();
    const note = [
      "Deposit Desk unlock (Simple Property Tools)",
      "Packet id: " + draft.id,
      "After payment, return to: " + packetReturnUrl(),
      "If you use a different device, ask your landlord for the packet .json file and tap Import packet file on simple-property.com/app.",
      "Not legal advice.",
    ].join("\n");
    const ok = await copyPlainText(note);
    if (els.status) {
      els.status.textContent = ok ? "Unlock note copied · paste into email or text to payer." : "Could not copy unlock note.";
    }
  });
}

function triggerWizardPrint(kind) {
  readStepIntoDraft();
  if (step < MAX_STEPS) return;
  if (kind === "final" && !canExportPro()) {
    document.getElementById("export-paywall")?.scrollIntoView({ behavior: "smooth", block: "center" });
    sptTrack("unlock_scroll", { state: draft.property.state || "" });
    return;
  }
  const isPreview = kind === "preview";
  window.__sptPrintKind = isPreview ? "preview" : "final";
  renderPrintPacket(isPreview ? "preview" : "final");
  els.printRoot?.scrollIntoView({ behavior: "smooth", block: "start" });
  trackPacketBar("pdf");
  if (!isPreview && canExportPro()) {
    void (async () => {
      try {
        const deadline = computeDeadline(deadlineInput());
        const row = await buildDepositDeskPbsRow({
          draft,
          deadline,
          shareUrl: packetReturnUrl(),
        });
        const receipt_id_hash = await hashReceiptId(row.receipt_id);
        trackIsles("sp_finalize_success", {
          receipt_id_hash,
          verdict: row.verdict || depositDeskVerdict(draft),
          via: "print_final",
        });
      } catch {
        /* telemetry only */
      }
    })();
  }
  window.print();
}

function bindPacketBarFinalize() {
  const bar = document.getElementById("spt-packet-bar");
  if (!bar) return;
  bindPacketBar(bar, {
    printLocked: !canExportPro(),
    getRow: async () => {
      readStepIntoDraft();
      const deadline = computeDeadline(deadlineInput());
      return buildDepositDeskPbsRow({
        draft,
        deadline,
        shareUrl: packetReturnUrl(),
      });
    },
    onPrint: (mode) => triggerWizardPrint(mode),
    onIcs: () => document.getElementById("btn-ics")?.click(),
    onFinalizeAttempt: (row) =>
      trackIsles("sp_finalize_attempt", { verdict: row?.verdict || depositDeskVerdict(draft) }),
    onFinalizeSuccess: ({ receipt_id_hash, verdict }) =>
      trackIsles("sp_finalize_success", { receipt_id_hash, verdict }),
    onFinalizeFail: (reason) => trackIsles("sp_finalize_fail", { reason }),
    onStatus: (msg) => {
      if (els.status) els.status.textContent = msg;
    },
  });
}

function syncPrintAccessClass(previewMode) {
  document.body.classList.remove("spt-no-pro-print", "spt-print-preview");
  if (previewMode || canExportPro()) return;
  document.body.classList.add("spt-no-pro-print");
}

function buildPrintPacketHtml() {
  const deadline = computeDeadline(deadlineInput());
  return buildPrintPacketInnerHtml(draft, deadline, esc);
}

/** @param {"auto"|"preview"|"final"} kind */
function renderPrintPacket(kind = "auto") {
  if (!els.printRoot) return;
  const preview =
    kind === "preview" || (kind === "auto" && !canExportPro());
  const final = kind === "final" || (kind === "auto" && canExportPro());
  if (!preview && !final) return;
  if (kind === "final" && !canExportPro()) return;

  const isPreview = preview && !final;
  syncPrintAccessClass(isPreview);
  document.body.classList.toggle("spt-print-preview", isPreview);
  els.printRoot.classList.toggle("print-packet--preview", isPreview);
  els.printRoot.classList.toggle("spt-preview-locked", isPreview);
  const banner = isPreview
    ? `<p class="print-preview-banner">PREVIEW · NOT FOR TENANT MAIL · UNLOCK AT SIMPLE-PROPERTY.COM</p>`
    : "";
  els.printRoot.innerHTML = `${banner}<div class="print-packet__inner">${buildPrintPacketHtml()}</div>`;
}

function syncExportButtons() {
  const onExport = step >= MAX_STEPS;
  const locked = !canExportPro();
  if (els.printPreview) {
    els.printPreview.hidden = !onExport;
    els.printPreview.disabled = !onExport;
    els.printPreview.classList.toggle("btn-primary", locked);
    els.printPreview.classList.toggle("btn-secondary", !locked);
  }
  if (els.print) {
    els.print.hidden = !onExport;
    els.print.disabled = !onExport;
    els.print.textContent = locked ? "Unlock mail-ready PDF" : "Print / Save PDF";
    els.print.classList.toggle("btn-primary", !locked);
    els.print.classList.toggle("btn-secondary", locked);
  }
}

function publishLiveAgentSnapshot() {
  const deadline = computeDeadline(deadlineInput());
  const sub = parseSubEntitlement();
  const subscriptionMeta = sub
    ? {
        plan: sub.plan,
        valid_until: sub.valid_until,
        product: sub.product,
      }
    : null;
  publishWizardAgentSnapshot(
    buildWizardAgentSnapshot({
      step,
      draft,
      canExport: canExportPro(),
      hasTurnUnlock: hasTurnUnlock(),
      isProSubscription: isProSubscription(),
      isDemoPro: typeof window.sptIsDemoPro === "function" && window.sptIsDemoPro(),
      subscriptionMeta,
      deadline,
      savedPacketCount: listSavedPackets().length,
    })
  );
}

function render() {
  bindWizardKeyboard();
  bindWizardStepNav();
  setStepLabels();
  const appIntro = document.getElementById("app-intro");
  if (appIntro) appIntro.classList.toggle("is-hidden", step > 1);
  const renders = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
  els.panel.setAttribute("data-wizard-step", String(step));
  const stepDef = WIZARD_STEPS.find((s) => s.n === step);
  if (stepDef) els.panel.setAttribute("data-step-key", stepDef.key);
  els.panel.innerHTML = renders[step - 1]();
  if (step === 1) bindStep1Events();
  if (step === 2) bindStep2Events();
  if (step === 3 || step === 4 || step === 5) bindStepEvents();
  renderPrintPacket("auto");
  syncExportButtons();
  if (step === MAX_STEPS && !canExportPro()) {
    sptTrack("paywall_view", { state: draft.property.state || "" });
    const urg = exportDeadlineUrgency(draft.surrenderDate, computeDeadline(deadlineInput()));
    if (urg.urgent) {
      sptTrack("paywall_urgency", {
        state: draft.property.state || "",
        days_left: String(urg.daysLeft ?? ""),
      });
    }
  }
  trackWizardStep();
  els.prev.disabled = step <= 1;
  if (step >= MAX_STEPS) els.next.textContent = "Done";
  else if (step === 4) els.next.textContent = "Continue to export";
  else els.next.textContent = "Continue";
  if (els.status) {
    if (window.__sptStatusMsg) {
      els.status.textContent = window.__sptStatusMsg;
      delete window.__sptStatusMsg;
    } else {
      els.status.textContent = wizardFlowStatusLine();
    }
  }
  publishLiveAgentSnapshot();
  if (step === 5) {
    if (!draft.signatures.landlordPrinted && draft.landlord.name) {
      const sig = document.getElementById("sig-ll");
      if (sig && !sig.value) sig.value = draft.landlord.name;
    }
    if (!draft.signatures.tenantPrinted && draft.tenant.name) {
      const sigTn = document.getElementById("sig-tn");
      if (sigTn && !sigTn.value) sigTn.value = draft.tenant.name;
    }
  }
}

els.prev?.addEventListener("click", () => {
  readStepIntoDraft();
  step = Math.max(1, step - 1);
  render();
  focusStepTitle();
});

els.next?.addEventListener("click", () => {
  if (step >= MAX_STEPS) {
    finishWizard();
    return;
  }
  advanceWizard();
});

els.printPreview?.addEventListener("click", () => {
  triggerWizardPrint("preview");
});

els.print?.addEventListener("click", () => {
  if (!canExportPro()) {
    document.getElementById("export-paywall")?.scrollIntoView({ behavior: "smooth", block: "center" });
    sptTrack("unlock_scroll", { state: draft.property.state || "" });
    return;
  }
  triggerWizardPrint("final");
});

document.getElementById("btn-new-packet")?.addEventListener("click", () => {
  if (!confirm("Start a fresh packet? Save the current one first if needed.")) return;
  draft = emptyDraft();
  saveDraft(draft);
  step = 1;
  render();
});

document.getElementById("btn-duplicate-packet")?.addEventListener("click", duplicateFromLastPacket);

document.getElementById("btn-export-packet")?.addEventListener("click", downloadPacketBackup);

document.getElementById("btn-import-packet")?.addEventListener("click", () => {
  document.getElementById("packet-import-file")?.click();
});

document.getElementById("packet-import-file")?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const report = validatePacketImport(parsed);
    if (!report.ok) {
      if (els.status) {
        els.status.textContent = report.errors[0] || "Could not import packet file.";
      }
      return;
    }
    if (report.warnings.length) {
      const detail = formatImportWarnings(report.warnings);
      const proceed = window.confirm(
        `Import packet with ${report.warnings.length} note(s)?\n\n${detail}\n\nContinue import?`
      );
      if (!proceed) {
        if (els.status) els.status.textContent = "Import cancelled · fix the file or fill missing fields after import.";
        return;
      }
    }
    importPacketBackupObject(report.data);
    if (els.status && report.warnings.length) {
      els.status.textContent = `Imported · ${report.warnings.length} field(s) need review before you mail.`;
    }
  } catch {
    if (els.status) els.status.textContent = "Could not import · use a Deposit Desk packet .json export.";
  }
});

document.getElementById("packet-select")?.addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) return;
  loadPacketById(id);
});

refreshPacketSelect();
(async function bootWizard() {
  consumeConditionHubHandoff({
    draft,
    saveDraft,
    enableTurnoverMode,
    getStep: () => step,
    setStep: (n) => {
      step = n;
    },
    setStatusMsg: (msg) => {
      window.__sptStatusMsg = msg;
    },
  });
  initFromQuery();
  if (typeof window.sptBootstrapEntitlement === "function") {
    try {
      await window.sptBootstrapEntitlement();
    } catch (e) {
      console.warn("spt entitlement", e);
    }
  }
  const bootParams = new URLSearchParams(location.search);
  const attr = typeof window.sptGetAttribution === "function" ? window.sptGetAttribution() : {};
  trackIsles("sp_app_open", {
    ref: (bootParams.get("ref") || attr.ref || "").slice(0, 64),
    utm_source: (attr.utm_source || bootParams.get("utm_source") || "").slice(0, 64),
    utm_campaign: (attr.utm_campaign || "").slice(0, 64),
    landing_path: (attr.landing_path || "").slice(0, 120),
  });
  trackIsles("sp_wizard_start", { template_id: DEPOSIT_DESK_TEMPLATE_ID });
  render();
})();

window.addEventListener("beforeprint", () => {
  readStepIntoDraft();
  const kind = window.__sptPrintKind || (canExportPro() ? "final" : "preview");
  renderPrintPacket(kind);
});
window.addEventListener("afterprint", () => {
  delete window.__sptPrintKind;
  document.body.classList.remove("spt-print-preview");
  renderPrintPacket("auto");
});
