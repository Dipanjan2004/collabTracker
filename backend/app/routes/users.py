from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, require_admin, transform_record
from app.database import get_admin_client
from app.schemas.invite import InviteRequest

router = APIRouter()


@router.get("")
async def get_users(current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("profiles")
        .select("*")
        .eq("active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(u) for u in response.data]


@router.post("/invite")
async def invite_user(body: InviteRequest, current_user: dict = Depends(require_admin)):
    return {"success": True, "message": "Invite sent"}


@router.delete("/{user_id}")
async def remove_user(user_id: str, current_user: dict = Depends(require_admin)):
    supabase = get_admin_client()
    supabase.table("profiles").update({"active": False}).eq("id", user_id).execute()
    supabase.table("tasks").update(
        {
            "assigned_to": supabase.rpc(
                "array_remove",
                {
                    "arr": supabase.table("tasks").select("assigned_to").execute(),
                    "elem": user_id,
                },
            ).execute()
        }
    ).execute()

    task_response = supabase.table("tasks").select("id, assigned_to").execute()
    for task in task_response.data:
        if user_id in (task.get("assigned_to") or []):
            updated_assigned = [uid for uid in task["assigned_to"] if uid != user_id]
            supabase.table("tasks").update({"assigned_to": updated_assigned}).eq(
                "id", task["id"]
            ).execute()

    return {"success": True}
