"""
Content Generation Agent

Generates personalized cold email content for leads.
Now with agentic capabilities: iterative refinement based on quality scores.
"""
from typing import Dict, Any, Tuple, Optional
from .base import BaseAgent, call_llm
from .prompts import EMAIL_GENERATION_PROMPT
import json


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
    
    def execute_with_refinement(
        self, 
        lead_data: Dict[str, Any], 
        product_service: str, 
        context: str = None, 
        angle: str = None, 
        company_name: str = None,
        quality_agent = None,
        min_quality_score: int = 80,
        max_iterations: int = 3
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Generate content with automatic refinement based on quality scores
        
        This is the agentic version that iteratively improves content quality.
        
        Args:
            lead_data: Company information from research agent
            product_service: Product or service being offered
            context: Additional context for personalization
            angle: Value proposition/angle
            company_name: Your company name (from profile)
            quality_agent: QualityEvaluationAgent instance for evaluation
            min_quality_score: Minimum acceptable quality score (0-100)
            max_iterations: Maximum number of refinement iterations
            
        Returns:
            (content, quality_scores) - Final content and quality metrics
        """
        # Generate initial content
        content = self._generate_initial_content(lead_data, product_service, context, angle, company_name)
        
        # If no quality agent provided, return without refinement
        if not quality_agent:
            return content, {"overall": 0, "note": "No quality agent provided"}
        
        # Evaluate initial quality
        quality = quality_agent.execute(content, lead_data, product_service)
        iteration = 0
        
        print(f"[CONTENT AGENT] Initial quality score: {quality['overall']}/100")
        
        # Refine if quality is below threshold
        while quality["overall"] < min_quality_score and iteration < max_iterations:
            iteration += 1
            print(f"[CONTENT AGENT] Refining content (iteration {iteration}/{max_iterations}), current score: {quality['overall']}/100")
            
            # Get specific feedback for improvement
            feedback = self._get_improvement_feedback(quality, content, lead_data, product_service)
            
            # Refine content based on feedback
            content = self._refine_content(content, feedback, lead_data, product_service, context, angle, company_name)
            
            # Re-evaluate
            quality = quality_agent.execute(content, lead_data, product_service)
            print(f"[CONTENT AGENT] After refinement {iteration}: {quality['overall']}/100")
        
        if iteration > 0:
            print(f"[CONTENT AGENT] Final quality after {iteration} refinements: {quality['overall']}/100")
        else:
            print(f"[CONTENT AGENT] Quality already acceptable: {quality['overall']}/100")
        
        return content, quality
    
    def _generate_initial_content(self, lead_data: Dict[str, Any], product_service: str, context: str = None, angle: str = None, company_name: str = None) -> str:
        """Generate initial email content"""
        prompt = self._build_prompt(lead_data, product_service, context, angle, company_name)
        generated_content = call_llm(prompt, temperature=0.7, model="gpt-4")
        return self._format_email(generated_content)
    
    def _get_improvement_feedback(self, quality: Dict[str, Any], content: str, lead_data: Dict[str, Any], product_service: str) -> str:
        """Get specific, actionable feedback for improvement"""
        feedback_prompt = f"""The following email scored {quality['overall']}/100 overall:
- Personalization: {quality['personalization']}/100
- Clarity: {quality['clarity']}/100
- Relevance: {quality['relevance']}/100
- Call-to-Action: {quality['call_to_action']}/100

Email Content:
{content}

Company: {lead_data.get('name')}
Industry: {lead_data.get('industry')}
Product/Service: {product_service}

Provide specific, actionable feedback on how to improve this email. Focus on the lowest-scoring areas and provide concrete suggestions. Be specific about what needs to change."""
        
        feedback = call_llm(feedback_prompt, temperature=0.5, model="gpt-3.5-turbo")
        return feedback
    
    def _refine_content(self, content: str, feedback: str, lead_data: Dict[str, Any], product_service: str, context: str = None, angle: str = None, company_name: str = None) -> str:
        """Refine content based on feedback"""
        refine_prompt = f"""Improve this email based on the feedback provided.

Original Email:
{content}

Feedback for Improvement:
{feedback}

Company Information:
{json.dumps({
    'name': lead_data.get('name'),
    'industry': lead_data.get('industry'),
    'location': lead_data.get('location'),
    'description': lead_data.get('description'),
    'recent_news': lead_data.get('recent_news', 'None available')
}, indent=2)}

Your Company: {company_name or 'Our Company'}
Product/Service: {product_service}
Context: {context or 'None'}
Value Proposition: {angle or 'None'}

Rewrite the email addressing ALL feedback points. Make it significantly better while keeping it:
- Personalized to the company
- Professional and friendly
- Clear and concise (150-200 words)
- With a strong call-to-action

Return the improved email in the same format (Subject: ... followed by body)."""
        
        refined = call_llm(refine_prompt, temperature=0.7, model="gpt-4")
        return self._format_email(refined)
    
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

