/**
 * Simple Property · greystone door-open on load (WWL through-motion)
 * Canon: docs/DOOR_ARRIVAL_LOTTIE.md · timing: scripts/lib/door-arrival-canon.mjs
 */
(function (global) {
  "use strict";

  if (global.__sptDoorArrivalBoot) return;
  global.__sptDoorArrivalBoot = true;

  var PLAYER = "/vendor/dotlottie-player.mjs";
  var ASSET_JSON = "/lottie/spt-door-arrival-lottie.json";
  var ASSET_FALLBACK = "/lottie/spt-door-arrival-fallback.svg";
  var ASSET_VER = "3";
  var HOLD_MS = 420;
  var FLOOR_MS = 780;
  var WALL_MS = 1600;
  var SESSION_KEY = "spt_door_arrival_seen";
  var LOCK_CLASS = "spt-door-arrival-lock";

  var playerLoading;
  var finished = false;
  var arrivalStarted = 0;
  var wallTimer;

  function shouldPlay() {
    if (global.document.documentElement.getAttribute("data-spt-door-arrival") === "off") {
      return false;
    }
    try {
      if (global.sessionStorage.getItem(SESSION_KEY) === "1") return false;
    } catch (e) {
      /* ignore */
    }
    return true;
  }

  function markSeen() {
    try {
      global.sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function reducedMotion() {
    try {
      return global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function lockScroll() {
    global.document.documentElement.classList.add(LOCK_CLASS);
  }

  function unlockScroll() {
    global.document.documentElement.classList.remove(LOCK_CLASS);
  }

  function ensureHost() {
    var host = global.document.getElementById("sptDoorArrival");
    if (host) return host;
    host = global.document.createElement("div");
    host.id = "sptDoorArrival";
    host.className = "spt-door-arrival";
    host.setAttribute("aria-hidden", "true");
    var glow = global.document.createElement("div");
    glow.className = "spt-door-arrival__glow";
    glow.setAttribute("aria-hidden", "true");
    var player = global.document.createElement("div");
    player.id = "sptDoorPlayer";
    player.className = "spt-door-arrival__player";
    host.appendChild(glow);
    host.appendChild(player);
    global.document.body.insertBefore(host, global.document.body.firstChild);
    return host;
  }

  function loadPlayer() {
    if (global.customElements && global.customElements.get("dotlottie-player")) {
      return Promise.resolve();
    }
    if (playerLoading) return playerLoading;
    playerLoading = new Promise(function (resolve, reject) {
      var s = global.document.createElement("script");
      s.type = "module";
      s.src = PLAYER + "?v=" + ASSET_VER;
      s.onload = function () {
        resolve();
      };
      s.onerror = reject;
      global.document.head.appendChild(s);
    });
    return playerLoading;
  }

  function clearWallTimer() {
    if (wallTimer) {
      global.clearTimeout(wallTimer);
      wallTimer = null;
    }
  }

  function finishHost(host, fast) {
    if (!host || finished) return;
    finished = true;
    clearWallTimer();
    markSeen();
    unlockScroll();
    host.classList.add("spt-door-arrival--done");
    try {
      global.dispatchEvent(new CustomEvent("spt:door-arrival-complete"));
    } catch (e) {
      /* ignore */
    }
    if (fast) return;
    global.setTimeout(function () {
      if (host.parentNode) host.parentNode.removeChild(host);
    }, 320);
  }

  function requestFinish(host, fast) {
    if (!host || finished) return;
    var elapsed = Date.now() - arrivalStarted;
    if (elapsed < FLOOR_MS) {
      global.setTimeout(function () {
        finishHost(host, fast);
      }, FLOOR_MS - elapsed);
      return;
    }
    finishHost(host, fast);
  }

  function scheduleWall(host, wallMs) {
    clearWallTimer();
    var cap = wallMs == null ? WALL_MS : wallMs;
    var elapsed = Date.now() - arrivalStarted;
    var remain = Math.max(0, cap - elapsed);
    wallTimer = global.setTimeout(function () {
      finishHost(host, false);
    }, remain);
  }

  function ensureMonogram(mount) {
    var el = mount.querySelector(".spt-door-arrival__monogram");
    if (el) return el;
    el = global.document.createElement("div");
    el.className = "spt-door-arrival__monogram";
    el.textContent = "SP";
    el.setAttribute("aria-hidden", "true");
    mount.appendChild(el);
    return el;
  }

  function mountSvg(host) {
    var mount = host.querySelector("#sptDoorPlayer") || host;
    mount.innerHTML = "";
    ensureMonogram(mount);
    var img = global.document.createElement("img");
    img.src = ASSET_FALLBACK + "?v=" + ASSET_VER;
    img.alt = "";
    img.decoding = "async";
    img.className = "spt-door-arrival__svg";
    mount.appendChild(img);
    scheduleWall(host, reducedMotion() ? 360 : WALL_MS);
  }

  function mountLottie(host) {
    var mount = host.querySelector("#sptDoorPlayer");
    if (!mount) return;
    loadPlayer()
      .then(function () {
        if (finished || host.classList.contains("spt-door-arrival--done")) return;
        mount.innerHTML = "";
        ensureMonogram(mount);
        var el = global.document.createElement("dotlottie-player");
        el.setAttribute("src", ASSET_JSON + "?v=" + ASSET_VER);
        el.setAttribute("autoplay", "");
        el.setAttribute("loop", "false");
        el.setAttribute("mode", "normal");
        el.className = "spt-door-arrival__lottie";
        mount.appendChild(el);
        scheduleWall(host);
        el.addEventListener(
          "complete",
          function () {
            requestFinish(host, false);
          },
          { once: true }
        );
      })
      .catch(function () {
        mountSvg(host);
      });
  }

  function kick() {
    if (finished || !shouldPlay()) return;
    arrivalStarted = Date.now();
    var host = ensureHost();
    if (!host) return;
    lockScroll();
    host.classList.remove("spt-door-arrival--done");
    host.style.animationDelay = HOLD_MS + "ms";
    if (reducedMotion()) {
      mountSvg(host);
      return;
    }
    mountLottie(host);
  }

  global.sptDoorArrivalKick = kick;
  global.sptDoorArrivalFinish = function (fast) {
    finishHost(global.document.getElementById("sptDoorArrival"), !!fast);
  };

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", kick);
  } else {
    kick();
  }
})(typeof window !== "undefined" ? window : globalThis);
