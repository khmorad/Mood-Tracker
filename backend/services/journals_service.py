from typing import Optional, Dict, Any, List, Union
from backend.services.base_service import BaseService
import logging

logger = logging.getLogger(__name__)

class JournalsService(BaseService):
    def __init__(self):
        super().__init__()
    
    def create_journal_entry(self, entry_data: Union[Dict[str, Any], 'JournalEntry']) -> Dict[str, Any]:
        """Create a new journal entry"""
        try:
            data = self._convert_to_dict(entry_data)
            result = self.client.table("journal_entry").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error("creating journal entry", e)
    
    def get_journal_entries_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all journal entries for a user"""
        try:
            result = self.client.table("journal_entry").select("*").eq("user_id", user_id).order("journal_date", desc=True).execute()
            return result.data or []
        except Exception as e:
            self._handle_error("getting journal entries", e)
    
    def get_journal_entry_by_id(self, entry_id: int) -> Optional[Dict[str, Any]]:
        """Get journal entry by ID"""
        try:
            result = self.client.table("journal_entry").select("*").eq("entry_id", entry_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            self._handle_error("getting journal entry", e)
    
    def update_journal_entry(self, entry_id: int, entry_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update journal entry"""
        try:
            result = self.client.table("journal_entry").update(entry_data).eq("entry_id", entry_id).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error("updating journal entry", e)
    
    def delete_journal_entry(self, entry_id: int) -> bool:
        """Delete journal entry"""
        try:
            result = self.client.table("journal_entry").delete().eq("entry_id", entry_id).execute()
            return True
        except Exception as e:
            self._handle_error("deleting journal entry", e)

# Create singleton instance
journals_service = JournalsService()
