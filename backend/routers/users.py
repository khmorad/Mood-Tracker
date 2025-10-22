from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..schemas.user_schemas import UserCreate, User
from ..services.supabase_service import supabase_service

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[dict])
async def get_users(email: Optional[str] = Query(None)):
    """Get all users or filter by email"""
    try:
        if email:
            user = supabase_service.get_user_by_email(email)
            return [user] if user else []
        else:
            # Get all users using Supabase
            client = supabase_service.client
            result = client.table("user").select("*").execute()
            return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=dict)
async def create_user(user: UserCreate):
    """Create a new user"""
    try:
        user_data = {
            "user_id": user.user_id,
            "email": user.email,
            "password": user.password,
            "profile_picture": user.profile_picture,
            "gender": user.gender,
            "preferred_language": user.preferred_language,
            "phone_number": user.phone_number,
            "date_of_birth": user.date_of_birth,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "diagnosis_status": user.diagnosis_status
        }
        
        created_user = supabase_service.create_user(user_data)
        
        return {
            "user_id": user.user_id,
            "email": user.email,
            "message": "User created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: str):
    """Get a specific user by ID"""
    try:
        user = supabase_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}", response_model=dict)
async def update_user(user_id: str, user_update: UserCreate):
    """Update a user"""
    try:
        # Check if user exists
        existing_user = supabase_service.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = {
            "email": user_update.email,
            "password": user_update.password,
            "profile_picture": user_update.profile_picture,
            "gender": user_update.gender,
            "preferred_language": user_update.preferred_language,
            "phone_number": user_update.phone_number,
            "date_of_birth": user_update.date_of_birth,
            "first_name": user_update.first_name,
            "middle_name": user_update.middle_name,
            "last_name": user_update.last_name,
            "diagnosis_status": user_update.diagnosis_status
        }
        
        supabase_service.update_user(user_id, user_data)
        return {"message": "User updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Delete a user"""
    try:
        # First check if user exists
        existing_user = supabase_service.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete the user
        supabase_service.delete_user(user_id)
        
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))