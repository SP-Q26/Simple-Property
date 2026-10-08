/** Home · geo-aware primary CTAs from ?state= or locale bar preset. Founded in Chicago · multistate. */
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

  function apply() {
    var code = stateFromContext();
    var href = hrefForState(code);
    document.querySelectorAll("[data-spt-geo-cta]").forEach(function (el) {
      el.setAttribute("href", href);
    });
    var primary = document.getElementById("hero-cta-primary");
    if (primary && !code) primary.setAttribute("href", PRESET.IL);
    else if (primary) primary.setAttribute("href", href);
  }

  window.addEventListener("spt-preset-state", function () {
    apply();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
