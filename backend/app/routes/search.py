import re
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client

router = APIRouter()


def _sanitize_search(q: str) -> str:
    """Escape special PostgREST/SQL LIKE characters."""
    q = q.replace("\\", "\\\\")
    q = q.replace("%", "\\%")
    q = q.replace("_", "\\_")
    # Remove characters that could break PostgREST filter syntax
    q = re.sub(r"[(),.]", "", q)
    return q


@router.get("")
async def search(
    q: str = Query("", max_length=200),
    limit: int = Query(10, ge=1, le=50),
    user=Depends(get_current_user),
):
    if not q.strip():
        return []

    supabase = get_admin_client()
    results = []
    safe_q = _sanitize_search(q.strip())
    pattern = f"%{safe_q}%"

    tasks = (
        supabase.table("tasks")
        .select("id, title, identifier, status")
        .or_(f"title.ilike.{pattern},identifier.ilike.{pattern}")
        .limit(limit)
        .execute()
    )
    for t in tasks.data:
        results.append(
            {
                "type": "issue",
                "id": t["id"],
                "title": t["title"],
                "identifier": t.get("identifier"),
            }
        )

    projects = (
        supabase.table("projects")
        .select("id, name")
        .ilike("name", pattern)
        .limit(limit)
        .execute()
    )
    for p in projects.data:
        results.append({"type": "project", "id": p["id"], "title": p["name"]})

    profiles = (
        supabase.table("profiles")
        .select("id, name")
        .ilike("name", pattern)
        .limit(limit)
        .execute()
    )
    for p in profiles.data:
        results.append({"type": "user", "id": p["id"], "title": p["name"]})

    return results[:limit]
