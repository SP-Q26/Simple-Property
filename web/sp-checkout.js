(function () {
  "use strict";

  async function startCheckout(btn) {
    var sku = btn.getAttribute("data-sku") || "annual";
    var prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Opening checkout…";
    var body = { sku: sku };
    if (btn.getAttribute("data-packet-id")) {
      body.packet_id = btn.getAttribute("data-packet-id");
    } else if (typeof window.sptCurrentPacketId === "function") {
      var pid = window.sptCurrentPacketId();
      if (pid) body.packet_id = pid;
    }
    try {
      var res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (data.error === "packet_id_required") {
        alert("Open the wizard and reach step 5 before unlocking this packet, or save your draft first.");
        throw new Error("packet_id_required");
      }
      if (data.url) location.href = data.url;
      else throw new Error(data.error || "checkout_failed");
    } catch (e) {
      btn.disabled = false;
      btn.textContent = prev;
      if (e.message !== "packet_id_required") {
        alert(
          "Checkout is unavailable right now. Email hello@simple-property.com and we will send a checkout link."
        );
      }
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
  if (buy === "monthly" || buy === "annual" || buy === "turn_move_out" || buy === "turn_full") {
    var auto = document.querySelector('.spt-checkout[data-sku="' + buy + '"]');
    if (auto) startCheckout(auto);
  }
})();
