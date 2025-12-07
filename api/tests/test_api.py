"""
API endpoint tests for SmartReach

Tests the REST API endpoints for functionality and reliability.
"""
import pytest
import sys
from pathlib import Path

# Add parent directory to path so we can import main
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestAPIEndpoints:
    """Test cases for API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns correct response"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "SmartReach" in data["message"]
        print("✅ Root endpoint: PASSED")
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health endpoint: PASSED")
    
    def test_dashboard_endpoint(self):
        """Test dashboard endpoint returns data"""
        response = client.get("/api/dashboard/")
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        assert "recent_activity" in data
        print("✅ Dashboard endpoint: PASSED")
    
    def test_profile_endpoint(self):
        """Test profile endpoint"""
        response = client.get("/api/profile/")
        assert response.status_code == 200
        data = response.json()
        assert "company_name" in data or "services" in data
        print("✅ Profile endpoint: PASSED")
    
    def test_history_endpoint(self):
        """Test history endpoint"""
        response = client.get("/api/history/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✅ History endpoint: PASSED")


def run_api_tests():
    """Run all API tests"""
    print("\n" + "="*60)
    print("SMARTREACH API TESTS")
    print("="*60 + "\n")
    
    test_instance = TestAPIEndpoints()
    passed = 0
    failed = 0
    
    for method_name in dir(test_instance):
        if method_name.startswith('test_'):
            try:
                method = getattr(test_instance, method_name)
                method()
                passed += 1
            except Exception as e:
                print(f"❌ {method_name}: FAILED - {e}")
                failed += 1
    
    print("\n" + "="*60)
    print("API TEST SUMMARY")
    print("="*60)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Total: {passed + failed}")
    print("="*60 + "\n")
    
    return passed, failed


if __name__ == "__main__":
    run_api_tests()

