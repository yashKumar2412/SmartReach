"""
Utility functions for the API
"""
from models import CampaignStatus
from db_models import CampaignStatusEnum


def map_db_status_to_pydantic(db_status: CampaignStatusEnum) -> CampaignStatus:
    """Map database enum status to Pydantic enum status"""
    status_mapping = {
        CampaignStatusEnum.RESEARCH_IN_PROGRESS: CampaignStatus.RESEARCH_IN_PROGRESS,
        CampaignStatusEnum.RESEARCH_COMPLETE: CampaignStatus.RESEARCH_COMPLETE,
        CampaignStatusEnum.GENERATION_IN_PROGRESS: CampaignStatus.GENERATION_IN_PROGRESS,
        CampaignStatusEnum.GENERATION_COMPLETE: CampaignStatus.GENERATION_COMPLETE,
        CampaignStatusEnum.COMPLETED: CampaignStatus.COMPLETED,
    }
    return status_mapping.get(db_status, CampaignStatus.RESEARCH_IN_PROGRESS)

