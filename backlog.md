# Backlog — Hispanos Pharmacy Store

## Status
**Build in progress** — separate chat handling the store construction.
This project will be wired to the phone AI (hispanos-pharmacy) once ready.

## Priority Queue

| # | Task | Status | Blocker |
|---|------|--------|---------|
| 1 | Build store (separate chat) | in progress | — |
| 2 | Set up Supabase products table | pending | store build |
| 3 | Connect phone AI: Sofia sends store link to delivery callers | pending | store URL |
| 4 | Switch WhatsApp test number → real pharmacy number | pending | client approval |
| 5 | End-to-end test: browse → add to cart → order via WhatsApp | pending | all above |

## Completed
- [x] Project folder created
- [x] Brief documented
- [x] Store build prompt written

## Integration Point (with hispanos-pharmacy)
When the store is live, update `prompts/pharmacy-agent.md` in `hispanos-pharmacy`:
- Delivery section → include store URL
- Sofia will say: "You can also browse and order directly from our website at [store URL]."
