from pydantic import BaseModel
from typing import Optional, List


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
