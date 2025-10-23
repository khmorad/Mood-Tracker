from typing import Optional, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, validator
import re

class User(BaseModel):
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

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None
        }

    @validator('email')
    def validate_email(cls, v):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v

    @validator('monthly_entries_count')
    def validate_monthly_entries_count(cls, v):
        if v is not None and v < 0:
            raise ValueError('Monthly entries count cannot be negative')
        return v

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for database operations"""
        data = self.dict()
        if self.date_of_birth:
            data['date_of_birth'] = self.date_of_birth.isoformat()
        if self.subscription_expires_at:
            data['subscription_expires_at'] = self.subscription_expires_at.isoformat()
        if self.monthly_entries_reset_at:
            data['monthly_entries_reset_at'] = self.monthly_entries_reset_at.isoformat()
        return data

    def to_safe_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary without sensitive information"""
        data = self.to_dict()
        data.pop('password', None)
        data.pop('stripe_customer_id', None)
        data.pop('stripe_subscription_id', None)
        return data
