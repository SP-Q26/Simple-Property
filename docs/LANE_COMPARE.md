# Lane compare · Deposit Desk vs Innsegall machine

**Reference lane:** `innsegall/` (own git, `audit-lane`, gospel, blog factory, Stripe+Vercel).  
**This product:** `simple-property/` · mom-and-pop IL deposits · Homestead brand.

Automated gates: `cd web && npm run audit` (SPT swarm ≥ 95).  
Innsegall: `cd innsegall && npm run audit` (multi-script stack).

## Scorecard (qualitative /100)

| Dimension | Deposit Desk (now) | Innsegall (mature lane) | Gap / move |
|-----------|-------------------:|------------------------:|------------|
| Brand shell & tokens | 100 (gated) | 95+ | **Parity** on static HTML; Innsegall wins on **nav unity** (`innsegall-nav.js`) |
| Distinctive visual | 78 | 88 | Homestead is calm but **generic “nice SaaS”**; invest in **one** signature (mascot in OG, packet mock, barn texture) |
| SEO technical | 95 (gated) | 90+ | SPT **clean**; Innsegall has **more indexable surface** |
| SEO volume & intent | 55 | 92 | **7** IL guides vs **15+** Mac posts + comparisons + field reports |
| Agent discoverability | 100 | 95 | Bus + gospel + llms **shipped**; Innsegall adds **ai-discovery.json** pattern |
| Product depth | 82 | 90 | Wizard + print strong; Innsegall has **CLI + license + terminal** loop |
| Billing / entitlements | 88 | 90 | KV + webhook + portal + magic **match** alpha Innsegall; live env must be set on Vercel |
| Content ops / factory | 40 | 85 | No render pipeline, no scheduled posts, no CTA sync scripts |
| Motion / preview discipline | 30 | 80 (Luxe) | Static site; no splash gate (not needed for this SKU) |
| Distribution moat | 70 | 75 | **IL deposit lifecycle** is clearer wedge than “another Mac blog” |

**Honest headline:** Deposit Desk **matches or beats** Innsegall on **indie ship gates** (brand + agent + billing skeleton). It **does not yet match** on **content factory, corpus size, and brand weirdness**.

## Brand growth (thoughts)

1. **One memorable asset** — Use Homestead on **OG image**, print header, and email templates (not only favicon). Same move Innsegall used with clan/boat art on Stripe products.
2. **Voice lock** — Keep “packet · receipt · deadline”; add **one recurring colophon line** on every export PDF (product marketing inside the deliverable).
3. **Social proof without hype** — “Built for teams who answer their own phone” is right; add **2–3 anonymized scenario cards** (Chicago 45-day, suburban 30-day) on home — not testimonials, **situations**.
4. **Separate brand from SPQ** in customer minds — Domain `simpleproperty.tools`, product name **Deposit Desk**, umbrella **Simple Property Tools** (already correct). Avoid cross-linking SPQ terminal on marketing until IL lane stands alone.
5. **Do not Luxe-ify** — No splash theater; growth here is **trust + search + forums**, not motion.

## SEO (thoughts)

1. **Cluster completion** — Target **12–15** pages: every IL FAQ you answer in the wizard gets a **800-word guide** (normal wear, forwarding address, joint tenants, LLC owner).
2. **Comparison pages** — You have spreadsheet + inspection apps; add **TurboTenant / Hemlane deposit module** (factual, not snark).
3. **Structured data** — FAQPage on home (done); add **HowTo** on checklist post; **BreadcrumbList** on blog.
4. **Local intent** — One page each: **Chicago**, **Cook County suburbs**, **rest of IL** (same law, different anxiety).
5. **GSC** — After deploy, verify property, submit sitemap, watch “security deposit return Illinois” queries.

## Content (thoughts)

| Priority | Piece | Why |
|----------|-------|-----|
| P0 | `#8` “Normal wear vs damage Illinois” | Highest wizard friction |
| P0 | `#9` “Who counts as tenant for deposit return” | Reduces bad mailings |
| P1 | `#10` Deposit Desk vs TurboTenant | Competitor absorption (Innsegall playbook) |
| P1 | Monthly **deadline calendar** PDF lead magnet | Email list without full CRM |
| P2 | Short **YouTube-style script** in blog (text) | Landlords search “how to itemize deposit” |

Run after each batch: `node scripts/sync-blog-article-seo.mjs` · sitemap · vercel rewrites · `npm run audit`.

## Redeploy checklist

See `docs/DEPLOY.md`.

## Xano / extra API?

**Default: no Xano for v1.**

| Need | Today | If you outgrow |
|------|--------|----------------|
| Pro entitlement | Stripe webhook → **Vercel KV** | Keep |
| Magic link / email | **Resend** + KV tokens | Keep |
| Reminders | Cron + KV subscriptions | Keep |
| Packet data | **localStorage** (+ export PDF) | **Supabase** or WeWeb tables if true cloud sync |
| CMS / blog | Static HTML in git | MD pipeline (like Innsegall `render-blog-post`) before Xano |

Xano only pays off if you already run **other** SP properties on Xano and want one ops dashboard — it duplicates KV + adds sync work. **Do not** block launch on Xano.
