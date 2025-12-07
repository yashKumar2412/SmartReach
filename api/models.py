"""
Data models for SmartReach API
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class CampaignStatus(str, Enum):
    """Campaign status enumeration"""
    RESEARCH_IN_PROGRESS = "research-in-progress"
    RESEARCH_COMPLETE = "research-complete"
    GENERATION_IN_PROGRESS = "generation-in-progress"
    GENERATION_COMPLETE = "generation-complete"
    COMPLETED = "completed"


class Campaign(BaseModel):
    """Campaign model"""
    id: str
    product_service: str
    area: str
    context: Optional[str] = None
    max_leads: int = 10
    status: CampaignStatus
    leads_found: int
    leads_selected: int
    created_at: str  # ISO format string
    
    class Config:
        from_attributes = True


class Message(BaseModel):
    """Generated message for a lead"""
    id: str
    company_name: str
    industry: str
    location: str
    content: str
    quality_score: int


class CampaignDetail(Campaign):
    """Campaign with messages"""
    messages: list[Message]


class RecentActivity(BaseModel):
    """Recent activity item for dashboard"""
    id: str
    name: str  # Combination of product_service and area
    status: CampaignStatus


class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_campaigns: int
    total_leads_found: int  # This month


class DashboardResponse(BaseModel):
    """Dashboard response with stats and recent activity"""
    stats: DashboardStats
    recent_activity: list[RecentActivity]


# --- Company Profile Models ---
class CompanyProfile(BaseModel):
    """Company profile model"""
    company_name: Optional[str] = None
    services: list[str] = []


class CompanyProfileResponse(BaseModel):
    """Response for company profile"""
    company_name: Optional[str] = None
    services: list[str] = []


class UpdateCompanyProfileRequest(BaseModel):
    """Request to update company profile"""
    company_name: Optional[str] = None
    services: Optional[list[str]] = None

