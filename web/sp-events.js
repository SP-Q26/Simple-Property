/** Lightweight client events · Vercel Web Analytics + /api/events + KV rollups (no PII). */
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

  function utmDims() {
    var p = new URLSearchParams(location.search);
    var out = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = p.get(k);
      if (v) out[k] = String(v).slice(0, 64);
    });
    return out;
  }

  function postEvent(name, data) {
    var body = JSON.stringify({
      name: name,
      data: data,
      path: location.pathname,
      t: Date.now(),
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon("/api/events", body)) return;
    } catch (e1) {
      /* ignore */
    }
    try {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e2) {
      /* ignore */
    }
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
    postEvent(name, data);
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

  document.addEventListener("click", function (e) {
    var cta = e.target.closest(".guide-cta a.btn-primary, .hero-actions a.btn-primary");
    if (!cta || !cta.href) return;
    var href = cta.getAttribute("href") || "";
    track("spt_guide_cta_click", {
      href: href.slice(0, 120),
      page: location.pathname,
    });
  });

  function blogSlugFromPath() {
    var m = location.pathname.match(/^\/blog\/([^/?#]+)/);
    if (!m) return "";
    return m[1].replace(/\.html$/i, "");
  }

  function bootPageTelemetry() {
    var utm = utmDims();
    var page = document.body && document.body.getAttribute("data-spt-page");
    var slug = blogSlugFromPath();
    if (slug && slug !== "index") {
      track("spt_blog_view", Object.assign({ slug: slug }, utm));
    } else if (page && page !== "blog_post") {
      track("spt_page_view", Object.assign({ page: page, path: location.pathname }, utm));
    } else if (location.pathname === "/" || location.pathname === "") {
      track("spt_page_view", Object.assign({ page: "home", path: "/" }, utm));
    }
    var params = new URLSearchParams(location.search);
    var ref = params.get("ref") || params.get("utm_campaign") || "";
    if (ref && (page === "deposit_desk" || page === "app" || location.pathname === "/app")) {
      track("spt_start_intent", Object.assign({ ref: ref.slice(0, 64) }, utm));
    }
    if (location.pathname === "/hub" || page === "condition_hub") {
      track("hub_spa_view", { route: (location.hash || "#/").slice(0, 80) });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootPageTelemetry);
  } else {
    bootPageTelemetry();
  }

  window.addEventListener("hashchange", function () {
    if (location.pathname !== "/hub") return;
    track("hub_spa_view", { route: (location.hash || "#/").slice(0, 80) });
  });
})();
