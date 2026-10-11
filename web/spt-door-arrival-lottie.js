/**
 * Simple Property · greystone door-open on load (WWL through-motion)
 * Canon: docs/DOOR_ARRIVAL_LOTTIE.md
 */
(function (global) {
  "use strict";

  if (global.__sptDoorArrivalBoot) return;
  global.__sptDoorArrivalBoot = true;

  var PLAYER =
    "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
  var ASSET_JSON = "/lottie/spt-door-arrival-lottie.json";
  var ASSET_FALLBACK = "/lottie/spt-door-arrival-fallback.svg";
  var ASSET_VER = "1";
  var WALL_MS = 1600;
  var HOLD_MS = 420;
  var SESSION_KEY = "spt_door_arrival_seen";

  var playerLoading;
  var finished = false;

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
      s.src = PLAYER;
      s.onload = function () {
        resolve();
      };
      s.onerror = reject;
      global.document.head.appendChild(s);
    });
    return playerLoading;
  }

  function finishHost(host, fast) {
    if (!host || finished) return;
    finished = true;
    markSeen();
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

  function mountSvg(host) {
    var mount = host.querySelector("#sptDoorPlayer") || host;
    mount.innerHTML = "";
    var img = global.document.createElement("img");
    img.src = ASSET_FALLBACK + "?v=" + ASSET_VER;
    img.alt = "";
    img.decoding = "async";
    img.className = "spt-door-arrival__svg";
    mount.appendChild(img);
    global.setTimeout(function () {
      finishHost(host, false);
    }, reducedMotion() ? 280 : WALL_MS);
  }

  function mountLottie(host) {
    var mount = host.querySelector("#sptDoorPlayer");
    if (!mount) return;
    loadPlayer()
      .then(function () {
        if (finished || host.classList.contains("spt-door-arrival--done")) return;
        mount.innerHTML = "";
        var el = global.document.createElement("dotlottie-player");
        el.setAttribute("src", ASSET_JSON + "?v=" + ASSET_VER);
        el.setAttribute("autoplay", "");
        el.className = "spt-door-arrival__lottie";
        mount.appendChild(el);
        var doneTimer = global.setTimeout(function () {
          finishHost(host, false);
        }, WALL_MS + 80);
        el.addEventListener(
          "complete",
          function () {
            global.clearTimeout(doneTimer);
            finishHost(host, false);
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
    var host = ensureHost();
    if (!host) return;
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
