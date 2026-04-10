from fastapi import APIRouter, Depends
from app.auth import get_current_user, transform_record
from app.database import get_admin_client

router = APIRouter()


@router.get("")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(n) for n in response.data]


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    supabase.table("notifications").update({"read": True}).eq(
        "id", notification_id
    ).execute()
    return {"success": True}
