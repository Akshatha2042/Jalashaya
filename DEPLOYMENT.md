# JALASHAYA — Deployment Guide

## 1. Local Development Setup (Quickest)

### Step 1: Backend Setup
```bash
# In the project root:
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will start at `http://localhost:8000`.
- API Documentation (Swagger): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/system/health`

### Step 2: Frontend Setup
In a separate terminal:
```bash
cd frontend
npm run dev
```
The Vite development server will open at `http://localhost:5173`.

---

## 2. Docker Compose Production Deployment

JALASHAYA includes a production multi-container `docker-compose.yml` that provisions:
1. **PostGIS Database Container:** `postgis/postgis:16-3.4`
2. **FastAPI Backend Container:** Python 3.13 production runtime
3. **Vite / Web Container:** Containerized frontend

### Start all services:
```bash
docker-compose up --build -d
```

### Stop all services:
```bash
docker-compose down
```

---

## 3. Production Environment Checklist
1. Ensure `.env` is configured with a secure `APP_SECRET_KEY`.
2. For production PostGIS, set:
   ```env
   DATABASE_URL=postgresql+psycopg://username:password@hostname:5432/jalashaya
   ```
3. When external satellite provider keys are ready, supply `GEE_PROJECT_ID`, `GEE_SERVICE_ACCOUNT`, `GEE_KEY_FILE_PATH`, and `SENTINEL_HUB_CLIENT_ID`.
