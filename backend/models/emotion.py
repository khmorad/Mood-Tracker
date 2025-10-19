from typing import Optional, Dict, Any
from datetime import date
from pydantic import BaseModel, validator

class Emotion(BaseModel):
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

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

    @validator('happy', 'stressed', 'anxious', 'angry', 'sad', 'agitated', 'neutral')
    def validate_emotion_scores(cls, v):
        if v < 0 or v > 10:
            raise ValueError('Emotion scores must be between 0 and 10')
        return v

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for database operations"""
        data = self.dict()
        data['journal_date'] = self.journal_date.isoformat()
        return data

    @classmethod
    def from_gemini_response(cls, data: Dict[str, Any], user_id: str, entry_id: int, journal_date: date) -> 'Emotion':
        """Create Emotion instance from Gemini API response"""
        return cls(
            journal_date=journal_date,
            entry_id=entry_id,
            user_id=user_id,
            happy=data.get('happy', 0),
            stressed=data.get('stressed', 0),
            anxious=data.get('anxious', 0),
            angry=data.get('angry', 0),
            sad=data.get('sad', 0),
            agitated=data.get('agitated', 0),
            neutral=data.get('neutral', 0)
        )
