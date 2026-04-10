from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.comment import CommentCreate, CommentUpdate

router = APIRouter()


@router.get("/task/{task_id}")
async def get_comments(task_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("comments")
        .select("*")
        .eq("task_id", task_id)
        .order("created_at", desc=False)
        .execute()
    )
    return [transform_record(c) for c in response.data]


@router.post("")
async def create_comment(
    body: CommentCreate, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    comment_data = {
        "task_id": body.taskId,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "content": body.content,
        "parent_id": body.parentId,
    }

    response = supabase.table("comments").insert(comment_data).execute()
    comment = response.data[0]

    supabase.table("activities").insert(
        {
            "user_id": current_user["id"],
            "user_name": current_user["name"],
            "action": "commented on task",
            "target_type": "task",
            "target_id": body.taskId,
        }
    ).execute()

    return transform_record(comment)


@router.put("/{comment_id}")
async def update_comment(
    comment_id: str, body: CommentUpdate, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    response = supabase.table("comments").select("*").eq("id", comment_id).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    comment = response.data[0]
    if comment["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    update_response = (
        supabase.table("comments")
        .update({"content": body.content})
        .eq("id", comment_id)
        .execute()
    )
    return transform_record(update_response.data[0])


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    response = (
        supabase.table("comments").select("user_id").eq("id", comment_id).execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    comment = response.data[0]
    if comment["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    supabase.table("comments").delete().eq("id", comment_id).execute()
    return {"success": True}
