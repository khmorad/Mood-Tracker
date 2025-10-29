from typing import Optional, Dict, Any, List, Union
from ..utils.supabase_client import get_supabase_client
from supabase import Client
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        try:
            self.client: Client = get_supabase_client()
            logger.info("[SupabaseService] ✓ Connected to Supabase successfully")
        except Exception as e:
            logger.error(f"[SupabaseService] Failed to connect to Supabase: {e}")
            raise
    
    # User operations
    def create_user(self, user_data: Union[Dict[str, Any], 'User']) -> Dict[str, Any]:
        """Create a new user"""
        try:
            # Convert to dict if it's a model
            if hasattr(user_data, 'to_dict'):
                data = user_data.to_dict()
            else:
                data = user_data.copy()
            
            # Ensure required fields have defaults
            data.setdefault('subscription_tier', 'Free')
            data.setdefault('monthly_entries_count', 0)
            
            # Handle None values for optional fields - keep them as None for database
            # Don't remove None values as some database columns allow NULL
            
            logger.info(f"[SupabaseService] Creating user with data keys: {list(data.keys())}")
            logger.info(f"[SupabaseService] User data: {data}")
            
            result = self.client.table("user").insert(data).execute()
            
            if result.data:
                logger.info(f"[SupabaseService] ✓ User created successfully: {result.data[0]['user_id']}")
                return result.data[0]
            
            logger.error("[SupabaseService] No data returned from user creation")
            raise Exception("Failed to create user - no data returned")
            
        except Exception as e:
            logger.error(f"[SupabaseService] Error creating user: {str(e)}")
            raise Exception(f"Error creating user: {str(e)}")
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table("user").select("*").eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            raise Exception(f"Error getting user: {str(e)}")
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            result = self.client.table("user").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            raise Exception(f"Error getting user by email: {str(e)}")
    
    def update_user(self, user_id: str, user_data: Union[Dict[str, Any], 'User']) -> Dict[str, Any]:
        """Update user"""
        try:
            # Convert to dict if it's a model
            if hasattr(user_data, 'to_dict'):
                data = user_data.to_dict()
            else:
                data = user_data
                
            result = self.client.table("user").update(data).eq("user_id", user_id).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            raise Exception(f"Error updating user: {str(e)}")
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            result = self.client.table("user").delete().eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            raise Exception(f"Error deleting user: {str(e)}")
    
    # Journal entry operations
    def create_journal_entry(self, entry_data: Union[Dict[str, Any], 'JournalEntry']) -> Dict[str, Any]:
        """Create a new journal entry"""
        try:
            # Convert to dict if it's a model
            if hasattr(entry_data, 'to_dict'):
                data = entry_data.to_dict()
            else:
                data = entry_data
                
            result = self.client.table("journal_entry").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating journal entry: {str(e)}")
            raise Exception(f"Error creating journal entry: {str(e)}")
    
    def get_journal_entries_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all journal entries for a user"""
        try:
            result = self.client.table("journal_entry").select("*").eq("user_id", user_id).order("journal_date", desc=True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting journal entries: {str(e)}")
            raise Exception(f"Error getting journal entries: {str(e)}")
    
    def get_journal_entry_by_id(self, entry_id: int) -> Optional[Dict[str, Any]]:
        """Get journal entry by ID"""
        try:
            result = self.client.table("journal_entry").select("*").eq("entry_id", entry_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting journal entry: {str(e)}")
            raise Exception(f"Error getting journal entry: {str(e)}")
    
    def update_journal_entry(self, entry_id: int, entry_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update journal entry"""
        try:
            result = self.client.table("journal_entry").update(entry_data).eq("entry_id", entry_id).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error updating journal entry: {str(e)}")
            raise Exception(f"Error updating journal entry: {str(e)}")
    
    def delete_journal_entry(self, entry_id: int) -> bool:
        """Delete journal entry"""
        try:
            result = self.client.table("journal_entry").delete().eq("entry_id", entry_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting journal entry: {str(e)}")
            raise Exception(f"Error deleting journal entry: {str(e)}")
    
    # Emotion operations
    def create_emotion_record(self, emotion_data: Union[Dict[str, Any], 'Emotion']) -> Dict[str, Any]:
        """Create emotion record"""
        try:
            # Convert to dict if it's a model
            if hasattr(emotion_data, 'to_dict'):
                data = emotion_data.to_dict()
            else:
                data = emotion_data
                
            result = self.client.table("emotions").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating emotion record: {str(e)}")
            raise Exception(f"Error creating emotion record: {str(e)}")
    
    def get_emotions_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all emotions for a user"""
        try:
            result = self.client.table("emotions").select("*").eq("user_id", user_id).order("journal_date", desc=True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting emotions: {str(e)}")
            raise Exception(f"Error getting emotions: {str(e)}")
    
    def get_emotions_by_entry(self, entry_id: int) -> Optional[Dict[str, Any]]:
        """Get emotions by journal entry ID"""
        try:
            result = self.client.table("emotions").select("*").eq("entry_id", entry_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting emotions by entry: {str(e)}")
            raise Exception(f"Error getting emotions by entry: {str(e)}")
    
    # Episode operations
    def create_episode(self, episode_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new episode"""
        try:
            result = self.client.table("episode").insert(episode_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating episode: {str(e)}")
            raise Exception(f"Error creating episode: {str(e)}")
    
    def get_episodes_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all episodes for a user"""
        try:
            result = self.client.table("episode").select("*").eq("user_id", user_id).order("episode_start", desc=True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting episodes: {str(e)}")
            raise Exception(f"Error getting episodes: {str(e)}")
    
    def update_episode(self, episode_id: str, episode_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update episode"""
        try:
            result = self.client.table("episode").update(episode_data).eq("episode_id", episode_id).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error updating episode: {str(e)}")
            raise Exception(f"Error updating episode: {str(e)}")
    
    def delete_episode(self, episode_id: str) -> bool:
        """Delete episode"""
        try:
            result = self.client.table("episode").delete().eq("episode_id", episode_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting episode: {str(e)}")
            raise Exception(f"Error deleting episode: {str(e)}")
    
    # Episode type operations
    def create_episode_type(self, episode_type_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create episode type"""
        try:
            result = self.client.table("episode_type").insert(episode_type_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error creating episode type: {str(e)}")
            raise Exception(f"Error creating episode type: {str(e)}")
    
    def get_episode_types_by_episode(self, episode_id: str) -> List[Dict[str, Any]]:
        """Get episode types by episode ID"""
        try:
            result = self.client.table("episode_type").select("*").eq("episode_id", episode_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting episode types: {str(e)}")
            raise Exception(f"Error getting episode types: {str(e)}")

# Create a singleton instance
logger.info("[SupabaseService] Creating global supabase_service instance...")
supabase_service = SupabaseService()
logger.info("[SupabaseService] ✓ Global supabase_service instance created")
