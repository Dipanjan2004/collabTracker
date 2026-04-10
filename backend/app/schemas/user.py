from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatarUrl: Optional[str] = ""
    createdAt: Optional[str] = None
    active: bool = True
