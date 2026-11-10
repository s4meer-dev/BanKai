# BAN KAI Local Setup Guide

Follow these steps to run BAN KAI on your local machine with zero external cloud dependencies.

---

## 1. Prerequisites
- Python 3.12+
- Node.js 20+ and npm
- `uv` (recommended) or standard `pip`

---

## 2. Backend Setup

```bash
cd backend

# Create virtual environment with uv
uv venv
.\.venv\Scripts\activate   # On Windows
# source .venv/bin/activate # On Linux/macOS

# Install dependencies
uv pip install -r requirements.txt
uv pip install greenlet email-validator

# Copy environment template
cp ../.env.example .env

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend interactive API documentation is available at `http://localhost:8000/docs`.

---

## 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 4. Running Tests

```bash
cd backend
.\.venv\Scripts\python -m pytest tests/ -v
```

