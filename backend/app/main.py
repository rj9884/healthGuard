from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.models.database import Base, engine, SessionLocal
from app.models.user import User
from app.core.auth import get_password_hash

# Import all models so SQLAlchemy knows about them
from app.models import user, symptom, medication  # noqa: F401
from app.models import chat as chat_model  # noqa: F401

Base.metadata.create_all(bind=engine)

def seed_test_credentials():
    db = SessionLocal()
    try:
        test_email = "demo@healthguard.ai"
        existing = db.query(User).filter(User.email == test_email).first()
        if not existing:
            demo_user = User(
                id="test_demo_user_id",
                email=test_email,
                hashed_password=get_password_hash("demo1234"),
                name="Alex Rivera (Test Demo)",
                age_range="adult"
            )
            db.add(demo_user)
            db.commit()
    except Exception as e:
        print(f"Note: Could not seed test user: {e}")
    finally:
        db.close()

seed_test_credentials()

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
