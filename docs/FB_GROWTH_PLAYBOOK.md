# Facebook / paid social · growth playbook

**Goal:** Turn views into **wizard starts** and **step 5 unlocks**, not more guide reads.

## Link targets (use in every post)

| Creative | URL |
|----------|-----|
| Default turnover | `https://simple-property.com/app?state=IL&turnover=1&ref=fb&utm_source=facebook&utm_medium=paid` |
| Compare objection | `https://simple-property.com/blog/deposit-desk-vs-innago-avail-turnover` → CTA goes to `/app?turnover=1&ref=compare` |
| Pain / fear creative | `https://simple-property.com/pain` → `/app?turnover=1&ref=pain-hub` |
| SimplifyEm / free app | `/blog/deposit-desk-vs-simplifyem-turnover` · `/blog/deposit-desk-vs-turbotenant-tenantcloud-turnover` |
| Pricing anchor | `https://simple-property.com/pricing?utm_source=facebook` |
| Statute trust | `https://simple-property.com/legal/deposit-statutes` |

Swap `IL` for `utm_content=TX` (wizard reads `utm_content` as two-letter state).

## Telemetry (KV / weekly report)

Events to watch:

- `sp_landing_capture` · first touch UTMs
- `sp_fb_landing` · Facebook/Instagram source
- `spt_guide_cta_click` · blog primary button
- `sp_app_open` · wizard loaded with attribution
- `sp_wizard_start` · draft boot
- `paywall_view` · step 5 lock
- `checkout_intent` · Stripe click

```bash
npm run report:funnel-weekly
```

## Deploy gate

```bash
npm run train:growth
```

Includes money path, FB wiring, route series (compare + statutes), full `npm run audit`, and `smoke:prod`.

## Copy angles

- Avail/Innago run the lease · **Deposit Desk runs the week the keys come back.**
- **$350/hr** organize-the-packet counsel vs **$29–49/turn** unlock.
- Screenshot **watermarked preview** on step 5, not homepage hero.
