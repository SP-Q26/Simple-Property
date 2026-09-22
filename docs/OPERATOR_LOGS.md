# Operator logs · Simple Property Tools

Browser-only documentation lanes (E1 / F3 / complaint trail in `SMALL_PM_LANE_MAP.md`). Not legal advice.

## URL

`/logs` · rewrites to `logs.html`

## Three loggers (tabs)

| Tab | Storage key | Use |
|-----|-------------|-----|
| **Maintenance** | `spt_log_maintenance` | Repairs, vendors, cost, priority, status |
| **Tickets** | `spt_log_tickets` | Tenant requests · channel, assignee, resolution |
| **Inspections & complaints** | `spt_log_inspections` | Entry, inspection, 311/city, complaint, follow-up flag |

Max **500** entries per log type in localStorage (same device as Deposit Desk).

## Features

- Add · edit · delete · filter by keyword/unit
- **Export CSV** (Google Sheets import)
- **Print log** (audit trail PDF via browser)
- Deep link tab: `/logs#tickets`, `/logs#inspections`, `/logs#maintenance`

## Code

- `web/lib/operator-logs.mjs` · storage + CSV
- `web/logs.js` · UI
- Free · no Pro gate (Deposit Desk Pro unchanged)

## Privacy

Log fields stay in **localStorage** unless the operator exports or prints · see `privacy.html` (update when shipping).
