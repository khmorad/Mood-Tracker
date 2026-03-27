from datetime import datetime
from pydantic import BaseModel


class UserFeatureSettingsBase(BaseModel):
    dbt_skill_suggestions_enabled: bool = False


class UserFeatureSettingsUpdate(UserFeatureSettingsBase):
    pass


class UserFeatureSettingsResponse(UserFeatureSettingsBase):
    user_id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
