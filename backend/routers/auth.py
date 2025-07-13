from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import get_db

router = APIRouter(prefix="/users", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user with email and password"""
    try:
        query = text("SELECT * FROM User WHERE email = :email AND password = :password")
        result = db.execute(query, {
            "email": login_data.email,
            "password": login_data.password
        })
        user = result.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_dict = dict(user._mapping)
        # Remove password from response for security
        user_dict.pop('password', None)
        
        return {
            "message": "Login successful",
            "user": user_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 