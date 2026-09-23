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

  var MAP_XY = {
    "DC": [
      178,
      52
    ],
    "GA": [
      168,
      78
    ],
    "IA": [
      108,
      42
    ],
    "IL": [
      118,
      44
    ],
    "IN": [
      124,
      44
    ],
    "LA": [
      112,
      82
    ],
    "MD": [
      172,
      54
    ],
    "MI": [
      126,
      32
    ],
    "MO": [
      108,
      52
    ],
    "MS": [
      122,
      74
    ],
    "NC": [
      168,
      62
    ],
    "ND": [
      98,
      22
    ],
    "NH": [
      182,
      28
    ],
    "NJ": [
      174,
      48
    ],
    "NV": [
      42,
      48
    ],
    "OH": [
      136,
      44
    ],
    "UT": [
      52,
      44
    ],
    "VA": [
      166,
      58
    ],
    "WA": [
      28,
      18
    ]
  };

  var SVG_NS = "http://www.w3.org/2000/svg";

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

  function buildCoverageMap() {
    var wrap = document.createElement("div");
    wrap.className = "locale-bar__map-wrap";

    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 120");
    svg.setAttribute("class", "coverage-map");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Deposit Desk coverage map · click a state");

    var plate = document.createElementNS(SVG_NS, "path");
    plate.setAttribute(
      "d",
      "M18,14 L188,10 L194,96 L22,102 Z M28,18 L52,44 L42,48 L38,38 L28,18 Z M98,22 L126,32 L136,44 L124,44 L118,44 L108,42 L98,22 Z M168,62 L168,78 L112,82 L122,74 L168,62 Z M172,54 L182,28 L174,48 L172,54 Z"
    );
    plate.setAttribute("class", "coverage-map__land");
    svg.appendChild(plate);

    LOCALES.forEach(function (loc) {
      var xy = MAP_XY[loc.code];
      if (!xy) return;
      var href = onBlog ? loc.blog : loc.app;
      var g = document.createElementNS(SVG_NS, "a");
      g.setAttribute("href", href);
      g.setAttribute("class", "coverage-map__state");
      g.setAttribute("data-code", loc.code);
      g.setAttribute("title", loc.name + " · " + loc.returnDays + "-day pack");

      var hitR = loc.code === "DC" ? "12" : "14";
      var hit = document.createElementNS(SVG_NS, "circle");
      hit.setAttribute("cx", String(xy[0]));
      hit.setAttribute("cy", String(xy[1]));
      hit.setAttribute("r", hitR);
      hit.setAttribute("class", "coverage-map__hit");
      g.appendChild(hit);

      var r = loc.code === "DC" ? "4.5" : "6.5";
      var dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", String(xy[0]));
      dot.setAttribute("cy", String(xy[1]));
      dot.setAttribute("r", r);
      dot.setAttribute(
        "class",
        loc.returnDays === 45 ? "coverage-map__dot coverage-map__dot--45" : "coverage-map__dot coverage-map__dot--30"
      );
      g.appendChild(dot);

      var label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", String(xy[0]));
      label.setAttribute("y", String(xy[1] + (loc.code === "DC" ? 2.5 : 3)));
      label.setAttribute("class", "coverage-map__label");
      label.textContent = loc.code;
      g.appendChild(label);

      wireAppPreset(g, loc.code);
      svg.appendChild(g);
    });

    wrap.appendChild(svg);

    var legend = document.createElement("div");
    legend.className = "coverage-map__legend";
    legend.innerHTML =
      '<span class="coverage-map__key coverage-map__key--30">30-day</span>' +
      '<span class="coverage-map__key coverage-map__key--45">45-day</span>' +
      '<span class="coverage-map__key coverage-map__key--muted">Click a dot · Chicago RLTO 45 on IL</span>';
    wrap.appendChild(legend);

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
    label.textContent = onBlog ? "Guides by state" : "Your state";
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
    document.querySelectorAll(".coverage-map__state").forEach(function (node) {
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
