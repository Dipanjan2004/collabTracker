from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, transform_record
from app.database import get_admin_client
from app.schemas.team import TeamCreate, TeamUpdate, TeamMemberAdd

router = APIRouter()


def _get_member_role(supabase, team_id: str, user_id: str) -> str | None:
    """Return the user's role in the team, or None if not a member."""
    result = (
        supabase.table("team_members")
        .select("role")
        .eq("team_id", team_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0]["role"] if result.data else None


def _require_team_admin(supabase, team_id: str, user_id: str):
    """Raise 403 if user is not an owner or admin of the team."""
    role = _get_member_role(supabase, team_id, user_id)
    if role not in ("owner", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a team owner or admin to perform this action",
        )


@router.get("")
async def list_teams(user=Depends(get_current_user)):
    supabase = get_admin_client()
    member_of = (
        supabase.table("team_members")
        .select("team_id")
        .eq("user_id", user["id"])
        .execute()
    )
    team_ids = [m["team_id"] for m in member_of.data]
    if not team_ids:
        return []
    teams = supabase.table("teams").select("*").in_("id", team_ids).execute()
    return [transform_record(t) for t in teams.data]


@router.post("")
async def create_team(body: TeamCreate, user=Depends(get_current_user)):
    supabase = get_admin_client()
    # Check identifier uniqueness
    existing = (
        supabase.table("teams")
        .select("id")
        .eq("identifier", body.identifier)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Team identifier '{body.identifier}' is already in use",
        )
    team = (
        supabase.table("teams")
        .insert(
            {
                "name": body.name,
                "identifier": body.identifier,
                "description": body.description,
                "color": body.color,
                "created_by": user["id"],
            }
        )
        .execute()
    )
    team_data = transform_record(team.data[0])
    supabase.table("team_counters").insert(
        {"team_id": team_data["id"], "next_issue_number": 1}
    ).execute()
    supabase.table("team_members").insert(
        {"team_id": team_data["id"], "user_id": user["id"], "role": "owner"}
    ).execute()
    return team_data


@router.put("/{team_id}")
async def update_team(team_id: str, body: TeamUpdate, user=Depends(get_current_user)):
    supabase = get_admin_client()
    _require_team_admin(supabase, team_id, user["id"])
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )
    result = supabase.table("teams").update(updates).eq("id", team_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Team not found"
        )
    return transform_record(result.data[0])


@router.delete("/{team_id}")
async def delete_team(team_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    role = _get_member_role(supabase, team_id, user["id"])
    if role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners can delete a team",
        )
    supabase.table("teams").delete().eq("id", team_id).execute()
    return {"success": True}


@router.get("/{team_id}/members")
async def list_members(team_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    # Any team member can list members
    if not _get_member_role(supabase, team_id, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team",
        )
    members = (
        supabase.table("team_members")
        .select("*, profiles(*)")
        .eq("team_id", team_id)
        .execute()
    )
    result = []
    for m in members.data:
        profile = transform_record(m["profiles"]) if m.get("profiles") else None
        result.append(
            {
                "teamId": m["team_id"],
                "userId": m["user_id"],
                "role": m["role"],
                "createdAt": m["created_at"],
                "user": profile,
            }
        )
    return result


@router.post("/{team_id}/members")
async def add_member(team_id: str, body: TeamMemberAdd, user=Depends(get_current_user)):
    supabase = get_admin_client()
    _require_team_admin(supabase, team_id, user["id"])
    # Prevent duplicate membership
    existing = (
        supabase.table("team_members")
        .select("user_id")
        .eq("team_id", team_id)
        .eq("user_id", body.userId)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member of this team",
        )
    supabase.table("team_members").insert(
        {"team_id": team_id, "user_id": body.userId, "role": body.role}
    ).execute()
    return {"success": True}


@router.delete("/{team_id}/members/{user_id}")
async def remove_member(team_id: str, user_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    _require_team_admin(supabase, team_id, user["id"])
    # Prevent removing the last owner
    if user_id != user["id"]:
        target_role = _get_member_role(supabase, team_id, user_id)
        if target_role == "owner":
            owners = (
                supabase.table("team_members")
                .select("user_id")
                .eq("team_id", team_id)
                .eq("role", "owner")
                .execute()
            )
            if len(owners.data) <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove the last owner of a team",
                )
    supabase.table("team_members").delete().eq("team_id", team_id).eq(
        "user_id", user_id
    ).execute()
    return {"success": True}
