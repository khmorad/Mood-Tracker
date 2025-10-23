from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import sqlite3
import os

router = APIRouter()

# Request/Response Models
class PlanActivationRequest(BaseModel):
    user_id: str
    plan: str

class PlanActivationResponse(BaseModel):
    message: str
    subscription_tier: str
    subscription_expires: Optional[str] = None

# Database helper function
def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'mood_tracker.db')
    return sqlite3.connect(db_path)

@router.post("/pricing/activate-plan", response_model=PlanActivationResponse)
async def activate_plan(request: PlanActivationRequest):
    """
    Activate a subscription plan for a user
    """
    try:
        # Validate plan type
        valid_plans = ["Free", "Plus", "Professional"]
        if request.plan not in valid_plans:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid plan. Must be one of: {', '.join(valid_plans)}"
            )
        
        # Handle Professional plan special case
        if request.plan == "Professional":
            return PlanActivationResponse(
                message="Please contact sales to activate the Professional plan.",
                subscription_tier="Professional",
                subscription_expires=None
            )
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (request.user_id,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate dates
        now = datetime.utcnow()
        monthly_reset = now + timedelta(days=30)  # 1 month from now
        
        # Plan-specific logic
        if request.plan == "Free":
            subscription_expires = None
            subscription_expires_str = None
            
            # Update user record for Free plan
            cursor.execute("""
                UPDATE users 
                SET subscription_tier = ?, 
                    subscription_expires_at = ?, 
                    monthly_entries_count = 0, 
                    monthly_entries_reset_at = ?
                WHERE user_id = ?
            """, ("Free", None, monthly_reset.isoformat(), request.user_id))
            
            message = "Free plan activated successfully"
            
        elif request.plan == "Plus":
            # 7-day free trial
            subscription_expires = now + timedelta(days=7)
            subscription_expires_str = subscription_expires.isoformat()
            
            # Update user record for Plus plan
            cursor.execute("""
                UPDATE users 
                SET subscription_tier = ?, 
                    subscription_expires_at = ?, 
                    monthly_entries_count = 0, 
                    monthly_entries_reset_at = ?
                WHERE user_id = ?
            """, ("Plus", subscription_expires_str, monthly_reset.isoformat(), request.user_id))
            
            message = "Plus plan activated successfully with 7-day free trial"
        
        # Commit changes
        conn.commit()
        conn.close()
        
        return PlanActivationResponse(
            message=message,
            subscription_tier=request.plan,
            subscription_expires=subscription_expires_str
        )
        
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/pricing/plans")
async def get_available_plans():
    """
    Get available subscription plans
    """
    plans = [
        {
            "name": "Free",
            "price": 0,
            "features": [
                "Basic mood tracking",
                "Limited AI interactions",
                "Basic analytics"
            ]
        },
        {
            "name": "Plus",
            "price": 9.99,
            "features": [
                "Unlimited mood tracking",
                "Advanced AI interactions",
                "Detailed analytics",
                "Export data",
                "7-day free trial"
            ]
        },
        {
            "name": "Professional",
            "price": "Contact Sales",
            "features": [
                "Everything in Plus",
                "Priority support",
                "Custom integrations",
                "Team management"
            ]
        }
    ]
    
    return {"plans": plans}
