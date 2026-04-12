from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.custom_view import CustomViewCreate, CustomViewUpdate

router = APIRouter()


@router.get("")
async def list_views(user=Depends(get_current_user)):
    supabase = get_admin_client()
    result = (
        supabase.table("custom_views")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(v) for v in result.data]


@router.post("")
async def create_view(body: CustomViewCreate, user=Depends(get_current_user)):
    supabase = get_admin_client()
    data = {
        "name": body.name,
        "description": body.description,
        "icon": body.icon,
        "filters": body.filters,
        "sort_by": body.sortBy,
        "sort_order": body.sortOrder,
        "group_by": body.groupBy,
        "layout": body.layout,
        "user_id": user["id"],
        "is_favorite": body.isFavorite,
    }
    if body.teamId:
        data["team_id"] = body.teamId
    result = supabase.table("custom_views").insert(data).execute()
    return transform_record(result.data[0])


@router.put("/{view_id}")
async def update_view(
    view_id: str, body: CustomViewUpdate, user=Depends(get_current_user)
):
    supabase = get_admin_client()
    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.description is not None:
        updates["description"] = body.description
    if body.filters is not None:
        updates["filters"] = body.filters
    if body.sortBy is not None:
        updates["sort_by"] = body.sortBy
    if body.sortOrder is not None:
        updates["sort_order"] = body.sortOrder
    if body.groupBy is not None:
        updates["group_by"] = body.groupBy
    if body.layout is not None:
        updates["layout"] = body.layout
    if body.isFavorite is not None:
        updates["is_favorite"] = body.isFavorite
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )
    result = (
        supabase.table("custom_views")
        .update(updates)
        .eq("id", view_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="View not found"
        )
    return transform_record(result.data[0])


@router.delete("/{view_id}")
async def delete_view(view_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    supabase.table("custom_views").delete().eq("id", view_id).eq(
        "user_id", user["id"]
    ).execute()
    return {"success": True}
