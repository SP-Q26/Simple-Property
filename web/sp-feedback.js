(function () {
  var form = document.getElementById("spt-feedback-form");
  var status = document.getElementById("spt-feedback-status");
  if (!form || !status) return;

  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    status.textContent = "Sending…";
    var data = new FormData(form);
    var payload = {
      category: data.get("category"),
      state: data.get("state"),
      email: data.get("email"),
      message: data.get("message"),
      website: data.get("website"),
    };
    try {
      var res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      var json = await res.json().catch(function () {
        return {};
      });
      if (res.ok && json.ok) {
        status.textContent = "Thanks. We read every suggestion. Not legal advice.";
        form.reset();
        return;
      }
      if (json.hint) {
        status.textContent = "Could not send automatically. Use email instead.";
        return;
      }
      status.textContent = "Could not send. Try hello@simple-property.com.";
    } catch (e) {
      status.textContent = "Network error. Email hello@simple-property.com.";
    }
  });
})();
