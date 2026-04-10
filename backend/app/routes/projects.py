from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.project import ProjectCreate, ProjectUpdate

router = APIRouter()


@router.get("")
async def get_projects(current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("projects")
        .select("*, project_tasks(task_id)")
        .order("created_at", desc=True)
        .execute()
    )

    projects = []
    for p in response.data:
        project = transform_record(p)
        task_ids = [pt["task_id"] for pt in p.get("project_tasks", [])]
        project["taskIds"] = task_ids
        project.pop("project_tasks", None)
        projects.append(project)

    return projects


@router.post("")
async def create_project(
    body: ProjectCreate, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    project_data = {
        "name": body.name,
        "description": body.description or "",
        "color": body.color or "#6EE7B7",
        "created_by": current_user["id"],
    }

    response = supabase.table("projects").insert(project_data).execute()
    project = response.data[0]
    result = transform_record(project)
    result["taskIds"] = []
    return result


@router.put("/{project_id}")
async def update_project(
    project_id: str, body: ProjectUpdate, current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.description is not None:
        update_data["description"] = body.description
    if body.color is not None:
        update_data["color"] = body.color

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )

    supabase = get_admin_client()
    response = (
        supabase.table("projects").update(update_data).eq("id", project_id).execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    project = response.data[0]
    pt_response = (
        supabase.table("project_tasks")
        .select("task_id")
        .eq("project_id", project_id)
        .execute()
    )
    task_ids = [pt["task_id"] for pt in pt_response.data]

    result = transform_record(project)
    result["taskIds"] = task_ids
    return result


@router.delete("/{project_id}")
async def delete_project(
    project_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    supabase.table("projects").delete().eq("id", project_id).execute()
    return {"success": True}


@router.post("/{project_id}/tasks")
async def add_task_to_project(
    project_id: str, body: dict, current_user: dict = Depends(get_current_user)
):
    task_id = body.get("taskId")
    if not task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="taskId is required"
        )

    supabase = get_admin_client()
    project_response = (
        supabase.table("projects").select("id").eq("id", project_id).execute()
    )
    if not project_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    existing = (
        supabase.table("project_tasks")
        .select("id")
        .eq("project_id", project_id)
        .eq("task_id", task_id)
        .execute()
    )
    if not existing.data:
        supabase.table("project_tasks").insert(
            {"project_id": project_id, "task_id": task_id}
        ).execute()

    supabase.table("tasks").update({"project_id": project_id}).eq(
        "id", task_id
    ).execute()

    return {"success": True}


@router.delete("/{project_id}/tasks/{task_id}")
async def remove_task_from_project(
    project_id: str, task_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    project_response = (
        supabase.table("projects").select("id").eq("id", project_id).execute()
    )
    if not project_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    supabase.table("project_tasks").delete().eq("project_id", project_id).eq(
        "task_id", task_id
    ).execute()
    supabase.table("tasks").update({"project_id": None}).eq("id", task_id).eq(
        "project_id", project_id
    ).execute()

    return {"success": True}
