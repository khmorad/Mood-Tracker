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

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    def __init__(self):
        logger.info({"event": "init", "service": "emotion_analyzer"})
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not self.gemini_api_key:
            logger.error({"event": "missing_api_key", "key": "GEMINI_API_KEY"})
            raise ValueError("GEMINI_API_KEY environment variable is required")

        try:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info({"event": "init_ok", "service": "emotion_analyzer", "model": "gemini-2.5-flash"})
        except Exception:
            logger.exception({"event": "init_failed", "service": "emotion_analyzer"})
            raise

    async def analyze_emotions_with_gemini(self, conversation_text: str) -> dict:
        """Use Gemini API to analyze emotions in conversation"""
        logger.info({"event": "gemini_request", "text_length": len(conversation_text)})

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

            try:
                response = self.model.generate_content(prompt)
                ai_response = response.text
                logger.info({"event": "gemini_response_ok"})

            except Exception as api_error:
                error_type = type(api_error).__name__
                error_str = str(api_error).lower()

                if "quota" in error_str:
                    event = "gemini_quota_exceeded"
                elif "authentication" in error_str:
                    event = "gemini_auth_failed"
                elif "timeout" in error_str:
                    event = "gemini_timeout"
                elif "rate" in error_str:
                    event = "gemini_rate_limited"
                else:
                    event = "gemini_api_error"

                logger.error({"event": event, "error_type": error_type, "error": str(api_error)})
                return self._get_default_emotions()

            try:
                json_match = re.search(r'\{[^}]+\}', ai_response)
                if json_match:
                    emotion_scores = json.loads(json_match.group())
                    logger.info({"event": "emotion_parse_ok", "scores": emotion_scores})
                    return emotion_scores
                else:
                    logger.warning({"event": "emotion_parse_no_json", "raw_response": ai_response[:200]})
                    return self._get_default_emotions()

            except json.JSONDecodeError:
                logger.exception({"event": "emotion_parse_json_error"})
                return self._get_default_emotions()

        except Exception:
            logger.exception({"event": "analyze_emotions_error"})
            return self._get_default_emotions()

    def _get_default_emotions(self) -> dict:
        """Return default emotion scores when analysis fails"""
        return {
            "happy": 0,
            "stressed": 0,
            "anxious": 0,
            "angry": 0,
            "sad": 0,
            "agitated": 0,
            "neutral": 5,
        }

    async def get_daily_conversations(self, user_id: str, target_date: date) -> str:
        """Get all conversations for a user on a specific date"""
        try:
            response = supabase_service.client.table("journal_entry") \
                .select("entry_text, AI_response") \
                .eq("user_id", user_id) \
                .eq("journal_date", str(target_date)) \
                .order("entry_id") \
                .execute()

            entries = response.data if response.data else []
            logger.info({"event": "conversations_fetched", "user_id": user_id, "date": str(target_date), "count": len(entries)})

            if not entries:
                logger.warning({"event": "no_conversations", "user_id": user_id, "date": str(target_date)})
                return ""

            conversation_text = ""
            for entry in entries:
                conversation_text += f"User: {entry['entry_text']}\n"
                conversation_text += f"AI: {entry['AI_response']}\n"

            return conversation_text

        except Exception:
            logger.exception({"event": "get_conversations_error", "user_id": user_id, "date": str(target_date)})
            return ""

    async def check_emotions_exist(self, user_id: str, target_date: date) -> bool:
        """Check if emotions already analyzed for this user and date"""
        try:
            response = supabase_service.client.table("emotions") \
                .select("entry_id") \
                .eq("user_id", user_id) \
                .eq("journal_date", str(target_date)) \
                .execute()

            exists = len(response.data) > 0 if response.data else False
            return exists

        except Exception:
            logger.exception({"event": "check_emotions_exist_error", "user_id": user_id, "date": str(target_date)})
            return False

    async def save_emotions(self, user_id: str, target_date: date, emotion_scores: dict) -> bool:
        """Save emotion analysis to database"""
        try:
            entry_response = supabase_service.client.table("journal_entry") \
                .select("entry_id") \
                .eq("user_id", user_id) \
                .eq("journal_date", str(target_date)) \
                .order("entry_id", desc=True) \
                .limit(1) \
                .execute()

            if not entry_response.data:
                logger.error({"event": "save_emotions_no_entry", "user_id": user_id, "date": str(target_date)})
                return False

            entry_id = entry_response.data[0]["entry_id"]
            emotion = Emotion.from_gemini_response(emotion_scores, user_id, entry_id, target_date)
            supabase_service.create_emotion_record(emotion)
            logger.info({"event": "emotions_saved", "user_id": user_id, "date": str(target_date)})
            return True

        except Exception:
            logger.exception({"event": "save_emotions_error", "user_id": user_id, "date": str(target_date)})
            return False

    async def analyze_user_day(self, user_id: str, target_date: date = None) -> bool:
        """Analyze emotions for a specific user and date"""
        if target_date is None:
            target_date = date.today()

        try:
            if await self.check_emotions_exist(user_id, target_date):
                logger.info({"event": "analysis_skipped", "user_id": user_id, "date": str(target_date), "reason": "already_exists"})
                return True

            conversation_text = await self.get_daily_conversations(user_id, target_date)
            if not conversation_text.strip():
                logger.warning({"event": "analysis_skipped", "user_id": user_id, "date": str(target_date), "reason": "no_conversations"})
                return False

            emotions = await self.analyze_emotions_with_gemini(conversation_text)
            success = await self.save_emotions(user_id, target_date, emotions)

            logger.info({"event": "user_day_analysis_done", "user_id": user_id, "date": str(target_date), "success": success})
            return success

        except Exception:
            logger.exception({"event": "analyze_user_day_error", "user_id": user_id, "date": str(target_date)})
            return False
