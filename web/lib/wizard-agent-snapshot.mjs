/**
 * Live wizard state for AI agents · client-only · no secrets · minimal PII.
 * Published to window.__SPT_AGENT__ and #spt-wizard-snapshot on each render.
 */
export const WIZARD_SNAPSHOT_SCHEMA = "spt-wizard-snapshot";
export const WIZARD_SNAPSHOT_VERSION = 1;

export const WIZARD_STEPS = [
  { n: 1, key: "property", label: "Property", focus: "state, rental address, city preset, unit count" },
  { n: 2, key: "turnover", label: "Turnover", focus: "surrender date, deposit, tenant, lease" },
  { n: 3, key: "move_out", label: "Move-out", focus: "itemized withholdings before export" },
  { n: 4, key: "move_in", label: "Move-in proof", focus: "optional album link or room checklist" },
  { n: 5, key: "export", label: "Export", focus: "landlord mail, deadline, print, paywall" },
];

/**
 * @param {object} ctx
 * @param {number} ctx.step
 * @param {object} ctx.draft
 * @param {boolean} ctx.canExport
 * @param {boolean} ctx.hasTurnUnlock
 * @param {boolean} ctx.isProSubscription
 * @param {boolean} ctx.isDemoPro
 * @param {object|null} ctx.subscriptionMeta sanitized entitlement (no sig)
 * @param {object} ctx.deadline from computeDeadline
 * @param {number} ctx.savedPacketCount
 */
export function buildWizardAgentSnapshot(ctx) {
  const stepDef = WIZARD_STEPS.find((s) => s.n === ctx.step) || WIZARD_STEPS[0];
  const st = ctx.draft?.property?.state || "";
  const dep = parseFloat(ctx.draft?.deposit?.amount) || 0;
  const withheld = (ctx.draft?.deductions || []).reduce(
    (acc, row) => acc + (parseFloat(row.amount) || 0),
    0
  );
  const rooms = ctx.draft?.rooms || [];
  const roomsWithPhoto = rooms.filter((r) => r.photo || r.photoLink).length;
  const dedLines = (ctx.draft?.deductions || []).filter((d) => d.amount || d.description).length;
  const paywallVisible = ctx.step === 5 && !ctx.canExport;

  const freeActions = [
    "wizard_navigate_steps",
    "deadline_math",
    "google_calendar",
    "google_sheets_csv",
    "ics_download",
    "copy_for_ai_clipboard",
    "save_packet_browser",
    "photo_proof_manifest_json",
  ];
  const paidActions = ["print_pdf", "email_tenant_copy"];
  const available = [...freeActions];
  const blocked = [];
  if (ctx.canExport) {
    available.push(...paidActions);
  } else {
    blocked.push(...paidActions, "checkout_required_for_print");
    if (paywallVisible) available.push("checkout_turn_move_out", "checkout_turn_full", "subscribe_pro");
  }

  const sub = ctx.subscriptionMeta;
  const entitlement = {
    canExport: Boolean(ctx.canExport),
    canPrint: Boolean(ctx.canExport && ctx.step >= 5),
    paywallVisible,
    hasTurnUnlock: Boolean(ctx.hasTurnUnlock),
    proSubscription: Boolean(ctx.isProSubscription),
    demoPro: Boolean(ctx.isDemoPro),
    plan: sub?.plan || null,
    validUntil: sub?.valid_until || null,
    product: sub?.product || "Simple Property Tools",
  };

  return {
    schema: WIZARD_SNAPSHOT_SCHEMA,
    version: WIZARD_SNAPSHOT_VERSION,
    updatedAt: new Date().toISOString(),
    site: "https://simple-property.com",
    route: "/app",
    notLegalAdvice: true,
    wizard: {
      step: ctx.step,
      maxSteps: WIZARD_STEPS.length,
      maxStepVisited: ctx.draft?.wizardMaxStep ?? 1,
      stepKey: stepDef.key,
      stepLabel: stepDef.label,
      stepFocus: stepDef.focus,
      steps: WIZARD_STEPS.map((s) => ({ n: s.n, key: s.key, label: s.label })),
      speedShortcuts: [
        "step_tab_jump",
        "surrender_today",
        "full_deposit_return",
        "deduction_quick_add",
        "skip_move_in",
        "duplicate_last_packet",
        "enter_to_continue",
        "watermarked_preview_print",
        "unlock_mail_ready_pdf",
        "turnover_deep_link",
        "packet_json_import_export",
        "mail_proof_log",
        "copy_return_link",
      ],
    },
    packet: {
      id: ctx.draft?.id || null,
      savedPacketCount: ctx.savedPacketCount ?? 0,
    },
    property: {
      state: st,
      cityPreset: ctx.draft?.property?.cityPreset || "",
      city: ctx.draft?.property?.city || "",
      inChicago: Boolean(ctx.draft?.property?.inChicago),
      unitCount: ctx.draft?.property?.unitCount ?? 1,
      hasStreet: Boolean((ctx.draft?.property?.street || "").trim()),
    },
    tenancy: {
      hasTenantName: Boolean((ctx.draft?.tenant?.name || "").trim()),
      hasTenantEmail: Boolean((ctx.draft?.tenant?.email || "").trim()),
      hasLandlordEmail: Boolean((ctx.draft?.landlord?.email || "").trim()),
      surrenderDate: ctx.draft?.surrenderDate || null,
      leaseStart: ctx.draft?.lease?.start || null,
      leaseEnd: ctx.draft?.lease?.end || null,
    },
    deposit: {
      amount: dep,
      withheld,
      returnToTenant: Math.max(0, dep - withheld),
      currency: "USD",
    },
    progress: {
      roomCount: rooms.length,
      roomsWithPhotoOrLink: roomsWithPhoto,
      deductionLines: dedLines,
      hasPhotoAlbumLink: Boolean((ctx.draft?.photoAlbumLink || "").trim()),
    },
    deadline: {
      jurisdiction: ctx.deadline?.jurisdiction || null,
      deadlineDate: ctx.deadline?.deadline || null,
      returnDays: ctx.deadline?.returnDays ?? null,
      cite: ctx.deadline?.cite || null,
    },
    entitlement,
    actions: { available, blocked },
    agent: {
      readOrder: [
        "window.__SPT_AGENT__",
        "#spt-wizard-snapshot",
        "document.querySelector('#spt-wizard-snapshot')?.textContent",
        "https://simple-property.com/spt-ai-bus.json",
        "https://simple-property.com/llms.txt",
      ],
      event: "spt-agent-snapshot",
      copyForAi: ctx.step === 5 ? "#btn-copy-ai" : null,
      fullPacketMarkdown: "Wizard step 5 · button Copy for AI assistant (clipboard)",
    },
  };
}

/** @param {ReturnType<typeof buildWizardAgentSnapshot>} snapshot */
export function publishWizardAgentSnapshot(snapshot) {
  if (typeof window === "undefined") return;
  window.__SPT_AGENT__ = snapshot;
  let el = document.getElementById("spt-wizard-snapshot");
  if (!el) {
    el = document.createElement("script");
    el.id = "spt-wizard-snapshot";
    el.type = "application/json";
    el.setAttribute("data-spt-agent", "live");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(snapshot);
  try {
    document.dispatchEvent(new CustomEvent("spt-agent-snapshot", { detail: snapshot }));
  } catch {
    /* ignore */
  }
}
