from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..schemas.db import get_db
from ..utils.jwt_utils import get_current_user

security = HTTPBearer()

async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Dependency to get current authenticated user with latest subscription info"""
    token = None
    # Try to get token from Authorization header first
    if credentials:
        token = credentials.credentials
    # If not present, try to get from cookie
    if not token and request:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = get_current_user(token)
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Get user from database with latest subscription info
    query = text("""
        SELECT u.*, s.subscription_tier, s.subscription_expires_at 
        FROM \"user\" u 
        LEFT JOIN subscription s ON u.user_id = s.user_id 
        WHERE u.user_id = :user_id
    """)
    result = db.execute(query, {"user_id": payload.get("user_id")})
    user = result.fetchone()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_dict = dict(user._mapping)
    user_dict.pop('password', None)  # Remove password from response
    
    # Ensure subscription defaults
    if not user_dict.get('subscription_tier'):
        user_dict['subscription_tier'] = 'Free'
    
    return user_dict
