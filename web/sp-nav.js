(function () {
  "use strict";

  var LOCALES = [
    {
      "code": "DC",
      "name": "District of Columbia",
      "returnDays": 45,
      "cite": "D.C. Code § 42-3508.11",
      "statuteUrl": "https://code.dccouncil.gov/us/dc/council/code/sections/42-3508.11",
      "blog": "/blog#locale-DC",
      "app": "/app?state=DC"
    },
    {
      "code": "GA",
      "name": "Georgia",
      "returnDays": 30,
      "cite": "O.C.G.A. 44-7-34",
      "statuteUrl": "https://law.justia.com/codes/georgia/title-44/chapter-7/section-44-7-34/",
      "blog": "/blog#locale-GA",
      "app": "/app?state=GA"
    },
    {
      "code": "IA",
      "name": "Iowa",
      "returnDays": 30,
      "cite": "Iowa Code 562A.12",
      "statuteUrl": "https://www.legis.iowa.gov/docs/code/562A.12",
      "blog": "/blog#locale-IA",
      "app": "/app?state=IA"
    },
    {
      "code": "IL",
      "name": "Illinois",
      "returnDays": 30,
      "cite": "765 ILCS 715/",
      "statuteUrl": "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2065&ChapterID=57",
      "blog": "/blog#locale-IL",
      "app": "/app?state=IL"
    },
    {
      "code": "IN",
      "name": "Indiana",
      "returnDays": 45,
      "cite": "IC 32-31-3-12 et seq.",
      "statuteUrl": "https://iga.in.gov/statutes/ic/2024/titles/32/ar/t.32/ch.31",
      "blog": "/blog#locale-IN",
      "app": "/app?state=IN"
    },
    {
      "code": "LA",
      "name": "Louisiana",
      "returnDays": 30,
      "cite": "La. R.S. 9:3251",
      "statuteUrl": "https://www.legis.la.gov/Legis/Law.aspx?d=78289",
      "blog": "/blog#locale-LA",
      "app": "/app?state=LA"
    },
    {
      "code": "MD",
      "name": "Maryland",
      "returnDays": 45,
      "cite": "Md. Real Prop. § 8-203",
      "statuteUrl": "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gpr&section=8-203",
      "blog": "/blog#locale-MD",
      "app": "/app?state=MD"
    },
    {
      "code": "MI",
      "name": "Michigan",
      "returnDays": 30,
      "cite": "MCL 554.610",
      "statuteUrl": "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-610",
      "blog": "/blog#locale-MI",
      "app": "/app?state=MI"
    },
    {
      "code": "MO",
      "name": "Missouri",
      "returnDays": 30,
      "cite": "RSMo 535.300",
      "statuteUrl": "https://revisor.mo.gov/main/OneSection.aspx?section=535.300",
      "blog": "/blog#locale-MO",
      "app": "/app?state=MO"
    },
    {
      "code": "MS",
      "name": "Mississippi",
      "returnDays": 45,
      "cite": "Miss. Code § 89-8-21",
      "statuteUrl": "https://law.justia.com/codes/mississippi/title-89/chapter-8/section-89-8-21/",
      "blog": "/blog#locale-MS",
      "app": "/app?state=MS"
    },
    {
      "code": "NC",
      "name": "North Carolina",
      "returnDays": 30,
      "cite": "N.C.G.S. § 42-52",
      "statuteUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-52.html",
      "blog": "/blog#locale-NC",
      "app": "/app?state=NC"
    },
    {
      "code": "ND",
      "name": "North Dakota",
      "returnDays": 30,
      "cite": "N.D.C.C. § 47-16-07.1",
      "statuteUrl": "https://www.ndleg.gov/assembly/current-session/ncc/ncc/47-16-07-1.htm",
      "blog": "/blog#locale-ND",
      "app": "/app?state=ND"
    },
    {
      "code": "NH",
      "name": "New Hampshire",
      "returnDays": 30,
      "cite": "RSA 540-A:7",
      "statuteUrl": "https://www.gencourt.state.n.us/rsa/html/LIV/540-A/540-A-7.htm",
      "blog": "/blog#locale-NH",
      "app": "/app?state=NH"
    },
    {
      "code": "NJ",
      "name": "New Jersey",
      "returnDays": 30,
      "cite": "N.J.S.A. 46:8-21.1",
      "statuteUrl": "https://lis.njleg.gov/statute/N.J.S.A_46%3A8-21.1",
      "blog": "/blog#locale-NJ",
      "app": "/app?state=NJ"
    },
    {
      "code": "NV",
      "name": "Nevada",
      "returnDays": 30,
      "cite": "NRS 118A.242",
      "statuteUrl": "https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec242",
      "blog": "/blog#locale-NV",
      "app": "/app?state=NV"
    },
    {
      "code": "OH",
      "name": "Ohio",
      "returnDays": 30,
      "cite": "ORC 5321.16",
      "statuteUrl": "https://codes.ohio.gov/ohio-revised-code/section-5321.16",
      "blog": "/blog#locale-OH",
      "app": "/app?state=OH"
    },
    {
      "code": "UT",
      "name": "Utah",
      "returnDays": 30,
      "cite": "Utah Code § 57-17-3",
      "statuteUrl": "https://le.utah.gov/xcode/Title57/Chapter17/57-17-3.html",
      "blog": "/blog#locale-UT",
      "app": "/app?state=UT"
    },
    {
      "code": "VA",
      "name": "Virginia",
      "returnDays": 45,
      "cite": "Va. Code § 55.1-1226",
      "statuteUrl": "https://law.lis.virginia.gov/vacodefull/title55.1/chapter12/section55.1-1226/",
      "blog": "/blog#locale-VA",
      "app": "/app?state=VA"
    },
    {
      "code": "WA",
      "name": "Washington",
      "returnDays": 30,
      "cite": "RCW 59.18.280",
      "statuteUrl": "https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.280",
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

  function openStatute(loc) {
    if (!loc.statuteUrl) return;
    window.open(loc.statuteUrl, "_blank", "noopener,noreferrer");
  }

  function wireLocaleLink(link, loc) {
    link.addEventListener("click", function (e) {
      if (loc.statuteUrl && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openStatute(loc);
        return;
      }
      if (!onApp) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      try {
        sessionStorage.setItem("spt_preset_state", loc.code);
      } catch (err) {
        /* ignore */
      }
      history.replaceState({}, "", "/app?state=" + loc.code);
      window.dispatchEvent(new CustomEvent("spt-preset-state", { detail: { state: loc.code } }));
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
    a.setAttribute(
      "title",
      loc.name +
        " · " +
        loc.returnDays +
        "-day · " +
        (loc.cite || "statute") +
        " · missed clock costs more · tap opens desk · Ctrl+click opens official code"
    );
    wireLocaleLink(a, loc);
    parent.appendChild(a);
  }

  function buildCoverageMap() {
    var wrap = document.createElement("div");
    wrap.className = "locale-bar__map-wrap";

    var head = document.createElement("div");
    head.className = "locale-bar__map-head";

    var legend = document.createElement("div");
    legend.className = "coverage-map__legend";
    legend.innerHTML =
      '<span class="coverage-map__key coverage-map__key--30">30-day</span>' +
      '<span class="coverage-map__key coverage-map__key--45">45-day</span>' +
      '<span class="coverage-map__key coverage-map__key--muted">Tap state · Ctrl+chip = statute</span>';
    head.appendChild(legend);

    var statuteIndex = document.createElement("p");
    statuteIndex.className = "locale-bar__statute-index";
    statuteIndex.innerHTML =
      '<a href="/legal/deposit-statutes">Official deposit statutes</a> · 18 states + DC';
    head.appendChild(statuteIndex);

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
      wireLocaleLink(a, loc);
      li.appendChild(a);
      if (loc.statuteUrl) {
        li.appendChild(document.createTextNode(" · "));
        var law = document.createElement("a");
        law.href = loc.statuteUrl;
        law.setAttribute("rel", "noopener noreferrer");
        law.setAttribute("target", "_blank");
        law.textContent = loc.cite || loc.code + " statute";
        li.appendChild(law);
      }
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
