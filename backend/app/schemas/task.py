from pydantic import BaseModel, field_validator
from typing import Optional, List


VALID_STATUSES = ("backlog", "todo", "in_progress", "done", "cancelled")
VALID_PRIORITIES = ("none", "low", "medium", "high", "urgent")


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    assignedTo: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    estimatedHours: Optional[float] = 0
    deadline: Optional[str] = None
    projectId: Optional[str] = None
    archived: Optional[bool] = False
    teamId: Optional[str] = None
    assigneeId: Optional[str] = None
    estimate: Optional[float] = None
    startDate: Optional[str] = None
    labelIds: Optional[List[str]] = []

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {VALID_PRIORITIES}")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignedTo: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    estimatedHours: Optional[float] = None
    deadline: Optional[str] = None
    projectId: Optional[str] = None
    archived: Optional[bool] = None
    teamId: Optional[str] = None
    assigneeId: Optional[str] = ""  # sentinel: "" means explicitly sent; None means not sent
    estimate: Optional[float] = None
    startDate: Optional[str] = None
    cycleId: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {VALID_PRIORITIES}")
        return v
