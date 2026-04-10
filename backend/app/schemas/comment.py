from pydantic import BaseModel
from typing import Optional


class CommentCreate(BaseModel):
    taskId: str
    content: str
    parentId: Optional[str] = None


class CommentUpdate(BaseModel):
    content: str
