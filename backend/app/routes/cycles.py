from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.cycle import CycleCreate, CycleUpdate

router = APIRouter()


@router.get("")
async def list_cycles(
    teamId: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    user=Depends(get_current_user),
):
    supabase = get_admin_client()
    query = supabase.table("cycles").select("*").order("created_at", desc=True)
    if teamId:
        query = query.eq("team_id", teamId)
    if status_filter:
        query = query.eq("status", status_filter)
    result = query.execute()
    return [transform_record(c) for c in result.data]


@router.post("")
async def create_cycle(body: CycleCreate, user=Depends(get_current_user)):
    supabase = get_admin_client()
    count_result = (
        supabase.table("cycles")
        .select("id", count="exact")
        .eq("team_id", body.teamId)
        .execute()
    )
    cycle_number = (count_result.count or 0) + 1
    result = (
        supabase.table("cycles")
        .insert(
            {
                "team_id": body.teamId,
                "name": body.name or f"Cycle {cycle_number}",
                "number": cycle_number,
                "start_date": body.startDate,
                "end_date": body.endDate,
                "status": "upcoming",
                "created_by": user["id"],
            }
        )
        .execute()
    )
    return transform_record(result.data[0])


@router.put("/{cycle_id}")
async def update_cycle(
    cycle_id: str, body: CycleUpdate, user=Depends(get_current_user)
):
    supabase = get_admin_client()
    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.startDate is not None:
        updates["start_date"] = body.startDate
    if body.endDate is not None:
        updates["end_date"] = body.endDate
    if body.status is not None:
        updates["status"] = body.status
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )
    result = supabase.table("cycles").update(updates).eq("id", cycle_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cycle not found"
        )
    return transform_record(result.data[0])


@router.delete("/{cycle_id}")
async def delete_cycle(cycle_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    # Unlink tasks from this cycle before deleting
    supabase.table("tasks").update({"cycle_id": None}).eq(
        "cycle_id", cycle_id
    ).execute()
    supabase.table("cycles").delete().eq("id", cycle_id).execute()
    return {"success": True}


@router.post("/{cycle_id}/complete")
async def complete_cycle(cycle_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    result = (
        supabase.table("cycles")
        .update({"status": "completed"})
        .eq("id", cycle_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cycle not found"
        )
    return {"success": True}
