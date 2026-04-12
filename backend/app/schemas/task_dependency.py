from pydantic import BaseModel, field_validator


class DependencyCreate(BaseModel):
    taskId: str
    dependsOnTaskId: str
    type: str

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        allowed = ("blocks", "blocked_by", "related", "duplicate")
        if v not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v
