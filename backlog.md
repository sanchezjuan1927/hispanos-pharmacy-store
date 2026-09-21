# Backlog — Hispanos Pharmacy Store

## Status
**Storefront rebuilt** — interface redesigned around an Amazon-style browse/cart/checkout
flow. Runs and builds clean. Not yet deployed.

## Priority Queue

| # | Task | Status | Blocker |
|---|------|--------|---------|
| 1 | Supply `NEXT_PUBLIC_SUPABASE_ANON_KEY` so orders are logged | pending | key from Supabase dashboard |
| 2 | Deploy to Vercel and capture the live URL | pending | task 1 (optional), client approval |
| 3 | Connect phone AI: Sofia sends store link to delivery callers | pending | store URL |
| 4 | End-to-end test from a real phone: browse → cart → WhatsApp | pending | task 2 |
| 5 | Replace product photos that carry a supplier watermark (e.g. Band-Aid) | pending | — |
| 6 | Move catalog from `src/lib/products.js` to the Supabase products table | pending | task 1 |

## Completed
- [x] Project folder created
- [x] Brief documented
- [x] Store build prompt written
- [x] Storefront v1 (28 products, 4 categories, WhatsApp checkout)
- [x] Interface redesign — see below

## Interface redesign (this pass)

**Layout**
- Header rebuilt: visible logo, search, and a horizontal category nav in one sticky unit
- Product cards rebuilt Amazon-style: calm white surfaces, split-cent pricing,
  quantity stepper in place of a repeated full-size button
- Added product detail sheet, sticky cart bar, delivery banner, store footer
- Cart drawer rebuilt with thumbnails, unit price, and line totals
- Shared design tokens in `globals.css`

**Bugs fixed along the way**
| Bug | Impact |
|-----|--------|
| Missing Supabase key crashed the whole storefront (500) | Store was unreachable without an env file |
| `window.open` after `await` in checkout | Mobile Safari blocks it — orders silently lost |
| A Supabase failure could throw before the WhatsApp handoff | Orders lost when the DB is slow or down |
| Search ignored accents — "cafe" missed "Café Bustelo" | Most customers type without accents |
| Logo drawn in navy on a navy header | Brand name invisible; collided with address text |
| Category tiles had `display: none` images | Dead code; chips wrapped 3 + 1 orphan |
| `user-scalable=no` in viewport | Blocked pinch-zoom for the older target audience |
| `<html lang>` stayed `es` in English mode | Screen readers read English with Spanish pronunciation |
| Turbopack inferred the wrong workspace root | Build/deploy fragility |

**Also added**
- Cart persists across reload via `localStorage` (guarded for private mode)
- `next/image` for all product images — lazy loading, responsive sizes, no layout shift
- Escape-to-close and scroll lock on cart and detail sheet

## Integration Point (with hispanos-pharmacy)
When the store is live, update `prompts/pharmacy-agent.md` in `hispanos-pharmacy`:
- Delivery section → include store URL
- Sofia will say: "You can also browse and order directly from our website at [store URL]."

## Notes
- Orders go to WhatsApp `(929) 606-7118` via `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Supabase logging is best-effort by design: it never blocks the WhatsApp handoff
- Catalog lives in `src/lib/products.js` (`placeholderProducts`); photos in `public/products/`
