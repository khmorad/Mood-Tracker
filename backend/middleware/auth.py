from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ..utils.jwt_utils import get_current_user
from ..services.users_service import users_service

security = HTTPBearer()

async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
):
    """Dependency to get current authenticated user with latest profile info."""
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

    user = users_service.get_user_by_id(payload.get("user_id"))
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_dict = dict(user)
    user_dict.pop('password', None)

    # Ensure subscription defaults
    if not user_dict.get('subscription_tier'):
        user_dict['subscription_tier'] = 'Free'

    return user_dict
