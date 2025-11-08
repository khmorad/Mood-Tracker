"""
Main service module that exposes all individual services.
This maintains backward compatibility while allowing modular access.
"""

import logging
from backend.services.users_service import users_service
from backend.services.journals_service import journals_service
from backend.services.emotions_service import emotions_service
from backend.services.episodes_service import episodes_service

logger = logging.getLogger(__name__)

# Legacy compatibility - combine all services into one interface
class SupabaseService:
    def __init__(self):
        self.users = users_service
        self.journals = journals_service
        self.emotions = emotions_service
        self.episodes = episodes_service
        logger.info("[SupabaseService] ✓ All services initialized")
    
    # User operations - delegate to users service
    def create_user(self, user_data):
        return self.users.create_user(user_data)
    
    def get_user_by_id(self, user_id):
        return self.users.get_user_by_id(user_id)
    
    def get_user_by_email(self, email):
        return self.users.get_user_by_email(email)
    
    def update_user(self, user_id, user_data):
        return self.users.update_user(user_id, user_data)
    
    def delete_user(self, user_id):
        return self.users.delete_user(user_id)
    
    # Journal operations - delegate to journals service
    def create_journal_entry(self, entry_data):
        return self.journals.create_journal_entry(entry_data)
    
    def get_journal_entries_by_user(self, user_id):
        return self.journals.get_journal_entries_by_user(user_id)
    
    def get_journal_entry_by_id(self, entry_id):
        return self.journals.get_journal_entry_by_id(entry_id)
    
    def update_journal_entry(self, entry_id, entry_data):
        return self.journals.update_journal_entry(entry_id, entry_data)
    
    def delete_journal_entry(self, entry_id):
        return self.journals.delete_journal_entry(entry_id)
    
    # Emotion operations - delegate to emotions service
    def create_emotion_record(self, emotion_data):
        return self.emotions.create_emotion_record(emotion_data)
    
    def get_emotions_by_user(self, user_id):
        return self.emotions.get_emotions_by_user(user_id)
    
    def get_emotions_by_entry(self, entry_id):
        return self.emotions.get_emotions_by_entry(entry_id)
    
    # Episode operations - delegate to episodes service
    def create_episode(self, episode_data):
        return self.episodes.create_episode(episode_data)
    
    def get_episodes_by_user(self, user_id):
        return self.episodes.get_episodes_by_user(user_id)
    
    def update_episode(self, episode_id, episode_data):
        return self.episodes.update_episode(episode_id, episode_data)
    
    def delete_episode(self, episode_id):
        return self.episodes.delete_episode(episode_id)
    
    def create_episode_type(self, episode_type_data):
        return self.episodes.create_episode_type(episode_type_data)
    
    def get_episode_types_by_episode(self, episode_id):
        return self.episodes.get_episode_types_by_episode(episode_id)

# Create singleton instance for backward compatibility
supabase_service = SupabaseService()

# Export individual services for direct access
__all__ = [
    'supabase_service',
    'users_service', 
    'journals_service', 
    'emotions_service', 
    'episodes_service'
]
