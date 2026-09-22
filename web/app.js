import { computeDeadline, formatUsDate } from "./lib/il-deposit-rules.mjs";
import { buildDeadlineIcs, downloadIcs } from "./lib/deadline-ics.mjs";
import {
  buildPacketSheetsCsv,
  downloadCsv,
  googleCalendarAddUrl,
  googleCalendarReminderUrls,
  openGoogleCalendar,
} from "./lib/google-tools.mjs";

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
    property: { street: "", city: "", zip: "", inChicago: false, unitCount: 1 },
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
    return {
      ...emptyDraft(),
      ...parsed,
      deductions: parsed.deductions?.length ? parsed.deductions : emptyDraft().deductions,
      rooms: parsed.rooms?.length ? parsed.rooms : emptyDraft().rooms,
    };
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

function sumDeductions(list) {
  return list.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
}

function photoBytesTotal(rooms) {
  return rooms.reduce((acc, r) => acc + (r.photo?.length || 0), 0);
}

let step = 1;
let draft = loadDraft();

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
  return `
    <h2 id="step-title" tabindex="-1">Landlord &amp; property</h2>
    <div class="form-grid two">
      <div><label for="ll-name">Landlord name</label><input id="ll-name" type="text" value="${esc(d.landlord.name)}" autocomplete="name" /></div>
      <div><label for="ll-email">Email</label><input id="ll-email" type="email" value="${esc(d.landlord.email)}" autocomplete="email" /></div>
      <div class="form-grid" style="grid-column:1/-1"><label for="ll-addr">Mailing address</label><input id="ll-addr" type="text" value="${esc(d.landlord.address)}" autocomplete="street-address" /></div>
      <div><label for="prop-street">Rental street address</label><input id="prop-street" type="text" value="${esc(d.property.street)}" /></div>
      <div><label for="prop-city">City</label><input id="prop-city" type="text" value="${esc(d.property.city)}" /></div>
      <div><label for="prop-zip">ZIP</label><input id="prop-zip" type="text" value="${esc(d.property.zip)}" /></div>
      <div><label for="prop-units">Units you manage</label><input id="prop-units" type="number" min="1" max="99" value="${esc(d.property.unitCount)}" /></div>
      <div>
        <label><input id="prop-chicago" type="checkbox" ${d.property.inChicago ? "checked" : ""} /> Property is in Chicago (RLTO)</label>
        <p class="field-hint">Chicago RLTO: <strong>45 days</strong> · elsewhere IL: <strong>30 days</strong> after surrender (765 ILCS 715/).</p>
      </div>
    </div>`;
}

function renderStep2() {
  const d = draft;
  return `
    <h2 id="step-title" tabindex="-1">Tenant &amp; lease</h2>
    <div class="form-grid two">
      <div><label for="tn-name">Tenant name</label><input id="tn-name" type="text" value="${esc(d.tenant.name)}" /></div>
      <div><label for="tn-email">Tenant email (optional)</label><input id="tn-email" type="email" value="${esc(d.tenant.email)}" /></div>
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
  const deadline = computeDeadline({
    surrenderDate: draft.surrenderDate,
    inChicago: draft.property.inChicago,
  });
  const sub = isSubscribed();
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
      sub
        ? `<p class="field-hint" role="status">Pro active · Print / Save as PDF below.</p>`
        : `<div class="paywall" role="status"><strong>Pro required for export.</strong> <a href="/pricing">Pricing</a></div>`
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
    draft.property.unitCount = parseInt(document.getElementById("prop-units")?.value, 10) || 1;
    draft.property.inChicago = Boolean(document.getElementById("prop-chicago")?.checked);
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
        alert("Photo too large — use a smaller image (max ~400KB).");
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
    const deadline = computeDeadline({
      surrenderDate: draft.surrenderDate,
      inChicago: draft.property.inChicago,
    });
    if (!deadline.deadline) return;
    const addr = [draft.property.street, draft.property.city].filter(Boolean).join(", ");
    const url = googleCalendarAddUrl({
      title: `Deposit return/itemize · ${draft.property.street || "rental"}`,
      startIso: deadline.deadline,
      location: addr,
      details: `${deadline.jurisdiction}. Surrender ${draft.surrenderDate || "—"}. Deposit Desk · not legal advice.`,
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
    const deadline = computeDeadline({
      surrenderDate: draft.surrenderDate,
      inChicago: draft.property.inChicago,
    });
    const csv = buildPacketSheetsCsv(draft, deadline);
    const slug = (draft.property.street || "unit").replace(/[^\w]+/g, "-").slice(0, 40);
    downloadCsv(`deposit-desk-${slug}.csv`, csv);
    if (els.status) els.status.textContent = "CSV saved · Google Sheets → File → Import → Upload.";
  });
  document.getElementById("btn-ics")?.addEventListener("click", () => {
    readStepIntoDraft();
    const deadline = computeDeadline({
      surrenderDate: draft.surrenderDate,
      inChicago: draft.property.inChicago,
    });
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
    const deadline = computeDeadline({
      surrenderDate: draft.surrenderDate,
      inChicago: draft.property.inChicago,
    });
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (status)
          status.textContent =
            data.error === "email_not_configured"
              ? "Email reminders not enabled on this host yet."
              : "Could not schedule — check deadline and email.";
        return;
      }
      if (status) status.textContent = `Scheduled ${data.scheduled} reminder(s).`;
    } catch {
      if (status) status.textContent = "Network error — try again.";
    }
  });
}

function renderPrintPacket() {
  if (!els.printRoot) return;
  const deadline = computeDeadline({
    surrenderDate: draft.surrenderDate,
    inChicago: draft.property.inChicago,
  });
  const addr = [draft.property.street, draft.property.city, draft.property.zip].filter(Boolean).join(", ");
  const dep = parseFloat(draft.deposit.amount) || 0;
  const withheld = sumDeductions(draft.deductions);
  const roomRows = draft.rooms
    .map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.condition)}</td><td>${esc(r.notes) || "—"}</td></tr>`)
    .join("");
  const photoBlock = draft.rooms
    .filter((r) => r.photo)
    .map((r) => `<figure class="print-photo"><figcaption>${esc(r.name)}</figcaption><img src="${r.photo}" alt="" /></figure>`)
    .join("");
  const dedRows = draft.deductions
    .filter((d) => d.amount || d.description)
    .map((d) => `<tr><td>${esc(d.category)}</td><td>${esc(d.description) || "—"}</td><td>$${esc(d.amount) || "0"}</td></tr>`)
    .join("");
  els.printRoot.innerHTML = `
    <h2>Homestead · Illinois deposit packet</h2>
    <p style="font-size:10pt;color:#6b5c4a">Simple Property Tools · Deposit Desk · ${formatUsDate(draft.signatures.date)}</p>
    <p><strong>Property:</strong> ${esc(addr)}<br/>
    <strong>Tenant:</strong> ${esc(draft.tenant.name)} · <strong>Lease:</strong> ${formatUsDate(draft.lease.start)} – ${formatUsDate(draft.lease.end)}<br/>
    <strong>Deposit:</strong> $${dep.toFixed(2)} · <strong>Held:</strong> ${esc(draft.deposit.heldAt) || "—"}</p>
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
    <p style="font-size:9pt">Documentation only · not legal advice.</p>
    <div style="display:flex;gap:3rem;margin-top:2rem">
      <div><div class="signature-line">Landlord: ${esc(draft.signatures.landlordPrinted || draft.landlord.name)}</div></div>
      <div><div class="signature-line">Tenant: ${esc(draft.signatures.tenantPrinted || draft.tenant.name)}</div></div>
    </div>`;
}

function render() {
  setStepLabels();
  const renders = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
  els.panel.innerHTML = renders[step - 1]();
  if (step === 3 || step === 4 || step === 5) bindStepEvents();
  renderPrintPacket();
  els.prev.disabled = step <= 1;
  els.next.textContent = step >= MAX_STEPS ? "Done" : "Continue";
  els.print.disabled = !isSubscribed() || step < MAX_STEPS;
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
  if (!isSubscribed()) {
    els.panel.insertAdjacentHTML(
      "beforeend",
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
