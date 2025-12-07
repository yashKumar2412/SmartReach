"""
Web search tool for verifying companies and finding information

Supports multiple search providers with graceful fallbacks.
"""
import os
import requests
from typing import Dict, Any, Optional


def search_web_serpapi(query: str, location: str = None) -> Dict[str, Any]:
    """
    Search web using SerpAPI (Recommended - easier setup)
    
    Requires: pip install google-search-results
    Get API key from: https://serpapi.com/ (Free tier: 100 searches/month)
    
    Args:
        query: Search query
        location: Optional location filter (e.g., "San Francisco, CA")
    
    Returns:
        Dict with search results
    """
    try:
        from serpapi import GoogleSearch
    except ImportError:
        return {
            "success": False,
            "error": "serpapi package not installed. Run: pip install google-search-results",
            "results": []
        }
    
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return {
            "success": False,
            "error": "SERPAPI_API_KEY not found in environment variables",
            "results": []
        }
    
    params = {
        "q": query,
        "api_key": api_key,
        "engine": "google"
    }
    
    if location:
        params["location"] = location
    
    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        
        organic_results = results.get("organic_results", [])
        
        # Format results
        formatted_results = []
        for result in organic_results[:5]:  # Top 5 results
            formatted_results.append({
                "title": result.get("title", ""),
                "link": result.get("link", ""),
                "snippet": result.get("snippet", ""),
                "position": result.get("position", 0)
            })
        
        return {
            "success": True,
            "results": formatted_results,
            "total_results": results.get("search_information", {}).get("total_results", 0),
            "provider": "serpapi"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "results": [],
            "provider": "serpapi"
        }


def search_web_google(query: str) -> Dict[str, Any]:
    """
    Search web using Google Custom Search API
    
    Requires: Google Custom Search API key and Search Engine ID
    Get from: https://developers.google.com/custom-search/v1/overview
    
    Args:
        query: Search query
    
    Returns:
        Dict with search results
    """
    api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
    search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
    
    if not api_key or not search_engine_id:
        return {
            "success": False,
            "error": "GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID required",
            "results": []
        }
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": api_key,
        "cx": search_engine_id,
        "q": query
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        items = data.get("items", [])
        formatted_results = []
        for item in items[:5]:  # Top 5 results
            formatted_results.append({
                "title": item.get("title", ""),
                "link": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "position": items.index(item) + 1
            })
        
        return {
            "success": True,
            "results": formatted_results,
            "total_results": data.get("searchInformation", {}).get("totalResults", 0),
            "provider": "google"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "results": [],
            "provider": "google"
        }


def search_web(query: str, location: str = None) -> Dict[str, Any]:
    """
    Search the web for information
    
    Tries multiple providers in order:
    1. SerpAPI (if SERPAPI_API_KEY is set)
    2. Google Custom Search (if GOOGLE_SEARCH_API_KEY is set)
    3. Returns empty results with warning
    
    Args:
        query: Search query
        location: Optional location filter
    
    Returns:
        Dict with search results or error message
    """
    # Try SerpAPI first (easiest to set up)
    if os.getenv("SERPAPI_API_KEY"):
        result = search_web_serpapi(query, location)
        if result.get("success"):
            return result
    
    # Fallback to Google Custom Search
    if os.getenv("GOOGLE_SEARCH_API_KEY"):
        result = search_web_google(query)
        if result.get("success"):
            return result
    
    # No search API configured - return warning
    return {
        "success": False,
        "error": "No search API configured. Set SERPAPI_API_KEY or GOOGLE_SEARCH_API_KEY in .env file",
        "results": [],
        "provider": "none",
        "note": "Web search will not work without an API key. Get free SerpAPI key from https://serpapi.com/"
    }


def verify_company_exists(company_name: str, location: str = None) -> bool:
    """
    Verify if a company actually exists by searching the web
    
    Args:
        company_name: Company name to verify
        location: Optional company location
    
    Returns:
        True if company appears to exist (found in search results), False otherwise
    """
    # Build search query
    query = f'"{company_name}" company'
    if location:
        query += f" {location}"
    
    # Search for the company
    results = search_web(query, location)
    
    if not results.get("success"):
        # If search API not configured, we can't verify
        # Return True to avoid blocking (graceful degradation)
        print(f"[WARNING] Cannot verify {company_name} - search API not configured")
        return True  # Assume exists if we can't verify
    
    # Check if we found relevant results
    search_results = results.get("results", [])
    
    if len(search_results) == 0:
        return False
    
    # Check if any result mentions the company name
    company_lower = company_name.lower()
    for result in search_results:
        title = result.get("title", "").lower()
        snippet = result.get("snippet", "").lower()
        
        if company_lower in title or company_lower in snippet:
            return True
    
    return False

