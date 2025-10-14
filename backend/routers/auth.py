from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
import sys
import os
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..schemas.db import get_db

# --- Add these imports ---
from ..utils.jwt_utils import (
    verify_password, get_password_hash, create_access_token
)
# -------------------------

# Add this import at the top with other imports
from ..middleware.auth import get_current_user_dependency

router = APIRouter(prefix="/users", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

@router.post("/register")
async def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with hashed password"""
    try:
        # Check if user already exists - FIXED: use user_id instead of id
        check_query = text("SELECT user_id FROM \"user\" WHERE email = :email")
        existing_user = db.execute(check_query, {"email": register_data.email}).fetchone()
        
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
        
        # Insert new user - FIXED: use actual table columns
        insert_query = text("""
            INSERT INTO \"user\" (user_id, email, password, first_name, last_name) 
            VALUES (:user_id, :email, :password, :first_name, :last_name)
        """)
        
        db.execute(insert_query, {
            "user_id": user_id,
            "email": register_data.email,
            "password": hashed_password,
            "first_name": first_name,
            "last_name": last_name
        })
        db.commit()
        
        return {"message": "User registered successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Login user with email and password, return JWT in cookie"""
    try:
        query = text("SELECT * FROM \"user\" WHERE email = :email")
        result = db.execute(query, {"email": login_data.email})
        user = result.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user_dict = dict(user._mapping)
        
        # --- Secure password check ---
        if not verify_password(login_data.password, user_dict['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # --- JWT creation - INCLUDE ALL USER INFO ---
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
async def get_current_user_info(current_user: dict = Depends(get_current_user_dependency)):
    """Get current user information from JWT token"""
    return {"user": current_user} 