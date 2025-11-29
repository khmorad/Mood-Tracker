from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import sys
import os
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..schemas.journal_schemas import JournalEntryCreate, JournalEntry
from ..services.journals_service import journals_service

# Add logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/journal-entries", tags=["journal_entries"])

@router.get("/", response_model=List[dict])
async def get_journal_entries(user_id: Optional[str] = Query(None)):
    """Get all journal entries or filter by user_id"""
    logger.info(f"[JournalEntries] GET / - user_id={user_id}")
    try:
        if user_id:
            logger.debug(f"[JournalEntries] Fetching entries for user_id={user_id}")
            entries = journals_service.get_journal_entries_by_user(user_id)
            logger.info(f"[JournalEntries] Found {len(entries)} entries for user_id={user_id}")
            return entries
        else:
            logger.debug("[JournalEntries] Fetching all journal entries")
            client = journals_service.client
            result = client.table("journal_entry").select("*").order("journal_date", desc=True).execute()
            logger.info(f"[JournalEntries] Found {len(result.data) if result.data else 0} total entries")
            return result.data or []
    except Exception as e:
        logger.error(f"[JournalEntries] Error in get_journal_entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=dict)
async def create_journal_entry(entry: JournalEntryCreate):
    """Create a new journal entry"""
    logger.info(f"[JournalEntries] POST / - Creating entry for user_id={entry.user_id}")
    try:
        entry_data = {
            "user_id": entry.user_id,
            "entry_text": entry.entry_text,
            "AI_response": entry.AI_response if entry.AI_response is not None else "",
            "journal_date": entry.journal_date,
            "episode_flag": entry.episode_flag if entry.episode_flag is not None else 0
        }
        logger.debug(f"[JournalEntries] Entry data to insert: {entry_data}")

        created_entry = journals_service.create_journal_entry(entry_data)
        logger.info(f"[JournalEntries] Created entry: {created_entry}")

        # Defensive: check if entry_id is present
        if "entry_id" not in created_entry:
            logger.warning(f"[JournalEntries] Created entry missing entry_id: {created_entry}")

        return {
            "entry_id": created_entry.get("entry_id"),
            "user_id": entry.user_id,
            "entry_text": entry.entry_text,
            "AI_response": entry.AI_response,
            "journal_date": entry.journal_date,
            "episode_flag": entry.episode_flag
        }
    except Exception as e:
        logger.error(f"[JournalEntries] Error in create_journal_entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{entry_id}", response_model=dict)
async def get_journal_entry(entry_id: int):
    """Get a specific journal entry by ID"""
    logger.info(f"[JournalEntries] GET /{entry_id}")
    try:
        entry = journals_service.get_journal_entry_by_id(entry_id)
        logger.debug(f"[JournalEntries] Entry fetched for entry_id={entry_id}: {entry}")

        if not entry:
            logger.warning(f"[JournalEntries] Entry not found for entry_id={entry_id}")
            raise HTTPException(status_code=404, detail="Journal entry not found")

        return entry
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[JournalEntries] Error in get_journal_entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{entry_id}", response_model=dict)
async def update_journal_entry(entry_id: int, entry_update: JournalEntryCreate):
    """Update a journal entry"""
    logger.info(f"[JournalEntries] PUT /{entry_id} - Update requested")
    try:
        existing_entry = journals_service.get_journal_entry_by_id(entry_id)
        logger.debug(f"[JournalEntries] Existing entry for update: {existing_entry}")
        if not existing_entry:
            logger.warning(f"[JournalEntries] Entry not found for update, entry_id={entry_id}")
            raise HTTPException(status_code=404, detail="Journal entry not found")

        entry_data = {
            "user_id": entry_update.user_id,
            "entry_text": entry_update.entry_text,
            "AI_response": entry_update.AI_response,
            "journal_date": entry_update.journal_date,
            "episode_flag": entry_update.episode_flag or 0
        }
        logger.debug(f"[JournalEntries] Update data: {entry_data}")

        journals_service.update_journal_entry(entry_id, entry_data)
        logger.info(f"[JournalEntries] Entry updated for entry_id={entry_id}")
        return {"message": "Journal entry updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[JournalEntries] Error in update_journal_entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{entry_id}")
async def delete_journal_entry(entry_id: int):
    """Delete a journal entry"""
    logger.info(f"[JournalEntries] DELETE /{entry_id}")
    try:
        existing_entry = journals_service.get_journal_entry_by_id(entry_id)
        logger.debug(f"[JournalEntries] Entry to delete: {existing_entry}")
        if not existing_entry:
            logger.warning(f"[JournalEntries] Entry not found for delete, entry_id={entry_id}")
            raise HTTPException(status_code=404, detail="Journal entry not found")

        journals_service.delete_journal_entry(entry_id)
        logger.info(f"[JournalEntries] Entry deleted for entry_id={entry_id}")
        return {"message": "Journal entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[JournalEntries] Error in delete_journal_entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))