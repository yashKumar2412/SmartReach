"""
Lead Research Agent

Searches for and gathers company information based on criteria.
Now with agentic capabilities: tool usage for verification and data enrichment.
"""
from typing import List, Dict, Any
import os
from .base import BaseAgent, call_llm
from .prompts import COMPANY_GENERATION_PROMPT, COMPANY_ENRICHMENT_PROMPT

# Import tools (will work even if API keys not set - graceful degradation)
try:
    from .tools import verify_company_exists, get_company_data
    TOOLS_AVAILABLE = True
except ImportError:
    TOOLS_AVAILABLE = False
    print("[RESEARCH AGENT] Tools not available - running in basic mode")


class LeadResearchAgent(BaseAgent):
    """Agent responsible for researching and finding potential leads"""
    
    def execute(self, product_service: str, area: str, context: str = None, angle: str = None, max_leads: int = 10) -> List[Dict[str, Any]]:
        """
        Research leads based on criteria with agentic capabilities
        
        Now includes:
        - Company verification using web search (if API key available)
        - Real company data enrichment (if API key available)
        - Graceful degradation if tools not available
        
        Args:
            product_service: Product or service being offered
            area: Target geographic area
            context: Additional context for search
            max_leads: Maximum number of leads to find
            
        Returns:
            List of lead dictionaries with company information
        """
        try:
            # Step 1: Generate companies using LLM
            companies = self._generate_companies_llm(product_service, area, context, max_leads)
            
            # Step 2: Verify and enrich companies using tools (if available)
            enriched_leads = []
            import uuid
            
            for company in companies:
                try:
                    company_name = company.get('name', '')
                    location = company.get('location', '')
                    
                    # Step 2a: Verify company exists (if tools available)
                    verified = True
                    if TOOLS_AVAILABLE and os.getenv("SERPAPI_API_KEY") or os.getenv("GOOGLE_SEARCH_API_KEY"):
                        try:
                            verified = verify_company_exists(company_name, location)
                            if not verified:
                                print(f"[RESEARCH AGENT] Skipping {company_name} - not verified as real company")
                                continue  # Skip unverified companies
                        except Exception as e:
                            print(f"[RESEARCH AGENT] Verification failed for {company_name}: {e}")
                            # Continue anyway if verification fails
                    
                    # Step 2b: Get real company data (if tools available)
                    if TOOLS_AVAILABLE:
                        try:
                            company_data_result = get_company_data(company_name, company.get('website'))
                            if company_data_result.get("success"):
                                real_data = company_data_result.get("data", {})
                                # Merge real data with LLM-generated data
                                company.update({
                                    "description": real_data.get("description", company.get("description", "")),
                                    "website": real_data.get("website", company.get("website", "")),
                                    "employees": real_data.get("employees", company.get("employees", "Unknown")),
                                    "verified": verified,
                                    "data_source": real_data.get("provider", "llm")
                                })
                                print(f"[RESEARCH AGENT] Enriched {company_name} with real data from {real_data.get('provider', 'unknown')}")
                        except Exception as e:
                            print(f"[RESEARCH AGENT] Data enrichment failed for {company_name}: {e}")
                            # Continue with LLM data if enrichment fails
                    
                    # Step 2c: Enrich with LLM analysis (always done)
                    enriched = self._enrich_company_data(company, product_service, context)
                    
                    # Ensure each lead has an ID
                    if "id" not in enriched:
                        enriched["id"] = str(uuid.uuid4())
                    
                    # Mark as verified if we checked
                    if TOOLS_AVAILABLE:
                        enriched["verified"] = verified
                    
                    enriched_leads.append(enriched)
                    
                except Exception as e:
                    print(f"[RESEARCH AGENT] Error processing {company.get('name', 'Unknown')}: {e}")
                    # Continue with next company even if one fails
                    if "id" not in company:
                        company["id"] = str(uuid.uuid4())
                    enriched_leads.append(company)
            
            print(f"[RESEARCH AGENT] Returning {len(enriched_leads)} enriched leads")
            return enriched_leads[:max_leads]  # Return up to max_leads
            
        except Exception as e:
            import traceback
            print(f"[RESEARCH AGENT] Error: {str(e)}")
            print(f"[RESEARCH AGENT] Traceback: {traceback.format_exc()}")
            raise
    
    def _generate_companies_llm(self, product_service: str, area: str, context: str = None, max_leads: int = 10) -> List[Dict[str, Any]]:
        """
        Generate companies directly using LLM
        
        This approach uses the LLM to generate realistic company leads based on criteria,
        which is more reliable than web scraping and doesn't require external APIs.
        """
        prompt = COMPANY_GENERATION_PROMPT.format(
            product_service=product_service,
            area=area,
            context=context or "None",
            max_leads=max_leads
        )
        
        try:
            response = call_llm(prompt, temperature=0.8, model="gpt-4")
            
            # Parse JSON response
            import json
            
            # Extract JSON from response (handle cases where LLM adds extra text)
            if "[" in response:
                json_start = response.find("[")
                json_end = response.rfind("]") + 1
                json_str = response[json_start:json_end]
                companies = json.loads(json_str)
                
                # Ensure all required fields are present
                for company in companies:
                    if "employees" not in company:
                        company["employees"] = "Unknown"
                    if "website" not in company:
                        company["website"] = f"https://{company.get('name', '').lower().replace(' ', '')}.com"
                
                print(f"[RESEARCH AGENT] Generated {len(companies)} companies using LLM")
                return companies[:max_leads]
            else:
                print(f"[RESEARCH AGENT] Failed to parse LLM response: {response[:200]}")
                return []
                
        except json.JSONDecodeError as e:
            print(f"[RESEARCH AGENT] JSON decode error: {e}")
            print(f"[RESEARCH AGENT] Response: {response[:500] if 'response' in locals() else 'N/A'}")
            return []
        except Exception as e:
            import traceback
            print(f"[RESEARCH AGENT] Error generating companies: {str(e)}")
            print(f"[RESEARCH AGENT] Traceback: {traceback.format_exc()}")
            return []
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.replace("www.", "")
            return domain
        except:
            return url
    
    def _extract_industry_from_text(self, text: str) -> str:
        """Extract industry from text (basic keyword matching)"""
        text_lower = text.lower()
        industries = {
            "technology": ["tech", "software", "saas", "platform", "digital"],
            "data analytics": ["analytics", "data", "business intelligence", "bi"],
            "cloud services": ["cloud", "aws", "azure", "infrastructure"],
            "software development": ["development", "dev", "coding", "programming"],
            "consulting": ["consulting", "advisory", "services"],
            "healthcare": ["health", "medical", "pharma"],
            "finance": ["financial", "fintech", "banking", "investment"],
        }
        
        for industry, keywords in industries.items():
            if any(keyword in text_lower for keyword in keywords):
                return industry
        return "Technology"  # Default
    
    def _extract_location_from_text(self, text: str) -> str:
        """Extract location from text (basic pattern matching)"""
        import re
        # Look for common location patterns
        location_patterns = [
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})",  # "City, ST"
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+([A-Z]{2})",  # "City ST"
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return "Unknown"
    
    def _enrich_company_data(self, company: Dict[str, Any], product_service: str, context: str = None) -> Dict[str, Any]:
        """Enrich company data using LLM"""
        prompt = COMPANY_ENRICHMENT_PROMPT.format(
            company_name=company.get('name', 'N/A'),
            industry=company.get('industry', 'N/A'),
            location=company.get('location', 'N/A'),
            description=company.get('description', 'N/A'),
            product_service=product_service,
            context=context or "None"
        )
        
        try:
            # Call LLM to enrich company data
            response = call_llm(prompt, temperature=0.7, model="gpt-3.5-turbo")
            
            # Parse JSON response
            import json
            try:
                # Extract JSON from response (handle cases where LLM adds extra text)
                if "{" in response:
                    json_start = response.find("{")
                    json_end = response.rfind("}") + 1
                    json_str = response[json_start:json_end]
                    enriched_data = json.loads(json_str)
                    
                    # Merge with original company data
                    return {
                        **company,
                        "description": enriched_data.get("description", company.get("description", "")),
                        "relevance_reason": enriched_data.get("relevance_reason", ""),
                        "recent_news": enriched_data.get("recent_news", "No recent news available")
                    }
            except json.JSONDecodeError:
                pass
        except Exception:
            pass
        
        # Fallback: return original data with basic enrichment
        return {
            **company,
            "description": company.get("description", ""),
            "relevance_reason": f"Company in {company.get('industry')} industry could benefit from {product_service}",
            "recent_news": "No recent news available"
        }

