# CartAndBuy

A full-featured e-commerce platform built with Laravel 13, Inertia.js v3, React 19, and Tailwind CSS v4.

## Tech Stack

- **Backend:** Laravel 13, PHP 8.5, Fortify (auth + 2FA + passkeys)
- **Frontend:** React 19 (TypeScript), Inertia.js v3, Tailwind CSS v4
- **Database:** MySQL
- **UI Components:** shadcn/ui
- **Build Tool:** Vite

## Features

### Shop
- Product catalog with category filtering, price range, and sorting
- Product detail page with image gallery, reviews, and ratings
- Shopping cart (guest + authenticated, auto-merge on login)
- Coupon / discount code support
- Checkout with shipping address and payment method selection
- Order history and order detail pages
- Wishlist

### Admin Dashboard
- Sales overview with revenue chart and stats
- Product management (create, edit, delete, image upload)
- Category management (nested parent/child)
- Order management with status updates
- User management with role filtering
- Coupon management (percent/fixed, expiry, usage limits)
- Review moderation (approve/unapprove/delete)

### Auth
- Register, login, password reset, email verification
- Two-factor authentication (TOTP)
- Passkeys (WebAuthn)

## Getting Started

### Requirements
- PHP 8.5+
- Composer
- Node.js 20+
- MySQL

### Installation

```bash
# Clone the repo
git clone https://github.com/midu-01/CartAndBuy.git
cd CartAndBuy

# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cartandbuy_db
DB_USERNAME=root
DB_PASSWORD=
```

```bash
# Run migrations and seed demo data
php artisan migrate --seed

# Build frontend
npm run build

# Start development server
composer run dev
```

Visit **http://localhost:8000**

### Demo Credentials

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Admin    | admin@cartandbuy.com   | password   |
| Customer | *(register a new account)* | — |

## Project Structure

```
app/
├── Http/Controllers/
│   ├── Admin/          # Admin panel controllers
│   └── Shop/           # Storefront controllers
├── Models/             # Eloquent models
└── Middleware/

resources/js/
├── pages/
│   ├── admin/          # Admin dashboard pages
│   └── shop/           # Storefront pages
├── components/
│   ├── shop/           # Navbar, ProductCard, StarRating, etc.
│   └── ui/             # shadcn/ui components
└── layouts/
    ├── shop-layout.tsx
    └── admin-layout.tsx

routes/
├── shop.php            # Public + auth shop routes
└── admin.php           # Admin-only routes
```

## License

MIT
