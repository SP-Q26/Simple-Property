/** Lightweight client events · Vercel Web Analytics + optional beacon (no PII). */
(function () {
  "use strict";

  function track(name, props) {
    if (!name) return;
    var data = props && typeof props === "object" ? props : {};
    try {
      if (typeof window.va === "function") {
        window.va("event", { name: name, data: data });
      }
    } catch (e) {
      /* ignore */
    }
    try {
      var body = JSON.stringify({
        name: name,
        data: data,
        path: location.pathname,
        t: Date.now(),
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/events", body);
      }
    } catch (e2) {
      /* ignore */
    }
  }

  window.sptTrack = track;

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".spt-checkout");
    if (!btn) return;
    track("checkout_click", {
      sku: btn.getAttribute("data-sku") || "",
      packet: btn.getAttribute("data-packet-id") ? "1" : "0",
    });
  });
})();
