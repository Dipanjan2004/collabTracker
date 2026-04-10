from fastapi import APIRouter, Depends
from app.auth import get_current_user, transform_record
from app.database import get_admin_client

router = APIRouter()


@router.get("")
async def get_all_activities(current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("activities")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(a) for a in response.data]


@router.get("/task/{task_id}")
async def get_task_activities(
    task_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    response = (
        supabase.table("activities")
        .select("*")
        .eq("target_type", "task")
        .eq("target_id", task_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(a) for a in response.data]


@router.get("/user/{user_id}")
async def get_user_activities(
    user_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    response = (
        supabase.table("activities")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(a) for a in response.data]
