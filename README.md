<p align="center">
  <h1 align="center">🛡️ HealthGuard</h1>
  <p align="center">
    <strong>AI-Powered Health Monitoring &amp; Pattern Analysis</strong>
  </p>
  <p align="center">
    Track symptoms · Spot patterns · Chat with AI · Screen skin conditions · Manage medications
  </p>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
  - [System Overview](#system-overview)
  - [Request Flow](#request-flow)
  - [Backend Layered Architecture](#backend-layered-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
  - [Docker (Recommended)](#docker-recommended)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Ethical Considerations](#ethical-considerations)
- [License](#license)

---

## Overview

HealthGuard is a full-stack health monitoring application that helps users track symptoms, discover hidden health patterns through AI-driven analysis, and make informed decisions about seeking medical care. It combines a **FastAPI** backend with a modern **Next.js** frontend, connected via a versioned REST API.

> **⚠️ Disclaimer:** HealthGuard is an educational and informational tool — it is **not** a substitute for professional medical advice, diagnosis, or treatment.

---

## Key Features

| Feature | Description |
|---|---|
| ** Dashboard** | At-a-glance health summary — recent symptoms, severity trends, and quick stats |
| ** Symptom Logging** | Log symptoms with severity (1–10), duration, triggers, relief measures, and notes |
| ** Pattern Analysis** | Automated trigger-confidence scoring using pandas/scipy to surface hidden correlations |
| ** AI Health Chat** | Conversational AI companion (via OpenRouter) that references your logged history |
| ** Skin Screener** | Upload a photo for preliminary visual classification using HuggingFace pretrained models |
| ** Medication Tracker** | CRUD interface for medications with dosage, frequency, and scheduling |
| ** Report Export** | Generate structured PDF health summaries shareable with a doctor |

---

## Architecture

### System Overview

```mermaid
graph TB
    subgraph Client["🖥️ Frontend — Next.js"]
        UI["React UI<br/>TypeScript + Tailwind"]
        RQ["React Query<br/>Data Fetching"]
        RC["Recharts<br/>Visualization"]
    end

    subgraph Server["⚙️ Backend — FastAPI"]
        API["REST API<br/>/api/v1/*"]
        SVC["Service Layer"]
        REPO["Repository Layer"]
        CORE["Core Engines"]
    end

    subgraph External["☁️ External Services"]
        OR["OpenRouter API<br/>AI Chat"]
        HF["HuggingFace Hub<br/>Image Classification"]
    end

    subgraph Storage["💾 Storage"]
        DB[(SQLite)]
    end

    UI --> RQ
    RQ -->|HTTP| API
    API --> SVC
    SVC --> REPO
    SVC --> CORE
    REPO --> DB
    CORE -->|AI Queries| OR
    CORE -->|Pretrained Models| HF

    style Client fill:#1e293b,stroke:#38bdf8,color:#e2e8f0
    style Server fill:#1e293b,stroke:#a78bfa,color:#e2e8f0
    style External fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style Storage fill:#1e293b,stroke:#34d399,color:#e2e8f0
```

### Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js Frontend
    participant API as FastAPI /api/v1
    participant SVC as Service Layer
    participant REPO as Repository
    participant DB as SQLite
    participant AI as OpenRouter / HuggingFace

    U->>FE: Interact with UI
    FE->>API: HTTP Request (React Query)
    API->>SVC: Delegate to service
    
    alt Data Operation
        SVC->>REPO: Query / Persist
        REPO->>DB: SQL via SQLAlchemy
        DB-->>REPO: Result
        REPO-->>SVC: Domain object
    else AI Operation
        SVC->>AI: External API call
        AI-->>SVC: AI response
    end
    
    SVC-->>API: Response DTO
    API-->>FE: JSON Response
    FE-->>U: Updated UI
```

### Backend Layered Architecture

```mermaid
graph TD
    A["API Endpoints<br/><i>app/api/v1/endpoints/</i>"] -->|delegates to| B["Services<br/><i>app/services/</i>"]
    B -->|data access| C["Repositories<br/><i>app/repositories/</i>"]
    B -->|business logic| D["Core Engines<br/><i>app/core/</i>"]
    C -->|ORM| E["Models<br/><i>app/models/</i>"]
    E -->|mapped to| F[(SQLite Database)]
    D -->|AI chat| G["ai_client.py<br/>OpenRouter"]
    D -->|image ML| H["image_classifier.py<br/>HuggingFace"]
    D -->|analytics| I["pattern_engine.py<br/>pandas + scipy"]
    D -->|PDF| J["report_generator.py<br/>fpdf2"]

    style A fill:#3b82f6,stroke:#60a5fa,color:#fff
    style B fill:#8b5cf6,stroke:#a78bfa,color:#fff
    style C fill:#06b6d4,stroke:#22d3ee,color:#fff
    style D fill:#f59e0b,stroke:#fbbf24,color:#000
    style E fill:#10b981,stroke:#34d399,color:#fff
    style F fill:#6b7280,stroke:#9ca3af,color:#fff
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | React framework with SSR and file-based routing |
| **TypeScript** | Type safety across the frontend |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui-style components** | Accessible, composable UI primitives |
| **React Query** | Server state management and caching |
| **React Hook Form + Zod** | Form handling with schema validation |
| **Recharts** | Interactive health data visualizations |
| **Lucide React** | Icon system |

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python REST API with auto-generated OpenAPI docs |
| **SQLAlchemy** | ORM for database modeling and queries |
| **pandas + scipy** | Statistical pattern analysis and correlation detection |
| **OpenRouter API** | LLM-backed AI health chat companion |
| **HuggingFace Transformers** | Pretrained image classification for skin screening |
| **fpdf2** | PDF health report generation |
| **SQLite** | Lightweight, zero-config database |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Docker Compose** | Multi-container orchestration (one-command startup) |
| **Named Volumes** | Persistent storage for SQLite DB and HuggingFace model cache |

---

## Project Structure

```text
healthGuard/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/     # Route handlers (dashboard, symptoms, chat, etc.)
│   │   ├── core/                 # AI client, pattern engine, image classifier, report gen
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── repositories/         # Data access layer
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Business logic layer
│   │   ├── config.py             # Environment and app settings
│   │   └── main.py               # FastAPI app entry point
│   ├── data/                     # Static reference data
│   ├── tests/                    # Backend test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/(product)/        # Next.js pages (dashboard, symptoms, chat, etc.)
│   │   ├── components/           # Shared UI components + layout
│   │   ├── features/             # Feature-specific modules (chat, dashboard, patterns…)
│   │   └── lib/                  # Utilities, API client, hooks
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml            # Orchestrates backend + frontend containers
├── .env.example                  # Environment variable template
└── AI_Powered_Health_App_Idea.md # Product/functional reference document
```

---

## Getting Started

### Prerequisites

- **Python 3.12+** and **pip** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **Docker** and **Docker Compose** (optional, for containerized setup)

### Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | API key for AI chat (get from [openrouter.ai](https://openrouter.ai)) |
| `OPENROUTER_MODEL` | No | LLM model to use (default: `qwen/qwen3-coder:free`) |
| `OPENFDA_API_KEY` | No | OpenFDA key for medication interactions |
| `DATABASE_URL` | No | SQLite connection string (auto-configured) |
| `NEXT_PUBLIC_API_URL` | No | Backend API URL for the frontend |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | Set `true` to use mock data for UI development |

### Local Development

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API Docs | http://localhost:8000/docs |

> **Tip:** The frontend defaults to mock data so UI renders immediately without a running backend. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env` to use live API data.

### Docker (Recommended)

```mermaid
graph LR
    DC["docker compose<br/>up --build"] --> BE["Backend Container<br/>FastAPI :8000"]
    DC --> FE["Frontend Container<br/>Next.js :3000"]
    BE --> DB["db_data volume<br/>SQLite"]
    BE --> HF["hf_cache volume<br/>HuggingFace Models"]
    FE -->|depends_on| BE

    style DC fill:#2563eb,stroke:#3b82f6,color:#fff
    style BE fill:#7c3aed,stroke:#8b5cf6,color:#fff
    style FE fill:#0891b2,stroke:#06b6d4,color:#fff
    style DB fill:#059669,stroke:#10b981,color:#fff
    style HF fill:#d97706,stroke:#f59e0b,color:#fff
```

```bash
# Build and start all services
docker compose up --build

# Run in detached mode
docker compose up -d

# Stop services (data preserved in volumes)
docker compose down

# Stop and wipe all data
docker compose down -v
```

---

## API Reference

All endpoints are served under `/api/v1`. Interactive documentation is available at `/docs` when the backend is running.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard` | Aggregated health dashboard data |
| `GET` | `/api/v1/symptoms` | List symptom logs |
| `POST` | `/api/v1/symptoms` | Create a new symptom entry |
| `GET` | `/api/v1/analysis/summary` | Pattern analysis summary |
| `GET` | `/api/v1/analysis/patterns/{symptom}` | Trigger analysis for a specific symptom |
| `GET` | `/api/v1/analysis/report` | Generate PDF health report |
| `POST` | `/api/v1/chat` | Send a message to the AI companion |
| `GET` | `/api/v1/medications` | List medications |
| `POST` | `/api/v1/medications` | Add a medication |
| `DELETE` | `/api/v1/medications/{id}` | Remove a medication |
| `POST` | `/api/v1/image/classify` | Upload image for skin condition screening |

---

## Database Schema

```mermaid
erDiagram
    USERS {
        TEXT id PK
        TEXT name
        TEXT age_range
        TEXT sex
        TEXT language
        DATETIME created_at
    }

    SYMPTOM_LOGS {
        INTEGER id PK
        TEXT user_id FK
        DATETIME timestamp
        TEXT symptom
        INTEGER severity "1-10"
        REAL duration_hr
        JSON triggers
        JSON relief
        TEXT notes
    }

    MEDICATIONS {
        INTEGER id PK
        TEXT user_id FK
        TEXT name
        TEXT dosage
        TEXT frequency
        DATE start_date
        TEXT notes
    }

    CHAT_SESSIONS {
        INTEGER id PK
        TEXT user_id FK
        DATETIME timestamp
        TEXT role "user | assistant"
        TEXT content
    }

    USERS ||--o{ SYMPTOM_LOGS : "logs"
    USERS ||--o{ MEDICATIONS : "takes"
    USERS ||--o{ CHAT_SESSIONS : "chats"
```

---

## Configuration

The backend reads configuration from environment variables via `app/config.py`. All settings can be overridden through the `.env` file or Docker environment.

| Setting | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./health_monitor.db` | Database connection string |
| `OPENROUTER_API_KEY` | — | Required for AI chat functionality |
| `OPENROUTER_MODEL` | `qwen/qwen3-coder:free` | LLM model used for health chat |
| `HF_HOME` | System default | HuggingFace model cache directory |

---

## Ethical Considerations

-  **No diagnosis claims** — All AI outputs include educational-only disclaimers
-  **Emergency referrals** — High-severity or dangerous symptom combinations surface professional care recommendations
-  **Transparency** — AI limitations and confidence levels are always visible to the user
-  **Mental health awareness** — Crisis resources are surfaced when mental health symptoms are detected
-  **Data minimalism** — No sensitive data is stored beyond what the user explicitly logs

---

## License

This project is for educational and demonstration purposes.