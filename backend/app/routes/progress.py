from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, require_admin, transform_record
from app.database import get_admin_client
from app.schemas.progress_log import ProgressLogCreate
from app.schemas.feedback import FeedbackRequest

router = APIRouter()


@router.get("/task/{task_id}")
async def get_progress_logs(
    task_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    response = (
        supabase.table("progress_logs")
        .select("*")
        .eq("task_id", task_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(log) for log in response.data]


@router.post("")
async def create_progress_log(
    body: ProgressLogCreate, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    log_data = {
        "task_id": body.taskId,
        "user_id": current_user["id"],
        "progress_text": body.progressText,
        "percentage_complete": body.percentageComplete,
        "hours_spent": body.hoursSpent,
        "attachments": body.attachments or [],
        "links": body.links or [],
        "date": body.date or date.today().isoformat(),
        "feedback_status": "pending",
    }

    response = supabase.table("progress_logs").insert(log_data).execute()
    log = response.data[0]

    supabase.table("tasks").update({"updated_at": datetime.utcnow().isoformat()}).eq(
        "id", body.taskId
    ).execute()

    task_response = (
        supabase.table("tasks")
        .select("created_by, title")
        .eq("id", body.taskId)
        .execute()
    )
    if task_response.data:
        task = task_response.data[0]
        if task["created_by"] != current_user["id"]:
            supabase.table("notifications").insert(
                {
                    "user_id": task["created_by"],
                    "type": "progress_submitted",
                    "message": f"{current_user['name']} submitted progress for '{task['title']}'",
                    "payload": {"taskId": body.taskId, "progressId": log["id"]},
                }
            ).execute()

    return transform_record(log)


@router.post("/{log_id}/approve")
async def approve_progress(
    log_id: str, body: FeedbackRequest, current_user: dict = Depends(require_admin)
):
    supabase = get_admin_client()
    response = (
        supabase.table("progress_logs")
        .update(
            {
                "feedback_status": "approved",
                "admin_feedback": body.feedback or "",
            }
        )
        .eq("id", log_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Progress log not found"
        )

    log = response.data[0]

    supabase.table("notifications").insert(
        {
            "user_id": log["user_id"],
            "type": "progress_approved",
            "message": "Your progress was approved",
            "payload": {"taskId": log["task_id"], "progressId": log["id"]},
        }
    ).execute()

    supabase.table("activities").insert(
        {
            "user_id": current_user["id"],
            "user_name": current_user["name"],
            "action": "approved progress",
            "target_type": "progress",
            "target_id": log["id"],
        }
    ).execute()

    return {
        "id": log["id"],
        "feedbackStatus": log["feedback_status"],
        "adminFeedback": log["admin_feedback"],
    }


@router.post("/{log_id}/reject")
async def reject_progress(
    log_id: str, body: FeedbackRequest, current_user: dict = Depends(require_admin)
):
    supabase = get_admin_client()
    response = (
        supabase.table("progress_logs")
        .update(
            {
                "feedback_status": "rejected",
                "admin_feedback": body.feedback or "",
            }
        )
        .eq("id", log_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Progress log not found"
        )

    log = response.data[0]

    supabase.table("notifications").insert(
        {
            "user_id": log["user_id"],
            "type": "progress_rejected",
            "message": "Your progress was rejected",
            "payload": {"taskId": log["task_id"], "progressId": log["id"]},
        }
    ).execute()

    return {
        "id": log["id"],
        "feedbackStatus": log["feedback_status"],
        "adminFeedback": log["admin_feedback"],
    }
