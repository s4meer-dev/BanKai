# BAN KAI Docker & Production Deployment

BAN KAI includes a complete Docker Compose environment provisioning PostgreSQL 16 with pgvector, Redis, FastAPI backend, and Next.js frontend.

---

## 1. Quick Start with Docker Compose

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and launch all services in detached mode
docker compose up --build -d

# 3. Check service health
docker compose ps

# 4. View logs
docker compose logs -f backend
```

---

## 2. Service Endpoints

- **Frontend Next.js UI:** `http://localhost:3000`
- **Backend FastAPI Gateway:** `http://localhost:8000`
- **Swagger API Docs:** `http://localhost:8000/docs`
- **PostgreSQL 16 + pgvector:** `localhost:5432`
- **Redis Cache & Queue:** `localhost:6379`

