from pydantic import BaseModel
from typing import Optional, List


class TemplateCreate(BaseModel):
    name: str
    title: str
    description: Optional[str] = ""
    tags: Optional[List[str]] = []
    priority: Optional[str] = "medium"
    estimatedHours: Optional[float] = 0
