(function () {
  "use strict";

  var LOCALES = [
    {
      "code": "DC",
      "name": "District of Columbia",
      "returnDays": 45,
      "blog": "/blog#locale-DC",
      "app": "/app?state=DC"
    },
    {
      "code": "GA",
      "name": "Georgia",
      "returnDays": 30,
      "blog": "/blog#locale-GA",
      "app": "/app?state=GA"
    },
    {
      "code": "IA",
      "name": "Iowa",
      "returnDays": 30,
      "blog": "/blog#locale-IA",
      "app": "/app?state=IA"
    },
    {
      "code": "IL",
      "name": "Illinois",
      "returnDays": 30,
      "blog": "/blog#locale-IL",
      "app": "/app?state=IL"
    },
    {
      "code": "IN",
      "name": "Indiana",
      "returnDays": 45,
      "blog": "/blog#locale-IN",
      "app": "/app?state=IN"
    },
    {
      "code": "LA",
      "name": "Louisiana",
      "returnDays": 30,
      "blog": "/blog#locale-LA",
      "app": "/app?state=LA"
    },
    {
      "code": "MD",
      "name": "Maryland",
      "returnDays": 45,
      "blog": "/blog#locale-MD",
      "app": "/app?state=MD"
    },
    {
      "code": "MI",
      "name": "Michigan",
      "returnDays": 30,
      "blog": "/blog#locale-MI",
      "app": "/app?state=MI"
    },
    {
      "code": "MO",
      "name": "Missouri",
      "returnDays": 30,
      "blog": "/blog#locale-MO",
      "app": "/app?state=MO"
    },
    {
      "code": "MS",
      "name": "Mississippi",
      "returnDays": 45,
      "blog": "/blog#locale-MS",
      "app": "/app?state=MS"
    },
    {
      "code": "NC",
      "name": "North Carolina",
      "returnDays": 30,
      "blog": "/blog#locale-NC",
      "app": "/app?state=NC"
    },
    {
      "code": "ND",
      "name": "North Dakota",
      "returnDays": 30,
      "blog": "/blog#locale-ND",
      "app": "/app?state=ND"
    },
    {
      "code": "NH",
      "name": "New Hampshire",
      "returnDays": 30,
      "blog": "/blog#locale-NH",
      "app": "/app?state=NH"
    },
    {
      "code": "NJ",
      "name": "New Jersey",
      "returnDays": 30,
      "blog": "/blog#locale-NJ",
      "app": "/app?state=NJ"
    },
    {
      "code": "NV",
      "name": "Nevada",
      "returnDays": 30,
      "blog": "/blog#locale-NV",
      "app": "/app?state=NV"
    },
    {
      "code": "OH",
      "name": "Ohio",
      "returnDays": 30,
      "blog": "/blog#locale-OH",
      "app": "/app?state=OH"
    },
    {
      "code": "UT",
      "name": "Utah",
      "returnDays": 30,
      "blog": "/blog#locale-UT",
      "app": "/app?state=UT"
    },
    {
      "code": "VA",
      "name": "Virginia",
      "returnDays": 45,
      "blog": "/blog#locale-VA",
      "app": "/app?state=VA"
    },
    {
      "code": "WA",
      "name": "Washington",
      "returnDays": 30,
      "blog": "/blog#locale-WA",
      "app": "/app?state=WA"
    }
  ];

  var path = location.pathname.replace(/\/$/, "") || "/";
  var onBlog = path === "/blog";
  var onApp = path === "/app";

  function activeStateCode() {
    var params = new URLSearchParams(location.search);
    var fromQuery = params.get("state");
    if (fromQuery) return fromQuery.toUpperCase();
    if (onBlog) {
      var hash = location.hash || "";
      if (hash.indexOf("#locale-") === 0) return hash.slice(8).toUpperCase();
    }
    return "";
  }

  function wireAppPreset(link, code) {
    if (!onApp) return;
    link.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      try {
        sessionStorage.setItem("spt_preset_state", code);
      } catch (err) {
        /* ignore */
      }
      history.replaceState({}, "", "/app?state=" + code);
      window.dispatchEvent(new CustomEvent("spt-preset-state", { detail: { state: code } }));
    });
  }

  function appendBubble(parent, loc) {
    var href = onBlog ? loc.blog : loc.app;
    var a = document.createElement("a");
    a.className =
      "coverage-bubble " +
      (loc.returnDays === 45 ? "coverage-bubble--45" : "coverage-bubble--30");
    a.href = href;
    a.setAttribute("data-code", loc.code);
    a.textContent = loc.code;
    a.setAttribute("title", loc.name + " · " + loc.returnDays + "-day · wrong clock costs");
    wireAppPreset(a, loc.code);
    parent.appendChild(a);
  }

  function buildCoverageMap() {
    var wrap = document.createElement("div");
    wrap.className = "locale-bar__map-wrap";

    var head = document.createElement("div");
    head.className = "locale-bar__map-head";

    var kicker = document.createElement("p");
    kicker.className = "locale-bar__kicker field-hint";
    kicker.textContent = onBlog
      ? "One missed window or thin itemization costs more than tool fees · tap your state."
      : "Wrong color = wrong deadline · tap your state before turnover.";
    head.appendChild(kicker);

    var legend = document.createElement("div");
    legend.className = "coverage-map__legend";
    legend.innerHTML =
      '<span class="coverage-map__key coverage-map__key--30">30-day</span>' +
      '<span class="coverage-map__key coverage-map__key--45">45-day</span>' +
      '<span class="coverage-map__key coverage-map__key--muted">Color bar · scroll · tap</span>';
    head.appendChild(legend);
    wrap.appendChild(head);

    var plate = document.createElement("div");
    plate.className = "coverage-bubbles coverage-bubbles--strip";
    plate.setAttribute("role", "group");
    plate.setAttribute("aria-label", "Deposit return clocks by state · tap a color chip");

    var track = document.createElement("div");
    track.className = "coverage-bubbles__track";
    LOCALES.slice()
      .sort(function (a, b) {
        return a.code.localeCompare(b.code);
      })
      .forEach(function (loc) {
        appendBubble(track, loc);
      });
    plate.appendChild(track);
    wrap.appendChild(plate);

    return wrap;
  }

  function injectLocaleBar() {
    var header = document.querySelector(".site-header");
    if (!header || document.querySelector(".locale-bar")) return;

    var nav = document.createElement("nav");
    nav.className = "locale-bar no-print";
    nav.setAttribute("aria-label", "Choose your state");

    var label = document.createElement("span");
    label.className = "locale-bar__label";
    label.textContent = onBlog ? "Pain guides by state" : "Beat the clock · your state";
    nav.appendChild(label);

    nav.appendChild(buildCoverageMap());

    var sr = document.createElement("ul");
    sr.className = "locale-bar__sr";
    LOCALES.forEach(function (loc) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = onBlog ? loc.blog : loc.app;
      a.textContent = loc.name + " (" + loc.code + ")";
      wireAppPreset(a, loc.code);
      li.appendChild(a);
      sr.appendChild(li);
    });
    nav.appendChild(sr);

    header.insertAdjacentElement("afterend", nav);
  }

  function markActiveLocale() {
    var active = activeStateCode();
    document.querySelectorAll(".coverage-bubble, .locale-bar__pill").forEach(function (node) {
      var code = node.getAttribute("data-code");
      if (code === active) node.setAttribute("aria-current", "location");
      else node.removeAttribute("aria-current");
    });
  }

  document.querySelectorAll(".header-nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    var target = href.replace(/\/$/, "") || "/";
    if (target === path || (target !== "/" && path.startsWith(target))) {
      a.setAttribute("aria-current", "page");
    }
  });

  injectLocaleBar();
  markActiveLocale();
  window.addEventListener("hashchange", markActiveLocale);
})();
