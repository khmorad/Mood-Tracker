from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import uvicorn

# Import routers
from routers import users, journal_entries, auth

# Load environment variables
load_dotenv()

app = FastAPI(title="Mood Tracker API", version="1.0.0")

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

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Create database engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class UserBase(BaseModel):
    user_id: str
    email: str
    password: str
    profile_picture: Optional[str] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    diagnosis_status: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class JournalEntryBase(BaseModel):
    user_id: str
    entry_text: str
    journal_date: str
    AI_response: Optional[str] = None
    episode_flag: Optional[int] = 0

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntry(JournalEntryBase):
    entry_id: int
    
    class Config:
        from_attributes = True

# Include routers
app.include_router(users.router)
app.include_router(journal_entries.router)
app.include_router(auth.router)

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