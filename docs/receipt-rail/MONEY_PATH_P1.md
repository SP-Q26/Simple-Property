# Money path P1 · attack order (do not reorder)

**Program A only** until this gate is green. **P2 compare** (Berth / deductions / insurance attach) ships **after** P1, not in parallel.

## Sequence (operator)

1. **Move-out** (wizard step 3) · line-item withholds  
2. **Move-in proof** (wizard step 4) · album or room checklist  
3. **Finalize** (step 5) · packet bar · PBS row · telemetry `sp_finalize_*`  
4. **PDF** · watermarked preview free · mail-ready after unlock  
5. **Share** · copy link · copy TSV · optional tenant email (Pro)  
6. **Stripe** · one live path · `isles_brand=deposit_desk` on session + product metadata  

## Stripe (Deposit Desk only)

| SKU | When |
|-----|------|
| `turn_move_out` / `turn_full` | Step 5 paywall · requires `packet_id` |
| `monthly` / `annual` | Pro subscription · `/pricing` or success |

Keeper / Portfolio hub SKUs are **not** P1 money path · do not market as turnkey until hub P1 exits.

## Explicitly later (P2)

- `compare_report` template · paired move-in/out receipts  
- Berth / FieldDrop packet bar fork  
- Deduction exhibit automation beyond Deposit Desk packet  

## Gates

```bash
npm run audit:money-path
npm run smoke:checkout
npm run audit:receipt-rail
```

**Biggest risk:** shipping hub compare or hub billing before step 5 conversion + live turn checkout are stable.
