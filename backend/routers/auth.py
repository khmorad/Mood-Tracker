from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
import sys
import os
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..utils.jwt_utils import verify_password, get_password_hash, create_access_token
from ..middleware.auth import get_current_user_dependency
from ..services.supabase_service import supabase_service

router = APIRouter(prefix="/users", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

@router.post("/register")
async def register(register_data: RegisterRequest):
    """Register a new user with hashed password"""
    try:
        # Check if user already exists using Supabase
        existing_user = supabase_service.get_user_by_email(register_data.email)
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = get_password_hash(register_data.password)
        
        # Generate unique user_id (format: U + timestamp)
        user_id = f"U{int(time.time() * 1000)}"
        
        # Split name into first and last name
        name_parts = register_data.name.split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Insert new user using Supabase
        user_data = {
            "user_id": user_id,
            "email": register_data.email,
            "password": hashed_password,
            "first_name": first_name,
            "last_name": last_name
        }
        
        supabase_service.create_user(user_data)
        
        return {"message": "User registered successfully", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(login_data: LoginRequest, response: Response):
    """Login user with email and password, return JWT in cookie"""
    try:
        # Get user using Supabase
        user = supabase_service.get_user_by_email(login_data.email)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Secure password check
        if not verify_password(login_data.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # JWT creation - INCLUDE ALL USER INFO
        # Remove password before creating JWT
        user_dict_for_jwt = user.copy()
        user_dict_for_jwt.pop('password', None)
        
        # Create JWT with all user information
        access_token = create_access_token(user_dict_for_jwt)
        
        # Remove password from response
        user.pop('password', None)
        
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
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@router.get("/me")
async def get_current_user_info(current_user: dict = get_current_user_dependency):
    """Get current user information from JWT token"""
    return {"user": current_user}