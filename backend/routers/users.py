from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import get_db, UserCreate, User
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[dict])
async def get_users(email: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Get all users or filter by email"""
    try:
        if email:
            query = text("SELECT * FROM User WHERE email = :email")
            result = db.execute(query, {"email": email})
        else:
            query = text("SELECT * FROM User")
            result = db.execute(query)
        
        users = result.fetchall()
        return [dict(user._mapping) for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=dict)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    try:
        # Format date if provided
        formatted_date = None
        if user.date_of_birth:
            try:
                date_obj = datetime.fromisoformat(user.date_of_birth.replace('Z', '+00:00'))
                formatted_date = date_obj.strftime('%Y-%m-%d %H:%M:%S')
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_of_birth format")
        
        query = text("""
            INSERT INTO User (user_id, email, password, profile_picture, gender, 
                            preferred_language, phone_number, date_of_birth, first_name, 
                            middle_name, last_name, diagnosis_status) 
            VALUES (:user_id, :email, :password, :profile_picture, :gender, 
                   :preferred_language, :phone_number, :date_of_birth, :first_name, 
                   :middle_name, :last_name, :diagnosis_status)
        """)
        
        result = db.execute(query, {
            "user_id": user.user_id,
            "email": user.email,
            "password": user.password,
            "profile_picture": user.profile_picture,
            "gender": user.gender,
            "preferred_language": user.preferred_language,
            "phone_number": user.phone_number,
            "date_of_birth": formatted_date,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "diagnosis_status": user.diagnosis_status
        })
        
        db.commit()
        
        return {
            "user_id": user.user_id,
            "email": user.email,
            "message": "User created successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    try:
        query = text("SELECT * FROM User WHERE user_id = :user_id")
        result = db.execute(query, {"user_id": user_id})
        user = result.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return dict(user._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}", response_model=dict)
async def update_user(user_id: str, user_update: UserCreate, db: Session = Depends(get_db)):
    """Update a user"""
    try:
        # Check if user exists
        check_query = text("SELECT user_id FROM User WHERE user_id = :user_id")
        result = db.execute(check_query, {"user_id": user_id})
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Format date if provided
        formatted_date = None
        if user_update.date_of_birth:
            try:
                date_obj = datetime.fromisoformat(user_update.date_of_birth.replace('Z', '+00:00'))
                formatted_date = date_obj.strftime('%Y-%m-%d %H:%M:%S')
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_of_birth format")
        
        query = text("""
            UPDATE User SET 
                email = :email, password = :password, profile_picture = :profile_picture,
                gender = :gender, preferred_language = :preferred_language, 
                phone_number = :phone_number, date_of_birth = :date_of_birth,
                first_name = :first_name, middle_name = :middle_name, 
                last_name = :last_name, diagnosis_status = :diagnosis_status
            WHERE user_id = :user_id
        """)
        
        db.execute(query, {
            "user_id": user_id,
            "email": user_update.email,
            "password": user_update.password,
            "profile_picture": user_update.profile_picture,
            "gender": user_update.gender,
            "preferred_language": user_update.preferred_language,
            "phone_number": user_update.phone_number,
            "date_of_birth": formatted_date,
            "first_name": user_update.first_name,
            "middle_name": user_update.middle_name,
            "last_name": user_update.last_name,
            "diagnosis_status": user_update.diagnosis_status
        })
        
        db.commit()
        return {"message": "User updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(user_id: str, db: Session = Depends(get_db)):
    """Delete a user"""
    try:
        # First check if user exists
        check_query = text("SELECT user_id FROM User WHERE user_id = :user_id")
        check_result = db.execute(check_query, {"user_id": user_id})
        if not check_result.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete the user
        query = text("DELETE FROM User WHERE user_id = :user_id")
        db.execute(query, {"user_id": user_id})
        db.commit()
        
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 