from typing import Optional, Dict, Any, List, Union
from backend.services.base_service import BaseService
import logging

logger = logging.getLogger(__name__)

class EmotionsService(BaseService):
    def __init__(self):
        super().__init__()
    
    def create_emotion_record(self, emotion_data: Union[Dict[str, Any], 'Emotion']) -> Dict[str, Any]:
        """Create emotion record"""
        try:
            data = self._convert_to_dict(emotion_data)
            result = self.client.table("emotions").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error("creating emotion record", e)
    
    def get_emotions_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all emotions for a user"""
        try:
            result = self.client.table("emotions").select("*").eq("user_id", user_id).order("journal_date", desc=True).execute()
            return result.data or []
        except Exception as e:
            self._handle_error("getting emotions", e)
    
    def get_emotions_by_entry(self, entry_id: int) -> Optional[Dict[str, Any]]:
        """Get emotions by journal entry ID"""
        try:
            result = self.client.table("emotions").select("*").eq("entry_id", entry_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            self._handle_error("getting emotions by entry", e)

# Create singleton instance
emotions_service = EmotionsService()
