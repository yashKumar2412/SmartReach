"""
History endpoints for campaign data
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session

from models import Campaign, CampaignDetail, CampaignStatus, Message
from database import get_db
from db_models import Campaign as DBCampaign, Message as DBMessage, CampaignStatusEnum
from utils import map_db_status_to_pydantic

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/", response_model=List[Campaign])
async def get_campaigns(db: Session = Depends(get_db)):
    """
    Get all campaigns
    
    Returns:
    - List of campaigns with basic info, ordered by created_at desc
    """
    db_campaigns = db.query(DBCampaign).order_by(DBCampaign.created_at.desc()).all()
    
    campaigns = [
        Campaign(
            id=campaign.id,
            product_service=campaign.product_service,
            area=campaign.area,
            context=campaign.context,
            max_leads=campaign.max_leads,
            status=map_db_status_to_pydantic(campaign.status),
            leads_found=campaign.leads_found,
            leads_selected=campaign.leads_selected,
            created_at=campaign.created_at.isoformat()
        )
        for campaign in db_campaigns
    ]
    
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignDetail)
async def get_campaign_detail(campaign_id: str, db: Session = Depends(get_db)):
    """
    Get campaign detail with messages
    
    Returns:
    - Campaign details with all generated messages
    """
    # Get campaign from database
    db_campaign = db.query(DBCampaign).filter(DBCampaign.id == campaign_id).first()
    
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Get messages for this campaign
    db_messages = db.query(DBMessage).filter(DBMessage.campaign_id == campaign_id).order_by(DBMessage.quality_score.desc()).all()
    
    messages = [
        Message(
            id=msg.id,
            company_name=msg.company_name,
            industry=msg.industry,
            location=msg.location,
            content=msg.content,
            quality_score=msg.quality_score
        )
        for msg in db_messages
    ]
    
    return CampaignDetail(
        id=db_campaign.id,
        product_service=db_campaign.product_service,
        area=db_campaign.area,
        context=db_campaign.context,
        max_leads=db_campaign.max_leads,
        status=map_db_status_to_pydantic(db_campaign.status),
        leads_found=db_campaign.leads_found,
        leads_selected=db_campaign.leads_selected,
        created_at=db_campaign.created_at.isoformat(),
        messages=messages
    )


@router.delete("/{campaign_id}")
async def delete_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """
    Delete a campaign and all its messages
    
    Returns:
    - Success message
    """
    # Get campaign from database
    db_campaign = db.query(DBCampaign).filter(DBCampaign.id == campaign_id).first()
    
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Delete campaign (messages will be deleted automatically due to cascade)
    db.delete(db_campaign)
    db.commit()
    
    return {"message": "Campaign deleted successfully"}

