from typing import Dict, Any, Union
from backend.services.supabase_client import get_supabase_client
from supabase import Client
import logging

logger = logging.getLogger(__name__)

class BaseService:
    def __init__(self):
        try:
            self.client: Client = get_supabase_client()
            logger.info(f"[{self.__class__.__name__}] ✓ Connected to Supabase successfully")
        except Exception as e:
            logger.error(f"[{self.__class__.__name__}] Failed to connect to Supabase: {e}")
            raise
    
    def _convert_to_dict(self, data: Union[Dict[str, Any], Any]) -> Dict[str, Any]:
        """Convert model to dict if it has to_dict method, otherwise return as is"""
        if hasattr(data, 'to_dict'):
            return data.to_dict()
        return data.copy() if isinstance(data, dict) else data
    
    def _handle_error(self, operation: str, error: Exception):
        """Handle and log errors consistently"""
        error_msg = f"Error {operation}: {str(error)}"
        logger.error(f"[{self.__class__.__name__}] {error_msg}")
        raise Exception(error_msg)
