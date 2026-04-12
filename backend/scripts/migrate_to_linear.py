import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

LABEL_COLORS = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#84CC16",
    "#22C55E",
    "#14B8A6",
    "#06B6D4",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#EC4899",
    "#F43F5E",
    "#64748B",
    "#6B7280",
]


def migrate():
    print("Starting Linear transform migration...")

    print("\n1. Creating default team...")
    existing = supabase.table("teams").select("*").eq("identifier", "GEN").execute()
    if existing.data:
        team = existing.data[0]
        print(f"   Team already exists: {team['id']}")
    else:
        admin_profile = (
            supabase.table("profiles")
            .select("*")
            .eq("role", "admin")
            .limit(1)
            .execute()
        )
        creator_id = admin_profile.data[0]["id"] if admin_profile.data else None
        if not creator_id:
            profiles = supabase.table("profiles").select("*").limit(1).execute()
            creator_id = profiles.data[0]["id"]

        team = (
            supabase.table("teams")
            .insert(
                {
                    "name": "General",
                    "identifier": "GEN",
                    "description": "Default team",
                    "color": "#6EE7B7",
                    "created_by": creator_id,
                }
            )
            .execute()
            .data[0]
        )
        print(f"   Created team: {team['id']}")

    team_id = team["id"]

    print("\n2. Setting up team counter...")
    existing_counter = (
        supabase.table("team_counters").select("*").eq("team_id", team_id).execute()
    )
    if not existing_counter.data:
        supabase.table("team_counters").insert(
            {"team_id": team_id, "next_issue_number": 1}
        ).execute()
        print("   Created counter")

    print("\n3. Adding all profiles as team members...")
    profiles = supabase.table("profiles").select("*").execute()
    for profile in profiles.data:
        existing_member = (
            supabase.table("team_members")
            .select("*")
            .eq("team_id", team_id)
            .eq("user_id", profile["id"])
            .execute()
        )
        if not existing_member.data:
            role = "owner" if profile["role"] == "admin" else "member"
            supabase.table("team_members").insert(
                {
                    "team_id": team_id,
                    "user_id": profile["id"],
                    "role": role,
                }
            ).execute()
            print(f"   Added {profile['name']} as {role}")

    print("\n4. Creating labels from existing tags...")
    tasks = supabase.table("tasks").select("tags").execute()
    all_tags = set()
    for task in tasks.data:
        for tag in task.get("tags") or []:
            all_tags.add(tag)

    tag_to_label = {}
    for i, tag in enumerate(sorted(all_tags)):
        color = LABEL_COLORS[i % len(LABEL_COLORS)]
        existing_label = (
            supabase.table("labels")
            .select("*")
            .eq("name", tag)
            .eq("team_id", team_id)
            .execute()
        )
        if existing_label.data:
            tag_to_label[tag] = existing_label.data[0]["id"]
        else:
            label = (
                supabase.table("labels")
                .insert(
                    {
                        "name": tag,
                        "color": color,
                        "team_id": team_id,
                    }
                )
                .execute()
                .data[0]
            )
            tag_to_label[tag] = label["id"]
            print(f"   Created label: {tag} ({color})")

    print("\n5. Assigning tasks to team and generating identifiers...")
    tasks = supabase.table("tasks").select("*").order("created_at").execute()
    issue_number = 0
    for task in tasks.data:
        issue_number += 1
        updates = {
            "team_id": team_id,
            "issue_number": issue_number,
            "identifier": f"GEN-{issue_number}",
        }
        if task.get("assigned_to") and len(task["assigned_to"]) > 0:
            updates["assignee_id"] = task["assigned_to"][0]

        supabase.table("tasks").update(updates).eq("id", task["id"]).execute()

        for tag in task.get("tags") or []:
            label_id = tag_to_label.get(tag)
            if label_id:
                try:
                    supabase.table("issue_labels").insert(
                        {
                            "issue_id": task["id"],
                            "label_id": label_id,
                        }
                    ).execute()
                except Exception:
                    pass

    supabase.table("team_counters").update({"next_issue_number": issue_number + 1}).eq(
        "team_id", team_id
    ).execute()

    print(f"\n   Migrated {issue_number} tasks")
    print(f"   Created {len(tag_to_label)} labels")
    print("\nMigration complete!")


if __name__ == "__main__":
    migrate()
