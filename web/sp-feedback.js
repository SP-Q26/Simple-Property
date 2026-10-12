import {
  registerFeedbackAgentApi,
  LANDLORD_FEEDBACK_SMOKE_FILL,
} from "./lib/agent-form-fill.mjs";

const form = document.getElementById("spt-feedback-form");
const status = document.getElementById("spt-feedback-status");
if (!form || !status) {
  /* page partial */
} else {
  registerFeedbackAgentApi({ form });

  if (new URLSearchParams(location.search).get("smoke") === "fill") {
    window.sptAgentFormFill?.(LANDLORD_FEEDBACK_SMOKE_FILL);
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    status.textContent = "Sending…";
    const data = new FormData(form);
    const payload = {
      category: data.get("category"),
      state: data.get("state"),
      email: data.get("email"),
      message: data.get("message"),
      website: data.get("website"),
    };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        status.textContent = "Thanks. We read every suggestion. Not legal advice.";
        form.reset();
        window.sptAgentFormFill?.({});
        return;
      }
      if (json.hint) {
        status.textContent = "Could not send automatically. Use email instead.";
        return;
      }
      status.textContent = "Could not send. Try hello@simple-property.com.";
    } catch {
      status.textContent = "Network error. Email hello@simple-property.com.";
    }
  });
}
