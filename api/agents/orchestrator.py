"""
Campaign Orchestrator

Coordinates the multi-agent workflow.
"""
from typing import Dict, Any, List
from .research_agent import LeadResearchAgent
from .content_agent import ContentGenerationAgent
from .quality_agent import QualityEvaluationAgent
from models import Campaign, Message, CampaignStatus
from datetime import datetime
import uuid
import asyncio


class CampaignOrchestrator:
    """Orchestrates the multi-agent campaign workflow"""
    
    def __init__(self):
        self.research_agent = LeadResearchAgent()
        self.content_agent = ContentGenerationAgent()
        self.quality_agent = QualityEvaluationAgent()
    
    async def start_research(self, product_service: str, area: str, context: str = None, angle: str = None, max_leads: int = 10) -> Dict[str, Any]:
        """
        Stage 1: Research leads
        
        Returns:
            Campaign ID and list of researched leads
        """
        # Create campaign
        campaign_id = str(uuid.uuid4())
        
        # Run research agent in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        leads = await loop.run_in_executor(
            None, 
            self.research_agent.execute, 
            product_service, area, context, angle, max_leads
        )
        
        return {
            "campaign_id": campaign_id,
            "leads": leads,
            "status": "research_complete"
        }
    
    async def generate_content(self, campaign_id: str, selected_lead_ids: List[str], 
                              product_service: str, context: str = None, angle: str = None,
                              all_leads: List[Dict[str, Any]] = None, company_name: str = None) -> List[Dict[str, Any]]:
        """
        Stage 2: Generate content for selected leads
        
        Args:
            campaign_id: Campaign identifier
            selected_lead_ids: List of lead IDs to generate content for
            product_service: Product/service being offered
            context: Additional context
            angle: Value proposition/angle
            all_leads: Full list of leads (to find selected ones)
            company_name: Your company name (from profile)
            
        Returns:
            List of messages with generated content and quality scores
        """
        # Filter selected leads
        selected_leads = [lead for lead in (all_leads or []) if lead.get('id') in selected_lead_ids]
        
        messages = []
        loop = asyncio.get_event_loop()
        
        for lead in selected_leads:
            # Generate content in thread pool to avoid blocking
            content = await loop.run_in_executor(
                None,
                self.content_agent.execute,
                lead, product_service, context, angle, company_name
            )
            
            # Evaluate quality in thread pool to avoid blocking
            quality = await loop.run_in_executor(
                None,
                self.quality_agent.execute,
                content, lead, product_service
            )
            
            messages.append({
                "id": str(uuid.uuid4()),
                "company_name": lead.get("name"),
                "industry": lead.get("industry"),
                "location": lead.get("location"),
                "content": content,
                "quality_score": quality["overall"]
            })
        
        return messages

