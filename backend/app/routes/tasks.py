from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.task import TaskCreate, TaskUpdate

router = APIRouter()


@router.get("")
async def get_tasks(
    assignedTo: str | None = Query(None),
    assigneeId: str | None = Query(None),
    status: str | None = Query(None),
    tags: list[str] | None = Query(None),
    search: str | None = Query(None),
    archived: str | None = Query(None),
    projectId: str | None = Query(None),
    teamId: str | None = Query(None),
    cycleId: str | None = Query(None),
    current_user: dict = Depends(get_current_user),
):
    supabase = get_admin_client()
    query = supabase.table("tasks").select("*, issue_labels(labels(*))")

    if archived is None or archived == "false":
        query = query.eq("archived", False)
    elif archived == "true":
        query = query.eq("archived", True)

    if status:
        query = query.eq("status", status)

    if projectId:
        query = query.eq("project_id", projectId)

    if teamId:
        query = query.eq("team_id", teamId)

    if assigneeId:
        query = query.eq("assignee_id", assigneeId)

    if cycleId:
        query = query.eq("cycle_id", cycleId)

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
            or search_lower in (t.get("identifier") or "").lower()
        ]

    result = []
    for t in tasks:
        record = transform_record(t)
        labels_data = t.get("issue_labels", [])
        record["labels"] = [
            transform_record(il["labels"]) for il in labels_data if il.get("labels")
        ]
        result.append(record)
    return result


@router.get("/{task_id}")
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("tasks")
        .select("*, issue_labels(labels(*))")
        .eq("id", task_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    task = response.data[0]
    record = transform_record(task)
    labels_data = task.get("issue_labels", [])
    record["labels"] = [
        transform_record(il["labels"]) for il in labels_data if il.get("labels")
    ]
    return record


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
        "team_id": body.teamId,
        "assignee_id": body.assigneeId,
        "estimate": body.estimate,
        "start_date": body.startDate,
    }

    if body.teamId:
        num_result = supabase.rpc(
            "next_issue_number", {"p_team_id": body.teamId}
        ).execute()
        issue_number = num_result.data
        if issue_number is not None:
            team_result = (
                supabase.table("teams")
                .select("identifier")
                .eq("id", body.teamId)
                .execute()
            )
            if team_result.data:
                task_data["issue_number"] = issue_number
                task_data["identifier"] = (
                    f"{team_result.data[0]['identifier']}-{issue_number}"
                )
    if body.assigneeId:
        task_data["assigned_to"] = [body.assigneeId]

    response = supabase.table("tasks").insert(task_data).execute()
    task = response.data[0]

    if body.labelIds:
        for label_id in body.labelIds:
            supabase.table("issue_labels").insert(
                {"issue_id": task["id"], "label_id": label_id}
            ).execute()

    if body.assignedTo or body.assigneeId:
        notify_ids = body.assignedTo or ([body.assigneeId] if body.assigneeId else [])
        notification_message = f"New task assigned: '{task['title']}'"
        if task.get("deadline"):
            notification_message += f" — Due {task['deadline'][:10]}"
        for user_id in notify_ids:
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

    result = transform_record(task)
    result["labels"] = []
    return result


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
        "teamId": "team_id",
        "estimate": "estimate",
        "startDate": "start_date",
        "cycleId": "cycle_id",
    }

    for camel_key, snake_key in field_map.items():
        value = getattr(body, camel_key, None)
        if value is not None:
            update_data[snake_key] = value

    # Handle assigneeId separately: "" = not sent (default), None = explicitly unassign, str = assign
    if body.assigneeId != "":  # field was explicitly sent
        update_data["assignee_id"] = body.assigneeId  # can be None to unassign
        if body.assigneeId:
            update_data["assigned_to"] = [body.assigneeId]
        else:
            update_data["assigned_to"] = []

    if update_data:
        response = (
            supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
    else:
        response = supabase.table("tasks").select("*").eq("id", task_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )

    # Re-fetch with labels
    full = (
        supabase.table("tasks")
        .select("*, issue_labels(labels(*))")
        .eq("id", task_id)
        .execute()
    )
    task = full.data[0]
    record = transform_record(task)
    labels_data = task.get("issue_labels", [])
    record["labels"] = [
        transform_record(il["labels"]) for il in labels_data if il.get("labels")
    ]
    return record


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    supabase.table("issue_labels").delete().eq("issue_id", task_id).execute()
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
        "team_id": original.get("team_id"),
        "assignee_id": original.get("assignee_id"),
        "estimate": original.get("estimate"),
    }

    if cloned_data.get("team_id"):
        num_result = supabase.rpc(
            "next_issue_number", {"p_team_id": cloned_data["team_id"]}
        ).execute()
        issue_number = num_result.data
        if issue_number is not None:
            team_result = (
                supabase.table("teams")
                .select("identifier")
                .eq("id", cloned_data["team_id"])
                .execute()
            )
            if team_result.data:
                cloned_data["issue_number"] = issue_number
                cloned_data["identifier"] = (
                    f"{team_result.data[0]['identifier']}-{issue_number}"
                )

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


@router.post("/{task_id}/labels/{label_id}")
async def attach_label(
    task_id: str, label_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    supabase.table("issue_labels").insert(
        {"issue_id": task_id, "label_id": label_id}
    ).execute()
    return {"success": True}


@router.delete("/{task_id}/labels/{label_id}")
async def detach_label(
    task_id: str, label_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    supabase.table("issue_labels").delete().eq("issue_id", task_id).eq(
        "label_id", label_id
    ).execute()
    return {"success": True}
