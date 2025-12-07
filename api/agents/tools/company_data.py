"""
Company data tools for enriching lead information

Supports multiple data providers with graceful fallbacks.
"""
import os
import requests
from typing import Dict, Any, Optional


def get_company_data_clearbit(company_name: str, domain: str = None) -> Dict[str, Any]:
    """
    Get company data from Clearbit API
    
    Requires: pip install clearbit
    Get API key from: https://clearbit.com/ (Free tier available)
    
    Args:
        company_name: Company name
        domain: Optional company domain/website
    
    Returns:
        Dict with company data
    """
    api_key = os.getenv("CLEARBIT_API_KEY")
    
    if not api_key:
        return {
            "success": False,
            "error": "CLEARBIT_API_KEY not found",
            "data": {}
        }
    
    try:
        from clearbit import Clearbit
        clearbit = Clearbit(api_key)
        
        # Try domain first if provided
        if domain:
            company = clearbit.Company.find(domain=domain)
        else:
            # Search by name
            results = clearbit.NameToDomain.find(name=company_name)
            if results and results.get("domain"):
                company = clearbit.Company.find(domain=results["domain"])
            else:
                return {
                    "success": False,
                    "error": "Company not found in Clearbit",
                    "data": {}
                }
        
        if company:
            return {
                "success": True,
                "data": {
                    "name": company.get("name"),
                    "domain": company.get("domain"),
                    "description": company.get("description"),
                    "industry": company.get("category", {}).get("industry"),
                    "employees": company.get("metrics", {}).get("employees"),
                    "location": f"{company.get('geo', {}).get('city', '')}, {company.get('geo', {}).get('state', '')}",
                    "founded": company.get("foundedYear"),
                    "website": company.get("domain"),
                    "provider": "clearbit"
                }
            }
    except ImportError:
        return {
            "success": False,
            "error": "clearbit package not installed. Run: pip install clearbit",
            "data": {}
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": {}
        }
    
    return {
        "success": False,
        "error": "Company not found",
        "data": {}
    }


def get_company_data_from_web(company_name: str) -> Dict[str, Any]:
    """
    Fallback: Get company data from web search
    
    Uses web search to find basic company information
    """
    from .web_search import search_web
    
    query = f"{company_name} company information about"
    search_results = search_web(query)
    
    if search_results.get("success") and search_results.get("results"):
        first_result = search_results["results"][0]
        return {
            "success": True,
            "data": {
                "name": company_name,
                "description": first_result.get("snippet", ""),
                "website": first_result.get("link", ""),
                "provider": "web_search"
            }
        }
    
    return {
        "success": False,
        "error": "No data found via web search",
        "data": {}
    }


def get_company_data(company_name: str, domain: str = None) -> Dict[str, Any]:
    """
    Get detailed company information from available data sources
    
    Tries multiple providers in order:
    1. Clearbit (if CLEARBIT_API_KEY is set)
    2. Web search (if search API is configured)
    3. Returns empty data with warning
    
    Args:
        company_name: Company name
        domain: Optional company website domain
    
    Returns:
        Dict with company data or error message
    """
    # Try Clearbit first
    if os.getenv("CLEARBIT_API_KEY"):
        result = get_company_data_clearbit(company_name, domain)
        if result.get("success"):
            return result
    
    # Fallback to web search
    result = get_company_data_from_web(company_name)
    if result.get("success"):
        return result
    
    # No data source available
    return {
        "success": False,
        "error": "No company data API configured. Set CLEARBIT_API_KEY or configure web search",
        "data": {},
        "note": "Company data enrichment will be limited without API keys"
    }

