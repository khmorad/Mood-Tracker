from fastapi import APIRouter, HTTPException, Response
import sys
import os
import time
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..utils.jwt_utils import verify_password, get_password_hash, create_access_token
from ..middleware.auth import get_current_user_dependency
from ..services.supabase_service import supabase_service
from ..schemas.auth_schemas import LoginRequest, RegisterRequest, UserResponse
from ..models.user import User

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(register_data: RegisterRequest):
    """Register a new user with hashed password"""
    try:
        logger.info(f"[Auth] Registration attempt for email: {register_data.email}")
        
        # Check if user already exists using Supabase
        existing_user = supabase_service.get_user_by_email(register_data.email)
        
        if existing_user:
            logger.warning(f"[Auth] Registration failed - email already exists: {register_data.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = get_password_hash(register_data.password)
        
        # Generate unique user_id (format: U + timestamp)
        user_id = f"U{int(time.time() * 1000)}"
        
        # Split name into first and last name
        name_parts = register_data.name.strip().split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        logger.info(f"[Auth] Creating user {user_id} with name: {first_name} {last_name}")
        
        # Create user data dictionary with only the required fields
        user_data = {
            "user_id": user_id,
            "email": register_data.email,
            "password": hashed_password,
            "first_name": first_name,
            "last_name": last_name,
            "subscription_tier": "Free",
            "monthly_entries_count": 0,
            # Set optional fields to None/default values
            "profile_picture": None,
            "gender": None,
            "preferred_language": None,
            "phone_number": None,
            "date_of_birth": None,
            "middle_name": None,
            "diagnosis_status": None,
            "subscription_expires_at": None,
            "stripe_customer_id": None,
            "stripe_subscription_id": None
        }
        
        # Create user directly with dictionary
        created_user_dict = supabase_service.create_user(user_data)
        
        logger.info(f"[Auth] ✓ User registered successfully: {user_id}")
        
        return UserResponse(
            user_id=created_user_dict["user_id"],
            email=created_user_dict["email"],
            first_name=created_user_dict.get("first_name", ""),
            last_name=created_user_dict.get("last_name", ""),
            message="User registered successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Auth] Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login(login_data: LoginRequest, response: Response):
    """Login user with email and password, return JWT in cookie"""
    try:
        # Get user using Supabase - returns dict
        user_dict = supabase_service.get_user_by_email(login_data.email)
        
        if not user_dict:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Secure password check
        if not verify_password(login_data.password, user_dict['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # JWT creation - INCLUDE ALL USER INFO
        # Remove password before creating JWT
        user_dict_for_jwt = user_dict.copy()
        user_dict_for_jwt.pop('password', None)
        
        # Create JWT with all user information
        access_token = create_access_token(user_dict_for_jwt)
        
        # Remove password from response
        user_dict.pop('password', None)
        
        # Set JWT as HTTP-only cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=False,  # Changed to False so frontend can read JWT
            secure=False,  # Set to True in production
            samesite="lax",
            max_age=1800
        )
        
        return {
            "message": "Login successful",
            "user": user_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@router.get("/me")
async def get_current_user_info(current_user: dict = get_current_user_dependency):
    """Get current user information from JWT token"""
    return {"user": current_user}

@router.post("/refresh-jwt")
async def refresh_jwt(user_data: dict):
    """Create a new JWT token with updated user data"""
    try:
        logger.info(f"[Auth] Refreshing JWT for user: {user_data.get('user_id')}")
        
        # Remove sensitive fields
        user_data_for_jwt = user_data.copy()
        user_data_for_jwt.pop('password', None)
        
        # Create new JWT with fresh user data
        access_token = create_access_token(user_data_for_jwt)
        
        logger.info(f"[Auth] ✓ JWT refreshed successfully for user: {user_data.get('user_id')}")
        
        return {
            "message": "JWT refreshed successfully",
            "access_token": access_token,
            "user": user_data_for_jwt
        }
        
    except Exception as e:
        logger.error(f"[Auth] JWT refresh error: {e}")
        raise HTTPException(status_code=500, detail=f"JWT refresh failed: {str(e)}")