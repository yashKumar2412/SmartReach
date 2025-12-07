"""
SmartReach API - Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import dashboard, history, campaigns, profile
from database import init_db

app = FastAPI(title="SmartReach API", version="0.1.0")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup"""
    init_db()

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router)
app.include_router(history.router)
app.include_router(campaigns.router)
app.include_router(profile.router)


@app.get("/")
async def root():
    return {"message": "SmartReach API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

