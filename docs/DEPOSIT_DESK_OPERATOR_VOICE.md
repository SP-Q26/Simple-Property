# Deposit Desk · operator voice (copy law)

**Site:** [simple-property.com](https://simple-property.com) · **Products:** **Deposit Desk** (statutory packet) · **Condition hub** (move-in/out walkthroughs).  
Say **Simple Property Tools** in footer; say **Deposit Desk** or **Condition hub** for the tool they are in.

**Tagline:** Itemize it. Date it. Never pay the fees.  
**Hook (pain):** Spreadsheets break at surrender date. The clock does not.  
**Category:** Documentation for small landlords at turnover—not property management software.

**Process name:** [**OAR Pass**](./ISLES_OAR_PASS_1PAGER.md) (Operator Adoption Rubric) · reuse on every Isles lane.

Canon siblings: Ships.one operator voice (SPQ `docs/receipt-rail/SHIPS_ONE_OPERATOR_VOICE.md`) · FieldDrop gospel (field service lanes).

---

## Who we talk to (primary persona)

**Mom-and-pop operator** · often the owner on the lease · **1–40 doors** · 1–3 people on the team (spouse, bookkeeper, part-time handyman). They already use a bank, maybe Innago/Avail/Stessa for rent, and **Excel or camera roll** for deposits.

| Trait | Detail |
|-------|--------|
| **Job** | Return or itemize on time after surrender; prove move-in condition when withhold is questioned |
| **Fear** | Missed statutory window · vague “cleaning fee” text · no dated photos · counsel cleanup bill |
| **Win** | Dated packet, line items, deadline on screen, print/PDF they can mail |
| **Not** | Enterprise PM, institutional investor desk, inspection-photo subscription, legal advice |

### Psychology (adoption)

| Lever | How we use it |
|-------|----------------|
| **Loss aversion** | Clock and penalties—without scareware or “guaranteed win” |
| **Identity** | “You run the doors” · respect their competence; we fill the paperwork gap |
| **Fairness** | Neutral on tenants—disputes are about **records**, not villains |
| **Seasonality** | Per-turn pricing beats “another monthly sub” in quiet months |
| **Stacking** | Deposit Desk **beside** rent tools at turnover, not replacing them |
| **Trust** | Honest limits (browser storage, no legal outcomes) · Chicago-founded credibility |

### Tastes (do)

- Short sentences. Turnover weeks are chaotic.
- **You / your doors / your packet**—not “users” or “the platform.”
- Words they already use: **surrender**, **itemize**, **withhold**, **move-in proof**, **line items**, **deadline**, **receipt**.
- **We're on your side** via product facts: built for small landlords, stays in the deposit lane, complements their stack.
- Admit preview limits (watermarked print, device storage) without internal roadmap jargon.

### Dislikes (don't)

| Avoid | Why |
|-------|-----|
| SaaS cheer · supercharge · unlock · leverage · game-changer | Feels like VC software, not a tool belt |
| **Users**, **end users**, **stakeholders** | Dehumanizes mom-and-pop |
| **Customer Portal** | Say **Manage billing** on simple-property.com |
| **Pain:** / **Solution:** labels in hero | Use `.ps-problem` / `.ps-fix` only |
| Tenant-bashing · sue your tenant · crush | Trust killer; stay documentation-neutral |
| **PM suite** / **all-in-one** for us | We are a lane, not AppFolio |
| Roadmap · alpha · P1 · template_id on UI | Internal only (`audit-customer-voice`) |
| Em dash | Style gate (`audit-branding-copy`) |
| Midwest-only identity in body copy | National 32 states + DC; Chicago is HQ, not fence |

---

## Voice patterns

**Problem → fix** (one beat each):

```html
<span class="ps-problem">…</span>
<span class="ps-fix">…</span>
```

**Team line** (optional third beat on landings):

`Built for landlords who run the doors themselves · not a property management company.`

**CTA verbs (preferred order):** Open · Start · Walk · Continue · See pricing

| Context | Label |
|---------|--------|
| Wizard | **Open Deposit Desk** · **Start free packet** |
| Guides | **Open {State} packet** · secondary **Condition hub walkthrough** |
| Hub | **Open condition hub** · **Lock & save** |
| Billing | **Manage billing** |

---

## Visual & feel (low friction)

| Layer | Lock |
|-------|------|
| Fonts | Source Sans 3 (UI) · Source Serif 4 (display/H1) |
| Palette | Cream `#f4f0e6` · bark ink · sage success · gold accent `#c9a227` · quant blue panels |
| Spacing | `--space-*` scale · generous `.prose` line-height on problem/fix |
| Atmosphere | Chicago greystone + door · weather mist · not playful mascot |

---

## Audits

```bash
npm run audit:adoption-voice
npm run audit:customer-voice
npm run audit:trust-voice
npm run apply:adoption-voice   # blog corpus refresh
```

---

## Agent duty

1. Read this file before customer copy edits.  
2. Run adoption + goal-copy audits before push.  
3. Blog bulk changes go through `scripts/refresh-adoption-voice.mjs`, not hand-editing 200+ files.
