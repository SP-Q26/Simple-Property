import {
  amendReceipt,
  finalizeReceipt,
  suggestVerdict,
  VERDICT_VALUES,
} from "./lib/receipt-spine.mjs";
import {
  HUB_DISCLAIMER,
  HUB_EYEBROW,
  HUB_INTRO,
  HUB_PRODUCT_NAME,
  receiptStatusLabel,
  verdictLabel,
} from "./lib/hub-copy.mjs";
import { CONDITION_OPTIONS, getTemplate, listTemplates } from "./lib/hub-templates.mjs";
import {
  chainForTenancy,
  createDraftReceipt,
  getReceipt,
  getTenancy,
  getUnit,
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

function conditionLabel(value) {
  return CONDITION_OPTIONS.find((o) => o.value === value)?.label || value;
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
  if (moveIn && moveOut) return { ready: true };
  return { ready: false, moveIn: !!moveIn, moveOut: !!moveOut };
}

function navHtml(active) {
  const items = [
    ["", "Home"],
    ["properties", "Properties"],
    ["receipts", "All records"],
    ["vault", "Saved"],
    ["billing", "Plans"],
  ];
  return `<nav class="hub-nav" aria-label="${esc(HUB_PRODUCT_NAME)}">
    ${items
      .map(([path, label]) => {
        const href = path ? `#/${path}` : "#/";
        const on = active === path ? ' aria-current="page"' : "";
        return `<a class="hub-nav__link" href="${href}"${on}>${esc(label)}</a>`;
      })
      .join("")}
    <a class="hub-nav__link hub-nav__link--muted" href="/modules">All tools</a>
    <a class="hub-nav__link hub-nav__link--muted" href="/app">Deposit Desk</a>
  </nav>`;
}

function receiptRow(r) {
  const t = getTemplate(r.templateId);
  const chain = chainForTenancy(state, r.tenancyId);
  const place = chain?.unit?.label || "Unit";
  const title = t?.label || "Condition record";
  const status = receiptStatusLabel(r.status);
  return `<li class="hub-list__item">
    <div>
      <strong>${esc(title)}</strong> · ${esc(place)} · <span class="log-badge">${esc(status)}</span>
    </div>
    <div class="hub-list__actions">
      <a class="btn btn-secondary btn-compact" href="#/receipts/${esc(r.id)}/wizard">${r.status === "finalized" ? "View" : "Continue"}</a>
      ${
        r.status === "finalized"
          ? `<a class="btn btn-secondary btn-compact" href="#/vault">Saved</a>`
          : `<a class="btn btn-primary btn-compact" href="#/receipts/${esc(r.id)}/review">Review &amp; lock</a>`
      }
    </div>
  </li>`;
}

function renderHome() {
  const drafts = draftReceipts();
  const saved = finalizedReceipts();
  const firstDraft = drafts[0];
  const continueBlock = firstDraft
    ? `<p><a class="btn btn-primary" href="#/receipts/${esc(firstDraft.id)}/wizard">Continue in-progress walkthrough</a></p>`
    : "";

  return `
    <header class="hub-head">
      <p class="hero-eyebrow">${esc(HUB_EYEBROW)}</p>
      <h1>${esc(state.org.name)}</h1>
      <p class="ps-problem">“We’ll remember what it looked like” is not a record when the deposit fight starts.</p>
      <p class="ps-fix">${esc(HUB_INTRO)}</p>
      <p class="field-hint">${esc(HUB_DISCLAIMER)}</p>
      ${continueBlock}
    </header>
    <div class="hub-kpi-grid">
      <div class="hub-kpi"><span class="hub-kpi__n">${state.properties.length}</span><span class="hub-kpi__l">Properties</span></div>
      <div class="hub-kpi"><span class="hub-kpi__n">${state.units.length}</span><span class="hub-kpi__l">Units</span></div>
      <div class="hub-kpi"><span class="hub-kpi__n">${drafts.length}</span><span class="hub-kpi__l">In progress</span></div>
      <div class="hub-kpi"><span class="hub-kpi__n">${saved.length}</span><span class="hub-kpi__l">Locked</span></div>
    </div>
    <section class="hub-panel">
      <h2>Start a walkthrough</h2>
      <p class="field-hint">Use the same room list at move-in and move-out so you can show what changed.</p>
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
        ? `<section class="hub-panel"><h2>Finish before keys change hands</h2><ul class="hub-list">${drafts
            .map((r) => receiptRow(r))
            .join("")}</ul></section>`
        : ""
    }
    <p class="field-hint"><button type="button" class="btn btn-secondary btn-compact" id="hub-reset">Reset sample portfolio</button></p>
  `;
}

function renderPickUnit(templateId) {
  const t = getTemplate(templateId);
  if (!t) return `<p>That tool is not available yet. <a href="/modules">See all tools</a>.</p>`;
  const cards = state.tenancies
    .map((ten) => {
      const chain = chainForTenancy(state, ten.id);
      const prop = chain?.property?.label || "Property";
      const unit = chain?.unit?.label || "Unit";
      return `<button type="button" class="hub-card hub-card--action hub-card--pick" data-hub-pick-tenancy="${esc(ten.id)}" data-hub-pick-template="${esc(templateId)}">
        <span class="hub-card__title">${esc(unit)}</span>
        <span class="hub-card__meta">${esc(prop)} · ${esc(ten.tenantName)}</span>
      </button>`;
    })
    .join("");
  return `
    <header class="hub-head">
      <h1>${esc(t.label)}</h1>
      <p class="field-hint">Which unit is this for?</p>
    </header>
    <div class="hub-template-grid hub-panel">${cards || "<p>Add a property first (sample data loads automatically).</p>"}</div>
    <p><a href="#/">← Back</a></p>
  `;
}

function startReceipt(templateId, tenancyId) {
  const { state: next, receipt } = createDraftReceipt(state, { tenancyId, templateId });
  persist(next);
  const label = getTemplate(templateId)?.label || "Walkthrough";
  setStatus(`${label} started · saved on this device.`);
  navigate(`#/receipts/${receipt.id}/wizard`);
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
                  ? " · Move-in & move-out locked"
                  : cmp.moveIn || cmp.moveOut
                    ? " · One walkthrough locked"
                    : "";
                return `<div class="field-hint">${esc(ten.tenantName)}${esc(cmpTxt)}
                  <a href="#/unit/${esc(ten.id)}">History</a></div>`;
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
  return `<header class="hub-head"><h1>Properties</h1><p class="field-hint">Buildings and units in this portfolio.</p></header>${rows || "<p>No properties yet.</p>"}`;
}

function renderUnitHistory(tenancyId) {
  const ten = getTenancy(state, tenancyId);
  if (!ten) return `<p>We could not find that unit.</p>`;
  const chain = chainForTenancy(state, tenancyId);
  const list = receiptsForTenancy(tenancyId);
  const cmp = compareHint(tenancyId);
  return `
    <header class="hub-head">
      <h1>${esc(chain?.unit?.label || "Unit")}</h1>
      <p class="field-hint">${esc(chain?.property?.label || "")} · ${esc(ten.tenantName)}</p>
    </header>
    <section class="hub-panel">
      <h2>Condition history</h2>
      <ul class="hub-list">${list.map((r) => receiptRow(r)).join("") || "<li>No records yet · start a walkthrough from home.</li>"}</ul>
    </section>
    <section class="hub-panel">
      <h2>Move-in vs move-out summary</h2>
      ${
        cmp.ready
          ? `<p class="ps-fix">You have locked move-in and move-out walkthroughs for this unit. A printable side-by-side report is next on our release list.</p>
             <button type="button" class="btn btn-secondary" disabled>Download comparison (coming soon)</button>`
          : `<p class="field-hint">Lock both a move-in and move-out walkthrough to unlock a comparison summary.</p>`
      }
    </section>
    <p><a href="#/properties">← Properties</a></p>
  `;
}

function renderReceiptsList() {
  const all = [...state.receipts].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return `
    <header class="hub-head"><h1>All records</h1><p class="field-hint">Every walkthrough in this portfolio.</p></header>
    <ul class="hub-list hub-panel">${all.map((r) => receiptRow(r)).join("") || "<li>No records yet.</li>"}</ul>
    <p><a class="btn btn-primary" href="#/">Start a walkthrough</a></p>
  `;
}

function renderWizard(receiptId) {
  const receipt = getReceipt(state, receiptId);
  if (!receipt) return `<p>Record not found.</p>`;
  if (receipt.status === "finalized") {
    return `<p>This record is locked. <a href="#/vault">Open saved records</a> or start a correction from there.</p>`;
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
        <textarea data-sec-idx="${idx}" data-field="notes" rows="2" placeholder="Scratches, stains, working appliances…">${esc(sec.notes)}</textarea>
      </label>
      <label>Photo link (optional)
        <input type="url" data-sec-idx="${idx}" data-field="photoUrl" value="${esc(sec.photoUrl)}" placeholder="Paste a cloud album or image URL" />
      </label>
    </fieldset>`
    )
    .join("");

  return `
    <header class="hub-head">
      <h1>${esc(t?.label || "Walkthrough")}</h1>
      <p class="field-hint">Saved automatically on this device as you go.</p>
    </header>
    <form class="hub-panel" id="hub-wizard-form">${sections}</form>
    <div class="hub-wizard-actions">
      <a class="btn btn-secondary" href="#/">Home</a>
      <button type="button" class="btn btn-primary" id="hub-wizard-review">Review &amp; lock</button>
    </div>
  `;
}

function renderReview(receiptId) {
  const receipt = getReceipt(state, receiptId);
  if (!receipt) return `<p>Record not found.</p>`;
  const suggested = suggestVerdict(receipt.sections);
  const options = VERDICT_VALUES.map(
    (v) =>
      `<option value="${v}"${(receipt.verdict || suggested) === v ? " selected" : ""}>${esc(verdictLabel(v))}</option>`
  ).join("");
  const rows = receipt.sections
    .map(
      (s) =>
        `<tr><td>${esc(s.label)}</td><td>${esc(conditionLabel(s.condition))}</td><td>${esc(s.notes || "-")}</td></tr>`
    )
    .join("");
  return `
    <header class="hub-head"><h1>Review before you lock</h1></header>
    <section class="hub-panel">
      <table class="log-table"><thead><tr><th>Room</th><th>Condition</th><th>Notes</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <label>Outcome for this visit
        <select id="hub-verdict">${options}</select>
      </label>
      <p class="field-hint">Suggested: <strong>${esc(verdictLabel(suggested))}</strong> · Locking prevents silent edits. To fix a mistake later, start a correction from saved records.</p>
      <div class="hub-wizard-actions">
        <a class="btn btn-secondary" href="#/receipts/${esc(receiptId)}/wizard">Back</a>
        <button type="button" class="btn btn-primary" id="hub-finalize">Lock &amp; save</button>
      </div>
    </section>
  `;
}

function renderVault() {
  const saved = finalizedReceipts();
  return `
    <header class="hub-head"><h1>Saved records</h1><p class="field-hint">Locked walkthroughs ready for export or sharing when delivery goes live.</p></header>
    <ul class="hub-list hub-panel">
      ${saved
        .map((r) => {
          const t = getTemplate(r.templateId);
          const title = t?.label || "Condition record";
          return `<li class="hub-list__item">
            <div><strong>${esc(title)}</strong> · ${esc(r.finalizedAt?.slice(0, 10) || "")} · ${esc(verdictLabel(r.verdict || ""))}</div>
            <div class="hub-list__actions">
              <button type="button" class="btn btn-secondary btn-compact" disabled title="PDF download coming soon">Download PDF</button>
              <button type="button" class="btn btn-secondary btn-compact" disabled title="Email link coming soon">Email tenant</button>
              <button type="button" class="btn btn-secondary btn-compact" data-hub-amend="${esc(r.id)}">Start correction</button>
            </div>
          </li>`;
        })
        .join("") || "<li>No locked records yet · finish a walkthrough from home.</li>"}
    </ul>
  `;
}

function renderBilling() {
  return `
    <header class="hub-head"><h1>Plans</h1></header>
    <section class="hub-panel prose">
      <p class="ps-fix">Deposit packets bill through Deposit Desk today. Hub plans bundle walkthroughs with the same subscription caps you already see on pricing.</p>
      <ul class="bullet-tight">
        <li><strong>Keeper</strong> · $29/mo · up to 10 units · move-in/out tools</li>
        <li><strong>Portfolio</strong> · $79/mo · up to 40 units · team seats</li>
        <li><strong>Per turnover</strong> · $29 move-out · $49 full tenancy (Deposit Desk)</li>
      </ul>
      <p><a class="btn btn-primary" href="/pricing">See pricing</a> <a class="btn btn-secondary" href="/app">Open Deposit Desk</a></p>
      <p class="field-hint">${esc(HUB_DISCLAIMER)}</p>
    </section>
  `;
}

function bindEvents(view, ctx = {}) {
  root.querySelectorAll("[data-hub-new]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const templateId = btn.getAttribute("data-hub-new");
      if (state.tenancies.length === 1) {
        startReceipt(templateId, state.tenancies[0].id);
        return;
      }
      navigate(`#/start/${templateId}`);
    });
  });

  root.querySelectorAll("[data-hub-pick-tenancy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      startReceipt(btn.getAttribute("data-hub-pick-template"), btn.getAttribute("data-hub-pick-tenancy"));
    });
  });

  const resetBtn = document.getElementById("hub-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (window.confirm("Reset the sample portfolio on this device? Your walkthroughs here will be replaced.")) {
        persist(resetHubState());
        setStatus("Sample portfolio restored.");
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
    setStatus("Record locked and saved on this device.");
    navigate("#/vault");
  });

  root.querySelectorAll("[data-hub-amend]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = getReceipt(state, btn.getAttribute("data-hub-amend"));
      const draft = amendReceipt(parent);
      if (!draft) return;
      persist(upsertReceipt(state, draft));
      setStatus("Correction draft started.");
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
  else if (section === "unit" && parts[1]) body = renderUnitHistory(parts[1]);
  else if (section === "tenancy" && parts[1]) body = renderUnitHistory(parts[1]);
  else if (section === "start" && parts[1]) body = renderPickUnit(parts[1]);
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

  root.innerHTML = `${navHtml(section === "start" ? "" : section)}<div class="hub-main">${body}</div>`;
  bindEvents(section, ctx);
}

window.addEventListener("hashchange", render);
render();
