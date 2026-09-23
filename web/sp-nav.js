(function () {
  "use strict";

  var LOCALES = [
    {
      "code": "DC",
      "name": "District of Columbia",
      "blog": "/blog#locale-DC",
      "app": "/app?state=DC"
    },
    {
      "code": "GA",
      "name": "Georgia",
      "blog": "/blog#locale-GA",
      "app": "/app?state=GA"
    },
    {
      "code": "IA",
      "name": "Iowa",
      "blog": "/blog#locale-IA",
      "app": "/app?state=IA"
    },
    {
      "code": "IL",
      "name": "Illinois",
      "blog": "/blog#locale-IL",
      "app": "/app?state=IL"
    },
    {
      "code": "IN",
      "name": "Indiana",
      "blog": "/blog#locale-IN",
      "app": "/app?state=IN"
    },
    {
      "code": "LA",
      "name": "Louisiana",
      "blog": "/blog#locale-LA",
      "app": "/app?state=LA"
    },
    {
      "code": "MD",
      "name": "Maryland",
      "blog": "/blog#locale-MD",
      "app": "/app?state=MD"
    },
    {
      "code": "MI",
      "name": "Michigan",
      "blog": "/blog#locale-MI",
      "app": "/app?state=MI"
    },
    {
      "code": "MO",
      "name": "Missouri",
      "blog": "/blog#locale-MO",
      "app": "/app?state=MO"
    },
    {
      "code": "MS",
      "name": "Mississippi",
      "blog": "/blog#locale-MS",
      "app": "/app?state=MS"
    },
    {
      "code": "NC",
      "name": "North Carolina",
      "blog": "/blog#locale-NC",
      "app": "/app?state=NC"
    },
    {
      "code": "ND",
      "name": "North Dakota",
      "blog": "/blog#locale-ND",
      "app": "/app?state=ND"
    },
    {
      "code": "NH",
      "name": "New Hampshire",
      "blog": "/blog#locale-NH",
      "app": "/app?state=NH"
    },
    {
      "code": "NJ",
      "name": "New Jersey",
      "blog": "/blog#locale-NJ",
      "app": "/app?state=NJ"
    },
    {
      "code": "NV",
      "name": "Nevada",
      "blog": "/blog#locale-NV",
      "app": "/app?state=NV"
    },
    {
      "code": "OH",
      "name": "Ohio",
      "blog": "/blog#locale-OH",
      "app": "/app?state=OH"
    },
    {
      "code": "UT",
      "name": "Utah",
      "blog": "/blog#locale-UT",
      "app": "/app?state=UT"
    },
    {
      "code": "VA",
      "name": "Virginia",
      "blog": "/blog#locale-VA",
      "app": "/app?state=VA"
    },
    {
      "code": "WA",
      "name": "Washington",
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

    var list = document.createElement("div");
    list.className = "locale-bar__pills";

    LOCALES.forEach(function (loc) {
      var a = document.createElement("a");
      a.className = "locale-pill";
      a.href = onBlog ? loc.blog : loc.app;
      a.setAttribute("title", loc.name + (onBlog ? " · guides" : " · open Deposit Desk"));
      a.innerHTML =
        "<span class=\"locale-pill__code\">" +
        loc.code +
        "</span><span class=\"locale-pill__name\">" +
        loc.name +
        "</span>";
      if (onApp) {
        a.addEventListener("click", function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          try {
            sessionStorage.setItem("spt_preset_state", loc.code);
          } catch (err) {
            /* ignore */
          }
          history.replaceState({}, "", loc.app);
          window.dispatchEvent(new CustomEvent("spt-preset-state", { detail: { state: loc.code } }));
        });
      }
      list.appendChild(a);
    });

    nav.appendChild(list);
    header.insertAdjacentElement("afterend", nav);
  }

  function markActiveLocale() {
    var active = activeStateCode();
    document.querySelectorAll(".locale-pill").forEach(function (a) {
      var codeEl = a.querySelector(".locale-pill__code");
      if (!codeEl) return;
      if (codeEl.textContent === active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
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
