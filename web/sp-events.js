/** Lightweight client events · Vercel Web Analytics + /api/events (no PII). */
(function () {
  "use strict";

  var PII_KEY_RE = /(email|e_mail|address|street|tenant|landlord|phone|zip|name|mail|recipient|to_|from_)/i;

  function scrub(props) {
    var data = props && typeof props === "object" ? props : {};
    var out = {};
    for (var key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      if (PII_KEY_RE.test(key) || key === "receipt_id") continue;
      var val = data[key];
      if (typeof val === "string" && val.indexOf("@") !== -1) continue;
      out[key] = val;
    }
    return out;
  }

  function track(name, props) {
    if (!name) return;
    var data = scrub(props);
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
    var sku = btn.getAttribute("data-sku") || "";
    track("checkout_intent", {
      sku: sku,
      page: location.pathname,
      isles_brand: "deposit_desk",
    });
    track("checkout_click", { sku: sku, packet: btn.getAttribute("data-packet-id") ? "1" : "0" });
  });

  document.addEventListener("click", function (e) {
    var mod = e.target.closest("[data-spt-module]");
    if (!mod) return;
    track("spt_module_click", { module: mod.getAttribute("data-spt-module") || "" });
  });

  function bootPageTelemetry() {
    var page = document.body && document.body.getAttribute("data-spt-page");
    if (page) {
      track("spt_page_view", { page: page, path: location.pathname });
    }
    var blogMatch = location.pathname.match(/^\/blog\/([^/]+)\.html$/);
    if (blogMatch) {
      track("spt_blog_view", { slug: blogMatch[1] });
    }
    var params = new URLSearchParams(location.search);
    var ref = params.get("ref") || params.get("utm_campaign") || "";
    if (ref && (page === "app" || location.pathname === "/app")) {
      track("spt_start_intent", { ref: ref.slice(0, 64) });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootPageTelemetry);
  } else {
    bootPageTelemetry();
  }
})();
