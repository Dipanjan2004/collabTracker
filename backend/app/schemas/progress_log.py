from pydantic import BaseModel
from typing import Optional, List


class ProgressLogCreate(BaseModel):
    taskId: str
    progressText: str
    percentageComplete: int
    hoursSpent: float
    date: Optional[str] = None
    attachments: Optional[List[str]] = []
    links: Optional[List[str]] = []
