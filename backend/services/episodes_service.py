from typing import Dict, Any, List
from backend.services.base_service import BaseService
import logging

logger = logging.getLogger(__name__)

class EpisodesService(BaseService):
    def __init__(self):
        super().__init__()
    
    def create_episode(self, episode_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new episode"""
        try:
            result = self.client.table("episode").insert(episode_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error("creating episode", e)
    
    def get_episodes_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all episodes for a user"""
        try:
            result = self.client.table("episode").select("*").eq("user_id", user_id).order("episode_start", desc=True).execute()
            return result.data or []
        except Exception as e:
            self._handle_error("getting episodes", e)
    
    def update_episode(self, episode_id: str, episode_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update episode"""
        try:
            result = self.client.table("episode").update(episode_data).eq("episode_id", episode_id).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error("updating episode", e)
    
    def delete_episode(self, episode_id: str) -> bool:
        """Delete episode"""
        try:
            result = self.client.table("episode").delete().eq("episode_id", episode_id).execute()
            return True
        except Exception as e:
            self._handle_error("deleting episode", e)
    
    def create_episode_type(self, episode_type_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create episode type"""
        try:
            result = self.client.table("episode_type").insert(episode_type_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error("creating episode type", e)
    
    def get_episode_types_by_episode(self, episode_id: str) -> List[Dict[str, Any]]:
        """Get episode types by episode ID"""
        try:
            result = self.client.table("episode_type").select("*").eq("episode_id", episode_id).execute()
            return result.data or []
        except Exception as e:
            self._handle_error("getting episode types", e)

# Create singleton instance
episodes_service = EpisodesService()
