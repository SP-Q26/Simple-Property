(function () {
  "use strict";

  var METRO_NAV = [
    {
      "short": "Chi",
      "state": "IL",
      "city": "chicago-il",
      "label": "Chicago · RLTO",
      "href": "/app?state=IL&turnover=1&step=2&city=chicago-il",
      "tone": "chi"
    },
    {
      "short": "DC",
      "state": "DC",
      "city": "",
      "label": "Washington DC · RHCA",
      "href": "/app?state=DC&turnover=1&step=2",
      "tone": "dc"
    },
    {
      "short": "Mia",
      "state": "FL",
      "city": "miami-fl",
      "label": "Miami · Florida § 83.49",
      "href": "/app?state=FL&turnover=1&step=2&city=miami-fl",
      "tone": "mia"
    },
    {
      "short": "Tpa",
      "state": "FL",
      "city": "tampa-fl",
      "label": "Tampa · Florida § 83.49",
      "href": "/app?state=FL&turnover=1&step=2&city=tampa-fl",
      "tone": "tpa"
    },
    {
      "short": "ATL",
      "state": "GA",
      "city": "atlanta-ga",
      "label": "Atlanta · Georgia",
      "href": "/app?state=GA&turnover=1&step=2&city=atlanta-ga",
      "tone": "atl"
    }
  ];
  var METRO_NAV_MORE = [
    {
      "short": "Sea",
      "state": "WA",
      "city": "seattle-wa",
      "label": "Seattle · Washington",
      "href": "/app?state=WA&turnover=1&step=2&city=seattle-wa",
      "tone": "sea"
    },
    {
      "short": "LV",
      "state": "NV",
      "city": "las-vegas-nv",
      "label": "Las Vegas · Nevada",
      "href": "/app?state=NV&turnover=1&step=2&city=las-vegas-nv",
      "tone": "lv"
    },
    {
      "short": "NOLA",
      "state": "LA",
      "city": "new-orleans-la",
      "label": "New Orleans · Louisiana",
      "href": "/app?state=LA&turnover=1&step=2&city=new-orleans-la",
      "tone": "nola"
    },
    {
      "short": "BWI",
      "state": "MD",
      "city": "baltimore-md",
      "label": "Baltimore · Maryland",
      "href": "/app?state=MD&turnover=1&step=2&city=baltimore-md",
      "tone": "bwi"
    },
    {
      "short": "RVA",
      "state": "VA",
      "city": "richmond-va",
      "label": "Richmond · Virginia",
      "href": "/app?state=VA&turnover=1&step=2&city=richmond-va",
      "tone": "rva"
    },
    {
      "short": "ORL",
      "state": "FL",
      "city": "orlando-fl",
      "label": "Orlando · Florida",
      "href": "/app?state=FL&turnover=1&step=2&city=orlando-fl",
      "tone": "orl"
    }
  ];

  var LOCALES = [
    {
      "code": "AR",
      "name": "Arkansas",
      "returnDays": 60,
      "cite": "Ark. Code § 18-16-305",
      "statuteUrl": "https://www.arkleg.state.ar.us/ArkansasCode/Sections/DisplaySection?code=18-16-305",
      "blog": "/blog#locale-AR",
      "app": "/app?state=AR&turnover=1&step=2"
    },
    {
      "code": "CA",
      "name": "California",
      "returnDays": 21,
      "cite": "Cal. Civ. Code § 1950.5",
      "statuteUrl": "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5",
      "blog": "/blog#locale-CA",
      "app": "/app?state=CA&turnover=1&step=2"
    },
    {
      "code": "CO",
      "name": "Colorado",
      "returnDays": 30,
      "cite": "C.R.S. § 38-12-103",
      "statuteUrl": "https://law.justia.com/codes/colorado/title-38/article-12/section-38-12-103/",
      "blog": "/blog#locale-CO",
      "app": "/app?state=CO&turnover=1&step=2"
    },
    {
      "code": "CT",
      "name": "Connecticut",
      "returnDays": 21,
      "cite": "Conn. Gen. Stat. § 47a-21",
      "statuteUrl": "https://www.cga.ct.gov/current/pub/chap_831.htm#sec_47a-21",
      "blog": "/blog#locale-CT",
      "app": "/app?state=CT&turnover=1&step=2"
    },
    {
      "code": "DC",
      "name": "District of Columbia",
      "returnDays": 45,
      "cite": "D.C. Code § 42-3502.17",
      "statuteUrl": "https://code.dccouncil.gov/us/dc/council/code/sections/42-3502.17",
      "blog": "/blog#locale-DC",
      "app": "/app?state=DC&turnover=1&step=2"
    },
    {
      "code": "DE",
      "name": "Delaware",
      "returnDays": 20,
      "cite": "25 Del. C. § 5514",
      "statuteUrl": "https://delcode.delaware.gov/title25/c055/#5514",
      "blog": "/blog#locale-DE",
      "app": "/app?state=DE&turnover=1&step=2"
    },
    {
      "code": "FL",
      "name": "Florida",
      "returnDays": 30,
      "cite": "Fla. Stat. § 83.49",
      "statuteUrl": "https://www.flsenate.gov/Laws/Statutes/2024/083.49",
      "blog": "/blog#locale-FL",
      "app": "/app?state=FL&turnover=1&step=2"
    },
    {
      "code": "GA",
      "name": "Georgia",
      "returnDays": 30,
      "cite": "O.C.G.A. 44-7-34",
      "statuteUrl": "https://law.justia.com/codes/georgia/title-44/chapter-7/section-44-7-34/",
      "blog": "/blog#locale-GA",
      "app": "/app?state=GA&turnover=1&step=2"
    },
    {
      "code": "HI",
      "name": "Hawaii",
      "returnDays": 14,
      "cite": "Haw. Rev. Stat. § 521-38",
      "statuteUrl": "https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0521/HRS_0521-0038.htm",
      "blog": "/blog#locale-HI",
      "app": "/app?state=HI&turnover=1&step=2"
    },
    {
      "code": "IA",
      "name": "Iowa",
      "returnDays": 30,
      "cite": "Iowa Code 562A.12",
      "statuteUrl": "https://www.legis.iowa.gov/law/iowaCode/sections?codeChapter=562A&codeSection=562A.12",
      "blog": "/blog#locale-IA",
      "app": "/app?state=IA&turnover=1&step=2"
    },
    {
      "code": "IL",
      "name": "Illinois",
      "returnDays": 30,
      "cite": "765 ILCS 715/",
      "statuteUrl": "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2065&ChapterID=57",
      "blog": "/blog#locale-IL",
      "app": "/app?state=IL&turnover=1&step=2"
    },
    {
      "code": "IN",
      "name": "Indiana",
      "returnDays": 45,
      "cite": "IC 32-31-3-12 et seq.",
      "statuteUrl": "https://iga.in.gov/statutes/ic/2024/titles/32/ar/t.32/ch.31",
      "blog": "/blog#locale-IN",
      "app": "/app?state=IN&turnover=1&step=2"
    },
    {
      "code": "KY",
      "name": "Kentucky",
      "returnDays": 30,
      "cite": "KRS 383.580",
      "statuteUrl": "https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35733",
      "blog": "/blog#locale-KY",
      "app": "/app?state=KY&turnover=1&step=2"
    },
    {
      "code": "LA",
      "name": "Louisiana",
      "returnDays": 30,
      "cite": "La. R.S. 9:3251",
      "statuteUrl": "https://www.legis.la.gov/Legis/Law.aspx?d=78289",
      "blog": "/blog#locale-LA",
      "app": "/app?state=LA&turnover=1&step=2"
    },
    {
      "code": "MD",
      "name": "Maryland",
      "returnDays": 45,
      "cite": "Md. Real Prop. § 8-203",
      "statuteUrl": "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gpr&section=8-203",
      "blog": "/blog#locale-MD",
      "app": "/app?state=MD&turnover=1&step=2"
    },
    {
      "code": "MI",
      "name": "Michigan",
      "returnDays": 30,
      "cite": "MCL 554.610",
      "statuteUrl": "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-610",
      "blog": "/blog#locale-MI",
      "app": "/app?state=MI&turnover=1&step=2"
    },
    {
      "code": "MN",
      "name": "Minnesota",
      "returnDays": 21,
      "cite": "Minn. Stat. § 504B.178",
      "statuteUrl": "https://www.revisor.mn.gov/statutes/cite/504B.178",
      "blog": "/blog#locale-MN",
      "app": "/app?state=MN&turnover=1&step=2"
    },
    {
      "code": "MO",
      "name": "Missouri",
      "returnDays": 30,
      "cite": "RSMo 535.300",
      "statuteUrl": "https://revisor.mo.gov/main/OneSection.aspx?section=535.300",
      "blog": "/blog#locale-MO",
      "app": "/app?state=MO&turnover=1&step=2"
    },
    {
      "code": "MS",
      "name": "Mississippi",
      "returnDays": 45,
      "cite": "Miss. Code § 89-8-21",
      "statuteUrl": "https://law.justia.com/codes/mississippi/title-89/chapter-8/section-89-8-21/",
      "blog": "/blog#locale-MS",
      "app": "/app?state=MS&turnover=1&step=2"
    },
    {
      "code": "NC",
      "name": "North Carolina",
      "returnDays": 30,
      "cite": "N.C.G.S. § 42-52",
      "statuteUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_42/GS_42-52.html",
      "blog": "/blog#locale-NC",
      "app": "/app?state=NC&turnover=1&step=2"
    },
    {
      "code": "ND",
      "name": "North Dakota",
      "returnDays": 30,
      "cite": "N.D.C.C. § 47-16-07.1",
      "statuteUrl": "https://www.ndleg.gov/assembly/current-session/ncc/ncc/47-16-07-1.htm",
      "blog": "/blog#locale-ND",
      "app": "/app?state=ND&turnover=1&step=2"
    },
    {
      "code": "NE",
      "name": "Nebraska",
      "returnDays": 14,
      "cite": "Neb. Rev. Stat. § 76-1416",
      "statuteUrl": "https://nebraskalegislature.gov/laws/statutes.php?statute=76-1416",
      "blog": "/blog#locale-NE",
      "app": "/app?state=NE&turnover=1&step=2"
    },
    {
      "code": "NH",
      "name": "New Hampshire",
      "returnDays": 30,
      "cite": "RSA 540-A:7",
      "statuteUrl": "https://www.gencourt.state.n.us/rsa/html/LIV/540-A/540-A-7.htm",
      "blog": "/blog#locale-NH",
      "app": "/app?state=NH&turnover=1&step=2"
    },
    {
      "code": "NJ",
      "name": "New Jersey",
      "returnDays": 30,
      "cite": "N.J.S.A. 46:8-21.1",
      "statuteUrl": "https://lis.njleg.gov/statute/N.J.S.A_46%3A8-21.1",
      "blog": "/blog#locale-NJ",
      "app": "/app?state=NJ&turnover=1&step=2"
    },
    {
      "code": "NV",
      "name": "Nevada",
      "returnDays": 30,
      "cite": "NRS 118A.242",
      "statuteUrl": "https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec242",
      "blog": "/blog#locale-NV",
      "app": "/app?state=NV&turnover=1&step=2"
    },
    {
      "code": "OH",
      "name": "Ohio",
      "returnDays": 30,
      "cite": "ORC 5321.16",
      "statuteUrl": "https://codes.ohio.gov/ohio-revised-code/section-5321.16",
      "blog": "/blog#locale-OH",
      "app": "/app?state=OH&turnover=1&step=2"
    },
    {
      "code": "RI",
      "name": "Rhode Island",
      "returnDays": 20,
      "cite": "R.I. Gen. Laws § 34-18-19",
      "statuteUrl": "https://webserver.rilegislature.gov/Statutes/title34/34-18/34-18-19.htm",
      "blog": "/blog#locale-RI",
      "app": "/app?state=RI&turnover=1&step=2"
    },
    {
      "code": "SD",
      "name": "South Dakota",
      "returnDays": 21,
      "cite": "SDCL § 43-32-24",
      "statuteUrl": "https://sdlegislature.gov/statutes/DisplayStatute/?Type=Statute&Statute=43-32-24",
      "blog": "/blog#locale-SD",
      "app": "/app?state=SD&turnover=1&step=2"
    },
    {
      "code": "UT",
      "name": "Utah",
      "returnDays": 30,
      "cite": "Utah Code § 57-17-3",
      "statuteUrl": "https://le.utah.gov/xcode/Title57/Chapter17/57-17-3.html",
      "blog": "/blog#locale-UT",
      "app": "/app?state=UT&turnover=1&step=2"
    },
    {
      "code": "VA",
      "name": "Virginia",
      "returnDays": 45,
      "cite": "Va. Code § 55.1-1226",
      "statuteUrl": "https://law.lis.virginia.gov/vacodefull/title55.1/chapter12/section55.1-1226/",
      "blog": "/blog#locale-VA",
      "app": "/app?state=VA&turnover=1&step=2"
    },
    {
      "code": "VT",
      "name": "Vermont",
      "returnDays": 14,
      "cite": "9 V.S.A. § 4461",
      "statuteUrl": "https://legislature.vermont.gov/statutes/section/09/137/04461",
      "blog": "/blog#locale-VT",
      "app": "/app?state=VT&turnover=1&step=2"
    },
    {
      "code": "WA",
      "name": "Washington",
      "returnDays": 30,
      "cite": "RCW 59.18.280",
      "statuteUrl": "https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.280",
      "blog": "/blog#locale-WA",
      "app": "/app?state=WA&turnover=1&step=2"
    },
    {
      "code": "WV",
      "name": "West Virginia",
      "returnDays": 60,
      "cite": "W. Va. Code § 37-6A-2",
      "statuteUrl": "https://code.wvlegislature.gov/37-6A-2/",
      "blog": "/blog#locale-WV",
      "app": "/app?state=WV&turnover=1&step=2"
    }
  ];

  var path = location.pathname.replace(/\/$/, "") || "/";
  var onBlog = path === "/blog";
  var onApp = path === "/app";

  function presetStateFromStorage() {
    try {
      var stored = sessionStorage.getItem("spt_preset_state");
      return stored ? stored.toUpperCase() : "";
    } catch (err) {
      return "";
    }
  }

  function activeStateCode() {
    var params = new URLSearchParams(location.search);
    var fromQuery = params.get("state");
    if (fromQuery) return fromQuery.toUpperCase();
    var stored = presetStateFromStorage();
    if (stored) return stored;
    if (onBlog) {
      var hash = location.hash || "";
      if (hash.indexOf("#locale-") === 0) return hash.slice(8).toUpperCase();
    }
    return "";
  }

  function setPresetState(code) {
    if (!code) return;
    try {
      sessionStorage.setItem("spt_preset_state", code);
    } catch (err) {
      /* ignore */
    }
  }

  function dispatchPresetState(detail) {
    window.dispatchEvent(new CustomEvent("spt-preset-state", { detail: detail }));
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
      setPresetState(loc.code);
      if (!onApp) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      history.replaceState({}, "", "/app?state=" + encodeURIComponent(loc.code));
      dispatchPresetState({ state: loc.code });
      markActiveLocale();
    });
  }

  function wireMetroLink(link, metro) {
    link.setAttribute("data-state", metro.state);
    link.addEventListener("click", function (e) {
      setPresetState(metro.state);
      if (onApp && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
        e.preventDefault();
        history.replaceState({}, "", metro.href);
        dispatchPresetState({ state: metro.state, city: metro.city || "" });
        markActiveLocale();
        return;
      }
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
        " · missed clock costs more than the tool · tap opens Deposit Desk · Ctrl+click opens official code"
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
      '<span class="coverage-map__key coverage-map__key--hint">Your state · tap opens Deposit Desk · <strong>Ctrl+chip = official statute</strong></span>';
    head.appendChild(legend);

    var statuteIndex = document.createElement("p");
    statuteIndex.className = "locale-bar__statute-index";
    statuteIndex.innerHTML =
      '<a href="/legal/deposit-statutes">Official deposit statutes</a> · 32 states + DC';
    head.appendChild(statuteIndex);

    wrap.appendChild(head);

    var plate = document.createElement("div");
    plate.className = "coverage-bubbles coverage-bubbles--strip";
    plate.setAttribute("role", "group");
    plate.setAttribute("aria-label", "Deposit return clocks by state · tap a chip to open Deposit Desk");

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

  function injectMetroNav() {
    var nav = document.querySelector(".header-nav");
    if (!nav || nav.querySelector(".metro-nav")) return;
    var wrap = document.createElement("span");
    wrap.className = "metro-nav";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Metro desks");
    function addMetroLink(m, parent) {
      var a = document.createElement("a");
      a.className = "metro-nav__link metro-nav__link--" + m.tone;
      a.href = m.href;
      a.textContent = m.short;
      a.title = m.label + " · Deposit Desk";
      wireMetroLink(a, m);
      parent.appendChild(a);
    }
    METRO_NAV.forEach(function (m) {
      addMetroLink(m, wrap);
    });
    if (typeof METRO_NAV_MORE !== "undefined" && METRO_NAV_MORE.length) {
      var more = document.createElement("details");
      more.className = "metro-nav-more";
      var sum = document.createElement("summary");
      sum.className = "metro-nav-more__toggle";
      sum.textContent = "+";
      sum.setAttribute("aria-label", "More metro guides");
      sum.title = "More metros · Seattle · Vegas · DMV · Orlando";
      more.appendChild(sum);
      var tray = document.createElement("span");
      tray.className = "metro-nav-more__tray";
      METRO_NAV_MORE.forEach(function (m) {
        addMetroLink(m, tray);
      });
      more.appendChild(tray);
      wrap.appendChild(more);
    }
    var guides = nav.querySelector('a[href="/blog"]');
    if (guides) nav.insertBefore(wrap, guides);
    else nav.appendChild(wrap);
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

    if (path === "/app") {
      nav.classList.add("locale-bar--wizard");
      nav.classList.add("locale-bar--compact");
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "btn btn-secondary locale-bar__toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Change state";
      toggle.addEventListener("click", function () {
        var compact = nav.classList.toggle("locale-bar--compact");
        toggle.setAttribute("aria-expanded", compact ? "false" : "true");
        toggle.textContent = compact ? "Change state" : "Hide map";
      });
      nav.insertBefore(toggle, nav.firstChild?.nextSibling || null);
    }
  }

  function markActiveLocale() {
    var active = activeStateCode();
    document.querySelectorAll(".coverage-bubble, .locale-bar__pill").forEach(function (node) {
      var code = node.getAttribute("data-code");
      if (active && code === active) node.setAttribute("aria-current", "location");
      else node.removeAttribute("aria-current");
    });
    document.querySelectorAll(".metro-nav__link").forEach(function (node) {
      var code = node.getAttribute("data-state");
      if (active && code === active) node.setAttribute("aria-current", "location");
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

  injectMetroNav();
  injectLocaleBar();
  markActiveLocale();
  window.addEventListener("hashchange", markActiveLocale);
  window.addEventListener("popstate", markActiveLocale);
  window.addEventListener("spt-preset-state", markActiveLocale);
})();
