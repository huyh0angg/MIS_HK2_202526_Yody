# Yody Fashion Monorepo

Full-stack e-commerce monorepo dùng npm workspaces.

- **Frontend:** React 18 + Vite (`apps/web`)
- **Backend:** Node.js + Express (`apps/api`)
- **Database:** MySQL 8
- **Infra phụ trợ:** Redis 7, phpMyAdmin (qua Docker)


## 1) Cấu trúc dự án

```text
apps/
	api/        Express API
	web/        React storefront
db/
	init-unified.sql   Schema + seed dữ liệu ban đầu
docker-compose.yml   MySQL + Redis + phpMyAdmin
```

## 2) Yêu cầu môi trường

Vui lòng cài sẵn:

- **Node.js** 18+
- **npm** 9+
- **Docker Desktop** (có Docker Compose)

## 3) Cài đặt nhanh

### Bước 1: Cài dependencies

Tại thư mục root project, cài package cho toàn monorepo:

```bash
npm install
```

### Bước 2: Khởi động dịch vụ database

```bash
npm run docker:up
```

Services mặc định:

- MySQL: `localhost:3306`
- Redis: `localhost:6379`
- phpMyAdmin: `http://localhost:8080`

### Bước 3: Chạy backend

```bash
npm run dev:api
```

Backend mặc định chạy tại: `http://localhost:4000`

### Bước 4: Chạy frontend (terminal thứ 2)

```bash
npm run dev:web
```

Frontend mặc định chạy tại: `http://localhost:5173`

## 4) Biến môi trường

Project hiện dùng biến môi trường theo từng app. Các file cần quan tâm:

- `apps/api/.env` (đang được backend sử dụng)
- `apps/web/.env` (đang được frontend sử dụng)
- `.env` ở root (đang tồn tại nhưng **không phải nguồn cấu hình chính** cho luồng chạy hiện tại)

---

### `apps/api/.env`

```env
PORT=4000

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=yody
MYSQL_PASSWORD=yody123
DB_NAME=yody_fashion
```

Giải thích nhanh:

- `PORT`: cổng chạy API
- `MYSQL_HOST`, `MYSQL_PORT`: host/port MySQL
- `MYSQL_USER`, `MYSQL_PASSWORD`: tài khoản DB
- `DB_NAME`: tên database

---

### `apps/web/.env`

```env
VITE_API_BASE_URL=http://localhost:4000
```

Giải thích:

- `VITE_API_BASE_URL`: base URL để frontend gọi backend API

---

### `.env` ở root (tham khảo)

Hiện có các biến như `STORE_CORS`, `ADMIN_CORS`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `PORT`.

Tuy nhiên, theo luồng chạy scripts hiện tại:

- Backend load `apps/api/.env`
- Frontend load `apps/web/.env`

Vì vậy, nếu cần đổi cấu hình chạy local thì ưu tiên chỉnh **2 file trong apps** ở trên.

## 5) Scripts thường dùng

Chạy từ thư mục root:

- `npm run dev:web` — chạy frontend Vite
- `npm run build:web` — build frontend production
- `npm run dev:api` — chạy backend dev
- `npm run start:api` — chạy backend chế độ start
- `npm run docker:up` — bật MySQL/Redis/phpMyAdmin
- `npm run docker:down` — tắt containers

## 6) Reset database

Khi sửa `db/init-unified.sql` và muốn re-seed từ đầu:

```bash
docker compose down -v
docker compose up -d
```

Lệnh trên sẽ xóa volume MySQL cũ và khởi tạo lại DB.

## 7) API chính

Một số nhóm endpoint tiêu biểu:

- Health: `GET /health`
- Products/Catalog: `GET /store/products`, `GET /store/products/:sku`, `GET /store/categories`, `GET /store/banners`
- Auth: `POST /store/auth/register`, `POST /store/auth/login`, `POST /store/auth/logout`, `GET /store/auth/me`
- Cart: `GET /store/cart`, `POST /store/cart`, `PUT /store/cart/:productId`, `DELETE /store/cart/:productId`
- Orders: `POST /store/orders`, `GET /store/orders`, `GET /store/orders/:id`

Chi tiết đầy đủ xem thêm file `API_DOCUMENTATION.md`.

## 8) Troubleshooting nhanh

- **Frontend không gọi được API**
	- Kiểm tra `apps/web/.env` có đúng `VITE_API_BASE_URL` chưa.
	- Đảm bảo backend đang chạy cổng `4000`.

- **Backend không kết nối được MySQL**
	- Kiểm tra Docker đã up MySQL chưa.
	- Kiểm tra lại `apps/api/.env` (host, port, user, password, db).

- **Dữ liệu seed không đúng như mong muốn**
	- Reset DB bằng `docker compose down -v` rồi `docker compose up -d`.

## 9) Ghi chú

- Dữ liệu local hiện lưu trong thư mục `data/mysql` (được mount từ Docker).
- Mã nguồn prototype cũ trong `apps/web/public/ui` chỉ để tham chiếu UI tĩnh.

