# Deposit Desk · run guide

Operator commands after content or wizard changes.

## Content pipeline (blog)

```bash
cd simple-property
node scripts/generate-state-expansion-blogs.mjs   # when adding states
node scripts/build-blog-seo.mjs                   # index clusters · RSS · sitemap blog URLs
node scripts/sync-social-meta.mjs                 # OG/Twitter on drop pages + articles
node scripts/audit-state-blog-coverage.mjs
npm run audit
```

One-liner:

```bash
npm run build-blog && npm run sync:seo && npm run audit
```

## Brand locale (nav tag + `sp-nav.js`)

```bash
npm run sync:locale
```

## Deploy smoke (apex)

```bash
SPT_SMOKE_URL=https://simple-property.com npm run smoke:full
```

Includes magic-link shape probe (`smoke-prod-magic-link.mjs`).

## Vercel env (P0 ops)

Production needs Stripe, KV, Resend, and webhook URL. Magic-link **sends mail** only when Resend env is set; otherwise API still returns a generic success message (no enumeration).

See `docs/STRIPE_SMOKE.md` and `docs/VERCEL_SETUP.md`.
