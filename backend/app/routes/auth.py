from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest
from app.database import get_admin_client, create_auth_client
from app.auth import transform_record
import re

router = APIRouter()


def extract_domain(email: str) -> str:
    return email.split("@")[-1].lower()


def generate_slug(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug[:50] or "org"


@router.post("/register")
async def register(body: RegisterRequest):
    domain = extract_domain(body.email)
    supabase = get_admin_client()

    existing_org = (
        supabase.table("organizations").select("*").eq("domain", domain).execute()
    )

    is_new_org = not existing_org.data
    organization = None

    auth_client = create_auth_client()
    try:
        auth_response = auth_client.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )
        if "disabled" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email/password registration is not enabled in Supabase.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
        )

    if not auth_response.user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )

    user_id = auth_response.user.id

    if is_new_org:
        org_name = body.organizationName or domain.split(".")[0].title()
        slug = generate_slug(org_name)

        slug_check = (
            supabase.table("organizations").select("id").eq("slug", slug).execute()
        )
        if slug_check.data:
            slug = f"{slug}-{domain.split('.')[0]}"

        org_response = (
            supabase.table("organizations")
            .insert(
                {
                    "name": org_name,
                    "domain": domain,
                    "slug": slug,
                    "created_by": user_id,
                }
            )
            .execute()
        )
        organization = org_response.data[0]
    else:
        organization = existing_org.data[0]

    avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={body.name}"

    supabase.table("profiles").insert(
        {
            "id": user_id,
            "name": body.name,
            "email": body.email,
            "role": "admin" if is_new_org else "collaborator",
            "avatar_url": avatar_url,
            "active": True,
            "organization_id": organization["id"],
        }
    ).execute()

    if is_new_org:
        team_response = (
            supabase.table("teams")
            .insert(
                {
                    "name": "General",
                    "identifier": "GEN",
                    "description": "Default team",
                    "color": "#6EE7B7",
                    "organization_id": organization["id"],
                    "created_by": user_id,
                }
            )
            .execute()
        )
        team = team_response.data[0]

        supabase.table("team_counters").insert(
            {"team_id": team["id"], "next_issue_number": 1}
        ).execute()

        supabase.table("team_members").insert(
            {
                "team_id": team["id"],
                "user_id": user_id,
                "role": "owner",
            }
        ).execute()
    else:
        teams_response = (
            supabase.table("teams")
            .select("id")
            .eq("organization_id", organization["id"])
            .execute()
        )
        if teams_response.data:
            for team in teams_response.data:
                existing_member = (
                    supabase.table("team_members")
                    .select("*")
                    .eq("team_id", team["id"])
                    .eq("user_id", user_id)
                    .execute()
                )
                if not existing_member.data:
                    supabase.table("team_members").insert(
                        {
                            "team_id": team["id"],
                            "user_id": user_id,
                            "role": "member",
                        }
                    ).execute()

    profile_response = (
        supabase.table("profiles").select("*").eq("id", user_id).execute()
    )
    profile = profile_response.data[0] if profile_response.data else None
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create profile",
        )

    token = None
    if auth_response.session:
        token = auth_response.session.access_token
    else:
        try:
            sign_in_client = create_auth_client()
            sign_in_response = sign_in_client.auth.sign_in_with_password(
                {
                    "email": body.email,
                    "password": body.password,
                }
            )
            token = sign_in_response.session.access_token
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Registration succeeded but login failed.",
            )

    return {
        "token": token,
        "user": transform_record(profile),
        "organization": transform_record(organization),
        "isNewOrganization": is_new_org,
    }


@router.post("/login")
async def login(body: LoginRequest):
    auth_client = create_auth_client()
    try:
        auth_response = auth_client.auth.sign_in_with_password(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except Exception as e:
        error_msg = str(e)
        if "disabled" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email/password login is not enabled.",
            )
        if "invalid" in error_msg.lower() or "wrong" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg
        )

    if not auth_response.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    user_id = auth_response.user.id
    token = auth_response.session.access_token

    supabase = get_admin_client()
    profile_response = (
        supabase.table("profiles").select("*").eq("id", user_id).execute()
    )
    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User profile not found"
        )

    profile = profile_response.data[0]
    if not profile.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is deactivated"
        )

    organization = None
    if profile.get("organization_id"):
        org_response = (
            supabase.table("organizations")
            .select("*")
            .eq("id", profile["organization_id"])
            .execute()
        )
        if org_response.data:
            organization = transform_record(org_response.data[0])

    return {
        "token": token,
        "user": transform_record(profile),
        "organization": organization,
    }


@router.get("/check-domain")
async def check_domain(email: str):
    domain = extract_domain(email)
    supabase = get_admin_client()
    org_response = (
        supabase.table("organizations")
        .select("id, name, domain")
        .eq("domain", domain)
        .execute()
    )
    return {
        "domain": domain,
        "hasOrganization": len(org_response.data) > 0,
        "organization": transform_record(org_response.data[0])
        if org_response.data
        else None,
    }
