"""
Campaign endpoints for lead generation workflow
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import asyncio

from agents.orchestrator import CampaignOrchestrator
from models import CampaignStatus
from database import get_db, SessionLocal
from db_models import Campaign as DBCampaign, Message as DBMessage, CampaignStatusEnum, UserProfile as DBUserProfile

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

# In-memory storage for active campaigns (will be replaced with database)
active_campaigns: Dict[str, Dict[str, Any]] = {}


# Request/Response Models
class ResearchRequest(BaseModel):
    """Request to start lead research"""
    product_service: str
    area: str
    context: Optional[str] = None
    angle: Optional[str] = None  # How the user can help potential leads
    max_leads: int = 10


class LeadResponse(BaseModel):
    """Lead information response"""
    id: str
    name: str
    industry: str
    location: str
    description: str
    relevance_reason: Optional[str] = None
    recent_news: Optional[str] = None


class ResearchResponse(BaseModel):
    """Response from research endpoint"""
    campaign_id: str
    leads: List[LeadResponse]
    status: str


class GenerateRequest(BaseModel):
    """Request to generate content for selected leads"""
    campaign_id: str
    selected_lead_ids: List[str]
    product_service: str
    context: Optional[str] = None
    angle: Optional[str] = None  # How the user can help potential leads


class MessageResponse(BaseModel):
    """Generated message response"""
    id: str
    company_name: str
    industry: str
    location: str
    content: str
    quality_score: int


class GenerateResponse(BaseModel):
    """Response from content generation endpoint"""
    campaign_id: str
    messages: List[MessageResponse]
    average_quality_score: float


class SaveCampaignRequest(BaseModel):
    """Request to save a completed campaign"""
    campaign_id: str
    product_service: str
    area: str
    context: Optional[str] = None
    max_leads: int
    leads_found: int
    leads_selected: int
    messages: List[MessageResponse]


class SaveCampaignResponse(BaseModel):
    """Response from save campaign endpoint"""
    campaign_id: str
    status: str
    message: str


@router.post("/research", response_model=ResearchResponse)
async def start_research(request: ResearchRequest, db: Session = Depends(get_db)):
    """
    Start lead research for a new campaign
    
    Returns:
        Campaign ID and list of researched leads
    """
    try:
        orchestrator = CampaignOrchestrator()
        
        # Create campaign ID first
        campaign_id = str(uuid.uuid4())
        
        # Save campaign to database immediately with RESEARCH_IN_PROGRESS status
        db_campaign = DBCampaign(
            id=campaign_id,
            product_service=request.product_service,
            area=request.area,
            context=request.context,
            max_leads=request.max_leads,
            status=CampaignStatusEnum.RESEARCH_IN_PROGRESS,
            leads_found=0,  # Will be updated after research
            leads_selected=0,
            created_at=datetime.utcnow()
        )
        db.add(db_campaign)
        db.commit()
        db.refresh(db_campaign)
        
        # Start research
        result = await orchestrator.start_research(
            product_service=request.product_service,
            area=request.area,
            context=request.context,
            angle=request.angle,
            max_leads=request.max_leads
        )
        
        leads = result["leads"]
        
        # Ensure all leads have IDs
        for lead in leads:
            if "id" not in lead:
                lead["id"] = str(uuid.uuid4())
        
        # Update campaign with leads_found, persist leads_data, and set status to RESEARCH_COMPLETE
        import json
        db_campaign.leads_found = len(leads)
        db_campaign.leads_data = json.dumps(leads)  # Persist leads to database
        db_campaign.status = CampaignStatusEnum.RESEARCH_COMPLETE
        db.commit()
        
        # Store campaign data temporarily (for content generation)
        active_campaigns[campaign_id] = {
            "campaign_id": campaign_id,
            "product_service": request.product_service,
            "area": request.area,
            "context": request.context,
            "max_leads": request.max_leads,
            "leads": leads,
            "status": "research_complete"
        }
        
        # Convert leads to response format
        lead_responses = [
            LeadResponse(
                id=lead.get("id", str(uuid.uuid4())),
                name=lead.get("name", "Unknown"),
                industry=lead.get("industry", "Unknown"),
                location=lead.get("location", "Unknown"),
                description=lead.get("description", ""),
                relevance_reason=lead.get("relevance_reason"),
                recent_news=lead.get("recent_news")
            )
            for lead in leads
        ]
        
        return ResearchResponse(
            campaign_id=campaign_id,
            leads=lead_responses,
            status="research_complete"
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")


@router.post("/generate", response_model=GenerateResponse)
async def generate_content(request: GenerateRequest, db: Session = Depends(get_db)):
    """
    Generate content for selected leads
    
    Returns:
        List of generated messages with quality scores
    """
    try:
        # Get campaign from database first
        db_campaign = db.query(DBCampaign).filter(DBCampaign.id == request.campaign_id).first()
        if not db_campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Update status to GENERATION_IN_PROGRESS and leads_selected immediately
        db_campaign.status = CampaignStatusEnum.GENERATION_IN_PROGRESS
        db_campaign.leads_selected = len(request.selected_lead_ids)  # Update immediately when user selects
        db.commit()
        
        # Get campaign data from active_campaigns or restore from DB
        if request.campaign_id not in active_campaigns:
            # Restore from database if not in active_campaigns
            if not db_campaign.leads_data:
                raise HTTPException(status_code=404, detail="Campaign leads not found. Please restart research.")
            
            import json
            all_leads = json.loads(db_campaign.leads_data)
            
            # Restore to active_campaigns for future use
            active_campaigns[request.campaign_id] = {
                "campaign_id": request.campaign_id,
                "product_service": db_campaign.product_service,
                "area": db_campaign.area,
                "context": db_campaign.context,
                "max_leads": db_campaign.max_leads,
                "angle": db_campaign.angle,
                "leads": all_leads,
                "status": "research_complete"
            }
        
        # Get campaign_data (now guaranteed to exist)
        campaign_data = active_campaigns[request.campaign_id]
        all_leads = campaign_data["leads"]
        
        # Get company name from profile
        import json
        company_profile = db.query(DBUserProfile).filter(DBUserProfile.id == "default").first()
        company_name = None
        if company_profile and company_profile.company_name:
            company_name = company_profile.company_name
        else:
            company_name = "Marketmind AI Hub"  # Default fallback
        
        orchestrator = CampaignOrchestrator()
        
        # Generate content
        messages = await orchestrator.generate_content(
            campaign_id=request.campaign_id,
            selected_lead_ids=request.selected_lead_ids,
            product_service=request.product_service,
            context=request.context,
            angle=request.angle,
            all_leads=all_leads,
            company_name=company_name
        )
        
        # Update campaign status to GENERATION_COMPLETE
        db_campaign.status = CampaignStatusEnum.GENERATION_COMPLETE
        
        # Save messages to database immediately (before approval)
        # Update existing messages or create new ones (don't delete all)
        existing_messages = {
            msg.company_name: msg 
            for msg in db.query(DBMessage).filter(DBMessage.campaign_id == request.campaign_id).all()
        }
        
        # Get set of company names being generated
        generated_company_names = {msg["company_name"] for msg in messages}
        
        # Update or create messages for generated companies
        for msg in messages:
            company_name = msg["company_name"]
            if company_name in existing_messages:
                # Update existing message
                existing_msg = existing_messages[company_name]
                existing_msg.content = msg["content"]
                existing_msg.quality_score = msg["quality_score"]
                existing_msg.industry = msg["industry"]
                existing_msg.location = msg["location"]
                # Keep existing created_at
            else:
                # Create new message
                db_message = DBMessage(
                    id=msg["id"],
                    campaign_id=request.campaign_id,
                    company_name=msg["company_name"],
                    industry=msg["industry"],
                    location=msg["location"],
                    content=msg["content"],
                    quality_score=msg["quality_score"],
                    created_at=datetime.utcnow()
                )
                db.add(db_message)
        
        # Note: We do NOT delete messages for companies not in this generation batch
        # This allows users to regenerate only some messages while keeping others unchanged
        
        db.commit()
        
        # Update campaign data
        campaign_data["messages"] = messages
        campaign_data["status"] = "generation_complete"
        
        # Convert to response format and sort by quality_score descending
        message_responses = [
            MessageResponse(
                id=msg["id"],
                company_name=msg["company_name"],
                industry=msg["industry"],
                location=msg["location"],
                content=msg["content"],
                quality_score=msg["quality_score"]
            )
            for msg in messages
        ]
        
        # Sort by quality_score descending (highest first)
        message_responses.sort(key=lambda x: x.quality_score, reverse=True)
        
        # Calculate average quality score
        avg_score = sum(msg["quality_score"] for msg in messages) / len(messages) if messages else 0
        
        return GenerateResponse(
            campaign_id=request.campaign_id,
            messages=message_responses,
            average_quality_score=round(avg_score, 2)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")


@router.post("/save", response_model=SaveCampaignResponse)
async def save_campaign(request: SaveCampaignRequest, db: Session = Depends(get_db)):
    """
    Save a completed campaign to the database
    """
    try:
        # Check if campaign already exists in database
        existing_campaign = db.query(DBCampaign).filter(DBCampaign.id == request.campaign_id).first()
        if existing_campaign:
            # Update existing campaign instead of creating new one
            existing_campaign.status = CampaignStatusEnum.COMPLETED
            existing_campaign.leads_found = request.leads_found
            existing_campaign.leads_selected = request.leads_selected
            existing_campaign.leads_data = None  # Clear leads data when completed
            db_campaign = existing_campaign
            
            # Update existing messages (they should already exist from generation, but update them anyway)
            # Delete and recreate to ensure consistency
            db.query(DBMessage).filter(DBMessage.campaign_id == request.campaign_id).delete()
        else:
            # Create new campaign record
            db_campaign = DBCampaign(
                id=request.campaign_id,
                product_service=request.product_service,
                area=request.area,
                context=request.context,
                max_leads=request.max_leads,
                status=CampaignStatusEnum.COMPLETED,
                leads_found=request.leads_found,
                leads_selected=request.leads_selected,
                created_at=datetime.utcnow()
            )
            db.add(db_campaign)
        
        # Create message records
        for msg in request.messages:
            db_message = DBMessage(
                id=msg.id,
                campaign_id=request.campaign_id,
                company_name=msg.company_name,
                industry=msg.industry,
                location=msg.location,
                content=msg.content,
                quality_score=msg.quality_score,
                created_at=datetime.utcnow()
            )
            db.add(db_message)
        
        # Commit to database
        db.commit()
        
        # Remove from active campaigns
        if request.campaign_id in active_campaigns:
            del active_campaigns[request.campaign_id]
        
        return SaveCampaignResponse(
            campaign_id=request.campaign_id,
            status="saved",
            message="Campaign saved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save campaign: {str(e)}")


@router.get("/{campaign_id}/restore", response_model=ResearchResponse)
async def restore_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """
    Restore an in-progress campaign state
    
    Returns campaign data including leads for continuing the workflow
    """
    # Get campaign from database
    db_campaign = db.query(DBCampaign).filter(DBCampaign.id == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Allow restore for any status that's not completed
    if db_campaign.status == CampaignStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Campaign is already completed")
    
    if not db_campaign.leads_data:
        raise HTTPException(status_code=404, detail="Campaign leads not found")
    
    # Parse leads from database
    import json
    leads = json.loads(db_campaign.leads_data)
    
    # Get messages from database if they exist (for generation-complete status)
    messages = []
    if db_campaign.status == CampaignStatusEnum.GENERATION_COMPLETE:
        db_messages = db.query(DBMessage).filter(DBMessage.campaign_id == campaign_id).order_by(DBMessage.quality_score.desc()).all()
        messages = [
            {
                "id": msg.id,
                "company_name": msg.company_name,
                "industry": msg.industry,
                "location": msg.location,
                "content": msg.content,
                "quality_score": msg.quality_score
            }
            for msg in db_messages
        ]
    
    # Restore to active_campaigns
    active_campaigns[campaign_id] = {
        "campaign_id": campaign_id,
        "product_service": db_campaign.product_service,
        "area": db_campaign.area,
        "context": db_campaign.context,
        "max_leads": db_campaign.max_leads,
        "angle": db_campaign.angle,
        "leads": leads,
        "messages": messages,
        "status": db_campaign.status.value
    }
    
    # Convert leads to response format
    lead_responses = [
        LeadResponse(
            id=lead.get("id", str(uuid.uuid4())),
            name=lead.get("name", "Unknown"),
            industry=lead.get("industry", "Unknown"),
            location=lead.get("location", "Unknown"),
            description=lead.get("description", ""),
            relevance_reason=lead.get("relevance_reason"),
            recent_news=lead.get("recent_news")
        )
        for lead in leads
    ]
    
    return ResearchResponse(
        campaign_id=campaign_id,
        leads=lead_responses,
        status=db_campaign.status.value
    )


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str):
    """
    Get campaign data by ID
    
    Returns campaign data including leads and messages if available
    """
    if campaign_id not in active_campaigns:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return active_campaigns[campaign_id]

