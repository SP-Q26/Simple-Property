/** Home · geo CTAs + optional traction line (single request) */
(function () {
  "use strict";

  var TURNOVER = "turnover=1&step=2";
  var PRESET = {
    IL: "/app?state=IL&city=chicago-il&" + TURNOVER,
    DC: "/app?state=DC&" + TURNOVER,
    FL: "/app?state=FL&city=miami-fl&" + TURNOVER,
  };

  function stateFromContext() {
    var params = new URLSearchParams(location.search);
    var q = (params.get("state") || "").toUpperCase();
    if (q) return q;
    try {
      return (sessionStorage.getItem("spt_preset_state") || "").toUpperCase();
    } catch (e) {
      return "";
    }
  }

  function hrefForState(code) {
    if (PRESET[code]) return PRESET[code];
    if (code) return "/app?state=" + encodeURIComponent(code) + "&" + TURNOVER;
    return PRESET.IL;
  }

  function applyCtas() {
    var code = stateFromContext();
    var href = hrefForState(code);
    document.querySelectorAll("[data-spt-geo-cta]").forEach(function (el) {
      el.setAttribute("href", href);
    });
    var primary = document.getElementById("hero-cta-primary");
    if (primary && !code) primary.setAttribute("href", PRESET.IL);
    else if (primary) primary.setAttribute("href", href);
  }

  function loadTraction() {
    var el = document.getElementById("hero-traction");
    if (!el) return;
    fetch("/data/public-traction.json", { credentials: "same-origin" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (d) {
        if (!d || !d.landlordsMin) return;
        var j = d.jurisdictionsMin ? d.landlordsMin + "+ jurisdictions" : "32 states + DC";
        el.textContent = d.landlordsMin + "+ landlords · " + j + " · paperwork-ready packets";
        el.hidden = false;
      })
      .catch(function () {});
  }

  window.addEventListener("spt-preset-state", applyCtas);

  function boot() {
    applyCtas();
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadTraction, { timeout: 2000 });
    } else {
      loadTraction();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
