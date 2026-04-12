from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    organizationName: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: dict
    organization: Optional[dict] = None
    isNewOrganization: bool = False
