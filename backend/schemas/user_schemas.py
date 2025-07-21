from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    user_id: str
    email: str
    password: str
    profile_picture: Optional[str] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    diagnosis_status: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    # Remove the incorrect 'id' field
    class Config:
        from_attributes = True 