/** Home + blog court-record rotation · shared snippet fetch cache */
(function () {
  "use strict";

  var blogCard = document.querySelector("[data-spt-court-card]");
  var heroLine = document.getElementById("hero-rotate");
  if (!heroLine && !blogCard) return;

  var isHome = !blogCard;
  var card = blogCard || heroLine.closest(".court-record-card");
  var lineEl = blogCard ? blogCard.querySelector("[data-spt-court-line]") : heroLine;
  var linkEl = card.querySelector("[data-spt-court-source]");
  var kickerEl = isHome ? document.getElementById("court-record-kicker") : null;
  if (!lineEl || !card) return;

  var blogStates = blogCard
    ? (blogCard.dataset.states || "")
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean)
    : [];
  var metro = blogCard ? (blogCard.dataset.cityPreset || "").trim() : "";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var snippetData = null;
  var rotateStop = null;

  function activeStateCode() {
    if (!isHome) return "";
    var q = new URLSearchParams(location.search).get("state");
    if (q) return q.toUpperCase();
    try {
      var stored = sessionStorage.getItem("spt_preset_state");
      if (stored) return stored.toUpperCase();
    } catch (e) {}
    var chip = document.querySelector(".coverage-bubble[aria-current='location']");
    return chip && chip.getAttribute("data-code") ? chip.getAttribute("data-code").toUpperCase() : "";
  }

  function loadSnippets() {
    if (window.__sptCourtSnippetsP) return window.__sptCourtSnippetsP;
    window.__sptCourtSnippetsP = fetch("/data/court-record-snippets.json", { credentials: "same-origin" }).then(
      function (res) {
        if (!res.ok) throw new Error("snippets");
        return res.json();
      }
    );
    return window.__sptCourtSnippetsP;
  }

  function poolFrom(data) {
    var list = data.snippets || [];
    var code = isHome ? activeStateCode() : "";
    if (isHome && code) {
      var statePool = list.filter(function (s) {
        return s.states && s.states.indexOf(code) !== -1;
      });
      if (statePool.length) return statePool;
    }
    if (isHome) {
      var home = list.filter(function (s) {
        return s.home;
      });
      return home.length
        ? home
        : list.filter(function (s) {
            return s.fallback;
          });
    }
    if (metro) {
      var metroPool = list.filter(function (s) {
        return s.metros && s.metros.indexOf(metro) !== -1;
      });
      if (metroPool.length) return metroPool;
    }
    if (blogStates.length) {
      var blogPool = list.filter(function (s) {
        return (
          s.states &&
          blogStates.some(function (c) {
            return s.states.indexOf(c) !== -1;
          })
        );
      });
      if (blogPool.length) return blogPool;
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

  function flashCard() {
    card.classList.remove("is-court-flash");
    void card.offsetWidth;
    card.classList.add("is-court-flash");
    window.setTimeout(function () {
      card.classList.remove("is-court-flash");
    }, 650);
  }

  function startRotate(pool) {
    if (rotateStop) rotateStop();
    if (pool.length < 2 || reduced) return;
    var index = 0;
    var timer = null;

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

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      if (timer) return;
      timer = window.setInterval(tick, 8000);
    }

    rotateStop = stop;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    start();
  }

  function refresh(flash) {
    if (!snippetData) return;
    var code = activeStateCode();
    if (kickerEl) {
      var railLabel = kickerEl.querySelector(".court-record-strip__rail-text");
      var target = railLabel || kickerEl;
      target.textContent = code ? "The " + code + " court clerk record" : "The court clerk record";
    }
    if (isHome) {
      if (code) card.setAttribute("data-spt-court-state", code);
      else card.removeAttribute("data-spt-court-state");
    }
    var pool = poolFrom(snippetData);
    if (!pool.length) return;
    applySnippet(pool[0]);
    startRotate(pool);
    if (flash) flashCard();
  }

  function boot() {
    if (isHome && card.classList.contains("court-record-card--strip")) {
      card.addEventListener("pointerenter", function () {
        card.classList.add("is-strip-hover");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-strip-hover");
      });
    }
    loadSnippets()
      .then(function (data) {
        snippetData = data;
        refresh(false);
        if (isHome) {
          window.addEventListener("spt-preset-state", function () {
            refresh(true);
          });
          window.addEventListener("popstate", function () {
            refresh(true);
          });
        }
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

  if ("requestIdleCallback" in window) requestIdleCallback(boot, { timeout: 1500 });
  else setTimeout(boot, 1);
})();
