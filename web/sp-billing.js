(function () {
  "use strict";

  async function openBillingPortal() {
    var sub;
    try {
      sub = JSON.parse(localStorage.getItem("spt_subscription") || "null");
    } catch (e) {
      sub = null;
    }
    if (!sub || !sub.stripe_customer) {
      alert("Subscribe first, then use Manage billing on this page or the link in your receipt email.");
      return;
    }
    try {
      var res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: sub.stripe_customer }),
      });
      var data = await res.json();
      if (data.url) location.href = data.url;
      else throw new Error(data.error || "portal_failed");
    } catch (e) {
      alert("Manage billing is unavailable right now. Use the link in your receipt email, or email hello@simple-property.com.");
    }
  }

  window.sptOpenBillingPortal = openBillingPortal;

  document.querySelectorAll(".spt-billing-portal").forEach(function (btn) {
    btn.addEventListener("click", openBillingPortal);
  });
})();
