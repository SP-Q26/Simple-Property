/**
 * The Isles Collective · shared hosted Checkout chrome (dark).
 * Deposit Desk lane · same account as Innsegall / Ships.one / FieldDrop.
 */

/** Blend of lane backgrounds: Ships #071018 · Innsegall #122A42 · FieldDrop #0a0d0b */
export const ISLES_COLLECTIVE_CHECKOUT = {
  background_color: "#0E1A24",
  /** Beam gold - Innsegall #F4C95D · Ships #c9a227 · SPT greystone accent */
  button_color: "#D4B84A",
};

export const ISLES_STRIPE_API_VERSION =
  process.env.STRIPE_API_VERSION || "2025-09-30.clover";

export function islesCheckoutBrandingEnabled() {
  const v = (process.env.ISLES_CHECKOUT_BRANDING || "").trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off") return false;
  return true;
}

/**
 * Session branding_settings (Checkout hosted page).
 * Pass display_name / icon only when you want lane label on the sheet.
 */
export function islesCheckoutBrandingSettings(overrides = {}) {
  const settings = {
    background_color:
      overrides.background_color || ISLES_COLLECTIVE_CHECKOUT.background_color,
    button_color: overrides.button_color || ISLES_COLLECTIVE_CHECKOUT.button_color,
  };
  if (overrides.display_name) settings.display_name = overrides.display_name;
  if (overrides.icon) settings.icon = overrides.icon;
  return settings;
}

export function withIslesCheckoutBranding(params, brandingOverrides = {}) {
  if (!islesCheckoutBrandingEnabled()) return params;
  return {
    ...params,
    branding_settings: islesCheckoutBrandingSettings(brandingOverrides),
  };
}

/**
 * Create Checkout Session with Isles dark branding; strip branding on API mismatch (no 500).
 */
function brandingError(msg) {
  return /branding|Invalid object|unknown parameter|received unknown/i.test(msg);
}

export async function createIslesCheckoutSession(stripe, params, brandingOverrides = {}) {
  if (!islesCheckoutBrandingEnabled()) {
    return stripe.checkout.sessions.create(params);
  }
  const branded = withIslesCheckoutBranding(params, brandingOverrides);
  try {
    return await stripe.checkout.sessions.create(branded);
  } catch (e) {
    const msg = e?.message || String(e);
    if (!brandingError(msg)) throw e;
    if (brandingOverrides.icon) {
      const { icon: _i, ...restOverrides } = brandingOverrides;
      const noIcon = withIslesCheckoutBranding(params, restOverrides);
      try {
        return await stripe.checkout.sessions.create(noIcon);
      } catch (e2) {
        if (!brandingError(e2?.message || "")) throw e2;
      }
    }
    const { branding_settings: _b, ...rest } = branded;
    return stripe.checkout.sessions.create(rest);
  }
}
