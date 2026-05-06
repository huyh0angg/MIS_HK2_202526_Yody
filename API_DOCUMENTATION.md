# Yody Fashion API Documentation

## 🎯 Overview

**Backend Server**: http://localhost:9000
**Frontend Server**: http://localhost:5173
**Frontend-Backend Connection**: ✅ Configured in `apps/web/.env`

---

## 🔌 Public Endpoints (No Auth Required)

### **Products**

#### `GET /store/products`
List all products with optional filters
```bash
curl http://localhost:9000/store/products?category=Nam&search=polo&minPrice=200000&maxPrice=500000
```

**Query Parameters:**
- `search` - Search by name/SKU/description
- `category` - Filter by category (Nam, Nữ, Trẻ em, Phụ kiện)
- `minPrice` - Minimum price in cents
- `maxPrice` - Maximum price in cents

**Response:**
```json
{
  "products": [...],
  "count": 4,
  "timestamp": "2026-05-04T16:43:23.589Z"
}
```

---

#### `GET /store/products/:sku`
Get a specific product
```bash
curl http://localhost:9000/store/products/YDY-M-POLO-001
```

**Response:**
```json
{
  "product": {
    "sku": "YDY-M-POLO-001",
    "name": "Áo Polo Nam Piqué Mắt Chim",
    "category": "Nam",
    "price_cents": 399000,
    "description": "...",
    "sizes": ["M", "L", "XL"],
    "colors": ["Navy", "Trắng", "Đen"],
    "stock": 42,
    "featured": true,
    "ratingCount": 125
  }
}
```

---

### **Authentication**

#### `POST /store/auth/login`
Login and get JWT token
```bash
curl -X POST http://localhost:9000/store/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yody.vn","password":"admin123"}'
```

**Request Body:**
```json
{
  "email": "admin@yody.vn",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJpZCI6InVzci1hZG1pbi0wMDEiLCJlbWFpbCI6ImFkbWluQHlvZHkudm4iLCJyb2xlIjoiYWRtaW4iLCJmdWxsTmFtZSI6IllvZHkgQWRtaW4iLCJpYXQiOjE3Nzc5MTMwMDM2OTR9.signature",
  "user": {
    "id": "usr-admin-001",
    "email": "admin@yody.vn",
    "role": "admin",
    "fullName": "Yody Admin"
  }
}
```

**Test Credentials:**
- Admin: `admin@yody.vn` / `admin123`
- Customer: `customer@yody.vn` / `customer123`

---

#### `POST /store/auth/register`
Register new customer
```bash
curl -X POST http://localhost:9000/store/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@yody.vn",
    "password":"pass123",
    "fullName":"New User"
  }'
```

**Response:**
```json
{
  "token": "...",
  "user": {
    "id": "usr-1777913013596",
    "email": "newuser@yody.vn",
    "role": "customer",
    "fullName": "New User"
  }
}
```

---

### **Orders**

#### `POST /store/orders`
Create new order (auth optional)
```bash
curl -X POST http://localhost:9000/store/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "test@yody.vn",
      "fullName": "Test User",
      "phone": "0123456789",
      "address": "123 Nguyen Trai, HCMC"
    },
    "items": [
      {
        "sku": "YDY-M-POLO-001",
        "name": "Áo Polo",
        "quantity": 2,
        "price_cents": 399000
      }
    ],
    "payment_method": "COD",
    "shipping_method": "standard",
    "subtotal_cents": 798000,
    "discount_cents": 0,
    "shipping_cents": 30000,
    "total_cents": 828000
  }'
```

**Response:**
```json
{
  "order": {
    "id": "YD-000001",
    "status": "PENDING",
    "payment_method": "COD",
    "shipping_method": "standard",
    "customer": {...},
    "items": [...],
    "total_cents": 828000,
    "createdAt": "2026-05-04T16:43:33.554Z"
  },
  "message": "Order created successfully"
}
```

---

#### `GET /store/orders`
Get orders (optionally filtered by email)
```bash
curl "http://localhost:9000/store/orders?email=test@yody.vn"
```

**Response:**
```json
{
  "orders": [...],
  "count": 1
}
```

---

#### `GET /store/orders/:orderId`
Get specific order
```bash
curl http://localhost:9000/store/orders/YD-000001
```

---

### **Dashboard (Public)**

#### `GET /dashboard/summary`
Get dashboard statistics
```bash
curl http://localhost:9000/dashboard/summary
```

**Response:**
```json
{
  "revenue_cents": 828000,
  "orders": 1,
  "customers": 2,
  "products": 4,
  "lastUpdated": "2026-05-04T16:43:23.737Z"
}
```

---

## 🔐 Protected Endpoints (Admin Only)

### **Authentication Header**
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### **Admin Dashboard**

#### `GET /admin/dashboard/summary`
Get admin dashboard with detailed stats (Admin only)
```bash
TOKEN="eyJpZCI6InVzci1hZG1pbi0wMDEiLCJlbWFpbCI6ImFkbWluQHlvZHkudm4iLCJyb2xlIjoiYWRtaW4iLCJmdWxsTmFtZSI6IllvZHkgQWRtaW4iLCJpYXQiOjE3Nzc5MTMwMDM2OTR9.signature"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/admin/dashboard/summary
```

---

#### `GET /admin/dashboard/revenue`
Get revenue by month
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/admin/dashboard/revenue
```

**Response:**
```json
{
  "revenueByMonth": {
    "2026-05": 828000
  },
  "total": 828000
}
```

---

#### `GET /admin/dashboard/top-products`
Get top-selling products
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/admin/dashboard/top-products
```

---

#### `GET /admin/orders`
Get all orders (Admin only)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/admin/orders
```

---

#### `PATCH /admin/orders/:orderId/status`
Update order status (Admin only)
```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"SHIPPED"}' \
  http://localhost:9000/admin/orders/YD-000001
```

**Valid Statuses:** `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

---

## 📋 Error Responses

### **400 Bad Request**
```json
{
  "error": "Order must contain at least one item"
}
```

### **401 Unauthorized**
```json
{
  "error": "Missing authorization token"
}
```

### **403 Forbidden**
```json
{
  "error": "Admin access required"
}
```

### **404 Not Found**
```json
{
  "error": "Product not found"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## 🧪 Testing

### **Health Check**
```bash
curl http://localhost:9000/health
```

### **Quick Integration Test**
```bash
# 1. Get all products
curl http://localhost:9000/store/products

# 2. Login (get token)
TOKEN=$(curl -s -X POST http://localhost:9000/store/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yody.vn","password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 3. Create order
curl -X POST http://localhost:9000/store/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer":{"email":"test@yody.vn","fullName":"Test","phone":"0123456789","address":"123 Street"},
    "items":[{"sku":"YDY-M-POLO-001","name":"Polo","quantity":1,"price_cents":399000}],
    "payment_method":"COD",
    "shipping_method":"standard",
    "subtotal_cents":399000,
    "discount_cents":0,
    "shipping_cents":30000,
    "total_cents":429000
  }'

# 4. View admin dashboard (requires admin token)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/admin/dashboard/summary
```

---

## 🔗 Frontend Integration

Frontend API calls are configured in:
- **API Base URL**: `apps/web/src/lib/api.js`
- **Config**: `apps/web/.env` (VITE_API_BASE_URL)

### **Frontend API Functions**
```javascript
// Products
fetchStorefrontProducts()
fetchStorefrontProduct(sku)

// Auth
loginCustomer(payload)
registerCustomer(payload)

// Orders
createStoreOrder(orderPayload)

// Dashboard
fetchDashboardSummary()
```

All functions handle errors gracefully with fallback data.

---

## 📊 Database Schema

### **Products** (In-Memory)
- sku, name, category, price_cents, description
- sizes[], colors[], stock, featured, ratingCount

### **Users** (In-Memory)
- id, email, password, role, fullName, createdAt

### **Orders** (In-Memory)
- id, status, payment_method, shipping_method
- customer, items[], totals, timestamps

### **Dashboard Summary** (Computed)
- revenue_cents, orders, customers, products, lastUpdated

---

## 🚀 Next Steps

1. ✅ Backend APIs implemented and tested
2. ✅ Frontend configured to connect to backend
3. ⏳ Database persistence (add PostgreSQL/MongoDB)
4. ⏳ Payment gateway integration (Stripe/VNPay)
5. ⏳ Email notifications
6. ⏳ Product image uploads
7. ⏳ Advanced search and filters
8. ⏳ Admin product management CRUD
