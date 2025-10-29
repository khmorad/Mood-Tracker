import asyncio
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.supabase_service import supabase_service
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlanScheduler:
    def __init__(self):
        logger.info("[PlanScheduler] Initializing PlanScheduler...")
        self.is_running = False
        logger.info("[PlanScheduler] ✓ PlanScheduler initialized successfully")
    
    async def check_expired_subscriptions(self):
        """Check for expired subscriptions and convert to free plan"""
        logger.info("[PlanScheduler] 🔍 Checking for expired subscriptions...")
        
        try:
            current_time = datetime.utcnow()
            
            # Get users with expired subscriptions - only use existing columns
            response = supabase_service.client.table("user") \
                .select("user_id, email, first_name, last_name, subscription_tier, subscription_expires_at") \
                .neq("subscription_tier", "Free") \
                .not_.is_("subscription_expires_at", "null") \
                .execute()
            
            if not response.data:
                logger.info("[PlanScheduler] No users with expiring subscriptions found")
                return
            
            expired_users = []
            for user in response.data:
                try:
                    expires_at = datetime.fromisoformat(user["subscription_expires_at"].replace("Z", "+00:00"))
                    if expires_at <= current_time:
                        expired_users.append(user)
                except Exception as e:
                    logger.error(f"[PlanScheduler] Error parsing expiration date for user {user['user_id']}: {e}")
            
            logger.info(f"[PlanScheduler] Found {len(expired_users)} expired subscriptions")
            
            converted_count = 0
            failed_count = 0
            
            for user in expired_users:
                try:
                    success = await self.convert_to_free_plan(user)
                    if success:
                        converted_count += 1
                        logger.info(f"[PlanScheduler] ✓ Converted user {user['user_id']} to Free plan")
                    else:
                        failed_count += 1
                        logger.warning(f"[PlanScheduler] ⚠️ Failed to convert user {user['user_id']} to Free plan")
                        
                except Exception as e:
                    failed_count += 1
                    logger.error(f"[PlanScheduler] ✗ Error converting user {user['user_id']}: {e}")
            
            logger.info(f"[PlanScheduler] 📊 Subscription conversion completed: {converted_count} successful, {failed_count} failed")
            
        except Exception as e:
            logger.error(f"[PlanScheduler] ✗ Error checking expired subscriptions: {e}")
    
    async def convert_to_free_plan(self, user: dict) -> bool:
        """Convert a user to free plan"""
        try:
            user_id = user["user_id"]
            logger.info(f"[PlanScheduler] Converting user {user_id} from {user['subscription_tier']} to Free plan")
            
            # Update user subscription - only use existing columns
            update_data = {
                "subscription_tier": "Free",
                "subscription_expires_at": None,
                "monthly_entries_count": 0
                # Removed monthly_entries_reset_at as it doesn't exist in the database
                # Removed stripe fields as they don't exist in the database
            }
            
            response = supabase_service.client.table("user") \
                .update(update_data) \
                .eq("user_id", user_id) \
                .execute()
            
            if response.data:
                logger.info(f"[PlanScheduler] ✓ Successfully converted user {user_id} to Free plan")
                
                # Log the conversion for audit purposes
                await self.log_plan_conversion(user, "Expired", "Free")
                
                return True
            else:
                logger.error(f"[PlanScheduler] Failed to update user {user_id} in database")
                return False
                
        except Exception as e:
            logger.error(f"[PlanScheduler] Error converting user to free plan: {e}")
            return False
    
    async def log_plan_conversion(self, user: dict, from_plan: str, to_plan: str):
        """Log plan conversion for audit purposes"""
        try:
            log_entry = {
                "user_id": user["user_id"],
                "user_email": user["email"],
                "from_plan": from_plan,
                "to_plan": to_plan,
                "conversion_reason": "Subscription Expired",
                "converted_at": datetime.utcnow().isoformat(),
                "user_name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
            }
            
            # Log to console for now
            logger.info(f"[PlanScheduler] 📝 Plan Conversion Log: {log_entry}")
            
        except Exception as e:
            logger.error(f"[PlanScheduler] Error logging plan conversion: {e}")
    
    async def check_upcoming_expirations(self, days_ahead: int = 3):
        """Check for subscriptions expiring in the next N days (for notifications)"""
        logger.info(f"[PlanScheduler] 🔔 Checking for subscriptions expiring in next {days_ahead} days...")
        
        try:
            current_time = datetime.utcnow()
            future_time = current_time + timedelta(days=days_ahead)
            
            response = supabase_service.client.table("user") \
                .select("user_id, email, first_name, last_name, subscription_tier, subscription_expires_at") \
                .neq("subscription_tier", "Free") \
                .not_.is_("subscription_expires_at", "null") \
                .execute()
            
            if not response.data:
                return []
            
            expiring_soon = []
            for user in response.data:
                try:
                    expires_at = datetime.fromisoformat(user["subscription_expires_at"].replace("Z", "+00:00"))
                    if current_time <= expires_at <= future_time:
                        days_until_expiry = (expires_at - current_time).days
                        user["days_until_expiry"] = days_until_expiry
                        expiring_soon.append(user)
                except Exception as e:
                    logger.error(f"[PlanScheduler] Error parsing expiration date for user {user['user_id']}: {e}")
            
            logger.info(f"[PlanScheduler] Found {len(expiring_soon)} subscriptions expiring soon")
            
            for user in expiring_soon:
                logger.info(f"[PlanScheduler] 🔔 User {user['user_id']} ({user['email']}) subscription expires in {user['days_until_expiry']} days")
            
            return expiring_soon
            
        except Exception as e:
            logger.error(f"[PlanScheduler] Error checking upcoming expirations: {e}")
            return []
    
    async def reset_monthly_entry_counts(self):
        """Reset monthly entry counts for users (simplified since we don't have reset_at column)"""
        logger.info("[PlanScheduler] 🔄 Checking for monthly entry count resets...")
        
        try:
            # Since we don't have monthly_entries_reset_at column, we'll reset all counts monthly
            # This is a simplified approach - you might want to add this column to the database later
            current_time = datetime.utcnow()
            
            # For now, let's just log that we would reset monthly counts
            logger.info("[PlanScheduler] Monthly entry count reset would happen here if reset_at column existed")
            
        except Exception as e:
            logger.error(f"[PlanScheduler] Error resetting monthly entry counts: {e}")
    
    async def start_scheduler(self):
        """Start the background scheduler"""
        self.is_running = True
        logger.info("[PlanScheduler] 🔄 Starting background plan management scheduler...")
        logger.info("[PlanScheduler] ⏰ Scheduled to run every hour")
        
        while self.is_running:
            try:
                current_time = datetime.now()
                
                # Run every hour at minute 0
                if current_time.minute == 0:
                    logger.info(f"[PlanScheduler] 🎯 Running scheduled checks at {current_time}")
                    
                    # Check for expired subscriptions
                    await self.check_expired_subscriptions()
                    
                    # Check for upcoming expirations (for notifications)
                    await self.check_upcoming_expirations(3)
                    
                    # Sleep for 60 seconds to avoid running multiple times
                    await asyncio.sleep(60)
                else:
                    # Check every 30 seconds
                    await asyncio.sleep(30)
                    
            except Exception as e:
                logger.error(f"[PlanScheduler] ✗ Scheduler error: {e}")
                await asyncio.sleep(60)
    
    def stop_scheduler(self):
        """Stop the background scheduler"""
        self.is_running = False
        logger.info("[PlanScheduler] 🛑 Background plan management scheduler stopped")
    
    async def run_manual_check(self):
        """Manually trigger plan checks"""
        logger.info("[PlanScheduler] 🔧 Manual plan check triggered")
        
        try:
            await self.check_expired_subscriptions()
            upcoming = await self.check_upcoming_expirations(7)
            
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "upcoming_expirations": len(upcoming),
                "status": "completed"
            }
            
            logger.info(f"[PlanScheduler] Manual check result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[PlanScheduler] Error in manual check: {e}")
            return {"error": str(e), "status": "failed"}


# Global scheduler instance
logger.info("[PlanScheduler] Creating global plan_scheduler instance...")
plan_scheduler = PlanScheduler()
logger.info("[PlanScheduler] ✓ Global plan_scheduler instance created")