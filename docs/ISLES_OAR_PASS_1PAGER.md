# The OAR Pass · Isles operator adoption rubric

**OAR** = **Operator Adoption Rubric** — one named pass that brings a product from “we shipped features” to **on-your-team** voice, friction-low CTAs, and machine-checked brand.

**Receipt Rail products share the spine (packet, finalize, export). OAR is how each lane gets its own operator truth without sounding like the same SaaS template.**

| Reference lane | Voice canon | What “OAR grade” looks like |
|----------------|-------------|-----------------------------|
| **Simple Property** | [`DEPOSIT_DESK_OPERATOR_VOICE.md`](./DEPOSIT_DESK_OPERATOR_VOICE.md) | Mom-and-pop · Open Deposit Desk · 267 guides swept · `audit:adoption-voice` |
| **Ships.one** | SPQ `docs/receipt-rail/SHIPS_ONE_OPERATOR_VOICE.md` | Dock operator · Run dock demo · hold/packet language |
| **FieldDrop** | `fielddrop.co` gospel + lane hooks | Yard/vendor · “Three photos. Solid proof.” · per-lane accent only |

---

## When to run an OAR Pass

- Before a **marketing push**, state expansion, or “we’re getting views” moment.
- After a **big feature** (new hub, packet bar, checkout) so UI + guides + OG tags don’t drift.
- When copy feels **generic AI** or **enterprise PM** — that’s a signal, not a style choice.
- **Not** a substitute for legal review; OAR assumes “documentation only · not legal advice” (or lane equivalent) stays visible.

---

## The five layers (do in order)

```text
1. PERSONA  → who actually pays / panics / wins (1 page, named fears & words they use)
2. VOICE    → do/don’t table + tagline · hook · category (one sentence each)
3. SURFACES → landings · wizard · modules · email/OG · llms/gospel
4. CORPUS   → every guide/post: pain→fix→CTA block (scripted, not hand-edited)
5. GATES    → audits + prod smoke so drift can’t merge
```

Skip a layer and you get “great hero, dead blog footers” or “perfect audits, wrong persona.”

---

## Layer 1 · Persona (15 minutes, write it down)

Answer on one screen — **for this lane only**:

| Question | Bad answer | Good answer |
|----------|------------|-------------|
| Who is the buyer? | “Small businesses” | “Owner on the lease, 1–40 doors, spouse on texts” |
| What job are they hiring you for? | “Damage reports” | “Return or itemize on time after surrender” |
| What do they already use? | “Legacy tools” | “Excel + camera roll + Innago at rent; us at turnover” |
| What are they afraid of? | “Compliance” | “Missed 30-day clock · one-line cleaning fee text” |
| What is a win they can feel? | “Efficiency” | “Dated packet I can mail · deadline on screen” |
| Who is **not** the customer? | (silent) | “Enterprise PM, surveyor, legal outcome” |

Add **psychology** in one table: loss aversion · identity respect · fairness · seasonality/pricing model · stack-not-replace · honest limits.

That table is what makes copy feel **on their team** instead of **at them**.

---

## Layer 2 · Voice law (one page per product)

Clone the Ships.one shape — short, enforceable:

- **Say** · company name in footer · **SKU name** in product UI · **you/your** · their nouns (hold, surrender, driveway, gelcoat).
- **Don’t** · users · platform · supercharge/unlock/leverage · Pain:/Solution: labels · roadmap/P1 on guest HTML · em dash (use ` · `).
- **Structure** · `.ps-problem` + `.ps-fix` (or lane equivalent) · optional **team line** (“Built for X who Y—not Z”).
- **CTAs** · pick **one primary verb** per lane (`Open` · `Run` · `Walk`) · secondary = adjacent product.

**Tagline grammar (Isles):** three beats · concrete verbs · outcome or fee avoidance — not clever clock puns unless research-backed.

---

## Layer 3 · Surfaces checklist

| Surface | OAR requirement |
|---------|-----------------|
| Home hero | Problem → fix → team line → primary CTA uses voice verb |
| Product entry (`/app`, dock demo) | Same voice in `<title>`, intro, paywall loss line |
| Modules / hub | Pair products; no internal template_ids on UI |
| Pricing | Per-event mental model where seasonality matters |
| Locale / nav chrome | Microcopy names the product (“tap opens Deposit Desk”) |
| Legal / privacy | Chicago HQ or lane HQ · honest limits FAQ |
| **Open Graph / Twitter** | `sync-social-meta` (or lane equivalent) on **every** indexable page + hub preview |
| `llms.txt` + gospel JSON | Persona one-liner + when to suggest / when not |
| Stripe / checkout | Product name · not legal advice · Manage billing (not Customer Portal) |

**Social rule:** sharing links should show **operator outcome**, not “Start free” boilerplate unless that’s the researched hook.

---

## Layer 4 · Corpus sweep (blogs, guides, SEO)

Never hand-edit 200 posts. **Template + script:**

1. **Default pain lead** (2 spans: problem + fix + disclaimer).
2. **Guide CTA block** (primary → product with state param if needed · secondary → paired lane · pricing).
3. **Phrase sweep** (remove SaaS words; align CTA labels).
4. Re-run **related guides** / statute links if your repo has them.

**Simple Property commands (copy the pattern):**

```bash
npm run apply:adoption-voice    # manifest blog posts
npm run apply:cta-brand         # sitewide CTA strings
node scripts/sync-social-meta.mjs
```

New repo: one `refresh-*-voice.mjs` + one `audit-*-voice.mjs` + entry in full `npm run audit`.

---

## Layer 5 · Gates (what “this grade” means)

Minimum bar before **commit + push + prod**:

| Gate | Purpose |
|------|---------|
| `audit:adoption-voice` (or lane clone) | Persona on home · no SaaS hype on core pages · CTA/social rules |
| `audit:customer-voice` | No roadmap / TestFlight / Tier A on guest HTML |
| `audit:goal-copy` / blog goal | Every guide: pain framing + action verb + primary link |
| `audit:trust-voice` | No scareware · disclaimer · no tenant-bashing |
| `audit:em-dash` | No U+2014 in `web/` |
| `audit:social-share` | `<!-- spt-social -->` + versioned OG PNG on drop pages |
| `npm run audit` | Full chain green |
| `smoke-prod` | Live hero strings match what audits expect |

**Rule:** if prod smoke still checks old copy, **update smoke in the same PR** as the voice sweep.

---

## Rollout playbook (any Isles project)

| Day | Work |
|-----|------|
| **0** | Write `OPERATOR_VOICE.md` (persona + voice + CTAs). Point gospel/llms at it. |
| **1** | Patch home · pricing · product shell · modules. Bump design tokens if needed (fonts, spacing, accent — **lane may differ**, structure should not). |
| **2** | Script corpus refresh + social meta sync. |
| **3** | Add adoption audit + wire into CI. Run full audit + prod smoke. |
| **Ship** | Commit · push · verify OG in Meta debugger once. |

**Division of labor:** agent/repo owns **canon + scripts + audits**; operator owns WeWeb/canvas only where git doesn’t own the surface.

---

## Copy this file tree (new lane)

```text
docs/<LANE>_OPERATOR_VOICE.md     # Layer 1–2 canon
docs/ISLES_OAR_PASS_1PAGER.md     # this rubric (link, don’t fork blindly)
scripts/lib/adoption-voice.mjs    # TEAM_LINE, DEFAULT_PAIN_LEAD, phrase sweeps
scripts/refresh-adoption-voice.mjs
scripts/audit-adoption-voice.mjs
scripts/sweep-cta-brand.mjs
scripts/sync-social-meta.mjs      # DROP_PAGES list per product
web/.well-known/*-gospel.json     # voice field → operator doc
```

---

## One-line pitch (for stakeholders)

> **OAR Pass:** We name the real operator, write voice law once, sweep every guide and OG tag with scripts, and lock it with audits so the product sounds like it’s on their side—not another subscription dashboard.

---

## Simple Property · quick index

| Doc / command | |
|---------------|--|
| Lane voice | [`DEPOSIT_DESK_OPERATOR_VOICE.md`](./DEPOSIT_DESK_OPERATOR_VOICE.md) |
| Hub expansion | [`receipt-rail/CONDITION_HUB_ROADMAP_2026-10.md`](./receipt-rail/CONDITION_HUB_ROADMAP_2026-10.md) |
| Full audit | `npm run audit` |
| Brand sweep | `npm run sync:brand-sweep` |

**Maintainer:** bump this 1-pager when a lane adds a new gate or renames the pass — keep OAR the single Isles name for “Deposit Desk grade.”
