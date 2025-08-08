from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..schemas.db import get_db
from ..schemas.journal_schemas import JournalEntryCreate, JournalEntry

router = APIRouter(prefix="/journal-entries", tags=["journal_entries"])

@router.get("/", response_model=List[dict])
async def get_journal_entries(user_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Get all journal entries or filter by user_id"""
    try:
        if user_id:
            query = text("SELECT * FROM journal_entry WHERE user_id = :user_id")
            result = db.execute(query, {"user_id": user_id})
        else:
            query = text("SELECT * FROM journal_entry")
            result = db.execute(query)
        
        entries = result.fetchall()
        return [dict(entry._mapping) for entry in entries]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=dict)
async def create_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    """Create a new journal entry"""
    try:
        query = text("""
            INSERT INTO journal_entry (user_id, entry_text, AI_response, journal_date, episode_flag) 
            VALUES (:user_id, :entry_text, :AI_response, :journal_date, :episode_flag)
        """)
        
        result = db.execute(query, {
            "user_id": entry.user_id,
            "entry_text": entry.entry_text,
            "AI_response": entry.AI_response if entry.AI_response is not None else "",
            "journal_date": entry.journal_date,
            "episode_flag": entry.episode_flag if entry.episode_flag is not None else 0
        })
        
        db.commit()
        
        # Get the inserted ID
        inserted_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar()
        
        return {
            "entry_id": inserted_id,
            "user_id": entry.user_id,
            "entry_text": entry.entry_text,
            "AI_response": entry.AI_response,
            "journal_date": entry.journal_date,
            "episode_flag": entry.episode_flag
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{entry_id}", response_model=dict)
async def get_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    """Get a specific journal entry by ID"""
    try:
        query = text("SELECT * FROM journal_entry WHERE entry_id = :entry_id")
        result = db.execute(query, {"entry_id": entry_id})
        entry = result.fetchone()
        
        if not entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        return dict(entry._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{entry_id}", response_model=dict)
async def update_journal_entry(entry_id: int, entry_update: JournalEntryCreate, db: Session = Depends(get_db)):
    """Update a journal entry"""
    try:
        # Check if entry exists
        check_query = text("SELECT entry_id FROM journal_entry WHERE entry_id = :entry_id")
        result = db.execute(check_query, {"entry_id": entry_id})
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        query = text("""
            UPDATE journal_entry SET 
                user_id = :user_id, entry_text = :entry_text, 
                AI_response = :AI_response, journal_date = :journal_date, 
                episode_flag = :episode_flag
            WHERE entry_id = :entry_id
        """)
        
        db.execute(query, {
            "entry_id": entry_id,
            "user_id": entry_update.user_id,
            "entry_text": entry_update.entry_text,
            "AI_response": entry_update.AI_response,
            "journal_date": entry_update.journal_date,
            "episode_flag": entry_update.episode_flag or 0
        })
        
        db.commit()
        return {"message": "Journal entry updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{entry_id}")
async def delete_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    """Delete a journal entry"""
    try:
        # First check if entry exists
        check_query = text("SELECT entry_id FROM journal_entry WHERE entry_id = :entry_id")
        check_result = db.execute(check_query, {"entry_id": entry_id})
        if not check_result.fetchone():
            raise HTTPException(status_code=404, detail="Journal entry not found")
        
        # Delete the entry
        query = text("DELETE FROM journal_entry WHERE entry_id = :entry_id")
        db.execute(query, {"entry_id": entry_id})
        db.commit()
        
        return {"message": "Journal entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))