from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from backend.services.supabase_service import supabase_service
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# Request/Response Models
class PlanActivationRequest(BaseModel):
    user_id: str
    plan: str

class PlanActivationResponse(BaseModel):
    message: str
    subscription_tier: str
    subscription_expires: Optional[str] = None

@router.post("/pricing/activate-plan", response_model=PlanActivationResponse)
async def activate_plan(request: PlanActivationRequest):
    """
    Activate a subscription plan for a user
    """
    try:
        logger.info(f"[Plans API] Activating {request.plan} plan for user {request.user_id}")
        
        # Validate plan type
        valid_plans = ["Free", "Plus", "Professional"]
        if request.plan not in valid_plans:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid plan. Must be one of: {', '.join(valid_plans)}"
            )
        
        # Validate user_id is not empty
        if not request.user_id or request.user_id.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="User ID cannot be empty"
            )
        
        # Check if user exists - only select columns that exist in the database
        try:
            response = supabase_service.client.table("user") \
                .select("user_id, subscription_tier, subscription_expires_at, monthly_entries_count") \
                .eq("user_id", request.user_id) \
                .execute()
        except Exception as db_error:
            logger.error(f"[Plans API] Database error checking user: {db_error}")
            raise HTTPException(
                status_code=500, 
                detail="Database connection error. Please try again later."
            )
        
        if not response.data:
            raise HTTPException(
                status_code=404, 
                detail=f"User with ID '{request.user_id}' not found"
            )
        
        user = response.data[0]
        logger.info(f"[Plans API] Found user with current tier: {user.get('subscription_tier', 'None')}")
        
        # Plan-specific logic
        if request.plan == "Free":
            subscription_expires = None
            subscription_expires_str = None
            
            # Update user record for Free plan - only use existing columns
            update_data = {
                "subscription_tier": "Free",
                "subscription_expires_at": None,
                "monthly_entries_count": 0
            }
            
            message = "Free plan activated successfully"
            
        elif request.plan == "Plus":
            # 7-day free trial
            subscription_expires = datetime.utcnow() + timedelta(days=7)
            subscription_expires_str = subscription_expires.isoformat()
            
            # Update user record for Plus plan - only use existing columns
            update_data = {
                "subscription_tier": "Plus",
                "subscription_expires_at": subscription_expires_str,
                "monthly_entries_count": 0
            }
            
            message = "Plus plan activated successfully with 7-day free trial"
            
        elif request.plan == "Professional":
            # Professional plan - no expiration date (lifetime access)
            subscription_expires = None
            subscription_expires_str = None
            
            # Update user record for Professional plan - only use existing columns
            update_data = {
                "subscription_tier": "Professional",
                "subscription_expires_at": None,  # No expiration for Professional
                "monthly_entries_count": 0
            }
            
            message = "Professional plan activated successfully - lifetime access"
        
        # Update user in Supabase
        try:
            logger.info(f"[Plans API] Updating user with data: {update_data}")
            response = supabase_service.client.table("user") \
                .update(update_data) \
                .eq("user_id", request.user_id) \
                .execute()
        except Exception as db_error:
            logger.error(f"[Plans API] Database error updating user: {db_error}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to update user plan. Please try again later."
            )
        
        if not response.data:
            raise HTTPException(
                status_code=500, 
                detail="Failed to update user plan. No data returned from database."
            )
        
        logger.info(f"[Plans API] ✓ Successfully activated {request.plan} plan for user {request.user_id}")
        
        return PlanActivationResponse(
            message=message,
            subscription_tier=request.plan,
            subscription_expires=subscription_expires_str
        )
        
    except HTTPException as http_error:
        # Re-raise HTTP exceptions as-is
        logger.error(f"[Plans API] HTTP Error: {http_error.detail}")
        raise http_error
    except Exception as e:
        logger.error(f"[Plans API] Unexpected error activating plan: {e}")
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred. Please try again later."
        )

@router.get("/pricing/plans")
async def get_available_plans():
    """
    Get available subscription plans
    """
    plans = [
        {
            "name": "Free",
            "price": 0,
            "period": "forever",
            "features": [
                "Basic mood tracking (3 entries per day)",
                "7-day mood history",
                "Simple mood insights",
                "Basic charts and trends"
            ]
        },
        {
            "name": "Plus",
            "price": 4.99,
            "period": "month",
            "features": [
                "Unlimited mood tracking",
                "30-day mood history & trends",
                "Advanced mood analytics",
                "Detailed pattern insights",
                "Custom mood categories",
                "Enhanced data visualization"
            ]
        },
        {
            "name": "Professional",
            "price": 14.99,
            "period": "month",
            "features": [
                "Everything in Plus",
                "Extended data retention",
                "Professional-grade analytics",
                "Advanced reporting tools",
                "Priority support",
                "API access for integrations"
            ]
        }
    ]
    
    return {"plans": plans}

@router.get("/pricing/user-plan/{user_id}")
async def get_user_plan(user_id: str):
    """
    Get current plan for a user
    """
    try:
        # Only select columns that exist in the database
        response = supabase_service.client.table("user") \
            .select("subscription_tier, subscription_expires_at, monthly_entries_count") \
            .eq("user_id", user_id) \
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = response.data[0]
        
        return {
            "user_id": user_id,
            "subscription_tier": user_data.get("subscription_tier", "Free"),
            "subscription_expires_at": user_data.get("subscription_expires_at"),
            "monthly_entries_count": user_data.get("monthly_entries_count", 0)
        }
        
    except Exception as e:
        logger.error(f"[Plans API] Error getting user plan: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
