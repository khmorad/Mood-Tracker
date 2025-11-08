from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..schemas.journal_schemas import JournalEntryCreate, JournalEntry
from ..services.journals_service import journals_service
router = APIRouter(prefix="/journal-entries", tags=["journal_entries"])

@router.get("/", response_model=List[dict])
async def get_journal_entries(user_id: Optional[str] = Query(None)):
    """Get all journal entries or filter by user_id"""
    try:
        if user_id:
            entries = journals_service.get_journal_entries_by_user(user_id)
            return entries
        else:
            # Get all entries using Supabase
            client = journals_service.client
            result = client.table("journal_entry").select("*").order("journal_date", desc=True).execute()
            return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=dict)
async def create_journal_entry(entry: JournalEntryCreate):
    """Create a new journal entry"""
    try:
        entry_data = {
            "user_id": entry.user_id,
            "entry_text": entry.entry_text,
            "AI_response": entry.AI_response if entry.AI_response is not None else "",
            "journal_date": entry.journal_date,
            "episode_flag": entry.episode_flag if entry.episode_flag is not None else 0
        }
        
        created_entry = journals_service.create_journal_entry(entry_data)
        
        return {
            "entry_id": created_entry.get("entry_id"),
            "user_id": entry.user_id,
            "entry_text": entry.entry_text,
            "AI_response": entry.AI_response,
            "journal_date": entry.journal_date,
            "episode_flag": entry.episode_flag
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{entry_id}", response_model=dict)
async def get_journal_entry(entry_id: int):
    """Get a specific journal entry by ID"""
    try:
        entry = journals_service.get_journal_entry_by_id(entry_id)
        
        if not entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        return entry
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{entry_id}", response_model=dict)
async def update_journal_entry(entry_id: int, entry_update: JournalEntryCreate):
    """Update a journal entry"""
    try:
        # Check if entry exists
        existing_entry = journals_service.get_journal_entry_by_id(entry_id)
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        entry_data = {
            "user_id": entry_update.user_id,
            "entry_text": entry_update.entry_text,
            "AI_response": entry_update.AI_response,
            "journal_date": entry_update.journal_date,
            "episode_flag": entry_update.episode_flag or 0
        }
        
        journals_service.update_journal_entry(entry_id, entry_data)
        return {"message": "Journal entry updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{entry_id}")
async def delete_journal_entry(entry_id: int):
    """Delete a journal entry"""
    try:
        # First check if entry exists
        existing_entry = journals_service.get_journal_entry_by_id(entry_id)
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        # Delete the entry
        journals_service.delete_journal_entry(entry_id)
        
        return {"message": "Journal entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))