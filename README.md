# Yody Fashion Stack

This repository now follows the requested tech stack direction:

- **Frontend:** React (Vite)
- **Backend:** Node.js
- **Database:** MySQL + Redis via Docker
- **Workflow:** Git-based monorepo

The existing `frontend/ui` folder is kept as a static prototype/reference, while the new `apps/web` folders represent the stack-compliant implementation.

## Structure

- `apps/web` — React storefront with the required screens
- `db/init-unified.sql` — MySQL seed and schema for the commerce data model
- `docker-compose.yml` — MySQL + Redis services

## Run locally

1. Install dependencies in the root and app folders.
2. Start Docker services.
3. Run the web app and backend separately.

Recommended commands:

```bash
docker compose up -d
docker logs yody-mysql --tail 5
npm install
npm run dev:api
npm run dev:web
```
hai lệnh npm run dev:api và npm run dev:web cần chạy song song trên 2 terminal khác nhau
Reset database:

