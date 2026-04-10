from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest
from app.database import get_admin_client, create_auth_client
from app.auth import transform_record

router = APIRouter()


@router.post("/register")
async def register(body: RegisterRequest):
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
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists"
            )
        if "disabled" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email/password registration is not enabled in Supabase. Enable it in Authentication > Providers in your Supabase dashboard.",
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
    avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={body.name}"

    supabase = get_admin_client()
    supabase.table("profiles").insert(
        {
            "id": user_id,
            "name": body.name,
            "email": body.email,
            "role": "collaborator",
            "avatar_url": avatar_url,
            "active": True,
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
                detail="Registration succeeded but login failed. Please log in manually.",
            )

    return {
        "token": token,
        "user": transform_record(profile),
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
        print(f"[DEBUG] Login error for {body.email}: {error_msg}")
        if "disabled" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email/password login is not enabled in Supabase. Enable it in Authentication > Providers in your Supabase dashboard.",
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

    return {
        "token": token,
        "user": transform_record(profile),
    }
