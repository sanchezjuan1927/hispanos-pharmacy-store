# Client Brief — Hispanos Pharmacy Store

## Identity
- **Client slug**: hispanos-pharmacy-store
- **Industry**: Retail Pharmacy — Online Mini Store
- **Parent project**: hispanos-pharmacy (phone AI)
- **Project start**: [PENDING — store build in separate chat]

## Objective
Build a simple, mobile-first online store for Hispanos Pharmacy. Customers (primarily older, Spanish-speaking) can browse 4 product categories, search, add to cart, and place orders that land in a staff dashboard (`/admin`).

## Context
- Customer base: older, Spanish-speaking community in Jackson Heights, Queens
- Default language: Spanish — English available via toggle
- Connected to the phone AI: Sofia sends delivery callers the store link
- Orders are stored in Supabase and reviewed by staff at `/admin` (WhatsApp ordering removed 2026-09-22)

## Product Categories
| # | Spanish | English |
|---|---------|---------|
| 1 | Farmacia | Pharmacy |
| 2 | Comida | Food |
| 3 | Limpieza | Cleaning |
| 4 | Utilidades | Utilities |

## Key Design Rules
- Large text, big tap targets — older users
- Warm colors, not clinical/cold
- No account creation required
- Simple checkout: name + phone (required, validated) + address + optional notes + pay-on-delivery method
- Order submission → saved to Supabase → confirmation screen with order number

## Tech Stack
- [DECIDED IN BUILD CHAT]
- Database: Supabase (`https://siquyautjftrppskodyw.supabase.co`) — products table
- Deployment: Vercel or similar

## Pharmacy Info
- **Name**: Hispanos Pharmacy
- **Address**: 80-11 37th Ave, Jackson Heights, NY 11372
- **Phone**: (718) 255-6129

## Out of Scope (Phase 1)
- Payment processing
- User accounts / login
- Real-time inventory
- Order tracking
- Spanish ↔ English auto-detection (manual toggle only)
