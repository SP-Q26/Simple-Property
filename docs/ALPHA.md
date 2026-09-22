# Alpha build checklist

## Proud-ship P0 (pass 2+)

- [x] Homestead brand · Simple Property Tools canon
- [x] `/api/entitlement` + signed unlock (Stripe session + KV customer)
- [x] Success onboarding + server verify
- [x] 5-step wizard · move-out itemization · print packet · saved packets
- [x] Marketing: deadline H1 · how-it-works · FAQ · trust · product proof
- [x] SEO: sitemap · OG · JSON-LD · llms.txt · **7** blog posts · Article sync script
- [x] Legal: privacy + terms (substantive, KV/reminders disclosed)
- [x] `npm run audit` gate (P0 + brand shell + **swarm ≥ 95**)

## P1 (Innsegall/Luxe tier — partial)

- [x] Webhook + server-side entitlement store (KV)
- [x] Magic link Pro restore (cross-device entitlement, not full packet cloud)
- [x] Deadline reminder emails (Resend + cron)
- [x] Photo attachments in packet
- [x] Stripe Customer Portal link
- [x] Comparison + depth guides (7 posts)
- [x] Agent bus + gospel (`spt-ai-bus.json`, `.well-known/spt-gospel.json`)
- [ ] Full account + cloud packet sync
- [ ] Innsegall-scale content factory + motion/preview gate

## Smoke test

1. `cd web && npx vercel dev`
2. `/app?demo=pro` → complete 5 steps → print
3. Pricing → checkout (test key) → success → `/app` export enabled
4. `npm run audit` → OK (swarm all ≥ 95)

See `docs/SWARM_AUDIT.md` for metric scores.
