from pydantic import BaseModel
from typing import Optional

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