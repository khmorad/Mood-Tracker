from typing import Optional, Dict, Any, Union
from backend.services.base_service import BaseService
import logging

logger = logging.getLogger(__name__)

class UsersService(BaseService):
    def __init__(self):
        super().__init__()
    
    def create_user(self, user_data: Union[Dict[str, Any], 'User']) -> Dict[str, Any]:
        """Create a new user"""
        try:
            data = self._convert_to_dict(user_data)
            
            # Ensure required fields have defaults
            data.setdefault('subscription_tier', 'Free')
            data.setdefault('monthly_entries_count', 0)
            
            logger.info(f"[UsersService] Creating user with data keys: {list(data.keys())}")
            logger.info(f"[UsersService] User data: {data}")
            
            result = self.client.table("user").insert(data).execute()
            
            if result.data:
                logger.info(f"[UsersService] ✓ User created successfully: {result.data[0]['user_id']}")
                return result.data[0]
            
            logger.error("[UsersService] No data returned from user creation")
            raise Exception("Failed to create user - no data returned")
            
        except Exception as e:
            self._handle_error("creating user", e)
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table("user").select("*").eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            self._handle_error("getting user", e)
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            result = self.client.table("user").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            self._handle_error("getting user by email", e)
    
    def update_user(self, user_id: str, user_data: Union[Dict[str, Any], 'User']) -> Dict[str, Any]:
        """Update user"""
        try:
            data = self._convert_to_dict(user_data)
            result = self.client.table("user").update(data).eq("user_id", user_id).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            self._handle_error("updating user", e)
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            result = self.client.table("user").delete().eq("user_id", user_id).execute()
            return True
        except Exception as e:
            self._handle_error("deleting user", e)

# Create singleton instance
users_service = UsersService()
