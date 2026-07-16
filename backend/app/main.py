from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.models.database import Base, engine, SessionLocal
from app.models.user import User
from app.core.auth import get_password_hash

# Import all models so SQLAlchemy knows about them
from app.models import user, symptom, medication, family_member  # noqa: F401
from app.models import chat as chat_model  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HealthGuard API", version="2.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
