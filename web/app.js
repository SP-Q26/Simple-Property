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
import { PRO_UNITS_MAX, parseUnitCount, unitsWithinProCap } from "./lib/pro-limits.mjs";

const DRAFT_KEY = "spt_draft";
const PACKETS_KEY = "spt_saved_packets";
const MAX_STEPS = 5;
const MAX_PHOTO_BYTES = 400_000;
const MAX_PHOTOS_TOTAL = 1_200_000;

const DEFAULT_ROOMS = [
  "Living room",
  "Kitchen",
  "Bedroom 1",
  "Bedroom 2",
  "Bathroom",
  "Hall / entry",
];

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
    rooms: DEFAULT_ROOMS.map((name) => ({ name, condition: "Good", notes: "", photo: null })),
    deductions: [{ category: "Unpaid rent", description: "", amount: "" }],
    signatures: { landlordPrinted: "", tenantPrinted: "", date: new Date().toISOString().slice(0, 10) },
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
      rooms: parsed.rooms?.length ? parsed.rooms : emptyDraft().rooms,
    };
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
  const label = [draft.property.street, draft.tenant.name].filter(Boolean).join("n/a") || "Packet " + new Date().toLocaleDateString();
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
  saveDraft(draft);
  step = 1;
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

function proBlockMessage() {
  if (!canExportPro()) {
    if (isSubscribed() && !unitsWithinProCap(draft.property.unitCount)) {
      return `<div class="paywall" role="status"><strong>Pro covers up to ${PRO_UNITS_MAX} units.</strong> Lower “units you manage” on step 1, or <a href="mailto:hello@simpleproperty.tools">email us</a> for larger portfolios.</div>`;
    }
    return `<div class="paywall" role="status">
      <strong>Unlock print/PDF for this packet.</strong> Per turn ($29 move-out · $49 full tenancy) or Pro subscription.
      <div class="paywall-actions" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.75rem">
        <button type="button" class="btn btn-primary spt-checkout" data-sku="turn_move_out" data-packet-id="${esc(draft.id)}">Unlock this turn · $29</button>
        <button type="button" class="btn btn-secondary spt-checkout" data-sku="turn_full" data-packet-id="${esc(draft.id)}">Full tenancy · $49</button>
        <a class="btn btn-secondary" href="/pricing">Pro pricing</a>
      </div>
    </div>`;
  }
  return "";
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

let step = 1;
let draft = loadDraft();

function applyPresetStateFromUrl() {
  const params = new URLSearchParams(location.search);
  let code = params.get("state");
  try {
    if (!code) code = sessionStorage.getItem("spt_preset_state");
  } catch {
    /* ignore */
  }
  if (!code) return;
  const normalized = normalizeStateCode(code);
  if (draft.property.state === normalized && !params.get("city")) return;
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
  draft.property.state = code;
  draft.property.cityPreset = "";
  draft.property.inChicago = false;
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
  print: document.getElementById("btn-print"),
  printRoot: document.getElementById("print-packet"),
  status: document.getElementById("wizard-status"),
};

function setStepLabels() {
  if (!els.steps) return;
  els.steps.querySelectorAll("[data-step]").forEach((el) => {
    const n = parseInt(el.getAttribute("data-step"), 10);
    el.classList.toggle("active", n === step);
  });
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
  const overlay = resolveCityOverlay(st, preset);
  const guideLink = overlay?.blogSlug
    ? ` · <a href="/blog/${overlay.blogSlug}">City guide</a>`
    : preset === "chicago-il"
      ? ` · <a href="/blog/chicago-45-day-deposit-deadline">Chicago RLTO guide</a>`
      : "";
  const cityBlock = `
      <div style="grid-column:1/-1">
        <label for="prop-city-preset">Major city (if local rules may apply)</label>
        <select id="prop-city-preset">${citySelectOptions(st, preset)}</select>
        <p class="field-hint" id="prop-city-hint">${cityPresetHint(st, preset)}${guideLink}</p>
      </div>`;
  const clockHint =
    preset === "chicago-il"
      ? `<p class="field-hint">Chicago RLTO: <strong>45 days</strong> after surrender. Elsewhere in Illinois: <strong>30 days</strong> (${pack.cite}).</p>`
      : `<p class="field-hint">${pack.label} default: <strong>${pack.returnDays} days</strong> after surrender (${pack.cite}). Pick a city above when ordinances or registration may differ · confirm with counsel.</p>`;
  return `
    <h2 id="step-title" tabindex="-1">Landlord &amp; property</h2>
    <div class="form-grid two">
      <div><label for="ll-name">Landlord name</label><input id="ll-name" type="text" value="${esc(d.landlord.name)}" autocomplete="name" /></div>
      <div><label for="ll-email">Email</label><input id="ll-email" type="email" value="${esc(d.landlord.email)}" autocomplete="email" /></div>
      <div class="form-grid" style="grid-column:1/-1"><label for="ll-addr">Mailing address</label><input id="ll-addr" type="text" value="${esc(d.landlord.address)}" autocomplete="street-address" /></div>
      <div><label for="prop-state">State</label><select id="prop-state">${stateSelectOptions(st)}</select></div>
      ${cityBlock}
      <div><label for="prop-street">Rental street address</label><input id="prop-street" type="text" value="${esc(d.property.street)}" /></div>
      <div><label for="prop-city">City</label><input id="prop-city" type="text" value="${esc(d.property.city)}" /></div>
      <div><label for="prop-zip">ZIP</label><input id="prop-zip" type="text" value="${esc(d.property.zip)}" /></div>
      <div><label for="prop-units">Units you manage</label><input id="prop-units" type="number" min="1" max="99" value="${esc(d.property.unitCount)}" aria-describedby="prop-units-hint" /></div>
        <p class="field-hint" id="prop-units-hint">Pro license: up to <strong>${PRO_UNITS_MAX} units</strong> per subscription. More doors? Finish the draft free, then contact us before checkout.</p>
      ${clockHint}
    </div>`;
}

function renderStep2() {
  const d = draft;
  return `
    <h2 id="step-title" tabindex="-1">Tenant &amp; lease</h2>
    <div class="form-grid two">
      <div><label for="tn-name">Tenant name</label><input id="tn-name" type="text" value="${esc(d.tenant.name)}" /></div>
      <div><label for="tn-email">Tenant email</label><input id="tn-email" type="email" value="${esc(d.tenant.email)}" autocomplete="email" /><p class="field-hint">Used for “Email copy to tenant” on export (Pro).</p></div>
      <div><label for="lease-start">Lease start</label><input id="lease-start" type="date" value="${esc(d.lease.start)}" /></div>
      <div><label for="lease-end">Lease end</label><input id="lease-end" type="date" value="${esc(d.lease.end)}" /></div>
      <div><label for="dep-amt">Security deposit ($)</label><input id="dep-amt" type="number" min="0" step="0.01" value="${esc(d.deposit.amount)}" /></div>
      <div><label for="dep-held">Deposit held at (bank note)</label><input id="dep-held" type="text" value="${esc(d.deposit.heldAt)}" /></div>
      <div><label for="surrender">Surrender date (keys returned)</label><input id="surrender" type="date" value="${esc(d.surrenderDate)}" /></div>
    </div>`;
}

function renderStep3() {
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
      <div><label>Notes / existing damage</label><textarea class="room-notes">${esc(r.notes)}</textarea></div>
      <div class="photo-cell"><label>Photo (optional)</label>
        <input type="file" class="room-photo" accept="image/jpeg,image/png,image/webp" />
        ${r.photo ? `<img class="photo-thumb" src="${r.photo}" alt="" />` : ""}
      </div>
    </div>`
    )
    .join("");
  return `
    <h2 id="step-title" tabindex="-1">Move-in checklist</h2>
    <p class="field-hint">Photos in-browser · ~400KB each.</p>
    ${rows}
    <button type="button" class="btn btn-secondary" id="btn-add-room">Add room</button>`;
}

function renderStep4() {
  const rows = draft.deductions
    .map(
      (r) => `
    <div class="room-row deduction-row">
      <div><label>Category</label><input type="text" class="ded-cat" value="${esc(r.category)}" placeholder="Damage / Cleaning" /></div>
      <div><label>Description</label><input type="text" class="ded-desc" value="${esc(r.description)}" /></div>
      <div><label>Amount ($)</label><input type="number" class="ded-amt" min="0" step="0.01" value="${esc(r.amount)}" /></div>
    </div>`
    )
    .join("");
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  return `
    <h2 id="step-title" tabindex="-1">Move-out itemization (optional)</h2>
    <p class="field-hint">Line items for your written statement.</p>
    ${rows}
    <button type="button" class="btn btn-secondary" id="btn-add-ded">Add line item</button>
    <div class="deadline-box" style="margin-top:1rem">
      Deposit $${dep.toFixed(2)} · Withheld $${withheld.toFixed(2)} ·
      Return $${Math.max(0, dep - withheld).toFixed(2)}
    </div>`;
}

function renderStep5() {
  const deadline = computeDeadline(deadlineInput());
  const sub = canExportPro();
  const reminderLines = deadline.reminders
    .map((d) => `<li>${formatUsDate(d)}</li>`)
    .join("");
  return `
    <h2 id="step-title" tabindex="-1">Review &amp; export</h2>
    <p><strong>${esc(draft.property.street)}</strong> · ${esc(draft.tenant.name)} · Deposit $${esc(draft.deposit.amount || "0")}</p>
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
        <p class="field-hint">7 days and 1 day before your deadline (requires Pro email on file at checkout).</p>
        <div class="form-grid two">
          <div><label for="rem-email">Email</label><input id="rem-email" type="email" value="${esc(draft.landlord.email)}" autocomplete="email" /></div>
          <div style="align-self:end"><button type="button" class="btn btn-secondary" id="btn-remind">Schedule emails</button></div>
        </div>
        <p class="field-hint" id="rem-status" aria-live="polite"></p>
      </div>`
        : ""
    }
    ${
      isProSubscription()
        ? `<div class="form-panel" style="margin-top:1rem;border-style:dashed">
        <p class="section-label" style="margin-bottom:0.5rem">Email copy to tenant</p>
        <p class="field-hint">Sends a plain-language statement summary (not photos). BCCs your landlord email when checked.</p>
        <div class="form-grid two">
          <div><label for="tenant-email-send">Tenant email</label><input id="tenant-email-send" type="email" value="${esc(draft.tenant.email)}" autocomplete="email" /></div>
          <div style="align-self:end;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
            <label><input id="tenant-email-bcc" type="checkbox" checked /> BCC me (${esc(draft.landlord.email) || "landlord email on step 1"})</label>
            <button type="button" class="btn btn-secondary" id="btn-email-tenant">Send tenant copy</button>
          </div>
        </div>
        <p class="field-hint" id="tenant-email-status" aria-live="polite"></p>
      </div>
      <p class="field-hint" role="status">${hasTurnUnlock() && !isSubscribed() ? "Turn unlock active for this packet · " : ""}${isSubscribed() ? `Pro active · up to ${PRO_UNITS_MAX} units · ` : ""}Print / Save as PDF below.</p>`
        : proBlockMessage() || `<div class="paywall" role="status"><strong>Unlock export below.</strong> <a href="/pricing">Pricing</a></div>`
    }`;
}

function readStepIntoDraft() {
  if (step === 1) {
    draft.landlord.name = document.getElementById("ll-name")?.value?.trim() || "";
    draft.landlord.email = document.getElementById("ll-email")?.value?.trim() || "";
    draft.landlord.address = document.getElementById("ll-addr")?.value?.trim() || "";
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
    draft.rooms = [...document.querySelectorAll(".room-row-photos")].map((row, i) => ({
      name: row.querySelector(".room-name")?.value?.trim() || "Room",
      condition: row.querySelector(".room-condition")?.value || "Good",
      notes: row.querySelector(".room-notes")?.value?.trim() || "",
      photo: draft.rooms[i]?.photo || null,
    }));
  }
  if (step === 4) {
    draft.deductions = [...document.querySelectorAll(".deduction-row")].map((row) => ({
      category: row.querySelector(".ded-cat")?.value?.trim() || "Item",
      description: row.querySelector(".ded-desc")?.value?.trim() || "",
      amount: row.querySelector(".ded-amt")?.value || "",
    }));
  }
  if (step === 5) {
    draft.signatures.landlordPrinted = document.getElementById("sig-ll")?.value?.trim() || "";
    draft.signatures.tenantPrinted = document.getElementById("sig-tn")?.value?.trim() || "";
    draft.signatures.date = document.getElementById("sig-date")?.value || draft.signatures.date;
  }
  saveDraft(draft);
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
  document.getElementById("btn-add-room")?.addEventListener("click", () => {
    readStepIntoDraft();
    draft.rooms.push({ name: "Other", condition: "Good", notes: "", photo: null });
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
        draft.rooms[i] = draft.rooms[i] || { name: "Room", condition: "Good", notes: "", photo: null };
        const nextTotal = photoBytesTotal(draft.rooms) - (draft.rooms[i].photo?.length || 0) + dataUrl.length;
        if (nextTotal > MAX_PHOTOS_TOTAL) {
          alert("Total photo storage cap reached for this packet.");
          return;
        }
        draft.rooms[i].photo = dataUrl;
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

function syncPrintAccessClass() {
  if (canExportPro()) document.body.classList.remove("spt-no-pro-print");
  else document.body.classList.add("spt-no-pro-print");
}

function renderPrintPacket() {
  if (!els.printRoot) return;
  syncPrintAccessClass();
  if (!canExportPro()) {
    els.printRoot.innerHTML = "";
    return;
  }
  const deadline = computeDeadline(deadlineInput());
  const stLabel = STATE_PACKS[normalizeStateCode(draft.property.state)]?.label || "deposit";
  const addr = [draft.property.street, draft.property.city, draft.property.zip].filter(Boolean).join(", ");
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  const roomRows = draft.rooms
    .map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.condition)}</td><td>${esc(r.notes) || "n/a"}</td></tr>`)
    .join("");
  const photoBlock = draft.rooms
    .filter((r) => r.photo)
    .map((r) => `<figure class="print-photo"><figcaption>${esc(r.name)}</figcaption><img src="${r.photo}" alt="" /></figure>`)
    .join("");
  const dedRows = draft.deductions
    .filter((d) => d.amount || d.description)
    .map((d) => `<tr><td>${esc(d.category)}</td><td>${esc(d.description) || "n/a"}</td><td>$${esc(d.amount) || "0"}</td></tr>`)
    .join("");
  els.printRoot.innerHTML = `
    <h2>Deposit Desk · ${esc(stLabel)} deposit packet</h2>
    <p style="font-size:10pt;color:#6b5c4a">Simple Property Tools · Deposit Desk · ${formatUsDate(draft.signatures.date)}</p>
    <p><strong>Property:</strong> ${esc(addr)}<br/>
    <strong>Tenant:</strong> ${esc(draft.tenant.name)} · <strong>Lease:</strong> ${formatUsDate(draft.lease.start)} – ${formatUsDate(draft.lease.end)}<br/>
    <strong>Deposit:</strong> $${dep.toFixed(2)} · <strong>Held:</strong> ${esc(draft.deposit.heldAt) || "n/a"}</p>
    <p><strong>Landlord:</strong> ${esc(draft.landlord.name)} · ${esc(draft.landlord.email)}</p>
    ${deadline.deadline ? `<p><strong>Deadline (${esc(deadline.jurisdiction)}):</strong> ${formatUsDate(deadline.deadline)}</p>` : ""}
    <h3>Move-in condition</h3>
    <table><thead><tr><th>Area</th><th>Condition</th><th>Notes</th></tr></thead><tbody>${roomRows}</tbody></table>
    ${photoBlock ? `<h3>Move-in photos</h3><div class="print-photos">${photoBlock}</div>` : ""}
    ${
      dedRows
        ? `<h3>Itemized deductions</h3><table><thead><tr><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>${dedRows}</tbody></table>
    <p><strong>Total withheld:</strong> $${withheld.toFixed(2)} · <strong>Return to tenant:</strong> $${Math.max(0, dep - withheld).toFixed(2)}</p>`
        : ""
    }
    <p style="font-size:9pt">Documentation only. Not legal advice.</p>
    <div style="display:flex;gap:3rem;margin-top:2rem">
      <div><div class="signature-line">Landlord: ${esc(draft.signatures.landlordPrinted || draft.landlord.name)}</div></div>
      <div><div class="signature-line">Tenant: ${esc(draft.signatures.tenantPrinted || draft.tenant.name)}</div></div>
    </div>`;
}

function render() {
  setStepLabels();
  const renders = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
  els.panel.innerHTML = renders[step - 1]();
  if (step === 1) bindStep1Events();
  if (step === 3 || step === 4 || step === 5) bindStepEvents();
  renderPrintPacket();
  els.prev.disabled = step <= 1;
  els.next.textContent = step >= MAX_STEPS ? "Done" : "Continue";
  els.print.disabled = !canExportPro() || step < MAX_STEPS;
  if (els.status) els.status.textContent = "Autosaved in this browser.";
}

els.prev?.addEventListener("click", () => {
  readStepIntoDraft();
  step = Math.max(1, step - 1);
  render();
});

els.next?.addEventListener("click", () => {
  readStepIntoDraft();
  if (step >= MAX_STEPS) return;
  step += 1;
  render();
});

els.print?.addEventListener("click", () => {
  readStepIntoDraft();
  if (!canExportPro()) {
    els.panel.insertAdjacentHTML(
      "beforeend",
      proBlockMessage() ||
        `<div class="paywall" role="alert">Subscribe on <a href="/pricing">pricing</a> to export.</div>`
    );
    return;
  }
  window.print();
});

document.getElementById("btn-new-packet")?.addEventListener("click", () => {
  if (!confirm("Start a fresh packet? Save the current one first if needed.")) return;
  draft = emptyDraft();
  saveDraft(draft);
  step = 1;
  render();
});

document.getElementById("packet-select")?.addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) return;
  loadPacketById(id);
});

refreshPacketSelect();
render();

window.addEventListener("beforeprint", () => {
  readStepIntoDraft();
  renderPrintPacket();
});
window.addEventListener("afterprint", () => {
  renderPrintPacket();
});
