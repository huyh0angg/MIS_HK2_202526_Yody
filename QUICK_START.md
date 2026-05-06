# Quick Start Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional, for MySQL/Redis)

---

## 🎯 Start the Application (2 Terminals)
### **Terminal 1: Backend**
```bash
docker compose up -d
docker logs yody-mysql --tail 5
npm install
```

```bash
npm run dev:api
```
✅ Server running at: http://localhost:9000

### **Terminal 2: Frontend**
```bash
npm run dev:web
```
✅ App running at: http://localhost:5173

---

## Quick Test

### **1. Open Frontend**
Visit: http://localhost:5173

### **2. Test Features**
```
✅ Browse products (home page)
✅ Filter/search products (/products)
✅ View product details (/products/YDY-M-POLO-001)
✅ Add to cart
✅ Login/Register (/login)
   - Email: tenho051512@gmail.com, Password: 123456
✅ Checkout & place order
✅ View order confirmation
```

### **3. Test Backend API (Optional)**
```bash
# Get all products
curl http://localhost:9000/store/products

# Login and get token
curl -X POST http://localhost:9000/store/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yody.vn","password":"admin123"}'

# Create order
curl -X POST http://localhost:9000/store/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer":{"email":"test@yody.vn","fullName":"Test","phone":"0123","address":"123 St"},
    "items":[{"sku":"YDY-M-POLO-001","name":"Polo","quantity":1,"price_cents":399000}],
    "payment_method":"COD",
    "shipping_method":"standard",
    "subtotal_cents":399000,"discount_cents":0,"shipping_cents":30000,"total_cents":429000
  }'
```

---

## 🐳 Docker (Optional)

Start MySQL + Redis (data persistence):

```bash
docker-compose up -d

# Verify
docker ps
# Should show:
# - mysql:8.0 (port 3306)
# - redis:7-alpine (port 6379)
# - phpmyadmin (port 8080)
```

Access:
- phpMyAdmin: http://localhost:8080
- MySQL User: yody / yody123
- Database: yody_fashion

---

## 📱 Test Scenarios

### **Scenario 1: Browse & Shop**
1. Home page → See featured products
2. Click "Sản phẩm mới" → Browse catalog
3. Filter by category (Nam, Nữ, etc.)
4. Click product → View details
5. Select size/color → Add to cart
6. View cart → Proceed to checkout
7. Fill shipping info → Complete order
8. See order confirmation

### **Scenario 2: User Authentication**
1. Click user icon (top right)
2. Click "Đăng ký" → Register with new email
3. Fill form → Create account
4. Auto-login (or click "Đăng nhập")
5. View customer dashboard (/customer)

### **Scenario 3: Admin (Demo)**
1. Login with: tenho051512@gmail.com/ 123456
2. Click user icon → "Admin"
3. View admin dashboard (/admin)
4. See revenue, orders, products

---

### **Scenario 4: Add product (Demo)**
1. Tên sản phẩm: Quần Jeans Nữ Baggy Xếp Ly
2. Giá: 399000
3. Chọn danh mục: Nữ
4. Mô tả: Quần jeans nữ baggy xếp ly – Thoải mái, tôn dáng, trẻ trung hiện đại
Quần jeans nữ baggy xếp ly là lựa chọn hoàn hảo cho phong cách năng động, hiện đại. Thiết kế form rộng phần trên, thuôn gọn ống dưới giúp che khuyết điểm hiệu quả, đồng thời vẫn tôn dáng và tạo cảm giác thoải mái khi mặc.
Chất liệu denim co giãn mềm mại, giữ form tốt
5. Chọn Giảm giá, Tồn kho
6. URL hình ảnh: https://buggy.yodycdn.com/images/product/f851656648a9d3f9cb5eacabf98ee8bb.webp
---