from pydantic import BaseModel, field_validator


class CustomViewCreate(BaseModel):
    name: str
    description: str = ""
    icon: str = "filter"
    filters: dict = {}
    sortBy: str = "created_at"
    sortOrder: str = "desc"
    groupBy: str | None = None
    layout: str = "list"
    teamId: str | None = None
    isFavorite: bool = False

    @field_validator("layout")
    @classmethod
    def validate_layout(cls, v):
        if v not in ("list", "board"):
            raise ValueError("layout must be 'list' or 'board'")
        return v

    @field_validator("sortOrder")
    @classmethod
    def validate_sort_order(cls, v):
        if v not in ("asc", "desc"):
            raise ValueError("sortOrder must be 'asc' or 'desc'")
        return v


class CustomViewUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    filters: dict | None = None
    sortBy: str | None = None
    sortOrder: str | None = None
    groupBy: str | None = None
    layout: str | None = None
    isFavorite: bool | None = None

    @field_validator("layout")
    @classmethod
    def validate_layout(cls, v):
        if v is not None and v not in ("list", "board"):
            raise ValueError("layout must be 'list' or 'board'")
        return v

    @field_validator("sortOrder")
    @classmethod
    def validate_sort_order(cls, v):
        if v is not None and v not in ("asc", "desc"):
            raise ValueError("sortOrder must be 'asc' or 'desc'")
        return v
