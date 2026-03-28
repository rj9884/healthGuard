# HealthGuard

HealthGuard is now a split-stack product codebase:

- `backend/` contains the FastAPI application, SQLAlchemy models, service layer, repositories, and tests.
- `frontend/` contains the Next.js App Router application built with React, TypeScript, Tailwind, and shadcn-style UI components.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn-style components, React Query, React Hook Form, Zod, Recharts
- Backend: FastAPI, SQLAlchemy, pandas/scipy analysis, Anthropic integration, HuggingFace image classification
- Database: SQLite
- Infra: Docker Compose

## Project Structure

```text
healthGuard/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── services/
│   ├── data/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   ├── src/components/
│   ├── src/features/
│   ├── src/lib/
│   ├── Dockerfile
│   └── package.json
├── AI_Powered_Health_App_Idea.md
└── docker-compose.yml
```

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend app: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`

By default the frontend is configured to use mock data so charts, tables, and cards render immediately for UI review. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` to force live API usage.

## Docker

```bash
docker compose up --build
```

## API

The frontend targets versioned backend routes under `/api/v1`.

Key endpoints:

- `GET /api/v1/dashboard`
- `GET/POST /api/v1/symptoms`
- `GET /api/v1/analysis/summary`
- `GET /api/v1/analysis/patterns/{symptom}`
- `GET /api/v1/analysis/report`
- `POST /api/v1/chat`
- `GET/POST/DELETE /api/v1/medications`
- `POST /api/v1/image/classify`

## Notes

- The current product is a single-user MVP using the existing default-user model.
- `AI_Powered_Health_App_Idea.md` remains the functional/product reference for the app.
