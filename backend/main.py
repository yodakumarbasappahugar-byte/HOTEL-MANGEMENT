from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os

app = FastAPI(title="LuxeStays Hotel Management API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str

@app.get("/", response_model=HealthCheck)
async def root():
    return HealthCheck(
        status="active",
        timestamp=datetime.now(),
        version="1.0.0"
    )

@app.get("/api/status")
async def api_status():
    return {
        "service": "LuxeStays Backend",
        "database": getattr(os.environ, "DATABASE_URL", "not_configured"),
        "environment": "production"
    }

# Remaining logic (users, bookings, etc.) would be added here
