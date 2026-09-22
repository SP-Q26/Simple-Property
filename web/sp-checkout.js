(function () {
  "use strict";

  async function startCheckout(btn) {
    var sku = btn.getAttribute("data-sku") || "annual";
    var prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Opening checkout…";
    try {
      var res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: sku }),
      });
      var data = await res.json();
      if (data.url) location.href = data.url;
      else throw new Error(data.error || "checkout_failed");
    } catch (e) {
      btn.disabled = false;
      btn.textContent = prev;
      alert(
        "Checkout is not configured on this host yet. Add STRIPE_SECRET_KEY in Vercel, or use /app in demo mode after setting a test subscription in dev tools."
      );
    }
  }

  window.sptStartCheckout = startCheckout;

  document.querySelectorAll(".spt-checkout").forEach(function (btn) {
    btn.addEventListener("click", function () {
      startCheckout(btn);
    });
  });

  var params = new URLSearchParams(location.search);
  var buy = params.get("buy");
  if (buy === "monthly" || buy === "annual") {
    var auto = document.querySelector('.spt-checkout[data-sku="' + buy + '"]');
    if (auto) startCheckout(auto);
  }
})();
