# Deploy · Simple Property Tools

**GitHub:** [SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property)

Repo was forked from Innsegall only as scaffolding; **ship target is Deposit Desk** (`docs/REPO_CANON.md`).

## Git

```bash
cd simple-property
git config user.name "S.P."
git config user.email "293159210+SP-Q26@users.noreply.github.com"
npm run preflight
git push origin main
```

## Vercel

1. Project → **SP-Q26/Simple-Property** · **Root directory:** `web`
2. Env from `web/.env.example` (Stripe, `SPT_ENTITLEMENT_SECRET`, KV, Resend, cron)
3. Stripe webhook → `https://simpleproperty.tools/api/stripe/webhook`

```bash
cd web && npx vercel --prod
```

## Post-deploy

- Smoke: `/`, `/pricing`, `/app?demo=pro`, one blog URL
- GSC sitemap · Stripe webhook 200
