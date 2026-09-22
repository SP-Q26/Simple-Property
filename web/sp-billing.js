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
      alert("Manage billing after you subscribe — checkout saves your Stripe customer id in this browser.");
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
      alert("Billing portal is not available on this host yet. Use the link in your Stripe receipt email.");
    }
  }

  window.sptOpenBillingPortal = openBillingPortal;

  document.querySelectorAll(".spt-billing-portal").forEach(function (btn) {
    btn.addEventListener("click", openBillingPortal);
  });
})();
