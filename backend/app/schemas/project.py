from pydantic import BaseModel, field_validator
from typing import Optional


VALID_PROJECT_STATUSES = (
    "backlog", "planned", "in_progress", "paused", "completed", "cancelled"
)


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#6EE7B7"
    teamId: Optional[str] = None
    status: Optional[str] = "planned"
    leadId: Optional[str] = None
    startDate: Optional[str] = None
    targetDate: Optional[str] = None
    icon: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_PROJECT_STATUSES:
            raise ValueError(f"status must be one of {VALID_PROJECT_STATUSES}")
        return v


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    teamId: Optional[str] = None
    status: Optional[str] = None
    leadId: Optional[str] = None
    startDate: Optional[str] = None
    targetDate: Optional[str] = None
    icon: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_PROJECT_STATUSES:
            raise ValueError(f"status must be one of {VALID_PROJECT_STATUSES}")
        return v
