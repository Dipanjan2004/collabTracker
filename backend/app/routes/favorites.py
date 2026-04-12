from fastapi import APIRouter, Depends
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.favorite import FavoriteCreate

router = APIRouter()


@router.get("")
async def list_favorites(user=Depends(get_current_user)):
    supabase = get_admin_client()
    result = (
        supabase.table("favorites")
        .select("*")
        .eq("user_id", user["id"])
        .order("sort_order")
        .execute()
    )
    return [transform_record(f) for f in result.data]


@router.post("")
async def add_favorite(body: FavoriteCreate, user=Depends(get_current_user)):
    supabase = get_admin_client()
    result = (
        supabase.table("favorites")
        .insert(
            {
                "user_id": user["id"],
                "target_type": body.targetType,
                "target_id": body.targetId,
            }
        )
        .execute()
    )
    return transform_record(result.data[0])


@router.delete("/{favorite_id}")
async def remove_favorite(favorite_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    supabase.table("favorites").delete().eq("id", favorite_id).eq(
        "user_id", user["id"]
    ).execute()
    return {"success": True}
