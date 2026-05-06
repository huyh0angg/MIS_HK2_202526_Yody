# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yody Fashion is a full-stack e-commerce monorepo (npm workspaces) with a React frontend (`apps/web`) and an Express backend (`apps/api`). Data is stored in a single MySQL database `yody_fashion`.

## Commands

### Root-level (run from repo root)
```bash
npm run dev:web        # Start frontend dev server (port 5173)
npm run build:web      # Production build → apps/web/dist/
npm run dev:api        # Start backend (port 4000)
npm run start:api      # Production start backend
npm run docker:up      # Start MySQL 8, Redis, phpMyAdmin containers
npm run docker:down    # Stop containers
```

### Frontend (`apps/web/`)
```bash
npm run dev            # Vite dev server with HMR
npm run build          # Production build
npm run preview        # Preview production build
```

### Backend (`apps/api/`)
```bash
npm run dev            # Express server (port 4000) via node --env-file=.env
npm run start          # Production start
```

### Reset database (after changing init-unified.sql)
```bash
docker compose down -v   # remove volumes
docker compose up -d     # re-init from scratch
```

## Architecture

### Monorepo layout
```
apps/
  web/              React 18 + Vite frontend
  api/              Express backend (MySQL, port 4000)
db/
  init-unified.sql  MySQL schema + seed (auto-runs on first docker up)
docker-compose.yml  MySQL 8 (port 3306), Redis 7 (port 6379), phpMyAdmin (port 8080)
```

### Database
Single database `yody_fashion` — all tables live here. No cross-DB queries.

Key tables: `users`, `sessions`, `addresses`, `categories`, `products`, `product_images`, `banners`, `inventory`, `cart_items`, `orders`, `order_items`, `payment_methods`, `terms_policies`.

`init-unified.sql` runs automatically when the MySQL container starts for the first time (via `/docker-entrypoint-initdb.d/`). To re-run it, destroy the volume first: `docker compose down -v`.

### Backend (`apps/api/src/`)
- **`index.js`** — entry point, starts Express on `PORT` (default 4000)
- **`app.js`** — route definitions, session middleware (auto-creates session in DB on first request)
- **`auth.js`** — user + session operations: `registerUser`, `loginUser`, `getUserById`, `updateUserProfile`, `getUserAddresses`, `getSessionById`, `updateSessionUser`, `deleteSession`, `createSession`
- **`cart.js`** — cart operations: `getCartBySession`, `getCartByUser`, `addToCart`, `updateCartQuantity`, `removeFromCart`, `clearCart`, `mergeCartToUser`, `getCartCount`
- **`orders.js`** — products, categories, orders, dashboard: `getProducts`, `getProductBySku`, `getCategories`, `getBanners`, `createOrder`, `getOrdersByUser`, `getOrderById`, `getDashboardSummary`
- **`db/connections.js`** — single MySQL pool (mysql2/promise); exports `queryOne`, `queryAll`, `execute`, `transaction`
- **`db/helpers.js`** — row formatting utilities for DB results

> Note: Redis is declared in `docker-compose.yml` but is **not used** anywhere in the codebase.

### Session flow
Frontend generates a UUID via `getOrCreateSessionId()` (stored in localStorage) and sends it as `X-Session-Id` header on every request. The backend middleware auto-creates a `sessions` row for new UUIDs. No JWT is used for session management — auth tokens returned by login are informational only.

### API surface

**Health & Sessions**
- `GET /health`
- `POST /sessions` — create session

**Products & Catalogue**
- `GET /store/products` — list products (query: `category`, `search`)
- `GET /store/products/:sku` — product detail with images & inventory
- `GET /store/categories` — list categories
- `GET /store/banners` — list active banners

**Auth**
- `POST /store/auth/register`
- `POST /store/auth/login`
- `POST /store/auth/logout`
- `GET /store/auth/me` — get authenticated user
- `PUT /store/auth/profile` — update profile
- `GET /store/auth/addresses` — get user addresses

**Cart**
- `GET /store/cart`
- `GET /store/cart/count`
- `POST /store/cart` — add item `{productId, quantity=1}`
- `PUT /store/cart/:productId` — update quantity
- `DELETE /store/cart/:productId` — remove item
- `DELETE /store/cart` — clear entire cart
- `POST /store/cart/merge` — merge anonymous cart to user on login

**Orders**
- `POST /store/orders`
- `GET /store/orders`
- `GET /store/orders/:id`

**Dashboard**
- `GET /dashboard/summary` — revenue, orders, customers, pending/shipping counts

### Frontend (`apps/web/src/`)
- **`App.jsx`** — route definitions, `AuthSessionContext` provider, cart count prop drilling
- **`main.jsx`** — React DOM render entry point
- **`lib/api.js`** — all API calls with graceful fallback to `data/catalog.js` when backend is unreachable; key functions: `fetchStorefrontProducts`, `fetchStorefrontProduct`, `fetchDashboardSummary`, `fetchCart`, `addToCart`, `updateCartItem`, `removeCartItem`, `clearCartItems`, `fetchCartCount`, `loginCustomer`, `registerCustomer`, `logoutCustomer`, `createStoreOrder`, `requestJson`
- **`lib/storage.js`** — localStorage helpers: `getOrCreateSessionId`, `getAuthSession`/`setAuthSession`/`clearAuthSession`, `getLatestOrder`/`setLatestOrder`; cart computation helpers (`calculateCartTotals`) — cart data itself lives in DB
- **`lib/helpers.js`** — formatting utilities: price (VND), emoji, color swatches, rating text, payment label
- **`hooks/useAuthSession.js`** — auth context hook
- **`hooks/useStorefrontData.js`** — fetches products + dashboard on mount
- **`data/catalog.js`** — 7 fallback products, categories, payment methods (used when API is unreachable)
- **`styles/design-system.css`** — single CSS file for all styling (no component-scoped styles)

### Pages (`components/pages/`)
| File | Route | Notes |
|---|---|---|
| `HomePage.jsx` | `/` | |
| `ProductsPage.jsx` | `/products` | |
| `ProductDetailPage.jsx` | `/products/:sku` | |
| `CartPage.jsx` | `/cart` | |
| `CheckoutPage.jsx` | `/checkout` | |
| `AuthPage.jsx` | `/auth` | Combined login/register |
| `LoginPage.jsx` | `/login` | |
| `RegisterPage.jsx` | `/register` | |
| `CustomerDashboardPage.jsx` | `/customer` | Protected (auth required) |
| `AdminPage.jsx` | `/admin` | Protected (ADMIN role only) |
| `OrderConfirmPage.jsx` | `/order-confirm` | |
| `ProtectedRoute.jsx` | — | Auth/role guard wrapper |

### Cart flow
1. Frontend generates sessionId → stored in localStorage
2. All cart operations call the API (`addToCart`, `updateCartItem`, `removeCartItem`)
3. Cart data lives in `cart_items` table, keyed by `session_id`
4. On login, anonymous cart is merged to the user's account via `POST /store/cart/merge`

## Environment Variables

**`apps/api/.env`**
```
PORT=4000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=yody
MYSQL_PASSWORD=yody123
DB_NAME=yody_fashion
```

**`apps/web/.env`**
```
VITE_API_BASE_URL=http://localhost:4000
```

> A root-level `.env` also exists with unused vars (STORE_CORS, ADMIN_CORS, JWT_SECRET, REDIS_URL, PORT=9000) — these are **not read** by the application.

## Key Notes

- **No test suite** is configured in any workspace.
- **Offline mode**: frontend falls back to `data/catalog.js` if the API is unreachable. Fallback products have no `id`, so add-to-cart is silently skipped in offline mode.
- **Seed credentials**: `tenho051512@gmail.com` (ADMIN role, password hash in `init-unified.sql`).
- **phpMyAdmin**: available at `http://localhost:8080` when Docker is running.
- **Legacy UI**: static HTML prototypes exist in `apps/web/public/ui/` — not part of the React app.
- **Character encoding**: UTF-8MB4 throughout for Vietnamese text support.
