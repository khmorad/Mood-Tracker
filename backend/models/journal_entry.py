from typing import Optional, Dict, Any
from datetime import date
from pydantic import BaseModel, validator

class JournalEntry(BaseModel):
    entry_id: Optional[int] = None
    user_id: str
    entry_text: str
    AI_response: Optional[str] = None
    journal_date: date
    episode_flag: Optional[int] = 0

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

    @validator('entry_text')
    def validate_entry_text(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Entry text cannot be empty')
        return v.strip()

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for database operations"""
        data = self.dict()
        data['journal_date'] = self.journal_date.isoformat()
        return data
