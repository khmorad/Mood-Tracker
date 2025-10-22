import asyncio
from datetime import datetime, date
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.supabase_service import supabase_service
from backend.models import Emotion
import json
import re
import google.generativeai as genai
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    def __init__(self):
        logger.info("[EmotionAnalyzer] Initializing EmotionAnalyzer...")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not self.gemini_api_key:
            logger.error("[EmotionAnalyzer] GEMINI_API_KEY environment variable is not set!")
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        try:
            # Configure Gemini
            genai.configure(api_key=self.gemini_api_key)
            # Use the correct model name
            self.model = genai.GenerativeModel('gemini-2.5-flash')  # Changed from 'gemini-pro'
            logger.info("[EmotionAnalyzer] Gemini API configured successfully")
        except Exception as e:
            logger.error(f"[EmotionAnalyzer] Failed to configure Gemini API: {e}")
            raise
    
    async def analyze_emotions_with_gemini(self, conversation_text: str) -> dict:
        """Use Gemini API to analyze emotions in conversation"""
        logger.info(f"[EmotionAnalyzer] Starting emotion analysis for conversation (length: {len(conversation_text)} chars)")
        
        try:
            prompt = f"""
            Analyze the following conversation for emotional content and return ONLY a JSON object with emotion scores (0-10 scale):
            
            Conversation: {conversation_text}
            
            Return format (no other text):
            {{
                "happy": 0,
                "stressed": 0,
                "anxious": 0,
                "angry": 0,
                "sad": 0,
                "agitated": 0,
                "neutral": 0
            }}
            
            Rules:
            - Score each emotion 0-10 based on intensity
            - Multiple emotions can have high scores
            - If no clear emotion, set neutral higher
            - Return ONLY the JSON object
            """
            
            logger.info("[EmotionAnalyzer] Sending request to Gemini API...")
            
            # Add timeout and more detailed error handling
            try:
                response = self.model.generate_content(prompt)
                ai_response = response.text
                logger.info(f"[EmotionAnalyzer] ✓ Received response from Gemini: {ai_response}")
                
            except Exception as api_error:
                # Specific API error logging
                error_type = type(api_error).__name__
                logger.error(f"[EmotionAnalyzer] ✗ Gemini API Error ({error_type}): {api_error}")
                
                # Check for specific error types
                if "quota" in str(api_error).lower():
                    logger.error("[EmotionAnalyzer] 🚫 API QUOTA EXCEEDED - Check your Gemini API limits")
                elif "authentication" in str(api_error).lower():
                    logger.error("[EmotionAnalyzer] 🔑 API AUTHENTICATION FAILED - Check your API key")
                elif "timeout" in str(api_error).lower():
                    logger.error("[EmotionAnalyzer] ⏰ API TIMEOUT - Gemini API took too long to respond")
                elif "rate" in str(api_error).lower():
                    logger.error("[EmotionAnalyzer] 🚦 API RATE LIMIT - Too many requests, need to slow down")
                else:
                    logger.error(f"[EmotionAnalyzer] 🔥 UNKNOWN API ERROR: {api_error}")
                
                # Return default emotions on API failure
                logger.warning("[EmotionAnalyzer] Using default emotions due to API failure")
                return self._get_default_emotions()
            
            # Extract JSON from response
            try:
                json_match = re.search(r'\{[^}]+\}', ai_response)
                if json_match:
                    emotion_scores = json.loads(json_match.group())
                    logger.info(f"[EmotionAnalyzer] ✓ Successfully parsed emotion scores: {emotion_scores}")
                    return emotion_scores
                else:
                    logger.warning("[EmotionAnalyzer] ⚠️ No valid JSON found in Gemini response")
                    logger.warning(f"[EmotionAnalyzer] Raw response: {ai_response}")
                    return self._get_default_emotions()
                    
            except json.JSONDecodeError as json_error:
                logger.error(f"[EmotionAnalyzer] ✗ JSON Parse Error: {json_error}")
                logger.error(f"[EmotionAnalyzer] Failed to parse: {ai_response}")
                return self._get_default_emotions()
                
        except Exception as e:
            logger.error(f"[EmotionAnalyzer] ✗ Unexpected error in emotion analysis: {e}")
            return self._get_default_emotions()
    
    def _get_default_emotions(self) -> dict:
        """Return default emotion scores when analysis fails"""
        default_emotions = {
            "happy": 0,
            "stressed": 0,
            "anxious": 0,
            "angry": 0,
            "sad": 0,
            "agitated": 0,
            "neutral": 5
        }
        logger.info(f"[EmotionAnalyzer] Using default emotions: {default_emotions}")
        return default_emotions
    
    async def get_daily_conversations(self, user_id: str, target_date: date) -> str:
        """Get all conversations for a user on a specific date"""
        logger.info(f"[EmotionAnalyzer] Getting conversations for user {user_id} on {target_date}")
        
        try:
            response = supabase_service.client.table("journal_entry") \
                .select("entry_text, AI_response") \
                .eq("user_id", user_id) \
                .eq("journal_date", str(target_date)) \
                .order("entry_id") \
                .execute()
            
            entries = response.data if response.data else []
            logger.info(f"[EmotionAnalyzer] Found {len(entries)} journal entries for user {user_id}")
            
            if not entries:
                logger.warning(f"[EmotionAnalyzer] No journal entries found for user {user_id} on {target_date}")
                return ""
            
            # Combine all conversations
            conversation_text = ""
            for i, entry in enumerate(entries):
                conversation_text += f"User: {entry['entry_text']}\n"
                conversation_text += f"AI: {entry['AI_response']}\n"
                logger.debug(f"[EmotionAnalyzer] Added entry {i+1}: User: '{entry['entry_text'][:50]}...'")
            
            logger.info(f"[EmotionAnalyzer] Combined conversation text length: {len(conversation_text)} characters")
            return conversation_text
            
        except Exception as e:
            logger.error(f"[EmotionAnalyzer] Error getting daily conversations: {e}")
            return ""
    
    async def check_emotions_exist(self, user_id: str, target_date: date) -> bool:
        """Check if emotions already analyzed for this user and date"""
        logger.info(f"[EmotionAnalyzer] Checking if emotions already exist for user {user_id} on {target_date}")
        
        try:
            response = supabase_service.client.table("emotions") \
                .select("entry_id") \
                .eq("user_id", user_id) \
                .eq("journal_date", str(target_date)) \
                .execute()
            
            exists = len(response.data) > 0 if response.data else False
            logger.info(f"[EmotionAnalyzer] Emotions exist for user {user_id} on {target_date}: {exists}")
            return exists
            
        except Exception as e:
            logger.error(f"[EmotionAnalyzer] Error checking if emotions exist: {e}")
            return False
    
    async def save_emotions(self, user_id: str, target_date: date, emotion_scores: dict) -> bool:
        """Save emotion analysis to database"""
        logger.info(f"[EmotionAnalyzer] Saving emotions for user {user_id} on {target_date}: {emotion_scores}")
        
        try:
            # Get the latest entry_id for this user and date
            entry_response = supabase_service.client.table("journal_entry") \
                .select("entry_id") \
                .eq("user_id", user_id) \
                .eq("journal_date", str(target_date)) \
                .order("entry_id", desc=True) \
                .limit(1) \
                .execute()
            
            if not entry_response.data:
                logger.error(f"[EmotionAnalyzer] No journal entries found for user {user_id} on {target_date}")
                return False
            
            entry_id = entry_response.data[0]["entry_id"]
            logger.info(f"[EmotionAnalyzer] Using entry_id {entry_id} for emotions")
            
            # Create Emotion model instance
            emotion = Emotion.from_gemini_response(emotion_scores, user_id, entry_id, target_date)
            
            # Save using Supabase service
            supabase_service.create_emotion_record(emotion)
            logger.info(f"[EmotionAnalyzer] ✓ Successfully saved emotions for user {user_id} on {target_date}")
            return True
            
        except Exception as e:
            logger.error(f"[EmotionAnalyzer] ✗ Error saving emotions: {e}")
            return False
    
    async def analyze_user_day(self, user_id: str, target_date: date = None) -> bool:
        """Analyze emotions for a specific user and date"""
        if target_date is None:
            target_date = date.today()
        
        logger.info(f"[EmotionAnalyzer] Starting analysis for user {user_id} on {target_date}")
        
        try:
            # Check if already analyzed
            if await self.check_emotions_exist(user_id, target_date):
                logger.info(f"[EmotionAnalyzer] ⚠️ Emotions already analyzed for user {user_id} on {target_date}")
                return True
            
            # Get conversations
            conversation_text = await self.get_daily_conversations(user_id, target_date)
            if not conversation_text.strip():
                logger.warning(f"[EmotionAnalyzer] ⚠️ No conversations found for user {user_id} on {target_date}")
                return False
            
            # Analyze emotions
            logger.info(f"[EmotionAnalyzer] Analyzing emotions for user {user_id}...")
            emotions = await self.analyze_emotions_with_gemini(conversation_text)
            
            # Save to database
            success = await self.save_emotions(user_id, target_date, emotions)
            
            if success:
                logger.info(f"[EmotionAnalyzer] ✓ Successfully completed analysis for user {user_id}")
            else:
                logger.error(f"[EmotionAnalyzer] ✗ Failed to complete analysis for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"[EmotionAnalyzer] ✗ Error analyzing user day: {e}")
            return False