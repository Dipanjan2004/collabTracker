import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def seed_data():
    print("Seeding database...")

    print("Creating admin user...")
    try:
        auth_response = supabase.auth.sign_up(
            {
                "email": "admin@collabtrack.app",
                "password": "Admin123!",
            }
        )
        if auth_response.user:
            admin_id = auth_response.user.id
            supabase.table("profiles").upsert(
                {
                    "id": admin_id,
                    "name": "Admin",
                    "email": "admin@collabtrack.app",
                    "role": "admin",
                    "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
                    "active": True,
                }
            ).execute()
            print(f"Admin user created: {admin_id}")
        else:
            print("Admin user may already exist, trying to find profile...")
            profile = (
                supabase.table("profiles")
                .select("*")
                .eq("email", "admin@collabtrack.app")
                .execute()
            )
            if profile.data:
                admin_id = profile.data[0]["id"]
                print(f"Admin user found: {admin_id}")
            else:
                print("Could not create admin user")
                return
    except Exception as e:
        print(f"Admin user creation note: {e}")
        profile = (
            supabase.table("profiles")
            .select("*")
            .eq("email", "admin@collabtrack.app")
            .execute()
        )
        if profile.data:
            admin_id = profile.data[0]["id"]
            print(f"Admin user found: {admin_id}")
        else:
            print("Could not find or create admin user")
            return

    print("Creating collaborator user...")
    try:
        collab_response = supabase.auth.sign_up(
            {
                "email": "collaborator@collabtrack.app",
                "password": "Collaborator123!",
            }
        )
        if collab_response.user:
            collab_id = collab_response.user.id
            supabase.table("profiles").upsert(
                {
                    "id": collab_id,
                    "name": "Collaborator",
                    "email": "collaborator@collabtrack.app",
                    "role": "collaborator",
                    "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Collaborator",
                    "active": True,
                }
            ).execute()
            print(f"Collaborator user created: {collab_id}")
        else:
            profile = (
                supabase.table("profiles")
                .select("*")
                .eq("email", "collaborator@collabtrack.app")
                .execute()
            )
            if profile.data:
                collab_id = profile.data[0]["id"]
                print(f"Collaborator user found: {collab_id}")
    except Exception as e:
        print(f"Collaborator user creation note: {e}")
        profile = (
            supabase.table("profiles")
            .select("*")
            .eq("email", "collaborator@collabtrack.app")
            .execute()
        )
        if profile.data:
            collab_id = profile.data[0]["id"]
            print(f"Collaborator user found: {collab_id}")
        else:
            collab_id = None

    print("Creating sample project...")
    project_response = (
        supabase.table("projects")
        .insert(
            {
                "name": "CollabTracker",
                "description": "A collaborative task tracking application",
                "color": "#6EE7B7",
                "created_by": admin_id,
            }
        )
        .execute()
    )

    if project_response.data:
        project_id = project_response.data[0]["id"]
        print(f"Sample project created: {project_id}")
    else:
        print("Project may already exist, skipping task creation")
        print("Seed completed!")
        return

    print("Creating sample tasks...")
    tasks_data = [
        {
            "title": "Set up project repository",
            "description": "Initialize the project with proper folder structure and configuration",
            "assigned_to": [admin_id],
            "tags": ["setup", "infrastructure"],
            "status": "done",
            "priority": "high",
            "estimated_hours": 4,
            "created_by": admin_id,
            "project_id": project_id,
        },
        {
            "title": "Design database schema",
            "description": "Create the database tables and relationships for the application",
            "assigned_to": [admin_id, collab_id] if collab_id else [admin_id],
            "tags": ["backend", "database"],
            "status": "in-progress",
            "priority": "high",
            "estimated_hours": 8,
            "created_by": admin_id,
            "project_id": project_id,
        },
        {
            "title": "Implement user authentication",
            "description": "Set up Supabase auth with login and registration",
            "assigned_to": [collab_id] if collab_id else [],
            "tags": ["backend", "auth"],
            "status": "todo",
            "priority": "high",
            "estimated_hours": 6,
            "created_by": admin_id,
            "project_id": project_id,
        },
    ]

    for task_data in tasks_data:
        supabase.table("tasks").insert(task_data).execute()

    print("Seed completed!")


if __name__ == "__main__":
    seed_data()
