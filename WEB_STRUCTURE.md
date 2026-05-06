# Yody Web - Cấu Trúc Ứng Dụng

## 📁 Cây Thư Mục

```
apps/web/src/
├── App.jsx                          # Root component, định tuyến chính
├── main.jsx                         # Entry point
│
├── components/
│   ├── common/                      # Shared layout components
│   │   ├── Shell.jsx               # Wrapper chính (Header + Footer)
│   │   ├── Header.jsx              # Navigation bar
│   │   └── Footer.jsx              # Footer section
│   │
│   ├── pages/                       # Page components (router)
│   │   ├── HomePage.jsx            # Trang chủ / Featured products
│   │   ├── ProductsPage.jsx        # Danh sách sản phẩm + filters
│   │   ├── ProductDetailPage.jsx   # Chi tiết sản phẩm
│   │   ├── CartPage.jsx            # Giỏ hàng
│   │   ├── CheckoutPage.jsx        # Thanh toán
│   │   ├── LoginPage.jsx           # Đăng nhập (new)
│   │   ├── RegisterPage.jsx        # Đăng ký (new)
│   │   ├── AuthPage.jsx            # Auth tổng hợp (legacy)
│   │   ├── CustomerDashboardPage.jsx # Dashboard khách hàng
│   │   ├── AdminPage.jsx           # Admin dashboard
│   │   ├── OrderConfirmPage.jsx    # Xác nhận đơn hàng
│   │   ├── ProtectedRoute.jsx      # Route protection wrapper
│   │   └── StaticPage.jsx          # Static content wrapper
│   │
│   ├── UI/                          # Reusable UI components
│   │   ├── ProductCard.jsx         # Product card (2 variants)
│   │   ├── CartItem.jsx            # Cart item row
│   │   └── StatCard.jsx            # Statistics card
│   │
│   └── index.js                     # Component exports
│
├── hooks/                           # Custom React hooks
│   ├── useAuthSession.js           # Auth context hook
│   ├── useStorefrontData.js        # Fetch products & summary
│   └── index.js                     # Hook exports
│
├── lib/                             # Utility libraries
│   ├── api.js                      # API calls & data transformation
│   ├── storage.js                  # LocalStorage management (cart, auth)
│   └── helpers.js                  # Helper functions (format, emoji)
│
├── data/
│   └── catalog.js                  # Fallback products & categories
│
└── styles/
    └── design-system.css           # Main stylesheet (1880+ lines)
```

---

## 🔄 Routing (React Router v6)

| Route | Component | Auth | Role | Purpose |
|-------|-----------|------|------|---------|
| `/` | HomePage | - | - | Trang chủ, sản phẩm nổi bật |
| `/products` | ProductsPage | - | - | Danh sách sản phẩm + filters |
| `/products/:sku` | ProductDetailPage | - | - | Chi tiết 1 sản phẩm |
| `/product-detail` | → `/products/YDY-M-POLO-001` | - | - | Redirect default |
| `/cart` | CartPage | - | - | Giỏ hàng |
| `/checkout` | CheckoutPage | - | - | Thanh toán |
| `/login` | LoginPage | - | - | Đăng nhập |
| `/register` | RegisterPage | - | - | Đăng ký |
| `/auth` | AuthPage | - | - | Auth tổng hợp (legacy) |
| `/customer` | CustomerDashboardPage | ✓ | customer | Dashboard khách |
| `/admin` | AdminPage | ✓ | admin | Dashboard admin |
| `/order-confirm` | OrderConfirmPage | - | - | Xác nhận đơn hàng |
| `*` | → `/` | - | - | 404 redirect |

---

## 🎯 Layout Cơ Bản

```
┌─────────────────────────────────────┐
│          Header (topbar)            │  Navigation, search, user menu
├─────────────────────────────────────┤
│                                     │
│         Page Content (Shell)        │  Dynamic content
│                                     │
├─────────────────────────────────────┤
│          Footer (site-footer)       │  Links, newsletter
└─────────────────────────────────────┘
```

### Header Components
- **Brand Logo**: Link to home
- **Navigation Menu**: Sản phẩm, Nữ, Nam, Trẻ em, Phụ kiện
- **Search Bar**: Product search
- **Header Actions**:
  - ❤️ Favorites
  - 🛒 Cart (with count badge)
  - 👤 User Menu (dropdown)

### User Dropdown (Unauthenticated)
- Link to `/login`
- Link to `/register`

### User Dropdown (Authenticated)
- Display email
- Link to `/customer` (customer dashboard)
- Link to `/admin` (admin only)
- Logout button

### Footer
- 4 sections:
  - Company info
  - Categories
  - Payment methods
  - Newsletter signup

---

## 💾 Data Management

### LocalStorage Keys
```js
'yody_cart_v1'           // Cart items: [{sku, quantity}]
'yody_latest_order'      // Last order placed
'yody_auth_session_v1'   // Auth token & user info
```

### Auth Session Structure
```js
{
  token: "jwt_token",
  user: {
    email: "user@example.com",
    role: "customer" | "admin",
    name?: "User Name"
  },
  loggedAt: "2026-05-05T..."
}
```

### Cart Item Structure
```js
{
  sku: "YDY-M-POLO-001",
  quantity: 2
}
```

---

## 🔐 Authentication & Authorization

### Context
- `AuthSessionContext`: Provides auth state to all components
- `useAuthSession()`: Hook to access auth

### Protected Routes
- `ProtectedRoute` component wraps pages requiring auth
- Redirects to `/auth` with `reason=auth-required` if not logged in
- Checks role for admin-only pages
- Redirects to `/auth` with `reason=admin-required` if role != admin

### Login/Register Flow
1. User fills form
2. API call: POST `/store/auth/login` or `/store/auth/register`
3. Response: `{token, user: {email, role}}`
4. Save to localStorage
5. Update context state
6. User can now access protected routes

---

## 🛍️ Product Management

### Product Structure
```js
{
  sku: "YDY-M-POLO-001",
  name: "Polo T-Shirt",
  category: "Nam",
  priceCents: 299000,      // Price in VND cents
  priceLabel: "299.000₫",  // Formatted price
  shortDescription: "...",
  description: "...",
  tag: "Yody",
  featured: true,
  ratingCount: 125
}
```

### Data Flow
1. App.jsx: `useStorefrontData()` hook
   - Fetches from API: `GET /store/products`
   - Falls back to `fallbackProducts` (catalog.js)
   - Merges with local catalog
2. Pass `products` array to pages via props
3. Pages filter/sort/display using useMemo

### Product Card Variants
- **default**: Full card with price, rating, "Add to Cart" button
- **card**: Compact card for home page featured section

---

## 🛒 Shopping Cart

### Cart Operations
1. **Add to Cart**: `addCartItem(product, quantity)`
   - Updates localStorage
   - Increments cart count
2. **Update Quantity**: `updateCartQuantity(sku, quantity)`
3. **Remove Item**: `removeCartItem(sku)`
4. **Clear Cart**: `clearCart()`

### Cart Total Calculation
```js
subtotal = sum of all (price × quantity)
discount = subtotal >= 1,000,000 VND ? 50,000 VND : 0
total = subtotal - discount
```

### Cart Line Items
- Merge cart storage with product catalog
- Calculate line totals: `price × quantity`
- Return enriched cart items with full product data

---

## 🎨 Design System

**File**: `design-system.css` (1880+ lines)

### Color Palette
```css
--color-primary: #001a33    (Navy blue)
--color-accent: #ff8c00     (Orange)
--color-bg: #f9f9f9         (Light gray background)
--color-surface: #ffffff    (White)
--color-border: #e0e0e0     (Light border)
```

### Spacing
```css
--radius-md: 8px
--radius-sm: 6px
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
```

### Component Classes

#### Layout
- `.app-shell`: Main container
- `.page`: Page content area
- `.container`: Max-width wrapper
- `.grid-2`: 2-column grid

#### Cards & Sections
- `.card`, `.panel`: White cards with shadow
- `.notice`: Info box (blue)
- `.empty-state`: Empty state (dashed border)

#### Forms
- `.form-grid`: Form layout
- `.form-group`: Input group
- `.input`: Input field
- `.radio-option`: Radio option with border

#### Buttons
- `.button`: Primary orange button
- `.button-ghost`: Outline button
- `.button-block`: Full width button
- `.text-button`: Borderless text button

#### Product Grid
- `.product-grid`: Auto-fill grid (220px min)
- `.catalog-grid`: 4 columns
- `.home-grid`: 4 columns
- Responsive: 3 cols (1024px), 2 cols (768px)

#### Auth
- `.auth-wrapper`: Auth page container
- `.auth-container`: 2-column layout (login/register)
- `.auth-hero`: Left side hero section
- `.auth-form`: Right side form

#### Typography
- `.eyebrow`: Uppercase label
- `.lead`: Large paragraph
- `.muted`: Secondary text
- `.section-title`: Section heading with underline

---

## 📊 API Integration

### Base URL
- Env variable: `VITE_API_BASE_URL`
- Default: `http://localhost:9000`

### Key Endpoints
```js
GET    /store/products              // Fetch all products
POST   /store/auth/login            // Login
POST   /store/auth/register         // Register
GET    /store/summary               // Order summary
POST   /store/orders                // Create order
GET    /store/orders/:id            // Order details
```

### Error Handling
- Fetch errors throw immediately
- No retry logic
- App falls back to catalog.js data if API fails

---

## 🔌 Hooks

### useAuthSession()
```js
const auth = useAuthSession();
// auth = { authSession: {...}, setAuthSession: fn }
```

### useStorefrontData()
```js
const { products, summary } = useStorefrontData();
// Fetches products & summary, handles errors
```

---

## 🔄 State Management Strategy

1. **Global Auth State**: React Context
   - Provider in App.jsx
   - Persisted to localStorage
   - Used by Header, ProtectedRoute, etc.

2. **Page-Level State**: useState
   - Cart items, filters, form inputs
   - Synced with localStorage for cart

3. **Data Fetching**: Custom hooks + useMemo
   - Products fetched once on app mount
   - Cached in component state
   - Filters/sorts use useMemo for performance

---

## 📱 Responsive Design

### Breakpoints
| Screen | Media Query | Changes |
|--------|-------------|---------|
| Desktop | Default | 2-col layouts, 4-col grid |
| Tablet | max-width: 1024px | 1-col layouts, 3-col grid |
| Mobile | max-width: 768px | 1-col layouts, 2-col grid |
| Small | max-width: 640px | Reduced padding, compact nav |

### Responsive Classes
- `.grid-2`: 1fr 1fr → 1fr
- `.detail-layout`: 1fr 1.2fr → 1fr
- `.split-layout`: 1fr 350px → 1fr
- `.checkout-layout`: 1fr 370px → 1fr
- `.catalog-grid`: 4 cols → 3 cols → 2 cols

---

## 🚀 Performance Optimizations

1. **useMemo**: Featured products, filtered products
2. **Lazy loading**: Products loaded on demand
3. **Fallback data**: Products in catalog.js
4. **LocalStorage**: Fast auth/cart access
5. **CSS-only**: No heavy JS libraries

---

## 🔧 Stack

- **Framework**: React 18.3
- **Router**: React Router v6
- **Build**: Vite 5.4
- **Styling**: Plain CSS (design-system.css)
- **State**: React Context + useState
- **Storage**: Browser LocalStorage

---

## 📋 Component Dependencies

```
App
├── AuthSessionContext.Provider
├── HomePage
│   └── ProductCard
├── ProductsPage
│   └── ProductCard
├── ProductDetailPage
├── CartPage
│   ├── CartItem
│   └── ProductCard
├── CheckoutPage
├── LoginPage
├── RegisterPage
├── CustomerDashboardPage
├── AdminPage
├── OrderConfirmPage
└── ProtectedRoute
    └── (Wrapped component)

Shell (Common Wrapper)
├── Header
└── Footer
```

---

## ✅ Recent Changes

### Added (LoginPage & RegisterPage)
- **LoginPage.jsx**: Dedicated login page with hero section
- **RegisterPage.jsx**: Dedicated signup page with validation
- **Updated routing**: `/login` and `/register` routes
- **New CSS**: `.auth-wrapper`, `.auth-container`, `.auth-hero`, etc.

### Key Features
- 2-column layout: Hero + Form
- Responsive design (single column on mobile)
- Password confirmation on register
- Links between login/register
- Terms of service link
- Feature bullets (icons + text)
