# Trimly

A modern, full-stack URL shortener — shorten links instantly and track click
analytics. Flask REST API backend and Angular frontend.

---

## Features

- **Shorten URLs** — turn a long URL into a short, shareable link
- **Redirect** — short codes redirect to the original URL
- **Click analytics** — per-link click count and creation date
- **OpenAPI docs** — interactive Swagger UI for the API
- **SSRF-hardened URL validation** — submitted URLs are checked without exposing
  internal services or cloud metadata endpoints

---

## Tech stack

| Layer     | Stack                                                                    |
| --------- | ------------------------------------------------------------------------ |
| Backend   | Python 3.12+, Flask, flask-smorest (OpenAPI), SQLAlchemy, Alembic, Postgres |
| Frontend  | Angular 21 (standalone, zoneless, signals), TypeScript, Angular Material  |
| Config    | pydantic-settings (typed, env-driven)                                    |
| Server    | Gunicorn (production), Flask dev server (development)                     |
| Tooling   | uv (Python deps), npm (frontend), Vitest (frontend tests), pytest (backend) |

---

## Project structure

```
trimly/
├── backend/                 # Flask REST API
│   ├── app/
│   │   ├── controllers/     # Route handlers (flask-smorest blueprints)
│   │   ├── services/        # Business logic (UrlService, SSRF-safe validation)
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Marshmallow request/response schemas
│   │   └── config/          # DB, OpenAPI, and typed settings
│   ├── migrations/          # Alembic migrations
│   ├── tests/               # pytest (unit + integration), 100% coverage
│   ├── wsgi.py              # Gunicorn entrypoint
│   └── gunicorn.conf.py     # Production server config
│
└── frontend/                # Angular SPA
    └── src/app/
        ├── core/            # Services, models, HTTP error interceptor
        ├── shared/          # Reusable components, validators
        ├── features/        # Home + analytics pages
        └── layouts/         # App shell (navbar, footer)
```

---

## Prerequisites

- **Python 3.12+** and [uv](https://docs.astral.sh/uv/)
- **Node.js 20+** and npm
- **PostgreSQL** (local or remote)

---

## Backend setup

```bash
cd backend

# 1. Install dependencies
uv sync

# 2. Configure environment
cp .env.example .env
#    then edit .env with your database URL, etc.

# 3. Apply database migrations
uv run alembic upgrade head
```

### Environment variables (`backend/.env`)

| Variable        | Required | Default                   | Description                                        |
| --------------- | -------- | ------------------------- | -------------------------------------------------- |
| `DATABASE_URL`  | ✅ yes   | —                         | SQLAlchemy connection string (Postgres)            |
| `BASE_URL`      | no       | `http://localhost:8004`   | Public base used to build short URLs               |
| `CORS_ORIGINS`  | no       | `["http://localhost:4200"]` | JSON list of browser origins allowed to call the API |

### Run the backend

```bash
# Development (auto-reload)
uv run flask --app app run --port 8004

# Production (Gunicorn)
uv run gunicorn --config gunicorn.conf.py wsgi:app
```

- API base: `http://localhost:8004`
- Swagger UI: `http://localhost:8004/apidocs`

### Run backend tests

```bash
cd backend
uv run pytest --cov        # runs the suite with coverage (gate: 100%)
```

---

## Frontend setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run the dev server
npm start                   # serves on http://localhost:4200
```

The dev build points at `http://localhost:8004`
(see `src/environments/environment.development.ts`). If you run the frontend on a
different port, add that origin to `CORS_ORIGINS` in `backend/.env`.

### Frontend commands

```bash
npm start        # dev server (http://localhost:4200)
npm run build    # production build -> dist/
npm test         # unit tests (Vitest)
```

---

## API reference

| Method | Endpoint                       | Description                          | Success        |
| ------ | ------------------------------ | ------------------------------------ | -------------- |
| `POST` | `/api/v1/urls`                 | Create a short URL from a long one   | `201 Created`  |
| `GET`  | `/<short_code>`                | Redirect to the original URL         | `302 Found`    |
| `GET`  | `/api/v1/urls/<short_code>`    | Get click stats for a short code     | `200 OK`       |

**Create a short URL**

```bash
curl -X POST http://localhost:8004/api/v1/urls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# 201 -> {"short_code": "abc123", "short_url": "http://localhost:8004/abc123"}
```

**Get analytics**

```bash
curl http://localhost:8004/api/v1/urls/abc123

# 200 -> {"original_url": "...", "short_code": "abc123",
#         "click_count": 5, "created_at": "..."}
```

Errors use standard status codes: `404` (not found), `422` (validation),
`400` (rejected URL), `500` (server error).

---

## Running the full stack locally

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && uv run flask --app app run --port 8004

# Terminal 2 — frontend
cd frontend && npm start
```

Then open **http://localhost:4200**.

