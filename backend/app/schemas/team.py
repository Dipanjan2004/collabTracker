from pydantic import BaseModel, field_validator
import re


class TeamCreate(BaseModel):
    name: str
    identifier: str
    description: str = ""
    color: str = "#6EE7B7"

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, v):
        v = v.upper().strip()
        if not re.match(r"^[A-Z]{2,5}$", v):
            raise ValueError("Identifier must be 2-5 uppercase letters")
        return v


class TeamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None


class TeamMemberAdd(BaseModel):
    userId: str
    role: str = "member"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("owner", "admin", "member"):
            raise ValueError("Role must be owner, admin, or member")
        return v
