(function () {
  "use strict";

  function bindMagicForms() {
    document.querySelectorAll("[data-spt-magic-form]").forEach(function (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var status = form.querySelector("[data-spt-magic-status]");
        var email = input && input.value.trim();
        if (!email) return;
        if (status) status.textContent = "Sending…";
        try {
          var data = await window.sptRequestMagicLink(email);
          if (status) status.textContent = data.message || "Check your inbox.";
        } catch (err) {
          if (status) status.textContent = "Could not send link. Try again later.";
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindMagicForms);
  } else {
    bindMagicForms();
  }
})();
