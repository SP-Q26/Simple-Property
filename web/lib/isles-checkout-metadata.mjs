/**
 * Isles Stripe session metadata · Deposit Desk lane only on shared account.
 */
export const ISLES_BRAND_DEPOSIT_DESK = "deposit_desk";
export const ISLES_PORTFOLIO_THE_ISLES = "the_isles";

/**
 * @param {string} sku normalized catalog sku
 * @param {{ metadata?: Record<string, string>, sku?: string }} catalog stripe catalog entry
 * @param {{ packetId?: string }} opts
 */
export function buildDepositDeskCheckoutMetadata(sku, catalog, opts = {}) {
  const meta = {
    isles_portfolio: catalog.metadata?.isles_portfolio || ISLES_PORTFOLIO_THE_ISLES,
    isles_brand: catalog.metadata?.isles_brand || ISLES_BRAND_DEPOSIT_DESK,
    isles_lane: catalog.metadata?.isles_lane || `spt_${sku}`,
    isles_product: catalog.metadata?.isles_product || "deposit_desk",
    spt_sku: sku,
    spt_plan: catalog.metadata?.spt_plan || "pro",
    spt_units_max: catalog.metadata?.spt_units_max || "",
    spt_payer: "landlord",
  };
  if (opts.packetId) meta.spt_packet_id = opts.packetId;
  return meta;
}

/** Reject Innsegall or other brand sessions on the Deposit Desk webhook. */
export function isDepositDeskCheckoutMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return true;
  const brand = metadata.isles_brand;
  if (!brand) return true;
  return brand === ISLES_BRAND_DEPOSIT_DESK;
}
