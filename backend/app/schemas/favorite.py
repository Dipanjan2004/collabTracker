from pydantic import BaseModel, field_validator


class FavoriteCreate(BaseModel):
    targetType: str
    targetId: str

    @field_validator("targetType")
    @classmethod
    def validate_target_type(cls, v):
        allowed = ("view", "project", "cycle", "issue")
        if v not in allowed:
            raise ValueError(f"targetType must be one of {allowed}")
        return v
