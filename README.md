# MAISON — Premium Fashion eCommerce

A curated luxury fashion platform offering timeless pieces for the modern wardrobe. Built with a minimalistic, editorial-grade aesthetic inspired by the world's leading fashion houses.

## Overview

MAISON is a full-featured eCommerce experience spanning 44 products across 10 categories and 26 in-house brands. From everyday essentials to statement outerwear, every detail is designed to feel premium — from the micro-interactions to the typography.

## Features

### Shopping Experience
- **Product Discovery** — Advanced filtering by category, brand, price range, sizes, and availability. Sort by newest, bestselling, price, or rating.
- **Product Pages** — Full image galleries, size guides, color selection, delivery estimates, and customer reviews with rating distributions.
- **Quick View** — Preview any product without leaving the current page.
- **Compare** — Side-by-side comparison of up to 4 products across specifications, pricing, and ratings.
- **Wishlist** — Save favorites to your personal collection. Move items to cart when ready.
- **Search** — Real-time product search with trending searches and popular category suggestions.

### Cart & Checkout
- **Smart Cart** — Persistent cart with quantity controls, item removal, and express delivery options.
- **Coupon System** — Apply discount codes at checkout. Percentage-based and flat-amount coupons supported.
- **Guest Checkout** — Complete your purchase without creating an account.
- **3-Step Checkout** — Shipping, payment, and order review in a clean, guided flow.
- **Order Confirmation** — Full order summary with tracking details and estimated delivery.

### Account & Orders
- **Profile Management** — Update personal information, manage saved addresses, and view order history.
- **Loyalty Program** — Earn points on every purchase. Tier-based rewards (Silver, Gold, Platinum) with birthday bonuses and weekend multipliers.
- **Order Tracking** — Real-time order status updates with step-by-step tracking timeline.
- **Notifications** — Order confirmations, shipping updates, and account activity.

### Admin Dashboard
- **Analytics** — Revenue charts, order status breakdowns, category performance, and monthly trends.
- **Product Management** — View and search all products with stock levels and review counts.
- **Order Management** — Update order statuses, track payment status, and manage fulfillment.
- **Coupon Management** — Create, edit, activate/deactivate, and delete promotional coupons.
- **Site Content** — Edit hero sections, marquee banners, testimonials, and editorial content without code changes.

### Design & Performance
- **Premium Aesthetic** — Minimalistic luxury design with a muted color palette, clean typography, and intentional whitespace.
- **Framer Motion Animations** — Page transitions, hover effects, staggered grids, and smooth micro-interactions throughout.
- **Responsive Design** — Fully optimized for mobile, tablet, and desktop viewports.
- **GPU-Optimized** — 60fps animations with `will-change` and `transform`-based transitions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| State | Zustand (client-side routing, cart, wishlist) |
| Animation | Framer Motion |
| Charts | Recharts |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js (Credentials provider) |
| Forms | Zod validation, React Hook Form |
| Icons | Lucide React |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Seed sample data
npm run seed

# Start development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:../db/custom.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@maison.com | Admin@123 |
| User | user@maison.com | User@123 |

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (products, orders, coupons, etc.)
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # SPA entry point with state-based routing
├── components/
│   ├── auth/             # Auth modal and provider
│   ├── layout/           # Navigation, Footer, CartDrawer, SearchOverlay
│   ├── pages/            # Home, Shop, Product, Cart, Checkout, Account, Admin
│   ├── shared/           # ProductCard, QuickView, SizeGuide, Newsletter
│   └── ui/               # Reusable UI primitives (Button, Input, Tabs, etc.)
├── lib/
│   ├── constants.ts      # Brand name, shipping thresholds, design tokens
│   ├── store.ts          # Zustand store (routing, cart, wishlist, filters)
│   ├── auth.ts           # Authentication helpers
│   └── db.ts             # Prisma client singleton
prisma/
├── schema.prisma         # Database schema (14 models)
├── seed.ts               # Sample data seeder (44 products, 26 brands, 18 reviews)
db/
└── custom.db             # SQLite database file
```

## Pages

| Page | Description |
|------|-------------|
| Homepage | Hero banner, marquee, category grid, featured products, editorial, testimonials, newsletter, press |
| Shop | Product grid with filters, sort, search, and pagination |
| Product Detail | Image gallery, size/color selection, reviews, related products |
| Cart | Line items, quantity controls, coupon application, order summary |
| Checkout | 3-step flow: shipping address, payment method, order review |
| Account | Profile, orders, addresses, loyalty, notifications, settings |
| Admin | Dashboard analytics, product/order/coupon management, site content |
| Order Tracking | Real-time tracking timeline with order details |
| Wishlist | Saved products with move-to-cart and sharing |
| Search | Full-screen overlay with real-time results and trending suggestions |

## Database

14 models covering the full commerce domain:

- **Product**, **Category**, **Brand** — Catalog management
- **User**, **Account**, **Session** — Authentication
- **Order**, **OrderItem** — Purchase history
- **Review** — Customer feedback with ratings
- **WishlistItem** — Saved products
- **Coupon** — Promotional discounts
- **SiteContent** — Dynamic page content
- **Newsletter** — Email subscriptions
- **CartItem** — Persistent cart (client-side)

## License

This project is private and not open for redistribution.
