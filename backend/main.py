import logging
import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import Optional, List
import uvicorn

# ---------------------------------------------------------------------------
# Load environment variables before anything else so that services which read
# env vars at import time (e.g. Supabase client) pick up the correct values.
# ---------------------------------------------------------------------------
load_dotenv(Path(__file__).resolve().parent / ".env")

# ---------------------------------------------------------------------------
# Configure structured JSON logging as early as possible.
# This must happen before any module that calls logging.basicConfig() is
# imported so that setup_logging() can clear those handlers and replace them
# with the JSON handler.
# ---------------------------------------------------------------------------
from backend.utils.logging_config import setup_logging  # noqa: E402

setup_logging(level=logging.INFO)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application imports (after logging is configured)
# ---------------------------------------------------------------------------
from backend.routers import auth, emotions, journal_entries, plans, users  # noqa: E402
from backend.routers.account import router as account_router  # noqa: E402
from backend.tasks.emotion_scheduler import emotion_scheduler  # noqa: E402
from backend.tasks.plan_scheduler import plan_scheduler  # noqa: E402
from backend.middleware.logging_middleware import RequestLoggingMiddleware  # noqa: E402


# ---------------------------------------------------------------------------
# Lifespan: start / stop background schedulers
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting background schedulers")

    emotion_task = asyncio.create_task(emotion_scheduler.start_scheduler())
    plan_task = asyncio.create_task(plan_scheduler.start_scheduler())

    logger.info("Emotion analysis scheduler started")
    logger.info("Plan management scheduler started")

    yield

    # Shutdown
    logger.info("Stopping background schedulers")

    emotion_scheduler.stop_scheduler()
    plan_scheduler.stop_scheduler()

    try:
        emotion_task.cancel()
        plan_task.cancel()
        await emotion_task
        await plan_task
    except asyncio.CancelledError:
        pass

    logger.info("All schedulers stopped successfully")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Mood Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)

# RequestLoggingMiddleware must be added BEFORE CORSMiddleware so that the
# request ID and latency headers are present on every response (including
# pre-flight OPTIONS responses handled by CORS).
app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Database configuration
# ---------------------------------------------------------------------------
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME]):
    raise ValueError("Missing required database environment variables")

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(users.router)
app.include_router(journal_entries.router)
app.include_router(auth.router)
app.include_router(emotions.router)
app.include_router(plans.router)
app.include_router(account_router)


# ---------------------------------------------------------------------------
# Health-check endpoints
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {"message": "Mood Tracker API is running!"}


@app.get("/health")
async def health_check():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}",
        )


@app.get("/scheduler-status")
async def scheduler_status():
    return {
        "emotion_scheduler": {
            "running": emotion_scheduler.is_running
            if hasattr(emotion_scheduler, "is_running")
            else "unknown"
        },
        "plan_scheduler": {
            "running": plan_scheduler.is_running
            if hasattr(plan_scheduler, "is_running")
            else "unknown"
        },
        "status": "healthy",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
