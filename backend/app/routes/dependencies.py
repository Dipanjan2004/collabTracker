from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.task_dependency import DependencyCreate

router = APIRouter()


@router.get("/task/{task_id}")
async def get_task_dependencies(
    task_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    response = (
        supabase.table("task_dependencies")
        .select(
            "*, task:task_id(id, title), depends_on_task:depends_on_task_id(id, title)"
        )
        .or_(f"task_id.eq.{task_id},depends_on_task_id.eq.{task_id}")
        .execute()
    )

    result = []
    for d in response.data:
        task_info = d.get("task")
        depends_on_info = d.get("depends_on_task")
        item = transform_record(d)
        item["taskId"] = (
            task_info["id"] if isinstance(task_info, dict) else d["task_id"]
        )
        item["dependsOnTaskId"] = (
            depends_on_info["id"]
            if isinstance(depends_on_info, dict)
            else d["depends_on_task_id"]
        )
        item.pop("task", None)
        item.pop("dependsOnTask", None)
        result.append(item)

    return result


@router.post("")
async def create_dependency(
    body: DependencyCreate, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    dep_data = {
        "task_id": body.taskId,
        "depends_on_task_id": body.dependsOnTaskId,
        "type": body.type,
    }

    response = supabase.table("task_dependencies").insert(dep_data).execute()
    dep = response.data[0]
    return {
        "id": dep["id"],
        "taskId": dep["task_id"],
        "dependsOnTaskId": dep["depends_on_task_id"],
        "type": dep["type"],
    }


@router.delete("/{dependency_id}")
async def delete_dependency(
    dependency_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    supabase.table("task_dependencies").delete().eq("id", dependency_id).execute()
    return {"success": True}
