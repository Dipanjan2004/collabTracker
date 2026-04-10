from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.task_template import TemplateCreate

router = APIRouter()


@router.get("")
async def get_templates(current_user: dict = Depends(get_current_user)):
    supabase = get_admin_client()
    response = (
        supabase.table("task_templates")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return [transform_record(t) for t in response.data]


@router.post("")
async def create_template(
    body: TemplateCreate, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    template_data = {
        "name": body.name,
        "title": body.title,
        "description": body.description or "",
        "tags": body.tags or [],
        "priority": body.priority or "medium",
        "estimated_hours": body.estimatedHours or 0,
        "created_by": current_user["id"],
    }

    response = supabase.table("task_templates").insert(template_data).execute()
    return transform_record(response.data[0])


@router.delete("/{template_id}")
async def delete_template(
    template_id: str, current_user: dict = Depends(get_current_user)
):
    supabase = get_admin_client()
    supabase.table("task_templates").delete().eq("id", template_id).execute()
    return {"success": True}
