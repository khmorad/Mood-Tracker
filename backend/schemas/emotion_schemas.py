from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import date

class EmotionBase(BaseModel):
    journal_date: date
    entry_id: int
    happy: int = 0
    stressed: int = 0
    anxious: int = 0
    angry: int = 0
    sad: int = 0
    agitated: int = 0
    neutral: int = 0
    user_id: str

class EmotionCreate(EmotionBase):
    pass

class EmotionResponse(EmotionBase):
    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    mood_improvement: Dict[str, Any]
    mood_journey: Dict[str, Any]
    emotional_landscape: Dict[str, Any]
    progress: Dict[str, Any]
    journal_entries: Dict[str, Any]
    period: Dict[str, Any]

class MoodImprovementData(BaseModel):
    percentage: float
    trend: str
    message: str
    days_compared: int

class EmotionalLandscapeItem(BaseModel):
    name: str
    percentage: float
    color: str

class EmotionalLandscapeData(BaseModel):
    emotions: List[EmotionalLandscapeItem]
    dominant_emotion: str
