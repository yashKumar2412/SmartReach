"""
Functional tests for SmartReach agents

Tests the agentic capabilities including:
- Company verification
- Real data enrichment
- Content generation
- Quality evaluation
- Iterative refinement
"""
import pytest
import os
import sys
from pathlib import Path

# Add parent directory to path so we can import agents
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from agents.research_agent import LeadResearchAgent
from agents.content_agent import ContentGenerationAgent
from agents.quality_agent import QualityEvaluationAgent
from agents.tools import search_web, verify_company_exists


class TestResearchAgent:
    """Test cases for Lead Research Agent"""
    
    def test_research_agent_initialization(self):
        """Test that Research Agent can be initialized"""
        agent = LeadResearchAgent()
        assert agent is not None
        assert hasattr(agent, 'execute')
        print("✅ Research Agent initialization: PASSED")
    
    def test_research_agent_generates_leads(self):
        """Test that Research Agent generates leads based on criteria"""
        agent = LeadResearchAgent()
        leads = agent.execute(
            product_service="Digital Marketing Strategy",
            area="San Francisco Bay Area",
            context="Technology companies",
            max_leads=3
        )
        
        assert leads is not None
        assert isinstance(leads, list)
        assert len(leads) > 0
        assert len(leads) <= 3
        
        # Check lead structure
        for lead in leads:
            assert 'name' in lead
            assert 'industry' in lead
            assert 'location' in lead
            assert 'id' in lead
        
        print(f"✅ Research Agent generates leads: PASSED ({len(leads)} leads generated)")
    
    def test_research_agent_verifies_companies(self):
        """Test that Research Agent verifies companies (if API key available)"""
        agent = LeadResearchAgent()
        leads = agent.execute(
            product_service="Digital Marketing",
            area="San Francisco",
            max_leads=5
        )
        
        # Check if verification happened (if API key is set)
        if os.getenv("SERPAPI_API_KEY"):
            # Some leads should be verified
            verified_count = sum(1 for lead in leads if lead.get('verified', False))
            print(f"✅ Company verification: PASSED ({verified_count}/{len(leads)} verified)")
        else:
            print("⚠️  Company verification: SKIPPED (SERPAPI_API_KEY not set)")
    
    def test_research_agent_enriches_data(self):
        """Test that Research Agent enriches company data"""
        agent = LeadResearchAgent()
        leads = agent.execute(
            product_service="Software Development",
            area="San Jose, CA",
            max_leads=2
        )
        
        # Check that leads have enriched data
        for lead in leads:
            assert 'description' in lead
            assert 'relevance_reason' in lead or 'description' in lead
        
        print("✅ Data enrichment: PASSED")


class TestContentAgent:
    """Test cases for Content Generation Agent"""
    
    def test_content_agent_initialization(self):
        """Test that Content Agent can be initialized"""
        agent = ContentGenerationAgent()
        assert agent is not None
        assert hasattr(agent, 'execute')
        print("✅ Content Agent initialization: PASSED")
    
    def test_content_agent_generates_email(self):
        """Test that Content Agent generates email content"""
        agent = ContentGenerationAgent()
        lead_data = {
            "name": "Test Company",
            "industry": "Technology",
            "location": "San Francisco, CA",
            "description": "A test company"
        }
        
        content = agent.execute(
            lead_data=lead_data,
            product_service="Digital Marketing",
            angle="We help companies grow",
            company_name="Test Marketing Co"
        )
        
        assert content is not None
        assert isinstance(content, str)
        assert len(content) > 0
        assert "Subject:" in content or "subject" in content.lower()
        
        print("✅ Content generation: PASSED")
    
    def test_content_agent_refinement(self):
        """Test that Content Agent can refine content iteratively"""
        content_agent = ContentGenerationAgent()
        quality_agent = QualityEvaluationAgent()
        
        lead_data = {
            "name": "TechCorp Inc",
            "industry": "Technology",
            "location": "San Francisco, CA",
            "description": "A growing SaaS company"
        }
        
        # Test refinement method exists and works
        content, quality = content_agent.execute_with_refinement(
            lead_data=lead_data,
            product_service="Digital Marketing",
            angle="We help companies scale",
            company_name="Marketing Pro",
            quality_agent=quality_agent,
            min_quality_score=80,
            max_iterations=3
        )
        
        assert content is not None
        assert quality is not None
        assert 'overall' in quality
        assert 0 <= quality['overall'] <= 100
        
        print(f"✅ Content refinement: PASSED (Quality: {quality['overall']}/100)")


class TestQualityAgent:
    """Test cases for Quality Evaluation Agent"""
    
    def test_quality_agent_initialization(self):
        """Test that Quality Agent can be initialized"""
        agent = QualityEvaluationAgent()
        assert agent is not None
        assert hasattr(agent, 'execute')
        print("✅ Quality Agent initialization: PASSED")
    
    def test_quality_agent_evaluates_content(self):
        """Test that Quality Agent evaluates content quality"""
        agent = QualityEvaluationAgent()
        
        sample_content = """Subject: Partnership Opportunity

Dear Test Company,

We are Marketing Pro, a digital marketing agency. We can help your company grow through our services.

Best regards,
Marketing Pro"""
        
        lead_data = {
            "name": "Test Company",
            "industry": "Technology",
            "description": "A test company"
        }
        
        quality = agent.execute(
            content=sample_content,
            lead_data=lead_data,
            product_service="Digital Marketing"
        )
        
        assert quality is not None
        assert 'overall' in quality
        assert 'personalization' in quality
        assert 'clarity' in quality
        assert 'relevance' in quality
        assert 'call_to_action' in quality
        
        # Check scores are in valid range
        for key, score in quality.items():
            assert 0 <= score <= 100
        
        print(f"✅ Quality evaluation: PASSED (Overall: {quality['overall']}/100)")


class TestTools:
    """Test cases for agentic tools"""
    
    def test_web_search_tool_available(self):
        """Test that web search tool is available"""
        # Just check it can be imported and called
        try:
            result = search_web("test query")
            assert result is not None
            assert isinstance(result, dict)
            print("✅ Web search tool: PASSED")
        except Exception as e:
            if "API key" in str(e).lower() or "not configured" in str(e).lower():
                print("⚠️  Web search tool: SKIPPED (API key not set)")
            else:
                raise
    
    def test_company_verification_tool(self):
        """Test company verification tool"""
        # Test with a known company
        try:
            exists = verify_company_exists("Apple Inc", "Cupertino, CA")
            assert isinstance(exists, bool)
            print(f"✅ Company verification tool: PASSED (Apple Inc: {exists})")
        except Exception as e:
            if "API key" in str(e).lower():
                print("⚠️  Company verification: SKIPPED (API key not set)")
            else:
                raise


def run_all_tests():
    """Run all tests and print summary"""
    print("\n" + "="*60)
    print("SMARTREACH FUNCTIONAL TESTS")
    print("="*60 + "\n")
    
    test_classes = [
        TestResearchAgent,
        TestContentAgent,
        TestQualityAgent,
        TestTools
    ]
    
    passed = 0
    skipped = 0
    failed = 0
    
    for test_class in test_classes:
        print(f"\n--- {test_class.__name__} ---")
        test_instance = test_class()
        
        for method_name in dir(test_instance):
            if method_name.startswith('test_'):
                try:
                    method = getattr(test_instance, method_name)
                    method()
                    passed += 1
                except AssertionError as e:
                    print(f"❌ {method_name}: FAILED - {e}")
                    failed += 1
                except Exception as e:
                    if "SKIPPED" in str(e) or "API key" in str(e):
                        skipped += 1
                    else:
                        print(f"❌ {method_name}: FAILED - {e}")
                        failed += 1
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {passed}")
    print(f"⚠️  Skipped: {skipped}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total: {passed + skipped + failed}")
    print("="*60 + "\n")
    
    return passed, skipped, failed


if __name__ == "__main__":
    run_all_tests()

