# ShopSphere E-Commerce Platform

A complete, production-ready, full-stack e-commerce application inspired by **Amazon** and **Myntra**, engineered with Next.js (App Router), TypeScript, Tailwind CSS, secure JWT authentication, relational SQLite database, Razorpay test mode payments, atomic inventory management, and a dedicated administrator control dashboard.

---

## 🌟 Key Features

### 1. Consumer Storefront Experience
- **Amazon & Myntra Grade Design**: Responsive design across mobile, tablet, and desktop with sleek hover effects, promotional banners, badges, and smooth transitions.
- **Dynamic Homepage**: Multi-slide interactive hero carousel, category pills, live ticking countdown for "Deals of the Day", curated editor's drops, brand showcases (Sony, Nike, Zara, Raymond, Fossil, Ray-Ban), and customer guarantees.
- **Product Browsing & Search**:
  - Instant live search auto-complete dropdown.
  - Multi-faceted filters (Category, Price Range Slider, Brand, Star Rating, Deals, Trending).
  - Sorting (Price Low-to-High, High-to-Low, Newest, Top-Rated, Biggest Discounts).
  - Product detail pages with multi-image gallery thumbnails, size & color selectors, specifications matrix, pin-code delivery estimator, and verified customer reviews.
- **Shopping Bag (Cart)**:
  - Add, update quantities with live stock limits, remove, move to wishlist.
  - Server-validated pricing calculations (subtotal, shipping charges free over ₹999, coupon discounts, grand total).
  - Persistent shopping bag per user account.
- **Wishlist**:
  - One-click heart toggle on product cards & detail pages.
  - One-click move from Wishlist to Shopping Bag.
- **Multi-Step Checkout & Payments**:
  - Saved address selector + new delivery address creator with real-time validation.
  - Razorpay Test Mode integration supporting **UPI (GPay, PhonePe, Paytm)**, **Credit/Debit Cards**, **Net Banking**, and **Cash on Delivery (COD)**.
  - Secure backend payment verification without exposing or storing card credentials.
- **Order Management & Tracking**:
  - Unique order IDs (`ORD-2026-XXXX`).
  - Visual shipment progress tracker (`Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`).
  - Printable official tax invoice receipt.
  - Customer order cancellation and 7-day return request actions with automatic inventory restock.

---

### 2. Administrator Dashboard
Access via `/admin` (protected by server-side role-based authorization):
- **Executive Metrics**: Total Revenue, Total Orders, Average Order Value, Registered Customers, Active Catalog, and Low Stock Alerts.
- **Orders Fulfillment Queue**: View all customer orders, filter by status, and update shipment status in real time.
- **Catalog & Inventory Control**: Add new products with specifications, edit stock levels, view low stock warnings, and delete items.
- **Promo Coupon Engine**: Create and manage percentage/flat discount coupons with minimum order values and discount caps.

---

## 🔐 Pre-Seeded Demo Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@website.com` | `Admin@123` | Full access to `/admin`, catalog editing, order status changes, coupon creation |
| **Customer** | `customer@website.com` | `Customer@123` | Shopping bag, wishlist, address book, checkout, order history |

*Quick-fill demo buttons are provided on the login page (`/auth/login`) for convenience.*

---

## 🎟️ Active Demo Promo Codes

- **`WELCOME10`**: 10% OFF on orders over ₹999 (Max discount: ₹1,000)
- **`FLAT500`**: Flat ₹500 OFF on orders over ₹2,999
- **`FESTIVE20`**: 20% OFF on orders over ₹1,999 (Max discount: ₹1,500)

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (React 19, App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (Node.js native `DatabaseSync` engine with WAL mode, foreign keys, and atomic transactions)
- **Authentication**: Stateless JSON Web Tokens (JWT) stored in HTTP-Only, SameSite cookies with `bcryptjs` password hashing
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Installation
```bash
cd website
bun install # or npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Build & Run
```bash
# Build for production
bun run build # or npm run build

# Start the production server on port 3000
bun run start # or npm run start
```
The application will be live at `http://localhost:3000`.

### 4. Running the End-to-End Automated Test Suite
With the server running on `http://localhost:3000`, run:
```bash
node tests/verify-ecommerce.mjs
```
All 37 automated tests verify auth, cart, coupons, checkout, inventory decrements, order statuses, admin permissions, reviews, and newsletter subscriptions.
