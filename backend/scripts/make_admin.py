import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def make_admin():
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        print("Example: python make_admin.py your@email.com")
        sys.exit(1)

    email = sys.argv[1]
    print(f"Making user {email} an admin...")

    profile = supabase.table("profiles").select("*").eq("email", email).execute()
    if not profile.data:
        print(f"User with email {email} not found")
        sys.exit(1)

    user_id = profile.data[0]["id"]
    supabase.table("profiles").update({"role": "admin"}).eq("id", user_id).execute()

    print(f"User {profile.data[0]['name']} ({email}) is now an admin")


if __name__ == "__main__":
    make_admin()
