from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date


class DependencyCreate(BaseModel):
    taskId: str
    dependsOnTaskId: str
    type: str
