from typing import Dict, Any

from backend.services.base_service import BaseService


class UserFeatureSettingsService(BaseService):
    def __init__(self):
        super().__init__()

    def get_settings(self, user_id: str) -> Dict[str, Any]:
        result = (
            self.client.table("user_feature_settings")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if result.data:
            return result.data[0]

        return {
            "user_id": user_id,
            "dbt_skill_suggestions_enabled": False,
            "created_at": None,
            "updated_at": None,
        }

    def upsert_settings(self, user_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        payload = {
            "user_id": user_id,
            "dbt_skill_suggestions_enabled": settings.get(
                "dbt_skill_suggestions_enabled", False
            ),
        }

        result = (
            self.client.table("user_feature_settings")
            .upsert(payload)
            .execute()
        )

        if result.data:
            return result.data[0]

        return self.get_settings(user_id)


user_feature_settings_service = UserFeatureSettingsService()
