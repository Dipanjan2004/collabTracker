from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.label import LabelCreate, LabelUpdate

router = APIRouter()


@router.get("")
async def list_labels(teamId: str | None = Query(None), user=Depends(get_current_user)):
    supabase = get_admin_client()
    query = supabase.table("labels").select("*")
    if teamId:
        query = query.eq("team_id", teamId)
    result = query.execute()
    return [transform_record(l) for l in result.data]


@router.post("")
async def create_label(body: LabelCreate, user=Depends(get_current_user)):
    supabase = get_admin_client()
    data = {
        "name": body.name,
        "color": body.color,
        "group_name": body.groupName,
    }
    if body.teamId:
        data["team_id"] = body.teamId
    result = supabase.table("labels").insert(data).execute()
    return transform_record(result.data[0])


@router.put("/{label_id}")
async def update_label(
    label_id: str, body: LabelUpdate, user=Depends(get_current_user)
):
    supabase = get_admin_client()
    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.color is not None:
        updates["color"] = body.color
    if body.groupName is not None:
        updates["group_name"] = body.groupName
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )
    result = supabase.table("labels").update(updates).eq("id", label_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Label not found"
        )
    return transform_record(result.data[0])


@router.delete("/{label_id}")
async def delete_label(label_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    # Clean up issue_labels references first
    supabase.table("issue_labels").delete().eq("label_id", label_id).execute()
    supabase.table("labels").delete().eq("id", label_id).execute()
    return {"success": True}
