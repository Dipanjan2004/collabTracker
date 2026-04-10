import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def create_admin():
    email = sys.argv[1] if len(sys.argv) > 1 else "admin@collabtrack.app"
    password = sys.argv[2] if len(sys.argv) > 2 else "Admin123!"

    print(f"Creating admin user: {email}")

    try:
        auth_response = supabase.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
            }
        )
        user_id = auth_response.user.id
        print(f"Auth user created: {user_id}")
    except Exception as e:
        if "already been registered" in str(e) or "already exists" in str(e):
            print(f"User {email} already exists in auth")
            profile = (
                supabase.table("profiles").select("id").eq("email", email).execute()
            )
            if profile.data:
                user_id = profile.data[0]["id"]
                print(f"Found existing profile: {user_id}")
            else:
                print("Could not find existing user profile")
                return
        else:
            print(f"Error creating auth user: {e}")
            return

    supabase.table("profiles").upsert(
        {
            "id": user_id,
            "name": "Admin",
            "email": email,
            "role": "admin",
            "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
            "active": True,
        }
    ).execute()

    supabase.table("profiles").update({"role": "admin"}).eq("id", user_id).execute()

    print(f"Admin user created/updated: {email}")
    print(f"Password: {password}")


if __name__ == "__main__":
    create_admin()
