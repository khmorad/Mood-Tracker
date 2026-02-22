import asyncio
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.services.supabase_service import supabase_service
import logging

logger = logging.getLogger(__name__)

class PlanScheduler:
    def __init__(self):
        self.is_running = False
        logger.info({"event": "init_ok", "scheduler": "plan"})

    async def check_expired_subscriptions(self):
        """Check for expired subscriptions and convert to free plan"""
        try:
            current_time = datetime.utcnow()

            response = supabase_service.client.table("user") \
                .select("user_id, email, first_name, last_name, subscription_tier, subscription_expires_at") \
                .neq("subscription_tier", "Free") \
                .not_.is_("subscription_expires_at", "null") \
                .execute()

            if not response.data:
                return

            expired_users = []
            for user in response.data:
                try:
                    expires_at = datetime.fromisoformat(user["subscription_expires_at"].replace("Z", "+00:00"))
                    if expires_at <= current_time:
                        expired_users.append(user)
                except Exception:
                    logger.exception({"event": "expiry_parse_error", "user_id": user["user_id"]})

            logger.info({"event": "expired_subscriptions_found", "count": len(expired_users)})

            success_count = 0
            failed_count = 0

            for user in expired_users:
                try:
                    success = await self.convert_to_free_plan(user)
                    if success:
                        success_count += 1
                    else:
                        failed_count += 1
                        logger.warning({"event": "plan_conversion_failed", "user_id": user["user_id"]})
                except Exception:
                    failed_count += 1
                    logger.exception({"event": "plan_conversion_error", "user_id": user["user_id"]})

            logger.info({"event": "subscription_sweep_done", "success": success_count, "failed": failed_count})

        except Exception:
            logger.exception({"event": "expired_subscriptions_check_error"})

    async def convert_to_free_plan(self, user: dict) -> bool:
        """Convert a user to free plan"""
        try:
            user_id = user["user_id"]

            update_data = {
                "subscription_tier": "Free",
                "subscription_expires_at": None,
                "monthly_entries_count": 0,
            }

            response = supabase_service.client.table("user") \
                .update(update_data) \
                .eq("user_id", user_id) \
                .execute()

            if response.data:
                logger.info({"event": "plan_converted", "user_id": user_id, "from": user["subscription_tier"], "to": "Free"})
                await self.log_plan_conversion(user, "Expired", "Free")
                return True
            else:
                logger.error({"event": "plan_conversion_no_data", "user_id": user_id})
                return False

        except Exception:
            logger.exception({"event": "convert_to_free_error", "user_id": user.get("user_id")})
            return False

    async def log_plan_conversion(self, user: dict, from_plan: str, to_plan: str):
        """Log plan conversion for audit purposes"""
        try:
            logger.info({
                "event": "plan_conversion_audit",
                "user_id": user["user_id"],
                "from_plan": from_plan,
                "to_plan": to_plan,
                "reason": "subscription_expired",
            })
        except Exception:
            logger.exception({"event": "plan_conversion_audit_error"})

    async def check_upcoming_expirations(self, days_ahead: int = 3):
        """Check for subscriptions expiring in the next N days"""
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
                        user["days_until_expiry"] = (expires_at - current_time).days
                        expiring_soon.append(user)
                except Exception:
                    logger.exception({"event": "expiry_parse_error", "user_id": user["user_id"]})

            logger.info({"event": "upcoming_expirations_found", "count": len(expiring_soon), "days_ahead": days_ahead})
            return expiring_soon

        except Exception:
            logger.exception({"event": "upcoming_expirations_check_error"})
            return []

    async def reset_monthly_entry_counts(self):
        """Reset monthly entry counts for users"""
        try:
            logger.info({"event": "monthly_reset_check", "note": "reset_at_column_not_yet_implemented"})
        except Exception:
            logger.exception({"event": "monthly_reset_error"})

    async def start_scheduler(self):
        """Start the background scheduler"""
        self.is_running = True
        logger.info({"event": "scheduler_start", "scheduler": "plan", "schedule": "hourly"})

        while self.is_running:
            try:
                current_time = datetime.now()

                if current_time.minute == 0:
                    logger.info({"event": "scheduled_run", "scheduler": "plan"})
                    await self.check_expired_subscriptions()
                    await self.check_upcoming_expirations(3)
                    await asyncio.sleep(60)
                else:
                    await asyncio.sleep(30)

            except Exception:
                logger.exception({"event": "scheduler_error", "scheduler": "plan"})
                await asyncio.sleep(60)

    def stop_scheduler(self):
        """Stop the background scheduler"""
        self.is_running = False
        logger.info({"event": "scheduler_stop", "scheduler": "plan"})

    async def run_manual_check(self):
        """Manually trigger plan checks"""
        logger.info({"event": "manual_check_start", "scheduler": "plan"})

        try:
            await self.check_expired_subscriptions()
            upcoming = await self.check_upcoming_expirations(7)

            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "upcoming_expirations": len(upcoming),
                "status": "completed",
            }
            return result

        except Exception:
            logger.exception({"event": "manual_check_error", "scheduler": "plan"})
            return {"error": "manual check failed", "status": "failed"}


# Global scheduler instance
plan_scheduler = PlanScheduler()
