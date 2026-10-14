# Receipt Rail · lane grammar

Shared vocabulary for **Simple Property** (proof-of-condition hub) and its modules. Every feature is a variation on the same rail — not a separate mini-app.

---

## One sentence

**Capture condition and context → finalize an immutable receipt → export PDF / share link / email with an audit trail.**

Deposit Desk is the **deposit + statutory clock** transactional layer on this rail for `hello@simple-property.com`. The hub generalizes the same pattern for move-in, move-out, keys, STR, and ops visits.

---

## What we build / what we refuse

| In lane | Out of lane |
|---------|-------------|
| Move-in / move-out / visit **documentation** | Rent ACH, ledger, syndication |
| Photo + room/section capture, notes, links | Full PMS (AppFolio-class) |
| **Finalize** + **amend** (linked child receipt) | Silent edit of locked records |
| Magic-link **view** + optional tenant **ack** | Tenant accounts required to view |
| PDF, email send, delivery log | Legal advice or guaranteed outcomes |
| Move-in vs move-out **compare** (moat) | Inspection SaaS replacement pitch |

Hand off rent, screening, and maintenance tickets to Innago, Avail, banks, and counsel. See `docs/LANE_ISOLATION.md` and `/launch-stack`.

---

## Entity spine

```
Organization
  └── Property
        └── Unit
              └── Tenancy (lease window · parties)
                    └── Receipt (one documented event)
                          ├── sections[]   (rooms, areas, checklist blocks)
                          ├── media[]      (photos, links; bytes in private storage)
                          ├── verdict      (module-specific enum)
                          └── exports[]    (PDF generations · send events)
```

### Organization

- Billing owner · Stripe customer · seat count (Portfolio).
- `isles_brand` metadata on products (e.g. `deposit_desk` today; `simple_property` hub SKUs later).

### Property · Unit

- Address, jurisdiction (state + city preset), unit label.
- Cap gates: Free 1 property · **2 units**; Keeper **10 units**; Portfolio **40 units** ([PRICING_40_UNITS.md](./PRICING_40_UNITS.md)).

### Tenancy

- Tenant / counterparty contact (email optional until send).
- Lease dates · surrender date when relevant (Deposit Desk clock).

### Receipt

| Field | Meaning |
|-------|---------|
| `id` | Stable UUID |
| `template_id` | Module discriminator (see expansion bible) |
| `status` | `draft` → `finalized` → (optional) `superseded` |
| `parent_receipt_id` | Null, or amendment / correction chain |
| `tenancy_id` | Required for unit-scoped modules |
| `finalized_at` | Set once; immutable content after |
| `verdict` | e.g. `CLEAR` · `FIX_LIST` · `FILE` (module may narrow) |
| `metadata` | Module JSON (statute cite, deposit lines, key counts, …) |

**Rule:** After `finalized`, edits create a **new receipt** with `parent_receipt_id` pointing at the locked record (amendment), never in-place mutation.

---

## Lifecycle verbs

| Verb | Actor | System behavior |
|------|--------|-----------------|
| **Capture** | Operator (mobile-first wizard) | Draft receipt; autosave; photos to storage |
| **Review** | Operator | Section completeness; compare hints (P2+) |
| **Finalize** | Operator | Lock body; stamp `finalized_at`; block capture edits |
| **Amend** | Operator | New draft receipt linked to parent; must finalize separately |
| **Export** | Operator | Server PDF (watermarked or paid); store `export_id` |
| **Send** | Operator | Magic link to counterparty; Resend email; append **delivery log** |
| **Acknowledge** | Counterparty (optional) | View-only page; optional checkbox + timestamp; no account |

### Send + audit

Each send appends:

```text
{ at, channel: email|link_copy, to_hash, template_id, receipt_id, export_id?, status }
```

No PII in analytics events; use hashed email or internal id in logs.

### Counterparty surface

- **View-only** magic link (expiring, revocable).
- Download PDF if export exists.
- Optional **ack** (“I received this condition report”) — not a lease signature.

---

## Module contract

A **module** is not a new app. It is:

1. **`template_id`** — stable string (`move_in_baseline`, `move_out_condition`, …).
2. **Wizard** — steps, fields, media rules (reuse lattice: container + boot + apply).
3. **Verdict enum** — subset of `CLEAR | FIX_LIST | FILE` or module-specific labels mapped to those.
4. **Export layout** — HTML/PDF template keyed by `template_id` + `verdict`.
5. **Compare hooks** (when P2+) — pairing keys to sibling receipt on same tenancy.

Registration table (conceptual):

```text
modules[template_id] = { wizard, exportLayout, compareWith?, stripe_sku? }
```

Deposit Desk today ≈ composite wizard exporting a packet JSON/PDF — **migrate** to `move_out_condition` + `deposit_deduction_exhibit` templates without breaking `spt_saved_packets` import path (see expansion bible).

---

## App shell (target)

```text
Home (portfolio) · Properties · Receipts · Vault · Billing · Settings
```

- **Property** page: units, active tenancies, receipt timeline (draft + finalized).
- **Receipts** list: filter by template, status, property.
- **Vault**: finalized PDFs + send log (operator counsel packet).
- **Billing**: Keeper / Portfolio / à la carte (Stripe portal).

Current production nav (`/app`, `/logs`, `/pricing`) remains until P1 shell ships; new routes must not break Deposit Desk URLs.

---

## Auth

- **Operators:** magic link or email OTP (no password sprawl at P1).
- **Counterparties:** receipt-scoped token only.
- **Agents / AI:** read-only snapshot bus (extend `spt-ai-bus.json` pattern) — finalized receipt summary, never raw photo bytes in gospel.

---

## Storage & PDF

- **Private object storage** for images; signed URLs for wizard capture and PDF embed.
- **Server-side PDF** generation on finalize or on paid export (not client-only for paid tier).
- Free tier: watermarked PDF; paid: clean PDF + send.

---

## Stripe discipline

Same as Innsegall / Deposit Desk:

- Product metadata includes `isles_brand` and module `template_id` where à la carte.
- Checkout for subscription vs per-receipt unlock.
- Entitlement in KV (or successor) keyed by org id + receipt id for à la carte.

---

## Phase guardrails

| Phase | Allowed on rail |
|-------|------------------|
| **P1** | `move_in_baseline`, `move_out_condition`, PDF, email send, Keeper + per-receipt |
| **P2** | Compare, `deposit_deduction_exhibit`, `key_fob_handoff` |
| **P3+** | Ops modules, Portfolio seats — see expansion bible |

If a task does not finalize a receipt or send one, it is probably **out of lane** or belongs in marketing/docs only.
