from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class UserBase(BaseModel):
    user_id: str
    email: str
    password: str
    profile_picture: Optional[bytes] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    diagnosis_status: Optional[str] = None
    subscription_tier: Optional[str] = None
    subscription_expires_at: Optional[datetime] = None
    monthly_entries_count: Optional[int] = 0
    monthly_entries_reset_at: Optional[datetime] = None
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    class Config:
        from_attributes = True