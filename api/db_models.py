"""
SQLAlchemy database models
"""
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base


class CampaignStatusEnum(str, enum.Enum):
    """Campaign status enumeration"""
    RESEARCH_IN_PROGRESS = "research-in-progress"
    RESEARCH_COMPLETE = "research-complete"
    GENERATION_IN_PROGRESS = "generation-in-progress"
    GENERATION_COMPLETE = "generation-complete"
    COMPLETED = "completed"


class Campaign(Base):
    """Campaign database model"""
    __tablename__ = "campaigns"
    
    id = Column(String, primary_key=True, index=True)
    product_service = Column(String, nullable=False)
    area = Column(String, nullable=False)
    context = Column(Text, nullable=True)
    angle = Column(Text, nullable=True)  # Value proposition/angle for the campaign
    max_leads = Column(Integer, default=10)
    status = Column(SQLEnum(CampaignStatusEnum), nullable=False, default=CampaignStatusEnum.RESEARCH_IN_PROGRESS)
    leads_found = Column(Integer, default=0)
    leads_selected = Column(Integer, default=0)
    leads_data = Column(Text, nullable=True)  # JSON string storing leads for in-progress campaigns
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    messages = relationship("Message", back_populates="campaign", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Campaign(id={self.id}, product_service={self.product_service}, status={self.status})>"


class Message(Base):
    """Message database model"""
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    location = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    quality_score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, company_name={self.company_name}, quality_score={self.quality_score})>"


class UserProfile(Base):
    """Company profile model for storing company info and services"""
    __tablename__ = "user_profiles"
    
    id = Column(String, primary_key=True, index=True, default="default")  # Single profile for now
    company_name = Column(String, nullable=True)
    services = Column(Text, nullable=True)  # JSON array of services
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<UserProfile(id={self.id}, company_name={self.company_name})>"

