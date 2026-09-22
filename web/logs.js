import {
  LOG_KEYS,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  TICKET_CHANNELS,
  TICKET_STATUSES,
  INSPECTION_KINDS,
  INSPECTION_STATUSES,
  deleteEntry,
  downloadCsv,
  loadEntries,
  newId,
  upsertEntry,
} from "./lib/operator-logs.mjs";

const tabs = [
  { id: "maintenance", label: "Maintenance" },
  { id: "tickets", label: "Tickets" },
  { id: "inspections", label: "Inspections & complaints" },
];

let activeTab = "maintenance";
let filterText = "";
let editingId = null;

const els = {
  tabs: document.getElementById("log-tabs"),
  panel: document.getElementById("log-panel"),
  list: document.getElementById("log-list"),
  filter: document.getElementById("log-filter"),
  status: document.getElementById("log-status"),
  export: document.getElementById("btn-export-csv"),
  print: document.getElementById("btn-print-log"),
};

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function setStatus(msg) {
  if (els.status) els.status.textContent = msg;
}

function matchesFilter(entry) {
  if (!filterText) return true;
  const hay = JSON.stringify(entry).toLowerCase();
  return hay.includes(filterText.toLowerCase());
}

function readFormMaintenance() {
  return {
    id: editingId || newId("mnt"),
    unit: document.getElementById("mnt-unit")?.value?.trim() || "",
    reportedDate: document.getElementById("mnt-date")?.value || todayIso(),
    category: document.getElementById("mnt-cat")?.value?.trim() || "General",
    description: document.getElementById("mnt-desc")?.value?.trim() || "",
    vendor: document.getElementById("mnt-vendor")?.value?.trim() || "",
    cost: document.getElementById("mnt-cost")?.value?.trim() || "",
    status: document.getElementById("mnt-status")?.value || "Open",
    priority: document.getElementById("mnt-priority")?.value || "Normal",
    notes: document.getElementById("mnt-notes")?.value?.trim() || "",
    createdAt: editingId
      ? loadEntries(LOG_KEYS.maintenance).find((e) => e.id === editingId)?.createdAt ||
        new Date().toISOString()
      : new Date().toISOString(),
  };
}

function readFormTicket() {
  return {
    id: editingId || newId("tkt"),
    unit: document.getElementById("tkt-unit")?.value?.trim() || "",
    reportedDate: document.getElementById("tkt-date")?.value || todayIso(),
    reportedBy: document.getElementById("tkt-by")?.value?.trim() || "",
    channel: document.getElementById("tkt-channel")?.value || "Email",
    subject: document.getElementById("tkt-subject")?.value?.trim() || "",
    detail: document.getElementById("tkt-detail")?.value?.trim() || "",
    assigned: document.getElementById("tkt-assigned")?.value?.trim() || "",
    status: document.getElementById("tkt-status")?.value || "New",
    resolvedDate: document.getElementById("tkt-resolved")?.value || "",
    createdAt: editingId
      ? loadEntries(LOG_KEYS.tickets).find((e) => e.id === editingId)?.createdAt ||
        new Date().toISOString()
      : new Date().toISOString(),
  };
}

function readFormInspection() {
  return {
    id: editingId || newId("ins"),
    unit: document.getElementById("ins-unit")?.value?.trim() || "",
    eventDate: document.getElementById("ins-date")?.value || todayIso(),
    kind: document.getElementById("ins-kind")?.value || "Inspection",
    party: document.getElementById("ins-party")?.value?.trim() || "",
    summary: document.getElementById("ins-summary")?.value?.trim() || "",
    status: document.getElementById("ins-status")?.value || "Logged",
    followUp: Boolean(document.getElementById("ins-follow")?.checked),
    reference: document.getElementById("ins-ref")?.value?.trim() || "",
    createdAt: editingId
      ? loadEntries(LOG_KEYS.inspections).find((e) => e.id === editingId)?.createdAt ||
        new Date().toISOString()
      : new Date().toISOString(),
  };
}

function options(list, selected) {
  return list.map((v) => `<option ${v === selected ? "selected" : ""}>${esc(v)}</option>`).join("");
}

function renderForm() {
  if (activeTab === "maintenance") {
    return `
    <form class="log-form" id="log-form">
      <div class="form-grid two">
        <div><label for="mnt-unit">Unit / address</label><input id="mnt-unit" type="text" required /></div>
        <div><label for="mnt-date">Reported date</label><input id="mnt-date" type="date" value="${todayIso()}" /></div>
        <div><label for="mnt-cat">Category</label><input id="mnt-cat" type="text" placeholder="Plumbing, HVAC, …" /></div>
        <div><label for="mnt-priority">Priority</label><select id="mnt-priority">${options(MAINTENANCE_PRIORITIES, "Normal")}</select></div>
        <div class="form-grid" style="grid-column:1/-1"><label for="mnt-desc">Issue</label><textarea id="mnt-desc" rows="2"></textarea></div>
        <div><label for="mnt-vendor">Vendor</label><input id="mnt-vendor" type="text" /></div>
        <div><label for="mnt-cost">Cost ($)</label><input id="mnt-cost" type="number" min="0" step="0.01" /></div>
        <div><label for="mnt-status">Status</label><select id="mnt-status">${options(MAINTENANCE_STATUSES, "Open")}</select></div>
        <div class="form-grid" style="grid-column:1/-1"><label for="mnt-notes">Notes</label><textarea id="mnt-notes" rows="2"></textarea></div>
      </div>
      <div class="log-form-actions">
        <button type="submit" class="btn btn-primary">${editingId ? "Update entry" : "Add maintenance log"}</button>
        ${editingId ? `<button type="button" class="btn btn-secondary" id="btn-cancel-edit">Cancel edit</button>` : ""}
      </div>
    </form>`;
  }
  if (activeTab === "tickets") {
    return `
    <form class="log-form" id="log-form">
      <div class="form-grid two">
        <div><label for="tkt-unit">Unit / address</label><input id="tkt-unit" type="text" required /></div>
        <div><label for="tkt-date">Reported date</label><input id="tkt-date" type="date" value="${todayIso()}" /></div>
        <div><label for="tkt-by">Reported by</label><input id="tkt-by" type="text" placeholder="Tenant name" /></div>
        <div><label for="tkt-channel">Channel</label><select id="tkt-channel">${options(TICKET_CHANNELS, "Email")}</select></div>
        <div class="form-grid" style="grid-column:1/-1"><label for="tkt-subject">Subject</label><input id="tkt-subject" type="text" /></div>
        <div class="form-grid" style="grid-column:1/-1"><label for="tkt-detail">Details</label><textarea id="tkt-detail" rows="2"></textarea></div>
        <div><label for="tkt-assigned">Assigned to</label><input id="tkt-assigned" type="text" placeholder="You, vendor, …" /></div>
        <div><label for="tkt-status">Status</label><select id="tkt-status">${options(TICKET_STATUSES, "New")}</select></div>
        <div><label for="tkt-resolved">Resolved date</label><input id="tkt-resolved" type="date" /></div>
      </div>
      <div class="log-form-actions">
        <button type="submit" class="btn btn-primary">${editingId ? "Update ticket" : "Add ticket"}</button>
        ${editingId ? `<button type="button" class="btn btn-secondary" id="btn-cancel-edit">Cancel edit</button>` : ""}
      </div>
    </form>`;
  }
  return `
    <form class="log-form" id="log-form">
      <div class="form-grid two">
        <div><label for="ins-unit">Unit / address</label><input id="ins-unit" type="text" required /></div>
        <div><label for="ins-date">Event date</label><input id="ins-date" type="date" value="${todayIso()}" /></div>
        <div><label for="ins-kind">Type</label><select id="ins-kind">${options(INSPECTION_KINDS, "Inspection")}</select></div>
        <div><label for="ins-status">Status</label><select id="ins-status">${options(INSPECTION_STATUSES, "Logged")}</select></div>
        <div><label for="ins-party">Who (tenant, inspector, city)</label><input id="ins-party" type="text" /></div>
        <div><label for="ins-ref">Reference # (311, case, …)</label><input id="ins-ref" type="text" /></div>
        <div class="form-grid" style="grid-column:1/-1"><label for="ins-summary">Summary</label><textarea id="ins-summary" rows="3"></textarea></div>
        <div><label><input id="ins-follow" type="checkbox" /> Follow-up required</label></div>
      </div>
      <div class="log-form-actions">
        <button type="submit" class="btn btn-primary">${editingId ? "Update entry" : "Add log entry"}</button>
        ${editingId ? `<button type="button" class="btn btn-secondary" id="btn-cancel-edit">Cancel edit</button>` : ""}
      </div>
    </form>`;
}

function storageKey() {
  return LOG_KEYS[activeTab];
}

function renderList() {
  const entries = loadEntries(storageKey()).filter(matchesFilter);
  if (!entries.length) {
    els.list.innerHTML = `<p class="field-hint">No entries yet · add one above. Stored in this browser only.</p>`;
    return;
  }
  if (activeTab === "maintenance") {
    els.list.innerHTML = `
      <div class="log-table-wrap">
        <table class="log-table">
          <thead><tr><th>Date</th><th>Unit</th><th>Issue</th><th>Status</th><th>Priority</th><th></th></tr></thead>
          <tbody>
            ${entries
              .map(
                (e) => `<tr>
                  <td>${esc(e.reportedDate)}</td>
                  <td>${esc(e.unit)}</td>
                  <td>${esc(e.category)} · ${esc(e.description) || "n/a"}</td>
                  <td><span class="log-badge">${esc(e.status)}</span></td>
                  <td>${esc(e.priority)}</td>
                  <td class="log-row-actions">
                    <button type="button" class="btn btn-secondary btn-compact" data-edit="${esc(e.id)}">Edit</button>
                    <button type="button" class="btn btn-secondary btn-compact" data-del="${esc(e.id)}">Delete</button>
                  </td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    return;
  }
  if (activeTab === "tickets") {
    els.list.innerHTML = `
      <div class="log-table-wrap">
        <table class="log-table">
          <thead><tr><th>Date</th><th>Unit</th><th>Subject</th><th>Status</th><th>Channel</th><th></th></tr></thead>
          <tbody>
            ${entries
              .map(
                (e) => `<tr>
                  <td>${esc(e.reportedDate)}</td>
                  <td>${esc(e.unit)}</td>
                  <td>${esc(e.subject) || esc(e.detail)?.slice(0, 40) || "n/a"}</td>
                  <td><span class="log-badge">${esc(e.status)}</span></td>
                  <td>${esc(e.channel)}</td>
                  <td class="log-row-actions">
                    <button type="button" class="btn btn-secondary btn-compact" data-edit="${esc(e.id)}">Edit</button>
                    <button type="button" class="btn btn-secondary btn-compact" data-del="${esc(e.id)}">Delete</button>
                  </td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    return;
  }
  els.list.innerHTML = `
    <div class="log-table-wrap">
      <table class="log-table">
        <thead><tr><th>Date</th><th>Unit</th><th>Type</th><th>Summary</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${entries
            .map(
              (e) => `<tr>
                <td>${esc(e.eventDate)}</td>
                <td>${esc(e.unit)}</td>
                <td>${esc(e.kind)}</td>
                <td>${esc(e.summary)?.slice(0, 60) || "n/a"}${e.followUp ? " · follow-up" : ""}</td>
                <td><span class="log-badge">${esc(e.status)}</span></td>
                <td class="log-row-actions">
                  <button type="button" class="btn btn-secondary btn-compact" data-edit="${esc(e.id)}">Edit</button>
                  <button type="button" class="btn btn-secondary btn-compact" data-del="${esc(e.id)}">Delete</button>
                </td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function fillFormForEdit(entry) {
  editingId = entry.id;
  if (activeTab === "maintenance") {
    document.getElementById("mnt-unit").value = entry.unit || "";
    document.getElementById("mnt-date").value = entry.reportedDate || todayIso();
    document.getElementById("mnt-cat").value = entry.category || "";
    document.getElementById("mnt-desc").value = entry.description || "";
    document.getElementById("mnt-vendor").value = entry.vendor || "";
    document.getElementById("mnt-cost").value = entry.cost || "";
    document.getElementById("mnt-status").value = entry.status || "Open";
    document.getElementById("mnt-priority").value = entry.priority || "Normal";
    document.getElementById("mnt-notes").value = entry.notes || "";
  } else if (activeTab === "tickets") {
    document.getElementById("tkt-unit").value = entry.unit || "";
    document.getElementById("tkt-date").value = entry.reportedDate || todayIso();
    document.getElementById("tkt-by").value = entry.reportedBy || "";
    document.getElementById("tkt-channel").value = entry.channel || "Email";
    document.getElementById("tkt-subject").value = entry.subject || "";
    document.getElementById("tkt-detail").value = entry.detail || "";
    document.getElementById("tkt-assigned").value = entry.assigned || "";
    document.getElementById("tkt-status").value = entry.status || "New";
    document.getElementById("tkt-resolved").value = entry.resolvedDate || "";
  } else {
    document.getElementById("ins-unit").value = entry.unit || "";
    document.getElementById("ins-date").value = entry.eventDate || todayIso();
    document.getElementById("ins-kind").value = entry.kind || "Inspection";
    document.getElementById("ins-party").value = entry.party || "";
    document.getElementById("ins-summary").value = entry.summary || "";
    document.getElementById("ins-status").value = entry.status || "Logged";
    document.getElementById("ins-follow").checked = Boolean(entry.followUp);
    document.getElementById("ins-ref").value = entry.reference || "";
  }
}

function bindForm() {
  document.getElementById("log-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    let row;
    if (activeTab === "maintenance") row = readFormMaintenance();
    else if (activeTab === "tickets") row = readFormTicket();
    else row = readFormInspection();
    if (!row.createdAt) row.createdAt = new Date().toISOString();
    upsertEntry(storageKey(), row);
    editingId = null;
    setStatus("Saved in this browser.");
    render();
  });
  document.getElementById("btn-cancel-edit")?.addEventListener("click", () => {
    editingId = null;
    render();
  });
}

function bindList() {
  els.list?.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit");
      const entry = loadEntries(storageKey()).find((e) => e.id === id);
      if (!entry) return;
      els.panel.innerHTML = renderForm();
      bindForm();
      fillFormForEdit(entry);
      setStatus("Editing entry.");
    });
  });
  els.list?.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      if (!confirm("Delete this log entry?")) return;
      deleteEntry(storageKey(), id);
      if (editingId === id) editingId = null;
      setStatus("Entry removed.");
      render();
    });
  });
}

function exportCsv() {
  const entries = loadEntries(storageKey()).filter(matchesFilter);
  if (activeTab === "maintenance") {
    downloadCsv(
      "maintenance-log.csv",
      ["reportedDate", "unit", "category", "description", "vendor", "cost", "status", "priority", "notes"],
      entries.map((e) => [
        e.reportedDate,
        e.unit,
        e.category,
        e.description,
        e.vendor,
        e.cost,
        e.status,
        e.priority,
        e.notes,
      ])
    );
  } else if (activeTab === "tickets") {
    downloadCsv(
      "tickets-log.csv",
      ["reportedDate", "unit", "reportedBy", "channel", "subject", "detail", "assigned", "status", "resolvedDate"],
      entries.map((e) => [
        e.reportedDate,
        e.unit,
        e.reportedBy,
        e.channel,
        e.subject,
        e.detail,
        e.assigned,
        e.status,
        e.resolvedDate,
      ])
    );
  } else {
    downloadCsv(
      "inspections-complaints-log.csv",
      ["eventDate", "unit", "kind", "party", "summary", "status", "followUp", "reference"],
      entries.map((e) => [
        e.eventDate,
        e.unit,
        e.kind,
        e.party,
        e.summary,
        e.status,
        e.followUp ? "yes" : "no",
        e.reference,
      ])
    );
  }
  setStatus(`Exported ${entries.length} row(s) for Google Sheets.`);
}

function renderPrintBlock() {
  const root = document.getElementById("print-log");
  if (!root) return;
  const entries = loadEntries(storageKey()).filter(matchesFilter);
  const title = tabs.find((t) => t.id === activeTab)?.label || "Log";
  root.innerHTML = `
    <h2>Simple Property Tools · ${esc(title)}</h2>
    <p>Printed ${new Date().toLocaleString()} · not legal advice</p>
    <table><thead><tr><th>#</th><th>When</th><th>Unit</th><th>Summary</th><th>Status</th></tr></thead>
    <tbody>
      ${entries
        .map((e, i) => {
          const when = e.reportedDate || e.eventDate || "";
          const summary =
            activeTab === "maintenance"
              ? `${e.category}: ${e.description}`
              : activeTab === "tickets"
                ? e.subject || e.detail
                : `${e.kind}: ${e.summary}`;
          return `<tr><td>${i + 1}</td><td>${esc(when)}</td><td>${esc(e.unit)}</td><td>${esc(summary)}</td><td>${esc(e.status)}</td></tr>`;
        })
        .join("")}
    </tbody></table>`;
}

function renderTabs() {
  els.tabs.innerHTML = tabs
    .map(
      (t) =>
        `<button type="button" class="log-tab ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}">${t.label}</button>`
    )
    .join("");
  els.tabs.querySelectorAll(".log-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTab = btn.getAttribute("data-tab");
      editingId = null;
      render();
    });
  });
}

function render() {
  renderTabs();
  els.panel.innerHTML = renderForm();
  bindForm();
  renderList();
  bindList();
  renderPrintBlock();
  setStatus(`${loadEntries(storageKey()).length} entries in this browser · filter: "${filterText || "none"}"`);
}

els.filter?.addEventListener("input", (e) => {
  filterText = e.target.value.trim();
  renderList();
  bindList();
  renderPrintBlock();
});

els.export?.addEventListener("click", exportCsv);
els.print?.addEventListener("click", () => window.print());

const hash = location.hash.replace("#", "");
if (tabs.some((t) => t.id === hash)) activeTab = hash;

render();
