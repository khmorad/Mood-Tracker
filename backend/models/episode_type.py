from typing import Dict, Any
from pydantic import BaseModel

class EpisodeType(BaseModel):
    episode_id: str
    detected_emotic: str

    class Config:
        from_attributes = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for database operations"""
        return self.dict()
