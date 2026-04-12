from pydantic import BaseModel, field_validator


class CycleCreate(BaseModel):
    teamId: str
    name: str
    startDate: str
    endDate: str


class CycleUpdate(BaseModel):
    name: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None:
            allowed = ("upcoming", "active", "completed")
            if v not in allowed:
                raise ValueError(f"status must be one of {allowed}")
        return v
