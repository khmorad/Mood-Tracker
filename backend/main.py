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

# Add these new imports for background task
import asyncio
from contextlib import asynccontextmanager

# Import routers
from backend.routers import users, journal_entries, auth
# Add this new import for emotions router
from backend.routers import emotions
# Add this import for the background scheduler
from backend.tasks.emotion_scheduler import emotion_scheduler

# Load environment variables from backend/.env explicitly
load_dotenv(Path(__file__).resolve().parent / ".env")

# Add lifespan event handler for background task
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting emotion analysis scheduler...")
    # Create background task for emotion analysis
    task = asyncio.create_task(emotion_scheduler.start_scheduler())
    yield
    # Shutdown
    print("Stopping emotion analysis scheduler...")
    emotion_scheduler.stop_scheduler()
    try:
        task.cancel()
        await task
    except asyncio.CancelledError:
        pass

# Update FastAPI app initialization to include lifespan
app = FastAPI(
    title="Mood Tracker API", 
    version="1.0.0",
    lifespan=lifespan  # Add this line
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
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
app.include_router(emotions.router)  # Add this line for emotions router

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)