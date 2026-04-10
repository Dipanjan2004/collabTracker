from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import PORT, NODE_ENV, FRONTEND_URL
from app.routes import (
    auth,
    users,
    tasks,
    projects,
    comments,
    notifications,
    progress,
    analytics,
    activity,
    dependencies,
    templates,
)

app = FastAPI(title="CollabTracker API", version="2.0.0", redirect_slashes=False)

origins = FRONTEND_URL.split(",") if FRONTEND_URL else ["*"]
if NODE_ENV == "development":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": NODE_ENV,
    }


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(comments.router, prefix="/api/comments", tags=["comments"])
app.include_router(
    notifications.router, prefix="/api/notifications", tags=["notifications"]
)
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(activity.router, prefix="/api/activity", tags=["activity"])
app.include_router(
    dependencies.router, prefix="/api/dependencies", tags=["dependencies"]
)
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])


from fastapi.responses import JSONResponse


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback

    traceback.print_exc()
    error_msg = "Internal server error" if NODE_ENV == "production" else str(exc)
    return JSONResponse(status_code=500, content={"error": error_msg})
