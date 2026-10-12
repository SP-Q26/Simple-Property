/**
 * Agent-directed form fill · feedback route · client-only · no secrets.
 * Voice / CDP / parent frame: window.sptAgentFormFill(payload) · postMessage spt-agent-form-fill
 */

export const FEEDBACK_FORM_SCHEMA = "spt-feedback-form";
export const FEEDBACK_FORM_VERSION = 1;

export const FEEDBACK_CATEGORIES = Object.freeze({
  ruleset: "State or city ruleset (deadlines, RLTO, fields)",
  wizard: "Wizard or export improvement",
  feature: "New feature",
  content: "Guide or comparison page",
  other: "Other",
});

export const FEEDBACK_FIELD_ORDER = ["category", "state", "email", "message"];

const CATEGORY_SET = new Set(Object.keys(FEEDBACK_CATEGORIES));

/** @param {unknown} raw */
export function normalizeFeedbackCategory(raw) {
  const v = String(raw || "").trim().toLowerCase();
  return CATEGORY_SET.has(v) ? v : null;
}

/**
 * @param {HTMLFormElement} form
 * @param {Record<string, unknown>} values
 */
export function applyFormFields(form, values) {
  const applied = [];
  const ignored = [];
  if (!form || !values || typeof values !== "object") return { applied, ignored };

  for (const [key, val] of Object.entries(values)) {
    if (key === "website" || key === "submit") continue;
    const el = form.elements.namedItem(key);
    if (!el || el.name === "website") {
      ignored.push(key);
      continue;
    }
    const tag = el.tagName?.toLowerCase();
    if (tag === "select") {
      const next =
        key === "category" ? normalizeFeedbackCategory(val) : String(val ?? "").trim();
      if (key === "category" && !next) {
        ignored.push(key);
        continue;
      }
      el.value = next;
    } else {
      el.value = String(val ?? "");
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    applied.push(key);
  }
  return { applied, ignored };
}

/** @param {HTMLFormElement} form */
export function readFeedbackForm(form) {
  if (!form) return null;
  const fd = new FormData(form);
  return {
    category: normalizeFeedbackCategory(fd.get("category")),
    state: String(fd.get("state") || "").trim(),
    email: String(fd.get("email") || "").trim(),
    message: String(fd.get("message") || "").trim(),
    website: String(fd.get("website") || "").trim(),
  };
}

/** @param {ReturnType<typeof readFeedbackForm>} values */
export function feedbackFormIsValid(values) {
  if (!values) return false;
  const messageLen = values.message?.length || 0;
  return Boolean(values.category && messageLen >= 12 && messageLen <= 4000);
}

/** @param {HTMLFormElement} form */
export function buildFeedbackAgentSnapshot(form) {
  const values = readFeedbackForm(form) || {
    category: null,
    state: "",
    email: "",
    message: "",
    website: "",
  };
  const messageLen = values.message?.length || 0;
  return {
    schema: FEEDBACK_FORM_SCHEMA,
    version: FEEDBACK_FORM_VERSION,
    updatedAt: new Date().toISOString(),
    site: "https://simple-property.com",
    route: "/feedback",
    notLegalAdvice: true,
    form: {
      id: "spt-feedback-form",
      fields: FEEDBACK_FIELD_ORDER.map((name) => ({
        name,
        required: name === "category" || name === "message",
        ...(name === "category"
          ? { options: Object.keys(FEEDBACK_CATEGORIES) }
          : {}),
      })),
      values: {
        category: values.category,
        state: values.state || null,
        hasEmail: Boolean(values.email),
        messageLength: messageLen,
      },
      valid: feedbackFormIsValid(values),
    },
    voice: {
      intents: [
        "set category to ruleset when suggesting a new state or city clock",
        "set state or city in the optional location field",
        "dictate the suggestion into the message field (12+ characters)",
        "submit when form is valid",
      ],
      exampleFill: {
        category: "ruleset",
        state: "Chicago RLTO",
        message:
          "Please add a forwarding-address line on export for Chicago two-flats. Not legal advice.",
      },
    },
    actions: {
      fill: "window.sptAgentFormFill({ category, state?, email?, message? })",
      submit: "window.sptAgentFormSubmit()",
      dryRunSubmit: "window.sptAgentFormSubmit({ dryRun: true })",
      queryFill: "/feedback?category=ruleset&state=Chicago&message=...",
      hashFill: "#spt-fill=" + encodeURIComponent('{"category":"ruleset","message":"..."}'),
    },
    agent: {
      readOrder: [
        "window.__SPT_AGENT__",
        "#spt-feedback-snapshot",
        "https://simple-property.com/spt-ai-bus.json",
        "https://simple-property.com/llms.txt",
      ],
      event: "spt-agent-snapshot",
      eventFill: "spt-agent-form-filled",
    },
  };
}

/** @param {ReturnType<typeof buildFeedbackAgentSnapshot>} snapshot */
export function publishFeedbackAgentSnapshot(snapshot) {
  if (typeof window === "undefined") return;
  window.__SPT_AGENT__ = snapshot;
  let el = document.getElementById("spt-feedback-snapshot");
  if (!el) {
    el = document.createElement("script");
    el.id = "spt-feedback-snapshot";
    el.type = "application/json";
    el.setAttribute("data-spt-agent", "feedback");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(snapshot);
  try {
    document.dispatchEvent(new CustomEvent("spt-agent-snapshot", { detail: snapshot }));
  } catch {
    /* ignore */
  }
}

/** @param {URLSearchParams} params */
export function parseFeedbackFillFromSearch(params) {
  const out = {};
  const category = normalizeFeedbackCategory(params.get("category"));
  if (category) out.category = category;
  const state = params.get("state");
  if (state) out.state = state;
  const email = params.get("email");
  if (email) out.email = email;
  const message = params.get("message") || params.get("suggestion");
  if (message) out.message = message;
  return Object.keys(out).length ? out : null;
}

/** @param {string} hash */
export function parseFeedbackFillFromHash(hash) {
  const h = String(hash || "").replace(/^#/, "");
  if (!h) return null;
  if (h.startsWith("spt-fill=")) {
    try {
      const parsed = JSON.parse(decodeURIComponent(h.slice("spt-fill=".length)));
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * @param {{ form: HTMLFormElement, onFilled?: (r: object) => void }} opts
 */
export function registerFeedbackAgentApi(opts) {
  const form = opts.form;
  if (!form) return;

  function refresh() {
    publishFeedbackAgentSnapshot(buildFeedbackAgentSnapshot(form));
  }

  window.sptAgentFormFill = function sptAgentFormFill(payload) {
    const result = applyFormFields(form, payload || {});
    refresh();
    const values = readFeedbackForm(form);
    try {
      document.dispatchEvent(
        new CustomEvent("spt-agent-form-filled", {
          detail: { ...result, values },
        })
      );
    } catch {
      /* ignore */
    }
    opts.onFilled?.({ ...result, values });
    return {
      ...result,
      valid: feedbackFormIsValid(values),
    };
  };

  window.sptAgentFormSubmit = function sptAgentFormSubmit(options) {
    refresh();
    const snap = buildFeedbackAgentSnapshot(form);
    if (!snap.form.valid) {
      return { ok: false, reason: "invalid", snapshot: snap };
    }
    if (options?.dryRun) {
      return { ok: true, dryRun: true, snapshot: snap };
    }
    form.requestSubmit();
    return { ok: true, submitted: true };
  };

  window.addEventListener("message", (ev) => {
    if (ev.origin !== window.location.origin) return;
    const data = ev.data;
    if (data && data.type === "spt-agent-form-fill" && data.fill) {
      window.sptAgentFormFill(data.fill);
    }
  });

  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);

  const fromQuery = parseFeedbackFillFromSearch(new URLSearchParams(location.search));
  const fromHash = parseFeedbackFillFromHash(location.hash);
  const initial = { ...(fromQuery || {}), ...(fromHash || {}) };
  if (Object.keys(initial).length) {
    window.sptAgentFormFill(initial);
  } else {
    refresh();
  }
}

/** Persona payload for smokes · example.com only */
export const LANDLORD_FEEDBACK_SMOKE_FILL = {
  category: "ruleset",
  state: "Indiana 45-day",
  email: "operator@example.com",
  message:
    "Smoke probe: add forwarding-address reminder on export for Indiana small landlords. Ignore this ticket.",
};
