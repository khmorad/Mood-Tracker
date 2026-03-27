import asyncio
from datetime import datetime, date, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.supabase_service import supabase_service
from backend.services.emotion_analyzer import EmotionAnalyzer
import logging
import re
import json

logger = logging.getLogger(__name__)

class EmotionScheduler:
    def __init__(self):
        logger.info({"event": "init", "scheduler": "emotion"})
        try:
            self.analyzer = EmotionAnalyzer()
            self.is_running = False
            logger.info({"event": "init_ok", "scheduler": "emotion"})
        except Exception:
            logger.exception({"event": "init_failed", "scheduler": "emotion"})
            raise

    async def get_active_users_for_date(self, target_date: date) -> list:
        """Get all users who have journal entries for a specific date"""
        try:
            response = supabase_service.client.table("journal_entry") \
                .select("user_id") \
                .eq("journal_date", str(target_date)) \
                .execute()

            users = list({row["user_id"] for row in response.data}) if response.data else []
            logger.info({"event": "active_users_fetched", "date": str(target_date), "count": len(users)})
            return users

        except Exception:
            logger.exception({"event": "active_users_error", "date": str(target_date)})
            return []

    async def analyze_daily_emotions(self, target_date: date = None):
        """Analyze emotions for all users for a specific date"""
        if target_date is None:
            target_date = date.today()

        logger.info({"event": "daily_analysis_start", "date": str(target_date)})
        start_time = datetime.now()

        try:
            active_users = await self.get_active_users_for_date(target_date)

            if not active_users:
                logger.info({"event": "daily_analysis_skip", "date": str(target_date), "reason": "no_active_users"})
                return

            success_count = 0
            failed_count = 0

            for i, user_id in enumerate(active_users, 1):
                logger.debug({"event": "user_analysis_start", "user_id": user_id, "index": i, "total": len(active_users)})
                try:
                    success = await self.analyzer.analyze_user_day(user_id, target_date)
                    if success:
                        success_count += 1
                    else:
                        failed_count += 1
                        logger.warning({"event": "user_analysis_failed", "user_id": user_id, "date": str(target_date)})
                except Exception:
                    failed_count += 1
                    logger.exception({"event": "user_analysis_error", "user_id": user_id, "date": str(target_date)})

                await asyncio.sleep(2)

            duration = (datetime.now() - start_time).total_seconds()
            logger.info({
                "event": "daily_analysis_done",
                "date": str(target_date),
                "success": success_count,
                "failed": failed_count,
                "duration_s": round(duration, 2),
            })

        except Exception:
            logger.exception({"event": "daily_analysis_error", "date": str(target_date)})

    async def analyze_missing_days(self, days_back: int = 7):
        """Analyze any missing emotion data for the last N days"""
        logger.info({"event": "catchup_start", "days_back": days_back})
        missing_analyses = 0

        for days_ago in range(1, days_back + 1):
            target_date = date.today() - timedelta(days=days_ago)
            active_users = await self.get_active_users_for_date(target_date)

            for user_id in active_users:
                emotions_exist = await self.analyzer.check_emotions_exist(user_id, target_date)

                if not emotions_exist:
                    success = await self.analyzer.analyze_user_day(user_id, target_date)
                    if success:
                        missing_analyses += 1
                        logger.info({"event": "catchup_filled", "user_id": user_id, "date": str(target_date)})
                    else:
                        logger.warning({"event": "catchup_failed", "user_id": user_id, "date": str(target_date)})

                    await asyncio.sleep(1)

        logger.info({"event": "catchup_done", "filled": missing_analyses, "days_back": days_back})
        return missing_analyses

    async def check_api_health(self):
        """Test Gemini API connectivity"""
        try:
            test_conversation = "User: Hello\nAI: Hi there!"
            emotions = await self.analyzer.analyze_emotions_with_gemini(test_conversation)
            healthy = emotions != self.analyzer._get_default_emotions()
            logger.info({"event": "api_health_check", "service": "gemini", "healthy": healthy})
            return healthy
        except Exception:
            logger.exception({"event": "api_health_check_error", "service": "gemini"})
            return False

    async def start_scheduler(self):
        """Start the background scheduler"""
        self.is_running = True
        logger.info({"event": "scheduler_start", "scheduler": "emotion", "schedule": "daily_23:30"})

        api_healthy = await self.check_api_health()
        if not api_healthy:
            logger.warning({"event": "api_unhealthy_on_start", "scheduler": "emotion"})

        logger.info({"event": "startup_catchup_start", "scheduler": "emotion", "days_back": 7})
        await self.analyze_missing_days(7)

        while self.is_running:
            try:
                current_time = datetime.now()

                if current_time.hour == 23 and current_time.minute == 30:
                    logger.info({"event": "scheduled_run", "scheduler": "emotion"})
                    await self.analyze_daily_emotions()
                    await self.analyze_missing_days(3)
                    await asyncio.sleep(60)
                else:
                    await asyncio.sleep(30)

            except Exception:
                logger.exception({"event": "scheduler_error", "scheduler": "emotion"})
                await asyncio.sleep(60)

    def stop_scheduler(self):
        """Stop the background scheduler"""
        self.is_running = False
        logger.info({"event": "scheduler_stop", "scheduler": "emotion"})

    async def run_manual_analysis(self, user_id: str = None, target_date: date = None):
        """Manually trigger emotion analysis"""
        if target_date is None:
            target_date = date.today()

        logger.info({"event": "manual_analysis_start", "user_id": user_id, "date": str(target_date)})

        if user_id:
            success = await self.analyzer.analyze_user_day(user_id, target_date)
            return {"user_id": user_id, "date": str(target_date), "success": success}
        else:
            await self.analyze_daily_emotions(target_date)
            return {"date": str(target_date), "message": "Analysis completed for all users"}


# Global scheduler instance
emotion_scheduler = EmotionScheduler()
