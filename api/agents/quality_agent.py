"""
Quality Evaluation Agent

Evaluates the quality of generated content.
"""
from typing import Dict, Any
from .base import BaseAgent, call_llm
from .prompts import QUALITY_EVALUATION_PROMPT


class QualityEvaluationAgent(BaseAgent):
    """Agent responsible for evaluating content quality"""
    
    def execute(self, content: str, lead_data: Dict[str, Any], product_service: str) -> Dict[str, Any]:
        """
        Evaluate content quality
        
        Args:
            content: Generated email content
            lead_data: Company information
            product_service: Product/service being offered
            
        Returns:
            Dictionary with quality scores and feedback
        """
        prompt = self._build_evaluation_prompt(content, lead_data, product_service)
        
        # Get evaluation from LLM
        evaluation_text = call_llm(prompt, temperature=0.3, model="gpt-3.5-turbo")
        
        # Parse and calculate scores
        scores = self._parse_evaluation(evaluation_text)
        overall_score = self._calculate_overall_score(scores)
        
        return {
            "personalization": scores.get("personalization", 75),
            "clarity": scores.get("clarity", 75),
            "relevance": scores.get("relevance", 75),
            "call_to_action": scores.get("call_to_action", 75),
            "overall": overall_score
        }
    
    def _build_evaluation_prompt(self, content: str, lead_data: Dict[str, Any], product_service: str) -> str:
        """Build prompt for quality evaluation"""
        return QUALITY_EVALUATION_PROMPT.format(
            content=content,
            company_name=lead_data.get('name', 'N/A'),
            industry=lead_data.get('industry', 'N/A'),
            description=lead_data.get('description', 'N/A'),
            product_service=product_service
        )
    
    def _parse_evaluation(self, evaluation_text: str) -> Dict[str, int]:
        """Parse LLM evaluation response"""
        import json
        import re
        
        try:
            # Try to extract JSON from response (handle cases where LLM adds extra text)
            if "{" in evaluation_text:
                json_start = evaluation_text.find("{")
                json_end = evaluation_text.rfind("}") + 1
                json_str = evaluation_text[json_start:json_end]
                parsed = json.loads(json_str)
                
                # Validate and ensure all required keys exist
                required_keys = ["personalization", "clarity", "relevance", "call_to_action"]
                scores = {}
                for key in required_keys:
                    value = parsed.get(key)
                    if isinstance(value, (int, float)):
                        scores[key] = max(0, min(100, int(value)))  # Clamp to 0-100
                    else:
                        # Try to extract number from string if needed
                        if isinstance(value, str):
                            numbers = re.findall(r'\d+', value)
                            if numbers:
                                scores[key] = max(0, min(100, int(numbers[0])))
                            else:
                                scores[key] = 75  # Default if can't parse
                        else:
                            scores[key] = 75  # Default
                
                return scores
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Failed to parse evaluation response: {e}")
            print(f"Response was: {evaluation_text[:200]}...")
        
        # Fallback: try to extract scores using regex if JSON parsing fails
        try:
            scores = {}
            for key in ["personalization", "clarity", "relevance", "call_to_action"]:
                # Look for pattern like "personalization: 85" or "personalization": 85
                pattern = rf'"{key}"\s*:\s*(\d+)|{key}\s*:\s*(\d+)'
                match = re.search(pattern, evaluation_text, re.IGNORECASE)
                if match:
                    score = int(match.group(1) or match.group(2))
                    scores[key] = max(0, min(100, score))
                else:
                    scores[key] = 75  # Default
            return scores
        except Exception as e:
            print(f"Regex parsing also failed: {e}")
        
        # Final fallback: return default scores
        return {
            "personalization": 75,
            "clarity": 75,
            "relevance": 75,
            "call_to_action": 75
        }
    
    def _calculate_overall_score(self, scores: Dict[str, int]) -> int:
        """Calculate weighted overall score"""
        weights = {
            "personalization": 0.3,
            "clarity": 0.2,
            "relevance": 0.3,
            "call_to_action": 0.2
        }
        
        overall = sum(scores.get(key, 0) * weight for key, weight in weights.items())
        return round(overall)

