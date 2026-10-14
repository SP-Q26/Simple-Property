import {
  amendReceipt,
  finalizeReceipt,
  suggestVerdict,
  spineChainLabel,
  VERDICT_VALUES,
} from "./lib/receipt-spine.mjs";
import { CONDITION_OPTIONS, getTemplate, listTemplates } from "./lib/hub-templates.mjs";
import {
  chainForTenancy,
  createDraftReceipt,
  getReceipt,
  getTenancy,
  getUnit,
  getProperty,
  loadHubState,
  resetHubState,
  saveHubState,
  upsertReceipt,
} from "./lib/hub-store.mjs";

let state = loadHubState();

const root = document.getElementById("hub-root");
const statusEl = document.getElementById("hub-status");

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function persist(next) {
  state = next;
  saveHubState(state);
}

function navigate(path) {
  location.hash = path.startsWith("#") ? path.slice(1) : path;
  render();
}

function parseRoute() {
  const raw = (location.hash || "#/").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  return { parts, raw: parts.join("/") || "" };
}

function finalizedReceipts() {
  return state.receipts.filter((r) => r.status === "finalized");
}

function draftReceipts() {
  return state.receipts.filter((r) => r.status === "draft");
}

function receiptsForTenancy(tenancyId) {
  return state.receipts.filter((r) => r.tenancyId === tenancyId);
}

function compareHint(tenancyId) {
  const list = receiptsForTenancy(tenancyId);
  const moveIn = list.find((r) => r.templateId === "move_in_baseline" && r.status === "finalized");
  const moveOut = list.find((r) => r.templateId === "move_out_condition" && r.status === "finalized");
  if (moveIn && moveOut) {
    return { ready: true, moveInId: moveIn.id, moveOutId: moveOut.id };
  }
  return { ready: false, moveIn: !!moveIn, moveOut: !!moveOut };
}

function navHtml(active) {
  const items = [
    ["", "Home"],
    ["properties", "Properties"],
    ["receipts", "Receipts"],
    ["vault", "Vault"],
    ["billing", "Billing"],
  ];
  return `<nav class="hub-nav" aria-label="Hub">
    ${items
      .map(([path, label]) => {
        const href = path ? `#/${path}` : "#/";
        const on = active === path ? ' aria-current="page"' : "";
        return `<a class="hub-nav__link" href="${href}"${on}>${esc(label)}</a>`;
      })
      .join("")}
    <a class="hub-nav__link hub-nav__link--muted" href="/modules">Modules</a>
    <a class="hub-nav__link hub-nav__link--muted" href="/app">Deposit Desk</a>
  </nav>`;
}

function renderHome() {
  const drafts = draftReceipts();
  const vault = finalizedReceipts();
  return `
    <header class="hub-head">
      <p class="hero-eyebrow">Receipt Rail · alpha · ${esc(spineChainLabel())}</p>
      <h1>${esc(state.org.name)}</h1>
      <p class="field-hint">Browser-only preview · no login · data stays on this device. Not legal advice.</p>
    </header>
    <div class="hub-kpi-grid">
      <div class="hub-kpi"><span class="hub-kpi__n">${state.properties.length}</span><span class="hub-kpi__l">Properties</span></div>
      <div class="hub-kpi"><span class="hub-kpi__n">${state.units.length}</span><span class="hub-kpi__l">Units</span></div>
      <div class="hub-kpi"><span class="hub-kpi__n">${drafts.length}</span><span class="hub-kpi__l">Draft receipts</span></div>
      <div class="hub-kpi"><span class="hub-kpi__n">${vault.length}</span><span class="hub-kpi__l">Vault</span></div>
    </div>
    <section class="hub-panel">
      <h2>Start capture</h2>
      <p class="field-hint">P1 modules: move-in baseline and move-out condition share the same room spine.</p>
      <div class="hub-template-grid">
        ${listTemplates({ p1Only: true })
          .map(
            (t) => `
          <button type="button" class="hub-card hub-card--action" data-hub-new="${esc(t.id)}">
            <span class="hub-card__title">${esc(t.label)}</span>
            <span class="hub-card__meta">${esc(t.blurb)}</span>
          </button>`
          )
          .join("")}
      </div>
    </section>
    ${
      drafts.length
        ? `<section class="hub-panel"><h2>Drafts needing finalize</h2><ul class="hub-list">${drafts
            .map((r) => receiptRow(r))
            .join("")}</ul></section>`
        : ""
    }
    <p class="field-hint"><button type="button" class="btn btn-secondary btn-compact" id="hub-reset">Reset demo data</button></p>
  `;
}

function receiptRow(r) {
  const t = getTemplate(r.templateId);
  const chain = chainForTenancy(state, r.tenancyId);
  const place = chain?.unit?.label || "Unit";
  const status = r.status === "finalized" ? "Finalized" : "Draft";
  return `<li class="hub-list__item">
    <div>
      <strong>${esc(t?.label || r.templateId)}</strong> · ${esc(place)} · <span class="log-badge">${esc(status)}</span>
    </div>
    <div class="hub-list__actions">
      <a class="btn btn-secondary btn-compact" href="#/receipts/${esc(r.id)}/wizard">Open</a>
      ${
        r.status === "finalized"
          ? `<a class="btn btn-secondary btn-compact" href="#/vault">Vault</a>`
          : `<a class="btn btn-primary btn-compact" href="#/receipts/${esc(r.id)}/review">Review</a>`
      }
    </div>
  </li>`;
}

function renderProperties() {
  const rows = state.properties
    .map((p) => {
      const units = state.units.filter((u) => u.propertyId === p.id);
      const unitRows = units
        .map((u) => {
          const tenancies = state.tenancies.filter((t) => t.unitId === u.id);
          return `<li><strong>${esc(u.label)}</strong>
            ${tenancies
              .map((ten) => {
                const cmp = compareHint(ten.id);
                const cmpTxt = cmp.ready
                  ? " · Compare ready"
                  : cmp.moveIn || cmp.moveOut
                    ? " · Compare partial"
                    : "";
                return `<div class="field-hint">${esc(ten.tenantName)}${esc(cmpTxt)}
                  <a href="#/tenancy/${esc(ten.id)}">Timeline</a></div>`;
              })
              .join("")}
          </li>`;
        })
        .join("");
      return `<article class="hub-panel"><h2>${esc(p.label)}</h2>
        <p class="field-hint">${esc(p.address)} · ${esc(p.city)}, ${esc(p.state)}</p>
        <ul class="hub-list">${unitRows}</ul></article>`;
    })
    .join("");
  return `<header class="hub-head"><h1>Properties</h1></header>${rows || "<p>No properties yet.</p>"}`;
}

function renderTenancy(tenancyId) {
  const ten = getTenancy(state, tenancyId);
  if (!ten) return `<p>Tenancy not found.</p>`;
  const chain = chainForTenancy(state, tenancyId);
  const list = receiptsForTenancy(tenancyId);
  const cmp = compareHint(tenancyId);
  return `
    <header class="hub-head">
      <h1>${esc(chain?.unit?.label || "Unit")}</h1>
      <p class="field-hint">${esc(chain?.property?.label || "")} · ${esc(ten.tenantName)}</p>
    </header>
    <section class="hub-panel">
      <h2>Receipt timeline</h2>
      <ul class="hub-list">${list.map((r) => receiptRow(r)).join("") || "<li>No receipts yet.</li>"}</ul>
    </section>
    <section class="hub-panel">
      <h2>Compare (P2 stub)</h2>
      ${
        cmp.ready
          ? `<p class="ps-fix">Finalized move-in and move-out on file · server compare PDF ships in P2.</p>
             <button type="button" class="btn btn-secondary" disabled>Generate compare_report (hookup pending)</button>`
          : `<p class="field-hint">Finalize both <code>move_in_baseline</code> and <code>move_out_condition</code> to unlock compare.</p>`
      }
    </section>
    <p><a href="#/properties">← Properties</a></p>
  `;
}

function renderReceiptsList() {
  const all = [...state.receipts].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return `
    <header class="hub-head"><h1>Receipts</h1></header>
    <ul class="hub-list hub-panel">${all.map((r) => receiptRow(r)).join("") || "<li>No receipts.</li>"}</ul>
    <p><a class="btn btn-primary" href="#/">New receipt</a></p>
  `;
}

function renderWizard(receiptId) {
  const receipt = getReceipt(state, receiptId);
  if (!receipt) return `<p>Receipt not found.</p>`;
  if (receipt.status === "finalized") {
    return `<p>Receipt is finalized. <a href="#/vault">Open vault</a> or amend from review.</p>`;
  }
  const t = getTemplate(receipt.templateId);
  const sections = receipt.sections
    .map(
      (sec, idx) => `
    <fieldset class="hub-wizard-section" data-step-key="${esc(sec.key)}">
      <legend>${esc(sec.label)}</legend>
      <label>Condition
        <select data-sec-idx="${idx}" data-field="condition">
          ${CONDITION_OPTIONS.map(
            (o) =>
              `<option value="${esc(o.value)}"${sec.condition === o.value ? " selected" : ""}>${esc(o.label)}</option>`
          ).join("")}
        </select>
      </label>
      <label>Notes
        <textarea data-sec-idx="${idx}" data-field="notes" rows="2">${esc(sec.notes)}</textarea>
      </label>
      <label>Photo URL (alpha · paste link)
        <input type="url" data-sec-idx="${idx}" data-field="photoUrl" value="${esc(sec.photoUrl)}" placeholder="https://…" />
      </label>
    </fieldset>`
    )
    .join("");

  return `
    <header class="hub-head">
      <h1>${esc(t?.label || receipt.templateId)}</h1>
      <p class="field-hint">Capture · autosaved locally</p>
    </header>
    <form class="hub-panel" id="hub-wizard-form">${sections}</form>
    <div class="hub-wizard-actions">
      <a class="btn btn-secondary" href="#/receipts">Cancel</a>
      <button type="button" class="btn btn-primary" id="hub-wizard-review">Review &amp; finalize</button>
    </div>
  `;
}

function renderReview(receiptId) {
  const receipt = getReceipt(state, receiptId);
  if (!receipt) return `<p>Receipt not found.</p>`;
  const suggested = suggestVerdict(receipt.sections);
  const options = VERDICT_VALUES.map(
    (v) => `<option value="${v}"${(receipt.verdict || suggested) === v ? " selected" : ""}>${v}</option>`
  ).join("");
  const rows = receipt.sections
    .map(
      (s) =>
        `<tr><td>${esc(s.label)}</td><td>${esc(s.condition)}</td><td>${esc(s.notes || "-")}</td></tr>`
    )
    .join("");
  return `
    <header class="hub-head"><h1>Review</h1></header>
    <section class="hub-panel">
      <table class="log-table"><thead><tr><th>Section</th><th>Condition</th><th>Notes</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <label>Verdict <select id="hub-verdict">${options}</select></label>
      <p class="field-hint">Suggested: <strong>${esc(suggested)}</strong> · Finalize locks this receipt (amend creates a child draft).</p>
      <div class="hub-wizard-actions">
        <a class="btn btn-secondary" href="#/receipts/${esc(receiptId)}/wizard">Back to capture</a>
        <button type="button" class="btn btn-primary" id="hub-finalize">Finalize to vault</button>
      </div>
    </section>
  `;
}

function renderVault() {
  const vault = finalizedReceipts();
  return `
    <header class="hub-head"><h1>Vault</h1><p class="field-hint">Finalized receipts · export/send stubs until P1 hookup.</p></header>
    <ul class="hub-list hub-panel">
      ${vault
        .map((r) => {
          const t = getTemplate(r.templateId);
          return `<li class="hub-list__item">
            <div><strong>${esc(t?.label || r.templateId)}</strong> · ${esc(r.finalizedAt?.slice(0, 10) || "")} · ${esc(r.verdict || "")}</div>
            <div class="hub-list__actions">
              <button type="button" class="btn btn-secondary btn-compact" disabled title="Server PDF pending">Export PDF</button>
              <button type="button" class="btn btn-secondary btn-compact" disabled title="Resend pending">Send link</button>
              <button type="button" class="btn btn-secondary btn-compact" data-hub-amend="${esc(r.id)}">Amend</button>
            </div>
          </li>`;
        })
        .join("") || "<li>No finalized receipts yet.</li>"}
    </ul>
  `;
}

function renderBilling() {
  return `
    <header class="hub-head"><h1>Billing</h1></header>
    <section class="hub-panel prose">
      <p>Alpha uses existing Deposit Desk checkout. Hub Keeper / Portfolio SKUs ship in Train 3.</p>
      <ul class="bullet-tight">
        <li><strong>Keeper</strong> · $29/mo · 10 units · core modules</li>
        <li><strong>Portfolio</strong> · $79/mo · 40 units · 3 seats</li>
        <li><strong>Turn unlock</strong> · $29 / $49 live on Deposit Desk today</li>
      </ul>
      <p><a class="btn btn-primary" href="/pricing">Open pricing</a> <a class="btn btn-secondary" href="/app">Deposit Desk</a></p>
    </section>
  `;
}

function pickTenancyForNewReceipt() {
  if (state.tenancies.length === 1) return state.tenancies[0].id;
  const label = state.tenancies
    .map((t, i) => {
      const u = getUnit(state, t.unitId);
      return `${i + 1}. ${u?.label || "Unit"} · ${t.tenantName}`;
    })
    .join("\n");
  const ans = window.prompt(`Pick tenancy by number:\n${label}`, "1");
  const idx = parseInt(ans, 10) - 1;
  return state.tenancies[idx]?.id || state.tenancies[0]?.id;
}

function bindEvents(view, ctx = {}) {
  root.querySelectorAll("[data-hub-new]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const templateId = btn.getAttribute("data-hub-new");
      const tenancyId = pickTenancyForNewReceipt();
      if (!tenancyId) return;
      const { state: next, receipt } = createDraftReceipt(state, { tenancyId, templateId });
      persist(next);
      setStatus(`Draft ${getTemplate(templateId)?.label || templateId} created.`);
      navigate(`#/receipts/${receipt.id}/wizard`);
    });
  });

  const resetBtn = document.getElementById("hub-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (window.confirm("Reset hub demo data on this device?")) {
        persist(resetHubState());
        setStatus("Demo data restored.");
        render();
      }
    });
  }

  const form = document.getElementById("hub-wizard-form");
  if (form && ctx.receiptId) {
    const sync = () => {
      const receipt = getReceipt(state, ctx.receiptId);
      if (!receipt || receipt.status === "finalized") return;
      form.querySelectorAll("[data-sec-idx]").forEach((el) => {
        const idx = Number(el.getAttribute("data-sec-idx"));
        const field = el.getAttribute("data-field");
        if (receipt.sections[idx]) receipt.sections[idx][field] = el.value;
      });
      persist(upsertReceipt(state, { ...receipt, updatedAt: new Date().toISOString() }));
    };
    form.addEventListener("change", sync);
    form.addEventListener("input", sync);
    document.getElementById("hub-wizard-review")?.addEventListener("click", () => {
      sync();
      navigate(`#/receipts/${ctx.receiptId}/review`);
    });
  }

  document.getElementById("hub-finalize")?.addEventListener("click", () => {
    const receipt = getReceipt(state, ctx.receiptId);
    if (!receipt) return;
    const verdict = document.getElementById("hub-verdict")?.value;
    const finalized = finalizeReceipt(receipt, verdict);
    persist(upsertReceipt(state, finalized));
    setStatus("Receipt finalized · vault updated (local).");
    navigate("#/vault");
  });

  root.querySelectorAll("[data-hub-amend]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = getReceipt(state, btn.getAttribute("data-hub-amend"));
      const draft = amendReceipt(parent);
      if (!draft) return;
      persist(upsertReceipt(state, draft));
      setStatus("Amendment draft created.");
      navigate(`#/receipts/${draft.id}/wizard`);
    });
  });
}

function render() {
  const { parts } = parseRoute();
  let body = "";
  let ctx = {};
  const section = parts[0] || "";

  if (section === "properties") body = renderProperties();
  else if (section === "tenancy" && parts[1]) body = renderTenancy(parts[1]);
  else if (section === "receipts") {
    if (parts[1] && parts[2] === "wizard") {
      body = renderWizard(parts[1]);
      ctx = { receiptId: parts[1] };
    } else if (parts[1] && parts[2] === "review") {
      body = renderReview(parts[1]);
      ctx = { receiptId: parts[1] };
    } else body = renderReceiptsList();
  } else if (section === "vault") body = renderVault();
  else if (section === "billing") body = renderBilling();
  else body = renderHome();

  root.innerHTML = `${navHtml(section)}<div class="hub-main">${body}</div>`;
  bindEvents(section, ctx);
}

window.addEventListener("hashchange", render);
render();
