"""
Company Profile endpoints for company info and services
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import json
import uuid

from models import CompanyProfileResponse, UpdateCompanyProfileRequest
from database import get_db
from db_models import UserProfile as DBUserProfile

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/", response_model=CompanyProfileResponse)
async def get_profile(db: Session = Depends(get_db)):
    """
    Get company profile (company name and services)
    
    Returns:
        Company profile with company name and list of services
    """
    profile = db.query(DBUserProfile).filter(DBUserProfile.id == "default").first()
    
    if not profile:
        # Return default profile with Marketmind AI Hub
        return CompanyProfileResponse(
            company_name="Marketmind AI Hub",
            services=[]
        )
    
    # Parse services from JSON
    services = []
    if profile.services:
        try:
            services = json.loads(profile.services)
        except:
            services = []
    
    return CompanyProfileResponse(
        company_name=profile.company_name or "Marketmind AI Hub",
        services=services
    )


@router.put("/", response_model=CompanyProfileResponse)
async def update_profile(request: UpdateCompanyProfileRequest, db: Session = Depends(get_db)):
    """
    Update company profile (company name and services)
    
    Returns:
        Updated company profile
    """
    profile = db.query(DBUserProfile).filter(DBUserProfile.id == "default").first()
    
    if not profile:
        # Create new profile with default company name if not provided
        profile = DBUserProfile(
            id="default",
            company_name=request.company_name or "Marketmind AI Hub",
            services=json.dumps(request.services or []),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(profile)
    else:
        # Update existing profile
        if request.company_name is not None:
            profile.company_name = request.company_name
        if request.services is not None:
            profile.services = json.dumps(request.services)
        profile.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(profile)
    
    # Parse services from JSON
    services = []
    if profile.services:
        try:
            services = json.loads(profile.services)
        except:
            services = []
    
    return CompanyProfileResponse(
        company_name=profile.company_name or "Marketmind AI Hub",
        services=services
    )

