import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy import text
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.schemas.db import SessionLocal
from backend.services.emotion_analyzer import EmotionAnalyzer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionScheduler:
    def __init__(self):
        logger.info("[EmotionScheduler] Initializing EmotionScheduler...")
        try:
            self.analyzer = EmotionAnalyzer()
            self.is_running = False
            logger.info("[EmotionScheduler] ✓ EmotionScheduler initialized successfully")
        except Exception as e:
            logger.error(f"[EmotionScheduler] ✗ Failed to initialize EmotionScheduler: {e}")
            raise
    
    async def get_active_users_for_date(self, target_date: date) -> list:
        """Get all users who have journal entries for a specific date"""
        logger.info(f"[EmotionScheduler] Getting active users for {target_date}")
        
        db = SessionLocal()
        try:
            query = text("""
                SELECT DISTINCT user_id 
                FROM journal_entry 
                WHERE journal_date = :journal_date
            """)
            
            result = db.execute(query, {
                "journal_date": target_date.strftime('%Y-%m-%d')
            })
            
            users = [row.user_id for row in result.fetchall()]
            logger.info(f"[EmotionScheduler] Found {len(users)} active users: {users}")
            return users
            
        except Exception as e:
            logger.error(f"[EmotionScheduler] Error getting active users: {e}")
            return []
        finally:
            db.close()
    
    async def analyze_daily_emotions(self, target_date: date = None):
        """Analyze emotions for all users for a specific date"""
        if target_date is None:
            target_date = date.today()
        
        logger.info(f"[EmotionScheduler] 🚀 Starting daily emotion analysis for {target_date}")
        start_time = datetime.now()
        
        try:
            # Get all users with journal entries for this date
            active_users = await self.get_active_users_for_date(target_date)
            
            if not active_users:
                logger.info(f"[EmotionScheduler] ⚠️ No active users found for {target_date}")
                return
            
            logger.info(f"[EmotionScheduler] Processing {len(active_users)} users...")
            
            success_count = 0
            failed_count = 0
            
            # Analyze emotions for each user
            for i, user_id in enumerate(active_users, 1):
                logger.info(f"[EmotionScheduler] Processing user {i}/{len(active_users)}: {user_id}")
                
                try:
                    success = await self.analyzer.analyze_user_day(user_id, target_date)
                    if success:
                        success_count += 1
                        logger.info(f"[EmotionScheduler] ✓ [{i}/{len(active_users)}] Completed analysis for user {user_id}")
                    else:
                        failed_count += 1
                        logger.warning(f"[EmotionScheduler] ⚠️ [{i}/{len(active_users)}] Failed analysis for user {user_id}")
                except Exception as e:
                    failed_count += 1
                    logger.error(f"[EmotionScheduler] ✗ [{i}/{len(active_users)}] Error analyzing user {user_id}: {e}")
                
                # Small delay between users to avoid API rate limits
                logger.debug(f"[EmotionScheduler] Waiting 2 seconds before next user...")
                await asyncio.sleep(2)
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            logger.info(f"[EmotionScheduler] 🎉 Completed daily emotion analysis for {target_date}")
            logger.info(f"[EmotionScheduler] 📊 Results: {success_count} successful, {failed_count} failed")
            logger.info(f"[EmotionScheduler] ⏱️ Total duration: {duration:.2f} seconds")
            
        except Exception as e:
            logger.error(f"[EmotionScheduler] ✗ Error in daily emotion analysis: {e}")
    
    async def analyze_missing_days(self, days_back: int = 7):
        """Analyze any missing emotion data for the last N days"""
        logger.info(f"[EmotionScheduler] 🔍 Checking for missing analysis in last {days_back} days")
        
        missing_analyses = 0
        
        for days_ago in range(1, days_back + 1):
            target_date = date.today() - timedelta(days=days_ago)
            logger.info(f"[EmotionScheduler] Checking {target_date} ({days_ago} days ago)")
            
            # Get users who had journal entries on this date
            active_users = await self.get_active_users_for_date(target_date)
            
            for user_id in active_users:
                # Check if emotions already exist for this user/date
                emotions_exist = await self.analyzer.check_emotions_exist(user_id, target_date)
                
                if not emotions_exist:
                    logger.info(f"[EmotionScheduler] 🔧 Missing analysis found for user {user_id} on {target_date}")
                    success = await self.analyzer.analyze_user_day(user_id, target_date)
                    if success:
                        missing_analyses += 1
                        logger.info(f"[EmotionScheduler] ✓ Catch-up analysis completed for {user_id} on {target_date}")
                    else:
                        logger.warning(f"[EmotionScheduler] ⚠️ Catch-up analysis failed for {user_id} on {target_date}")
                    
                    # Small delay to avoid API rate limits
                    await asyncio.sleep(1)
        
        logger.info(f"[EmotionScheduler] 📊 Completed catch-up analysis: {missing_analyses} missing analyses filled")
        return missing_analyses
    
    async def start_scheduler(self):
        """Start the background scheduler"""
        self.is_running = True
        logger.info("[EmotionScheduler] 🔄 Starting background emotion analysis scheduler...")
        logger.info("[EmotionScheduler] ⏰ Scheduled to run daily at 11:30 PM")
        
        # Run catch-up analysis on startup
        logger.info("[EmotionScheduler] 🚀 Running startup catch-up analysis...")
        await self.analyze_missing_days(7)  # Check last 7 days
        
        while self.is_running:
            try:
                current_time = datetime.now()
                
                # Log current time every hour for debugging
                if current_time.minute == 0:
                    logger.info(f"[EmotionScheduler] ⏰ Current time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
                
                # Run analysis at 11:30 PM every day
                if current_time.hour == 23 and current_time.minute == 30:
                    logger.info(f"[EmotionScheduler] 🎯 Triggered scheduled analysis at {current_time}")
                    await self.analyze_daily_emotions()  # Analyze today
                    
                    # Also run catch-up for any missed days
                    await self.analyze_missing_days(3)  # Check last 3 days
                    
                    # Sleep for 60 seconds to avoid running multiple times in the same minute
                    logger.info("[EmotionScheduler] 😴 Sleeping for 60 seconds to avoid duplicate runs...")
                    await asyncio.sleep(60)
                else:
                    # Check every 30 seconds
                    await asyncio.sleep(30)
                    
            except Exception as e:
                logger.error(f"[EmotionScheduler] ✗ Scheduler error: {e}")
                logger.info("[EmotionScheduler] 😴 Sleeping for 60 seconds after error...")
                await asyncio.sleep(60)
    
    def stop_scheduler(self):
        """Stop the background scheduler"""
        self.is_running = False
        logger.info("[EmotionScheduler] 🛑 Background emotion analysis scheduler stopped")
    
    async def run_manual_analysis(self, user_id: str = None, target_date: date = None):
        """Manually trigger emotion analysis"""
        if target_date is None:
            target_date = date.today()
        
        logger.info(f"[EmotionScheduler] 🔧 Manual analysis triggered - User: {user_id}, Date: {target_date}")
        
        if user_id:
            # Analyze specific user
            logger.info(f"[EmotionScheduler] Analyzing specific user: {user_id}")
            success = await self.analyzer.analyze_user_day(user_id, target_date)
            result = {"user_id": user_id, "date": str(target_date), "success": success}
            logger.info(f"[EmotionScheduler] Manual analysis result: {result}")
            return result
        else:
            # Analyze all users for the date
            logger.info(f"[EmotionScheduler] Analyzing all users for date: {target_date}")
            await self.analyze_daily_emotions(target_date)
            result = {"date": str(target_date), "message": "Analysis completed for all users"}
            logger.info(f"[EmotionScheduler] Manual analysis result: {result}")
            return result

# Global scheduler instance
logger.info("[EmotionScheduler] Creating global emotion_scheduler instance...")
emotion_scheduler = EmotionScheduler()
logger.info("[EmotionScheduler] ✓ Global emotion_scheduler instance created")