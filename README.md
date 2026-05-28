# CartAndBuy

A full-featured e-commerce platform built with Laravel 13, Inertia.js v3, React 19, and Tailwind CSS v4.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13, PHP 8.5 |
| Frontend | React 19 (TypeScript), Inertia.js v3 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | MySQL |
| Auth | Laravel Fortify (2FA, Passkeys) |
| Build | Vite |
| AI | OpenAI API, Web Speech API |

## Features

### 🛍️ Shop

- Product catalog with category, brand, price range, and sort filtering
- Product detail page — image gallery, variants, features list, size chart, FAQ, reviews & star ratings
- Quick-view modal on product cards
- Product comparison — side-by-side table for up to 4 products
- Recently viewed products
- Shopping cart — guest and authenticated, auto-merge on login
- Coupon / discount code validation at checkout
- Checkout with shipping address and payment method selection
- Order history, order detail, and order cancellation
- Wishlist — toggle from any product card or detail page
- Out-of-stock notifications — subscribe and get notified when stock returns

### 🤖 AI Assistant

A floating chat widget powered by OpenAI with 15+ intent handlers:

| Intent | What it does |
|---|---|
| Product search | Natural-language product search with refinement |
| Budget filter | "I only have ৳X" — filters by max price |
| Add to cart | Add products directly from the chat |
| Cart view | Shows live cart with free-shipping progress bar |
| Checkout | Redirects to checkout with a summary |
| Order status | Looks up real order data from the database |
| Wishlist view | Shows your saved items |
| Wishlist add/remove | Manage wishlist without leaving the chat |
| Product reviews | Surfaces ratings and reviews for searched products |
| Coupon intelligence | Lists active discount codes and their details |
| Product comparison | Side-by-side compare of products found in session |
| Size guide | Bangladesh-standard sizing chart |
| Delivery info | Shipping policy and thresholds |
| Bengali / Banglish | Detects Bengali input and responds bilingually |
| General | Fallback via OpenAI for open-ended questions |

**Additional AI features:**
- Upsell suggestions after add-to-cart (complementary products from same category)
- Free shipping progress bar shown in cart and after add-to-cart
- Stock urgency badge ("Only 3 left!") on AI product cards
- Voice input via Web Speech API (mic button in chat)
- Proactive chat triggers — 30-second timer and exit-intent detection
- Premium design — dark gradient header, glow buttons, glassmorphism bubbles, animated typing indicator

### 🔧 Admin Dashboard

- Sales overview with revenue chart and key stats
- **Product management** — create, edit, delete, image upload, product variants, features, labels, scheduled publish (draft → published), duplicate product
- **Bulk CSV import/export** — full round-trip including all variant columns (`variant_sku`, `variant_attributes`, `variant_price_modifier`, `variant_stock_qty`, `variant_is_active`)
- **Category management** — create, edit, delete with hierarchy
- **Brand management** — create, edit, delete with logo upload
- **Order management** — list, detail view, status updates
- **User management** — list with role filtering
- **Coupon management** — percent or fixed discount, expiry date, usage limits, per-user limits
- **Review moderation** — approve, unapprove, delete
- Artisan command `products:publish-scheduled` — publishes scheduled products whose `publish_at` has passed

### 🔐 Auth

- Register, login, password reset, email verification
- Two-factor authentication (TOTP)
- Passkeys (WebAuthn)
- Teams — create/switch teams, invite members, manage roles

### 📄 Support Pages

- Help Center
- Contact Us
- Returns & Refunds

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

Update `.env` with your database credentials and OpenAI key:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cartandbuy_db
DB_USERNAME=root
DB_PASSWORD=

OPENAI_API_KEY=sk-...
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

| Role | Email | Password |
|---|---|---|
| Admin | admin@cartandbuy.com | password |
| Customer | *(register a new account)* | — |

## Project Structure

```
app/
├── Console/Commands/
│   └── PublishScheduledProducts.php
├── Http/Controllers/
│   ├── Admin/          # Admin panel controllers
│   └── Shop/           # Storefront controllers
├── Models/             # Eloquent models
│   ├── Product.php / ProductVariant.php
│   ├── Brand.php / Category.php
│   ├── Cart.php / CartItem.php
│   ├── Order.php / OrderItem.php
│   ├── Coupon.php / Review.php / Wishlist.php
│   └── ProductStockNotification.php
└── Services/
    └── AiAssistant/    # AI intent handlers and OpenAI integration

resources/js/
├── pages/
│   ├── admin/          # Admin dashboard pages
│   └── shop/           # Storefront pages
├── components/
│   ├── shop/
│   │   └── ai-assistant/   # AiAssistant, AiChatWindow, AiMessageBubble, etc.
│   └── ui/             # shadcn/ui components
└── layouts/
    ├── shop-layout.tsx
    └── admin-layout.tsx

routes/
├── shop.php            # Public + auth shop routes
└── admin.php           # Admin-only routes
```

## Running Tests

```bash
# Run all tests
php artisan test --compact

# Run a specific test file
php artisan test --compact tests/Feature/AdminTest.php
```

## License

MIT
