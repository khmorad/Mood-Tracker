from fastapi import APIRouter, Depends, HTTPException

from ..middleware.auth import get_current_user_dependency
from ..schemas.feature_settings_schemas import (
    UserFeatureSettingsResponse,
    UserFeatureSettingsUpdate,
)
from ..schemas.user_schemas import UserUpdate
from ..services.user_feature_settings_service import user_feature_settings_service
from ..services.users_service import users_service
from ..utils.jwt_utils import get_password_hash


router = APIRouter(prefix="/account", tags=["account"])


@router.get("/profile", response_model=dict)
async def get_account_profile(
    current_user: dict = Depends(get_current_user_dependency),
):
    return current_user


@router.put("/profile", response_model=dict)
async def update_account_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user_dependency),
):
    try:
        update_data = user_update.model_dump(exclude_unset=True)

        blocked_fields = {
            "subscription_tier",
            "subscription_expires_at",
            "monthly_entries_count",
            "monthly_entries_reset_at",
            "stripe_customer_id",
            "stripe_subscription_id",
        }
        update_data = {
            key: value for key, value in update_data.items() if key not in blocked_fields
        }

        password = update_data.get("password")
        if password == "":
            update_data.pop("password", None)
        elif password:
            update_data["password"] = get_password_hash(password)

        if not update_data:
            refreshed_user = users_service.get_user_by_id(current_user["user_id"])
            if not refreshed_user:
                raise HTTPException(status_code=404, detail="User not found")
            refreshed_user.pop("password", None)
            return refreshed_user

        updated_user = users_service.update_user(current_user["user_id"], update_data)
        if not updated_user:
            raise HTTPException(status_code=500, detail="Failed to update account")

        updated_user.pop("password", None)
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/settings", response_model=UserFeatureSettingsResponse)
async def get_account_settings(
    current_user: dict = Depends(get_current_user_dependency),
):
    try:
        return user_feature_settings_service.get_settings(current_user["user_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/settings", response_model=UserFeatureSettingsResponse)
async def update_account_settings(
    settings_update: UserFeatureSettingsUpdate,
    current_user: dict = Depends(get_current_user_dependency),
):
    try:
        return user_feature_settings_service.upsert_settings(
            current_user["user_id"], settings_update.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
