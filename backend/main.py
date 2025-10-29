from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from pathlib import Path
import uvicorn
import asyncio
from contextlib import asynccontextmanager

# Import routers
from backend.routers import users, journal_entries, auth, plans  # Add plans router
from backend.routers import emotions

# Import both schedulers
from backend.tasks.emotion_scheduler import emotion_scheduler
from backend.tasks.plan_scheduler import plan_scheduler

# Load environment variables
load_dotenv(Path(__file__).resolve().parent / ".env")

# Update lifespan event handler for both schedulers
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting background schedulers...")
    
    # Create background tasks for both schedulers
    emotion_task = asyncio.create_task(emotion_scheduler.start_scheduler())
    plan_task = asyncio.create_task(plan_scheduler.start_scheduler())
    
    print("✓ Emotion analysis scheduler started")
    print("✓ Plan management scheduler started")
    
    yield
    
    # Shutdown
    print("🛑 Stopping background schedulers...")
    
    # Stop both schedulers
    emotion_scheduler.stop_scheduler()
    plan_scheduler.stop_scheduler()
    
    # Cancel and await both tasks
    try:
        emotion_task.cancel()
        plan_task.cancel()
        await emotion_task
        await plan_task
    except asyncio.CancelledError:
        pass
    
    print("✓ All schedulers stopped successfully")

# Update FastAPI app initialization
app = FastAPI(
    title="Mood Tracker API", 
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME]):
    raise ValueError("Missing required database environment variables")

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Create database engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Include routers
app.include_router(users.router)
app.include_router(journal_entries.router)
app.include_router(auth.router)
app.include_router(emotions.router)
app.include_router(plans.router)  # Add the plans router

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Mood Tracker API is running!"}

# Health check for database
@app.get("/health")
async def health_check():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Add scheduler status endpoint
@app.get("/scheduler-status")
async def scheduler_status():
    return {
        "emotion_scheduler": {"running": emotion_scheduler.is_running if hasattr(emotion_scheduler, 'is_running') else "unknown"},
        "plan_scheduler": {"running": plan_scheduler.is_running if hasattr(plan_scheduler, 'is_running') else "unknown"},
        "status": "healthy"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)