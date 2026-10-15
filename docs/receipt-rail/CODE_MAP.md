# Receipt Rail · code map (alpha)

**Status:** Program B · browser-local until P1 DB. Deposit Desk (`web/app.js`) remains Program A.

| Layer | Path | Role |
|-------|------|------|
| Spine types + finalize/amend | `web/lib/receipt-spine.mjs` | Entity shapes · `createReceiptDraft` · `finalizeReceipt` · `amendReceipt` |
| Module registry | `web/lib/hub-templates.mjs` | `template_id` → rooms · P1: `move_in_baseline`, `move_out_condition` |
| Persistence | `web/lib/hub-store.mjs` | `localStorage` key `spt_hub_v1` |
| Demo seed | `web/lib/hub-fixtures.mjs` | Greystone two-flat sample |
| Hub UI | `web/hub.html` · `web/hub-app.js` | Hash routes · capture → review → vault |
| Packet bar (PBS v1) | `web/lib/packet-bar.mjs` · `web/app.js` step 5 | Copy link · TSV row · print · `.ics` |
| Modules marketing | `web/modules.html` | Public module list |
| Gate | `scripts/audit-hub-alpha.mjs` | CI / `npm run audit:hub-alpha` |

**Grammar:** [LANE.md](./LANE.md) · **Phases:** [SIMPLE_PROPERTY_EXPANSION.md](./SIMPLE_PROPERTY_EXPANSION.md)

**Import path (future):** `spt_saved_packets` JSON → migration script → `createReceiptDraft` with `deposit_deduction_exhibit` / `move_out_condition` metadata.
