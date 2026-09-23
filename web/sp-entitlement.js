(function () {
  "use strict";
  var TURN_KEY = "spt_turn_unlocks";

  function parseSub() {
    try {
      return JSON.parse(localStorage.getItem("spt_subscription") || "null");
    } catch (e) {
      return null;
    }
  }

  function getTurnUnlocks() {
    try {
      return JSON.parse(localStorage.getItem(TURN_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function isProActive(sub) {
    if (!sub || !sub.sig) return false;
    if (sub.plan === "turn") return false;
    if (sub.valid_until) {
      return new Date(sub.valid_until).getTime() > Date.now();
    }
    return sub.plan === "pro" || sub.sku === "monthly" || sub.sku === "annual";
  }

  function isActive(sub) {
    return isProActive(sub);
  }

  function hasTurnUnlockForPacket(packetId) {
    if (!packetId) return false;
    var ent = getTurnUnlocks()[packetId];
    return Boolean(ent && ent.sig && ent.plan === "turn");
  }

  function isSubscribed() {
    if (typeof global.sptIsDemoPro === "function" && global.sptIsDemoPro()) return true;
    return isProActive(parseSub());
  }

  function canExportPacket(packetId) {
    if (typeof global.sptIsDemoPro === "function" && global.sptIsDemoPro()) return true;
    if (isProActive(parseSub())) return true;
    return hasTurnUnlockForPacket(packetId);
  }

  function saveEntitlement(ent) {
    if (ent.plan === "turn" && ent.packet_id) {
      saveTurnUnlock(ent);
      return;
    }
    localStorage.setItem(
      "spt_subscription",
      JSON.stringify({
        product: ent.product,
        plan: ent.plan,
        sku: ent.sku,
        valid_until: ent.valid_until,
        stripe_session: ent.stripe_session,
        stripe_subscription: ent.stripe_subscription,
        stripe_customer: ent.stripe_customer,
        issued_at: ent.issued_at,
        sig: ent.sig,
        activatedAt: new Date().toISOString(),
      })
    );
  }

  function saveTurnUnlock(ent) {
    var map = getTurnUnlocks();
    map[ent.packet_id] = {
      product: ent.product,
      plan: ent.plan,
      sku: ent.sku,
      packet_id: ent.packet_id,
      valid_until: ent.valid_until,
      stripe_session: ent.stripe_session,
      stripe_customer: ent.stripe_customer,
      issued_at: ent.issued_at,
      sig: ent.sig,
      activatedAt: new Date().toISOString(),
    };
    localStorage.setItem(TURN_KEY, JSON.stringify(map));
  }

  async function refreshFromSession(sessionId) {
    var res = await fetch("/api/entitlement?session_id=" + encodeURIComponent(sessionId));
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || "entitlement_failed");
    saveEntitlement(data);
    return data;
  }

  async function refreshFromCustomer(customerId) {
    var res = await fetch("/api/entitlement?customer_id=" + encodeURIComponent(customerId));
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || "entitlement_failed");
    saveEntitlement(data);
    return data;
  }

  async function refreshFromMagic(magic, sig) {
    var q =
      "/api/entitlement?magic=" +
      encodeURIComponent(magic) +
      "&sig=" +
      encodeURIComponent(sig);
    var res = await fetch(q);
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || "entitlement_failed");
    saveEntitlement(data);
    return data;
  }

  async function requestMagicLink(email) {
    var res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || "magic_failed");
    return data;
  }

  async function bootstrapEntitlement() {
    var params = new URLSearchParams(location.search);
    var magic = params.get("magic");
    var sig = params.get("sig");
    if (magic && sig) {
      try {
        await refreshFromMagic(magic, sig);
        params.delete("magic");
        params.delete("sig");
        var clean = params.toString();
        history.replaceState({}, "", location.pathname + (clean ? "?" + clean : ""));
      } catch (e) {
        console.warn("spt magic", e);
      }
      return;
    }
    var sub = parseSub();
    if (!sub || !sub.stripe_customer) return;
    var expires = sub.valid_until ? new Date(sub.valid_until).getTime() : 0;
    var stale = !expires || expires - Date.now() < 3 * 86400000;
    if (stale && isProActive(sub)) {
      try {
        await refreshFromCustomer(sub.stripe_customer);
      } catch (e) {
        /* offline or inactive */
      }
    }
  }

  global.sptIsSubscribed = isSubscribed;
  global.sptCanExportPacket = canExportPacket;
  global.sptHasTurnUnlock = hasTurnUnlockForPacket;
  global.sptSaveEntitlement = saveEntitlement;
  global.sptRefreshEntitlement = refreshFromSession;
  global.sptRefreshFromCustomer = refreshFromCustomer;
  global.sptRequestMagicLink = requestMagicLink;
  global.sptBootstrapEntitlement = bootstrapEntitlement;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapEntitlement);
  } else {
    bootstrapEntitlement();
  }
})(window);
