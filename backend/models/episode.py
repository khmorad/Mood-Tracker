from typing import Optional, Dict, Any
from datetime import date
from pydantic import BaseModel

class Episode(BaseModel):
    episode_id: Optional[str] = None
    user_id: str
    episode_start: date
    episode_end: Optional[date] = None

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for database operations"""
        data = self.dict()
        data['episode_start'] = self.episode_start.isoformat()
        if self.episode_end:
            data['episode_end'] = self.episode_end.isoformat()
        return data
