/** Restore Pro · magic link + customer refresh */
(function (global) {
  "use strict";
  var SUB_KEY = "spt_subscription";

  function parseSub() {
    try {
      return JSON.parse(localStorage.getItem(SUB_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function isActive(sub) {
    if (!sub || !sub.sig) return false;
    if (sub.valid_until) {
      return new Date(sub.valid_until).getTime() > Date.now();
    }
    return Boolean(sub.plan || sub.sku);
  }

  function isSubscribed() {
    if (new URLSearchParams(location.search).get("demo") === "pro") return true;
    return isActive(parseSub());
  }

  function saveEntitlement(ent) {
    localStorage.setItem(
      SUB_KEY,
      JSON.stringify({
        plan: ent.plan,
        sku: ent.sku,
        valid_until: ent.valid_until,
        stripe_session: ent.stripe_session,
        stripe_subscription: ent.stripe_subscription,
        stripe_customer: ent.stripe_customer,
        sig: ent.sig,
        activatedAt: new Date().toISOString(),
      })
    );
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
    if (!res.ok && res.status !== 503) throw new Error(data.error || "magic_failed");
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
    if (stale && isActive(sub)) {
      try {
        await refreshFromCustomer(sub.stripe_customer);
      } catch (e) {
        /* offline or inactive */
      }
    }
  }

  global.sptIsSubscribed = isSubscribed;
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
