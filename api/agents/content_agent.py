"""
Content Generation Agent

Generates personalized cold email content for leads.
"""
from typing import Dict, Any
from .base import BaseAgent, call_llm
from .prompts import EMAIL_GENERATION_PROMPT


class ContentGenerationAgent(BaseAgent):
    """Agent responsible for generating personalized outreach content"""
    
    def execute(self, lead_data: Dict[str, Any], product_service: str, context: str = None, angle: str = None, company_name: str = None) -> str:
        """
        Generate personalized email content for a lead
        
        Args:
            lead_data: Company information from research agent
            product_service: Product or service being offered
            context: Additional context for personalization
            angle: Value proposition/angle
            company_name: Your company name (from profile)
            
        Returns:
            Generated email content (subject + body)
        """
        prompt = self._build_prompt(lead_data, product_service, context, angle, company_name)
        
        # Generate content using LLM
        generated_content = call_llm(prompt, temperature=0.7, model="gpt-4")
        
        # Format and return
        return self._format_email(generated_content)
    
    def _build_prompt(self, lead_data: Dict[str, Any], product_service: str, context: str = None, angle: str = None, company_name: str = None) -> str:
        """Build prompt for content generation"""
        return EMAIL_GENERATION_PROMPT.format(
            company_name=lead_data.get('name', 'N/A'),
            industry=lead_data.get('industry', 'N/A'),
            location=lead_data.get('location', 'N/A'),
            description=lead_data.get('description', 'N/A'),
            recent_news=lead_data.get('recent_news', 'None available'),
            your_company_name=company_name or 'Our Company',
            product_service=product_service,
            context=context or 'None',
            angle=angle or 'None'
        )
    
    def _format_email(self, raw_content: str) -> str:
        """Format and clean the generated email"""
        # Remove any markdown formatting if present
        content = raw_content.strip()
        
        # Ensure proper formatting
        if not content.startswith("Subject:"):
            content = "Subject: Partnership Opportunity\n\n" + content
        
        return content

