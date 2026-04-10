from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from app.auth import get_current_user
from app.database import get_admin_client

router = APIRouter()


@router.get("/overview")
async def get_analytics_overview(
    time_range: str = Query("week", alias="range"),
    current_user: dict = Depends(get_current_user),
):
    supabase = get_admin_client()

    tasks_response = supabase.table("tasks").select("*").eq("archived", False).execute()
    progress_response = supabase.table("progress_logs").select("*").execute()
    users_response = (
        supabase.table("profiles")
        .select("*")
        .eq("role", "collaborator")
        .eq("active", True)
        .execute()
    )

    tasks = tasks_response.data
    progress = progress_response.data
    users = users_response.data

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    recent_progress = [
        p
        for p in progress
        if p.get("created_at")
        and datetime.fromisoformat(p["created_at"].replace("Z", "+00:00")) > week_ago
    ]

    hours_this_week = round(sum(p.get("hours_spent", 0) for p in recent_progress), 1)

    weekly_hours_data = []
    for i in range(6, -1, -1):
        date = now - timedelta(days=i)
        day_str = date.strftime("%a")
        day_progress = [
            p
            for p in progress
            if p.get("created_at")
            and datetime.fromisoformat(p["created_at"].replace("Z", "+00:00")).strftime(
                "%Y-%m-%d"
            )
            == date.strftime("%Y-%m-%d")
        ]
        hours = round(sum(p.get("hours_spent", 0) for p in day_progress), 1)
        weekly_hours_data.append({"date": day_str, "hours": hours})

    status_counts = {}
    for t in tasks:
        s = t.get("status", "todo")
        status_counts[s] = status_counts.get(s, 0) + 1

    status_labels = {
        "todo": "To Do",
        "in-progress": "In Progress",
        "review": "Review",
        "done": "Done",
        "blocked": "Blocked",
    }

    task_status_distribution = []
    for status_key, label in status_labels.items():
        if status_key in status_counts:
            status_tasks = [t for t in tasks if t.get("status") == status_key]
            collaborator_ids = set()
            for t in status_tasks:
                for uid in t.get("assigned_to", []):
                    collaborator_ids.add(uid)

            user_names = []
            for uid in collaborator_ids:
                user_match = [u for u in users if u["id"] == uid]
                if user_match:
                    user_names.append(user_match[0]["name"])

            task_status_distribution.append(
                {
                    "status": label,
                    "count": status_counts[status_key],
                    "collaborators": user_names,
                }
            )

    top_contributors = []
    for u in users:
        user_progress = [p for p in progress if p.get("user_id") == u["id"]]
        hours = round(sum(p.get("hours_spent", 0) for p in user_progress), 1)
        top_contributors.append({"name": u["name"], "hours": hours})

    top_contributors.sort(key=lambda x: x["hours"], reverse=True)

    overdue_tasks = sum(
        1
        for t in tasks
        if t.get("deadline")
        and datetime.fromisoformat(t["deadline"].replace("Z", "+00:00")) < now
        and t.get("status") != "done"
    )

    return {
        "tasksCompleted": status_counts.get("done", 0),
        "activeContributors": len(users),
        "hoursThisWeek": hours_this_week,
        "weeklyHoursData": weekly_hours_data,
        "taskStatusDistribution": task_status_distribution,
        "topContributors": top_contributors[:5],
        "overdueTasks": overdue_tasks,
    }
