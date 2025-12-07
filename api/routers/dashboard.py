"""
Dashboard endpoints for homepage data
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func

from models import DashboardResponse, DashboardStats, RecentActivity, CampaignStatus
from database import get_db
from db_models import Campaign as DBCampaign, CampaignStatusEnum
from utils import map_db_status_to_pydantic

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(db: Session = Depends(get_db)):
    """
    Get dashboard data including statistics and recent activity
    
    Returns:
    - Stats: Total campaigns, leads found this month
    - Recent Activity: List of recent campaigns with status
    """
    # Calculate start of current month
    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)
    
    # Get total campaigns
    total_campaigns = db.query(func.count(DBCampaign.id)).scalar() or 0
    
    # Get total leads found this month
    total_leads_found = db.query(func.sum(DBCampaign.leads_found)).filter(
        DBCampaign.created_at >= start_of_month
    ).scalar() or 0
    
    stats = DashboardStats(
        total_campaigns=total_campaigns,
        total_leads_found=int(total_leads_found)
    )
    
    # Get recent campaigns (last 5, ordered by created_at desc)
    recent_campaigns = db.query(DBCampaign).order_by(
        DBCampaign.created_at.desc()
    ).limit(5).all()
    
    recent_activity = [
        RecentActivity(
            id=campaign.id,
            name=f"{campaign.product_service} - {campaign.area}",
            status=map_db_status_to_pydantic(campaign.status)
        )
        for campaign in recent_campaigns
    ]
    
    return DashboardResponse(
        stats=stats,
        recent_activity=recent_activity
    )

