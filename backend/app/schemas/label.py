from pydantic import BaseModel


class LabelCreate(BaseModel):
    name: str
    color: str = "#6B7280"
    groupName: str | None = None
    teamId: str | None = None


class LabelUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    groupName: str | None = None
