# Backlog — Hispanos Pharmacy Store

## Status
**Storefront + orders dashboard built.** Customers order on the store; staff see and
manage orders at `/admin`. WhatsApp ordering removed.
**Live:** https://hispanos-pharmacy-store.vercel.app · dashboard: `/admin` (deployed 2026-09-22).

## Priority Queue

| # | Task | Status | Blocker |
|---|------|--------|---------|
| 1 | Keep Supabase project awake (free tier pauses after ~1 week idle) — upgrade to Pro or add a keep-alive | pending | client decision |
| 2 | Deploy to Vercel and capture the live URL | done 2026-09-22 | — |
| 2b | Create the pharmacy owner's dashboard login | pending | owner's email [NEEDED] |
| 2c | Notify staff of new orders when the dashboard is closed (SMS/email via n8n) | pending | decide channel |
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
- [x] Supabase project restored (2026-09-21); `.env.local` set; order insert verified end-to-end
- [x] WhatsApp checkout replaced by database orders + `/admin` dashboard (2026-09-22) — see below

## Orders dashboard (2026-09-22)
- Checkout: required, auto-formatted US phone; delivery notes; cash/card on delivery;
  confirmation screen with order number. Cart is kept if submission fails.
- Store places orders only through `place_order()` (validates input, recomputes total).
- `/admin`: email/password login; stats (today, open, sales today, total); orders
  grouped by status (Nuevo → Preparando → En camino → Entregado / Cancelado);
  search; detail panel with call/map buttons; polls every 15 s with a chime and
  highlight for new orders; card layout on phones.
- Security: only users in `pharmacy_staff` can read/update orders; public sign-up
  disabled (previously any signed-up user could read every order).
- Migration: `supabase/migrations/20260921_orders_dashboard.sql` (applied).
- Staff login for Juan stored in `~/.secrets/hispanos-dashboard.env`.

### Add a staff member
1. Supabase → Authentication → Users → Add user (email + password, auto-confirm)
2. SQL: `insert into pharmacy_staff (user_id) select id from auth.users where email = '<email>';`

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
- Deploy: Vercel project `hispanos-pharmacy-store` is NOT git-connected — pushing does not deploy. Run `vercel deploy --prod` from this folder.
- Unused Vercel env vars to remove: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Orders are only recorded in Supabase now — if the project pauses, checkout shows an error and asks the customer to call
- Catalog lives in `src/lib/products.js` (`placeholderProducts`); photos in `public/products/`
