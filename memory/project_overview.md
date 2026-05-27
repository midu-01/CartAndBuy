---
name: project-overview
description: CartAndBuy full-stack e-commerce app overview — stack, domain model, routing, auth
metadata:
  type: project
---

CartAndBuy is a full-featured e-commerce SPA built with Laravel 13 + Inertia.js v3 + React 19 + Tailwind CSS v4 + MySQL.

**Why:** Personal/portfolio project demonstrating a complete shop and admin panel.

**How to apply:** All backend routes follow REST conventions split across `routes/shop.php` and `routes/admin.php`. Frontend pages live in `resources/js/pages/shop/` and `resources/js/pages/admin/`. Use shadcn/ui components from `resources/js/components/ui/`.

## Domain Models
- **User** — roles: `admin` | `customer`. Has 2FA, passkeys (WebAuthn), teams.
- **Product** — slug-routed, has `price`/`sale_price`, `stock_qty`, `images` (JSON array), `is_featured`, `is_active`. Belongs to Category.
- **Category** — nested (parent_id), has slug.
- **Cart / CartItem** — guests use `session_id`, auth users use `user_id`. On login, guest cart is auto-merged into user cart.
- **Order / OrderItem** — statuses: `pending|processing|shipped|delivered|cancelled`. Payment status: `unpaid|paid|refunded`. Stores `shipping_address` as JSON. Supports coupons.
- **Coupon** — type `percent` or `fixed`, has `min_order`, `max_uses`, `expires_at`.
- **Review** — rating + comment, requires `is_approved` before showing.
- **Wishlist** — user+product pivot.

## Key Controllers
- `Shop\CartController` — resolveCart() handles guest/auth merge logic
- `Shop\OrderController` — checkout + order history
- `Admin\DashboardController` — stats, monthly revenue chart, top products
- Admin CRUD controllers for Products, Categories, Orders, Users, Coupons, Reviews

## Auth
Laravel Fortify: registration, login, password reset, email verification, TOTP 2FA, passkeys (WebAuthn). Admin access gated by `EnsureUserIsAdmin` middleware.

## Currency
BDT (Bangladeshi Taka) — see recent commit.
