# Condition hub · expansion roadmap (Oct 2026)

**Context:** Deposit Desk is earning traffic and PBS v1 on step 5. Condition hub stays **noindex** until P1 server receipts gate closes (see [ACHIEVABLE_NOW.md](./ACHIEVABLE_NOW.md)).

---

## Product pairing

| Lane | URL | Job |
|------|-----|-----|
| **Deposit Desk** | `/app` | Statutory deposit packet · deadlines · deductions |
| **Condition hub** | `/hub` | Move-in / move-out room proof · compare · handoff |

**Handoff:** `sessionStorage` key `spt_hub_desk_handoff_v1` + `/app?ref=condition-hub` (Deposit Desk reads handoff in P1).

---

## Shipped in alpha (browser-local)

| Slice | Code |
|-------|------|
| Walkthrough wizards | `hub-templates.mjs` · `hub-app.js` |
| Lock + vault | `finalizeReceipt` · `renderVault` |
| **PBS export after lock** | `hub-packet-export.mjs` · `#/receipts/:id/done` |
| **Move-in vs move-out table** | `compareReceiptSections` on unit history |
| **Desk CTA** | move-out done screen + compare-ready unit history |
| Telemetry | `hub_receipt_finalized` · `hub_desk_handoff_click` · packet bar with `isles_brand: condition_hub` |

---

## Next expansions (ordered)

### Wave A · while Desk SEO runs (no backend)

1. **Blog CTAs** — `ref=condition-hub` on condition-hub posts → `/hub` and `/app`.
2. **Modules + launch-stack** — Keeper/Portfolio story tied to hub caps (marketing only until Stripe SKUs).
3. **Import stub** — read `spt_saved_packets` from Deposit Desk into hub metadata (read-only preview).
4. **Compare PDF** — print stylesheet for side-by-side table (client print, like hub record print).

### Wave B · P1 train (server)

1. Org DB + auth (reuse operator magic link).
2. Signed photo uploads (replace URL-only fields).
3. Server PDF + watermark rules aligned with Desk.
4. Receipt magic link for tenant ack.
5. Stripe **Keeper** / **Portfolio** entitlements.
6. Deposit Desk **consumes** `spt_hub_desk_handoff_v1` to prefill step 1–2.

### Wave C · moat

1. `compare_report` template (paired finalized receipts).
2. Amend chain UI (parent → correction receipts).
3. Index `/hub` when **10 server-finalized** hub receipts exist in prod (gate in ACHIEVABLE_NOW).

---

## Audits

```bash
npm run audit:hub-alpha
npm run audit:packet-bar
```

---

## Doc links

- [CODE_MAP.md](./CODE_MAP.md)
- [SIMPLE_PROPERTY_EXPANSION.md](./SIMPLE_PROPERTY_EXPANSION.md)
- [PACKET_BAR_SWEEP_v1.md](./PACKET_BAR_SWEEP_v1.md)
