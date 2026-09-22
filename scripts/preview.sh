#!/usr/bin/env bash
# Simple Property Tools · local preview
# UI-only: ./scripts/preview.sh static
# Full (Stripe APIs): ./scripts/preview.sh full  — needs web/.env.local
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/web"
MODE="${1:-static}"

cd "$WEB"

case "$MODE" in
  static)
    echo "Static preview · http://127.0.0.1:4321"
    echo "App export: /app?demo=pro  (no checkout API)"
    echo "Checkout/success will not work on this mode."
    exec npx --yes serve . -l 4321
    ;;
  full)
    if [[ ! -f .env.local && ! -f .env ]]; then
      echo "Copy .env.example → web/.env.local and add STRIPE_SECRET_KEY (+ SPT_ENTITLEMENT_SECRET)."
      exit 1
    fi
    echo "Vercel dev · API routes + cleanUrls (same as deploy)"
    exec npx --yes vercel dev --listen 4321
    ;;
  *)
    echo "Usage: $0 static|full"
    exit 1
    ;;
esac
