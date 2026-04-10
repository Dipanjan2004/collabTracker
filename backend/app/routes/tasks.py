from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.task import TaskCreate, TaskUpdate

router = APIRouter()


@router.get("")
async def get_tasks(
    assignedTo: str | None = Query(None),
    status: str | None = Query(None),
    tags: list[str] | None = Query(None),
    search: str | None = Query(None),
    archived: str | None = Query(None),
    projectId: str | None = Query(None),
    current_user: dict = Depends(get_current_user),
):
    supabase = get_admin_client()
    query = supabase.table("tasks").select("*")

    if archived is None or archived == "false":
        query = query.eq("archived", False)
    elif archived == "true":
        query = query.eq("archived", True)

    if status:
        query = query.eq("status", status)

    if projectId:
        query = query.eq("project_id", projectId)

    response = query.execute()
    tasks = response.data

    if assignedTo:
        tasks = [t for t in tasks if assignedTo in (t.get("assigned_to") or [])]

    if tags:
        tasks = [t for t in tasks if any(tag in (t.get("tags") or []) for tag in tags)]

    if search:
        search_lower = search.lower()
        tasks = [
            t
            for t in tasks
            if search_lower in t.get("title", "").lower()
            or search_lower in t.get("description", "").lower()
        ]

    return [transform_record(t) for t in tasks]


@router.get("/{task_id}")
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return transform_record(response.data[0])


@router.post("")
async def create_task(body: TaskCreate, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    task_data = {
        "title": body.title,
        "description": body.description or "",
        "assigned_to": body.assignedTo or [],
        "tags": body.tags or [],
        "status": body.status or "todo",
        "priority": body.priority or "medium",
        "estimated_hours": body.estimatedHours or 0,
        "deadline": body.deadline,
        "created_by": current_user["id"],
        "archived": body.archived if body.archived is not None else False,
        "project_id": body.projectId,
    }

    response = supabase.table("tasks").insert(task_data).execute()
    task = response.data[0]

    if body.assignedTo:
        notification_message = f"New task assigned: '{task['title']}'"
        if task.get("deadline"):
            notification_message += f" — Due {task['deadline'][:10]}"
        for user_id in body.assignedTo:
            supabase.table("notifications").insert(
                {
                    "user_id": user_id,
                    "type": "task_assigned",
                    "message": notification_message,
                    "payload": {"taskId": task["id"]},
                }
            ).execute()

    supabase.table("activities").insert(
        {
            "user_id": current_user["id"],
            "user_name": current_user["name"],
            "action": "created task",
            "target_type": "task",
            "target_id": task["id"],
        }
    ).execute()

    return transform_record(task)


@router.put("/{task_id}")
async def update_task(
    task_id: str, body: TaskUpdate, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    update_data = {}
    field_map = {
        "title": "title",
        "description": "description",
        "assignedTo": "assigned_to",
        "tags": "tags",
        "status": "status",
        "priority": "priority",
        "estimatedHours": "estimated_hours",
        "deadline": "deadline",
        "projectId": "project_id",
        "archived": "archived",
    }

    for camel_key, snake_key in field_map.items():
        value = getattr(body, camel_key, None)
        if value is not None:
            update_data[snake_key] = value

    if update_data:
        response = (
            supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        return transform_record(response.data[0])

    response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return transform_record(response.data[0])


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    supabase.table("comments").delete().eq("task_id", task_id).execute()
    supabase.table("progress_logs").delete().eq("task_id", task_id).execute()
    supabase.table("task_dependencies").delete().or_(
        f"task_id.eq.{task_id},depends_on_task_id.eq.{task_id}"
    ).execute()
    supabase.table("tasks").delete().eq("id", task_id).execute()
    return {"success": True}


@router.post("/{task_id}/archive")
async def archive_task(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("tasks").update({"archived": True}).eq("id", task_id).execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return transform_record(response.data[0])


@router.post("/{task_id}/unarchive")
async def unarchive_task(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("tasks").update({"archived": False}).eq("id", task_id).execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return transform_record(response.data[0])


@router.post("/{task_id}/clone")
async def clone_task(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    original = response.data[0]
    cloned_data = {
        "title": f"{original['title']} (Copy)",
        "description": original.get("description", ""),
        "assigned_to": [],
        "tags": original.get("tags", []),
        "status": "todo",
        "priority": original.get("priority", "medium"),
        "estimated_hours": original.get("estimated_hours", 0),
        "deadline": original.get("deadline"),
        "created_by": current_user["id"],
        "archived": False,
        "project_id": original.get("project_id"),
    }

    cloned_response = supabase.table("tasks").insert(cloned_data).execute()
    cloned = cloned_response.data[0]

    supabase.table("activities").insert(
        {
            "user_id": current_user["id"],
            "user_name": current_user["name"],
            "action": "cloned task",
            "target_type": "task",
            "target_id": cloned["id"],
        }
    ).execute()

    return transform_record(cloned)
