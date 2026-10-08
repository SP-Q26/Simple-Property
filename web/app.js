import {
  computeDeadline,
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
import { buildPacketAiReport, copyTextForAi } from "./lib/packet-ai-report.mjs";
import { buildWizardAgentSnapshot, publishWizardAgentSnapshot } from "./lib/wizard-agent-snapshot.mjs";
import { PRO_UNITS_MAX, parseUnitCount, unitsWithinProCap } from "./lib/pro-limits.mjs";
import { STATUTE_URLS, CHICAGO_RLTO_URL } from "./lib/statute-urls.mjs";

const DRAFT_KEY = "spt_draft";
const PACKETS_KEY = "spt_saved_packets";
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
    wizardMaxStep: 1,
  };
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
  if (typeof window.sptTrack === "function") window.sptTrack(name, data || {});
}

function proBlockMessage() {
  if (!canExportPro()) {
    if (isSubscribed() && !unitsWithinProCap(draft.property.unitCount)) {
      return `<div class="paywall paywall--streamlined" role="status"><strong>Pro covers up to ${PRO_UNITS_MAX} units.</strong> Lower “units you manage” on step 1, or <a href="mailto:hello@simple-property.com">email us</a> for larger portfolios.</div>`;
    }
    return `<div class="paywall paywall--streamlined" id="export-paywall" role="status">
      <strong>Unlock mail-ready PDF</strong> · one disputed withhold usually costs more than $29.
      <p class="field-hint" style="margin:0.5rem 0 0">Preview is free and watermarked · unlock removes blur for tenant mail. Pro also sends a <strong>tenant email copy</strong> · <a href="/pricing">compare plans</a></p>
      <div class="paywall-actions" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.75rem">
        <button type="button" class="btn btn-primary spt-checkout" data-sku="turn_move_out" data-packet-id="${esc(draft.id)}">Unlock this turn · $29</button>
        <button type="button" class="btn btn-secondary spt-checkout" data-sku="turn_full" data-packet-id="${esc(draft.id)}">Full tenancy · $49</button>
        <a class="btn btn-secondary" href="/pricing">Pro · $22/mo</a>
      </div>
    </div>`;
  }
  return "";
}

function paywallFreeToolsNote() {
  return `<div class="paywall-free-tools" role="note"><strong>Already free:</strong> deadline math · Calendar · .ics · Sheets export · <strong>watermarked preview print</strong> · copy for AI. Unlock once for a <strong>mail-ready PDF</strong> (no watermark).</div>`;
}

function renderMailReadyRoute() {
  return `<div class="mail-route-panel form-panel" id="mail-ready-route">
      <p class="section-label">Mail-ready packet route</p>
      <ol class="mail-route-list">
        <li>Confirm landlord mailing address, tenant name, surrender date, and withhold lines above.</li>
        <li><strong>Preview (watermarked)</strong> in the footer · check layout before you pay.</li>
        <li><strong>Unlock mail-ready PDF</strong> · print or Save as PDF for tenant mail and your files.</li>
        <li>Mail check and itemization together · log certificate of mailing or tracking on your own.</li>
      </ol>
      <p class="ps-fix">Your attorney will thank you for dated, itemized records. Organized packets cut billable hours when a tenant disputes a withhold.</p>
      <p class="field-hint">Not legal advice · Deposit Desk does not mail for you · counsel sets strategy.</p>
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

function renderItemizationPreview(lockedPreview) {
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  const lockClass = lockedPreview ? " itemization-preview--locked" : "";
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
  const stepParam = parseInt(params.get("step") || "0", 10);
  if (stepParam >= 1 && stepParam <= MAX_STEPS) step = stepParam;
  const packetId = params.get("packet_id");
  if (packetId && packetId !== draft.id) {
    const found = listSavedPackets().find((p) => p.id === packetId);
    if (found) {
      draft = { ...emptyDraft(), ...found.data, id: found.id };
      saveDraft(draft);
    } else {
      window.__sptStatusMsg =
        "Paid packet id not in saved list · load the same browser draft or restore from Saved packets.";
    }
  }
  if (params.get("checkout") === "cancel") {
    window.__sptStatusMsg = "Checkout canceled · draft still saved · unlock anytime from step 5.";
  }
}

let step = 1;
let draft = loadDraft();

function applyPresetStateFromUrl() {
  const params = new URLSearchParams(location.search);
  const urlState = params.get("state");
  let code = urlState;
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
    if (step >= MAX_STEPS) return;
    e.preventDefault();
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
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step || (n <= max && n !== step));
    el.setAttribute("aria-selected", n === step ? "true" : "false");
    el.disabled = n > max;
    el.setAttribute("aria-disabled", n > max ? "true" : "false");
  });
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

function statuteClockDetails(st, pack, preset) {
  const guideLink = overlayGuideLink(st, preset);
  const inner =
    preset === "chicago-il"
      ? `<p class="field-hint">Chicago RLTO: <strong>45 days</strong> after surrender (<a href="${esc(CHICAGO_RLTO_URL)}" rel="noopener noreferrer" target="_blank">city RLTO</a>). Elsewhere in Illinois: <strong>30 days</strong> (${citeLink(st, pack.cite)}).</p>`
      : st === "NC"
        ? `<p class="field-hint">${pack.label} wizard uses a <strong>${pack.returnDays}-day</strong> default after surrender (${citeLink(st, pack.cite)}). Some tenancies also have interim/final return phases · see <a href="/blog/north-carolina-interim-30-final-60-deposit">NC pain guide</a> · confirm with counsel.</p>`
        : st === "FL"
          ? `<p class="field-hint">Florida (${citeLink(st, pack.cite)}): within <strong>15 days</strong> after termination and possession, return the full deposit <strong>or</strong> send written claim notice · then <strong>30 days</strong> after notice for the balance and accounting. Deposit Desk shows a <strong>30-day</strong> export line from surrender for step-two discipline · see <a href="/blog/florida-83-49-two-step-miami-condo-deposit">§ 83.49 two-step guide</a> · confirm with counsel.</p>`
          : `<p class="field-hint">${pack.label} default: <strong>${pack.returnDays} days</strong> after surrender (${citeLink(st, pack.cite)}). Pick a city above when ordinances or registration may differ · confirm with counsel.</p>`;
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
    <h2 id="step-title" tabindex="-1">Rental property</h2>
    <p class="field-hint">Start with the unit and state rules · landlord details land on export for your mailed packet.</p>
    <div class="form-grid two wizard-flow-grid">
      <div><label for="prop-state">State</label><select id="prop-state">${stateSelectOptions(st)}</select></div>
      ${cityBlock}
      <div style="grid-column:1/-1"><label for="prop-street">Rental street address</label><input id="prop-street" type="text" value="${esc(d.property.street)}" autocomplete="street-address" /></div>
      <div><label for="prop-city">City</label><input id="prop-city" type="text" value="${esc(d.property.city)}" autocomplete="address-level2" /></div>
      <div><label for="prop-zip">ZIP</label><input id="prop-zip" type="text" value="${esc(d.property.zip)}" autocomplete="postal-code" inputmode="numeric" /></div>
      <div><label for="prop-units">Units you manage</label><input id="prop-units" type="number" min="1" max="99" value="${esc(d.property.unitCount)}" aria-describedby="prop-units-hint" /></div>
      <p class="field-hint" id="prop-units-hint" style="grid-column:1/-1">Pro license: up to <strong>${PRO_UNITS_MAX} units</strong> per subscription.</p>
      ${statuteClockDetails(st, pack, preset)}
      <p class="field-hint step-loss-kicker" style="grid-column:1/-1">Miss the return window or export without move-in proof · dispute cost usually beats $29–$99 tool fees.</p>
    </div>`;
}

function renderStep2() {
  const d = draft;
  const deadline = computeDeadline(deadlineInput());
  const clockLine = deadline.deadline
    ? `<p class="deadline-box deadline-box--inline" role="status"><strong>Return / itemize by:</strong> ${formatUsDate(deadline.deadline)} · ${deadline.days} days (${esc(deadline.jurisdiction)})</p>`
    : `<p class="field-hint" role="status">Add surrender below to see your statutory clock.</p>`;
  return `
    <h2 id="step-title" tabindex="-1">Turnover &amp; clock</h2>
    <p class="field-hint">Surrender drives the deadline · deposit and tenant ID the packet.</p>
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
    <h2 id="step-title" tabindex="-1">Move-out itemization</h2>
    <p class="field-hint">Line items for your written statement · do this before move-in proof when you are at move-out. <a href="${guide}">Wear vs damage guide</a></p>
    <div class="wizard-speed-row">
      <button type="button" class="btn btn-primary" id="btn-full-return">Full deposit return</button>
      <span class="field-hint">No withholds · jumps to move-in proof</span>
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
  const roomsOpen = hasRoomDetail || Boolean(draft.photoAlbumLink);
  return `
    <h2 id="step-title" tabindex="-1">Move-in proof (optional)</h2>
    <p class="field-hint">Fast path: paste one folder link · skip room grid if you already have cloud proof.</p>
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
  const reminderLines = deadline.reminders
    .map((d) => `<li>${formatUsDate(d)}</li>`)
    .join("");
  const d = draft;
  return `
    <h2 id="step-title" tabindex="-1">Review &amp; export</h2>
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
    ${renderMailReadyRoute()}
    ${!canExportPro() ? paywallFreeToolsNote() : ""}
    ${renderItemizationPreview(!canExportPro())}
    ${canExportPro() ? exportEntitlementSection() : proBlockMessage()}
    <p style="margin:var(--space-4) 0 var(--space-2)">
      <button type="button" class="btn btn-secondary" id="btn-copy-ai">Copy for AI assistant</button>
    </p>
    <p class="field-hint">Markdown summary in your clipboard · Dropbox/Drive links included · no photo bytes · paste into ChatGPT, Claude, or any LLM you already pay for. Not legal advice.</p>
    <div class="form-grid two">
      <div><label for="sig-ll">Landlord printed name</label><input id="sig-ll" type="text" value="${esc(draft.signatures.landlordPrinted)}" /></div>
      <div><label for="sig-tn">Tenant printed name</label><input id="sig-tn" type="text" value="${esc(draft.signatures.tenantPrinted)}" /></div>
      <div><label for="sig-date">Document date</label><input id="sig-date" type="date" value="${esc(draft.signatures.date)}" /></div>
    </div>
    <button type="button" class="btn btn-secondary" id="btn-save-packet">Save packet to this browser</button>
    ${
      deadline.deadline
        ? `<div class="form-panel" style="margin-top:1rem;border-style:dashed">
        <p class="section-label" style="margin-bottom:0.5rem">Email reminders</p>
        <p class="field-hint">7 days and 1 day before your deadline (uses the email you enter below · stored for reminders only).</p>
        <div class="form-grid two">
          <div><label for="rem-email">Email</label><input id="rem-email" type="email" value="${esc(draft.landlord.email)}" autocomplete="email" /></div>
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
    const rem = document.getElementById("rem-email");
    if (rem?.value?.trim()) draft.landlord.email = rem.value.trim();
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
    draft.wizardMaxStep = Math.max(maxWizardStep(), 4);
    saveDraft(draft);
    step = 4;
    render();
    focusStepField();
    if (els.status) els.status.textContent = "Full return noted · add move-in link if you have one, or skip to export.";
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
  document.getElementById("btn-remind")?.addEventListener("click", async () => {
    readStepIntoDraft();
    const deadline = computeDeadline(deadlineInput());
    const email = document.getElementById("rem-email")?.value?.trim();
    const status = document.getElementById("rem-status");
    if (!deadline.deadline || !email) {
      if (status) status.textContent = "Add surrender date and email.";
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
        if (status)
          status.textContent =
            data.error === "email_not_configured"
              ? "Email reminders not enabled on this host yet."
              : "Could not schedule  ·  check deadline and email.";
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
}

function syncPrintAccessClass(previewMode) {
  document.body.classList.remove("spt-no-pro-print", "spt-print-preview");
  if (previewMode || canExportPro()) return;
  document.body.classList.add("spt-no-pro-print");
}

function buildPrintPacketInnerHtml() {
  const deadline = computeDeadline(deadlineInput());
  const stLabel = STATE_PACKS[normalizeStateCode(draft.property.state)]?.label || "deposit";
  const addr = [draft.property.street, draft.property.city, draft.property.zip].filter(Boolean).join(", ");
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  const roomRows = draft.rooms
    .map((r) => {
      const noteParts = [r.notes || ""];
      if (r.photoFileName) noteParts.push(`File: ${r.photoFileName}`);
      if (r.photoCapturedAt) noteParts.push(`Captured: ${r.photoCapturedAt.slice(0, 10)}`);
      if (r.photoLink) noteParts.push(`Photo link: ${r.photoLink}`);
      const noteCell = noteParts.filter(Boolean).join(" · ") || "n/a";
      return `<tr><td>${esc(r.name)}</td><td>${esc(r.condition)}</td><td>${esc(noteCell)}</td></tr>`;
    })
    .join("");
  const photoBlock = draft.rooms
    .filter((r) => r.photo)
    .map(
      (r) =>
        `<figure class="print-photo"><figcaption>${esc(r.name)}${r.photoFileName ? ` · ${esc(r.photoFileName)}` : ""}</figcaption><img src="${r.photo}" alt="" /></figure>`
    )
    .join("");
  const dedRows = draft.deductions
    .filter((d) => d.amount || d.description)
    .map((d) => `<tr><td>${esc(d.category)}</td><td>${esc(d.description) || "n/a"}</td><td>$${esc(d.amount) || "0"}</td></tr>`)
    .join("");
  return `
    <h2>Deposit Desk · ${esc(stLabel)} deposit packet</h2>
    <p style="font-size:10pt;color:#6b5c4a">Simple Property Tools · Deposit Desk · ${formatUsDate(draft.signatures.date)}</p>
    <p><strong>Property:</strong> ${esc(addr)}<br/>
    <strong>Tenant:</strong> ${esc(draft.tenant.name)} · <strong>Lease:</strong> ${formatUsDate(draft.lease.start)} – ${formatUsDate(draft.lease.end)}<br/>
    <strong>Deposit:</strong> $${dep.toFixed(2)} · <strong>Held:</strong> ${esc(draft.deposit.heldAt) || "n/a"}</p>
    <p><strong>Landlord:</strong> ${esc(draft.landlord.name)} · ${esc(draft.landlord.email)}<br/>
    <strong>Mailing address:</strong> ${esc(draft.landlord.address) || "n/a"}</p>
    ${deadline.deadline ? `<p><strong>Deadline (${esc(deadline.jurisdiction)}):</strong> ${formatUsDate(deadline.deadline)}</p>` : ""}
    ${draft.photoAlbumLink ? `<p><strong>Move-in photo folder:</strong> ${esc(draft.photoAlbumLink)}</p>` : ""}
    <h3>Move-in condition</h3>
    <table><thead><tr><th>Area</th><th>Condition</th><th>Notes</th></tr></thead><tbody>${roomRows}</tbody></table>
    ${photoBlock ? `<h3>Move-in photos</h3><div class="print-photos print-photos--sensitive">${photoBlock}</div>` : ""}
    ${
      dedRows
        ? `<h3>Itemized deductions</h3><table><thead><tr><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>${dedRows}</tbody></table>
    <p><strong>Total withheld:</strong> $${withheld.toFixed(2)} · <strong>Return to tenant:</strong> $${Math.max(0, dep - withheld).toFixed(2)}</p>`
        : ""
    }
    <p style="font-size:9pt">Documentation only. Not legal advice.</p>
    <p style="font-size:8pt;color:#6b5c4a;margin-top:0.75rem">Packet prepared with Deposit Desk · simple-property.com · Packet ${esc(draft.id.slice(0, 8))}</p>
    <div style="display:flex;gap:3rem;margin-top:2rem">
      <div><div class="signature-line">Landlord: ${esc(draft.signatures.landlordPrinted || draft.landlord.name)}</div></div>
      <div><div class="signature-line">Tenant: ${esc(draft.signatures.tenantPrinted || draft.tenant.name)}</div></div>
    </div>`;
}

/** @param {"auto"|"preview"|"final"} kind */
function renderPrintPacket(kind = "auto") {
  if (!els.printRoot) return;
  const preview =
    kind === "preview" || (kind === "auto" && !canExportPro());
  const final = kind === "final" || (kind === "auto" && canExportPro());
  if (!preview && !final) return;
  if (kind === "final" && !canExportPro()) return;

  syncPrintAccessClass(preview && !final);
  els.printRoot.classList.toggle("print-packet--preview", preview && !final);
  const banner = preview && !final
    ? `<p class="print-preview-banner" aria-hidden="true">PREVIEW · NOT FOR TENANT MAIL · UNLOCK MAIL-READY PDF AT SIMPLE-PROPERTY.COM</p>`
    : "";
  els.printRoot.innerHTML = `${banner}<div class="print-packet__inner">${buildPrintPacketInnerHtml()}</div>`;
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
  const renders = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
  els.panel.innerHTML = renders[step - 1]();
  if (step === 1) bindStep1Events();
  if (step === 2) bindStep2Events();
  if (step === 3 || step === 4 || step === 5) bindStepEvents();
  renderPrintPacket("auto");
  syncExportButtons();
  if (step === MAX_STEPS && !canExportPro()) {
    sptTrack("paywall_view", { state: draft.property.state || "" });
  }
  sptTrack("wizard_step", { step: String(step), state: draft.property.state || "" });
  els.prev.disabled = step <= 1;
  if (step >= MAX_STEPS) els.next.textContent = "Done";
  else if (step === 4) els.next.textContent = "Continue to export";
  else els.next.textContent = "Continue";
  if (els.status) {
    if (window.__sptStatusMsg) {
      els.status.textContent = window.__sptStatusMsg;
      delete window.__sptStatusMsg;
    } else {
      els.status.textContent = "Autosaved in this browser.";
    }
  }
  publishLiveAgentSnapshot();
  if (!draft.signatures.landlordPrinted && draft.landlord.name && step === 5) {
    const sig = document.getElementById("sig-ll");
    if (sig && !sig.value) sig.value = draft.landlord.name;
  }
}

els.prev?.addEventListener("click", () => {
  readStepIntoDraft();
  step = Math.max(1, step - 1);
  render();
  focusStepTitle();
});

els.next?.addEventListener("click", () => {
  advanceWizard();
});

els.printPreview?.addEventListener("click", () => {
  readStepIntoDraft();
  if (step < MAX_STEPS) return;
  window.__sptPrintKind = "preview";
  renderPrintPacket("preview");
  sptTrack("preview_print", { state: draft.property.state || "" });
  window.print();
});

els.print?.addEventListener("click", () => {
  readStepIntoDraft();
  if (step < MAX_STEPS) return;
  if (!canExportPro()) {
    document.getElementById("export-paywall")?.scrollIntoView({ behavior: "smooth", block: "center" });
    sptTrack("unlock_scroll", { state: draft.property.state || "" });
    return;
  }
  window.__sptPrintKind = "final";
  renderPrintPacket("final");
  sptTrack("print_final", { state: draft.property.state || "" });
  window.print();
});

document.getElementById("btn-new-packet")?.addEventListener("click", () => {
  if (!confirm("Start a fresh packet? Save the current one first if needed.")) return;
  draft = emptyDraft();
  saveDraft(draft);
  step = 1;
  render();
});

document.getElementById("btn-duplicate-packet")?.addEventListener("click", duplicateFromLastPacket);

document.getElementById("packet-select")?.addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) return;
  loadPacketById(id);
});

refreshPacketSelect();
(async function bootWizard() {
  initFromQuery();
  if (typeof window.sptBootstrapEntitlement === "function") {
    try {
      await window.sptBootstrapEntitlement();
    } catch (e) {
      console.warn("spt entitlement", e);
    }
  }
  sptTrack("wizard_start", { state: draft.property.state || "" });
  render();
})();

window.addEventListener("beforeprint", () => {
  readStepIntoDraft();
  const kind = window.__sptPrintKind || (canExportPro() ? "final" : "preview");
  renderPrintPacket(kind);
});
window.addEventListener("afterprint", () => {
  delete window.__sptPrintKind;
  renderPrintPacket("auto");
});
