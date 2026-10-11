/** Home + blog court-record rotation · shared snippet fetch cache */
(function () {
  "use strict";

  var heroLine = document.getElementById("hero-rotate");
  var blogCard = document.querySelector("[data-spt-court-card]");
  if (!heroLine && !blogCard) return;

  var card = blogCard || (heroLine && heroLine.closest(".court-record-card"));
  var lineEl = blogCard ? blogCard.querySelector("[data-spt-court-line]") : heroLine;
  var linkEl = blogCard ? blogCard.querySelector("[data-spt-court-source]") : null;
  if (!lineEl || !card) return;

  var isHome = !blogCard;
  var states = blogCard
    ? (blogCard.dataset.states || "")
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean)
    : [];
  var metro = blogCard ? (blogCard.dataset.cityPreset || "").trim() : "";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadSnippets() {
    if (window.__sptCourtSnippetsP) return window.__sptCourtSnippetsP;
    window.__sptCourtSnippetsP = fetch("/data/court-record-snippets.json", {
      credentials: "same-origin",
    }).then(function (res) {
      if (!res.ok) throw new Error("snippets");
      return res.json();
    });
    return window.__sptCourtSnippetsP;
  }

  function poolFrom(data) {
    var list = data.snippets || [];
    if (isHome) {
      var home = list.filter(function (s) {
        return s.home;
      });
      return home.length ? home : list.filter(function (s) {
        return s.fallback;
      });
    }
    if (metro) {
      var metroPool = list.filter(function (s) {
        return s.metros && s.metros.indexOf(metro) !== -1;
      });
      if (metroPool.length) return metroPool;
    }
    if (states.length) {
      var statePool = list.filter(function (s) {
        return s.states && states.some(function (c) {
          return s.states.indexOf(c) !== -1;
        });
      });
      if (statePool.length) return statePool;
    }
    return list.filter(function (s) {
      return s.fallback;
    });
  }

  function applySnippet(snippet) {
    lineEl.textContent = snippet.text;
    if (linkEl && snippet.sourceUrl) {
      linkEl.href = snippet.sourceUrl;
      linkEl.textContent = snippet.sourceLabel || "Source";
    }
  }

  function startRotate(pool) {
    if (pool.length < 2 || reduced) return;

    var index = 0;
    var timer = null;

    function flashCard() {
      card.classList.remove("is-court-flash");
      void card.offsetWidth;
      card.classList.add("is-court-flash");
      window.setTimeout(function () {
        card.classList.remove("is-court-flash");
      }, 650);
    }

    function show(next) {
      flashCard();
      lineEl.classList.add("is-fading");
      window.setTimeout(function () {
        applySnippet(pool[next]);
        lineEl.classList.remove("is-fading");
        lineEl.classList.add("is-entering");
        window.setTimeout(function () {
          lineEl.classList.remove("is-entering");
        }, 400);
      }, 280);
    }

    function tick() {
      index = (index + 1) % pool.length;
      show(index);
    }

    function start() {
      if (timer) return;
      timer = window.setInterval(tick, 8000);
    }

    function stop() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  function boot() {
    loadSnippets()
      .then(function (data) {
        var pool = poolFrom(data);
        if (!pool.length) return;
        applySnippet(pool[0]);
        startRotate(pool);
      })
      .catch(function () {
        lineEl.textContent =
          "Small claims dockets still turn on surrender dates, itemized withholds, and mail proof, not lease end alone.";
        if (linkEl) {
          linkEl.href = "/legal/deposit-statutes";
          linkEl.textContent = "Deposit statutes index";
        }
      });
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(boot, { timeout: 1500 });
  } else {
    setTimeout(boot, 1);
  }
})();
