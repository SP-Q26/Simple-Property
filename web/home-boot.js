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

  function wireFaqDoors() {
    var root = document.getElementById("home-faq");
    if (!root) return;
    var doors = root.querySelectorAll("details.faq-door");
    if (!doors.length) return;

    doors.forEach(function (door) {
      door.addEventListener("toggle", function () {
        if (!door.open) return;
        doors.forEach(function (other) {
          if (other !== door && other.open) other.open = false;
        });
      });
    });

    root.querySelectorAll(".faq-doors-jump a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function (ev) {
        var id = (link.getAttribute("href") || "").slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) return;
        ev.preventDefault();
        openFaqGroup(id, true);
      });
    });

    function openFaqGroup(id, smooth) {
      var group = id ? document.getElementById(id) : null;
      if (!group || !root.contains(group)) return;
      var first = group.querySelector("details.faq-door");
      if (first) {
        doors.forEach(function (d) {
          if (d !== first) d.open = false;
        });
        first.open = true;
      }
      if (smooth) {
        group.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", "#" + id);
      }
    }

    function openFaqFromHash() {
      var id = (location.hash || "").replace(/^#/, "");
      if (!id || id.indexOf("faq-") !== 0) return;
      openFaqGroup(id, false);
      var group = document.getElementById(id);
      if (group) group.scrollIntoView({ block: "start" });
    }

    openFaqFromHash();
    window.addEventListener("hashchange", openFaqFromHash);
  }

  function boot() {
    applyCtas();
    wireFaqDoors();
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
