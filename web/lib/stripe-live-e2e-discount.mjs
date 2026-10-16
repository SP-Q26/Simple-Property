/**
 * @see ../../../scripts/lib/stripe-live-e2e-discount.mjs (keep in sync)
 */
export function applyLiveE2eDiscount(sessionParams, body) {
  const token = process.env.STRIPE_LIVE_E2E_TOKEN?.trim();
  const coupon = process.env.STRIPE_LIVE_E2E_COUPON_ID?.trim();
  if (!token || !coupon) return sessionParams;

  const got = String(body?.e2e_token ?? "").trim();
  if (!got || got !== token) return sessionParams;

  const metadata = {
    ...(sessionParams.metadata || {}),
    isles_live_e2e: "1",
  };

  return {
    ...sessionParams,
    metadata,
    discounts: [{ coupon }],
  };
}
