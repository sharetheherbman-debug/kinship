import requests
import sys
import json
from datetime import datetime

class KinshipJourneysAPITester:
    def __init__(self, base_url="https://kinship-journeys.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.family_id = None
        self.trip_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        self.run_test("API Root", "GET", "api/", 200)
        self.run_test("Health Check", "GET", "api/health", 200)

    def test_auth_flow(self):
        """Test authentication flow"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Test registration
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@kinship.app",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=test_user
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
        else:
            print("❌ Registration failed, cannot continue with auth tests")
            return False

        # Test login with same credentials
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']  # Update token
            print(f"   Login successful, new token: {self.token[:20]}...")
        
        # Test get current user
        self.run_test("Get Current User", "GET", "api/auth/me", 200)
        
        return True

    def test_family_management(self):
        """Test family creation and management"""
        print("\n=== FAMILY MANAGEMENT TESTS ===")
        
        if not self.token:
            print("❌ No auth token, skipping family tests")
            return False
        
        # Test family creation
        family_data = {
            "name": f"Test Family {datetime.now().strftime('%H%M%S')}",
            "description": "Test family for API testing"
        }
        
        success, response = self.run_test(
            "Create Family",
            "POST",
            "api/families",
            200,
            data=family_data
        )
        
        if success and 'id' in response:
            self.family_id = response['id']
            invite_code = response.get('invite_code')
            print(f"   Family created with ID: {self.family_id}")
            print(f"   Invite code: {invite_code}")
        else:
            print("❌ Family creation failed")
            return False
        
        # Test get my family
        self.run_test("Get My Family", "GET", "api/families/my", 200)
        
        # Test get family members
        self.run_test("Get Family Members", "GET", f"api/families/{self.family_id}/members", 200)
        
        return True

    def test_trip_management(self):
        """Test trip creation and management"""
        print("\n=== TRIP MANAGEMENT TESTS ===")
        
        if not self.family_id:
            print("❌ No family ID, skipping trip tests")
            return False
        
        # Test trip creation
        trip_data = {
            "name": f"Test Trip {datetime.now().strftime('%H%M%S')}",
            "destination": "Cape Town, South Africa",
            "start_date": "2024-12-01",
            "end_date": "2024-12-07",
            "description": "Test trip for API testing",
            "budget": 5000
        }
        
        success, response = self.run_test(
            "Create Trip",
            "POST",
            "api/trips",
            200,
            data=trip_data
        )
        
        if success and 'id' in response:
            self.trip_id = response['id']
            print(f"   Trip created with ID: {self.trip_id}")
        else:
            print("❌ Trip creation failed")
            return False
        
        # Test get trips
        self.run_test("Get Trips", "GET", "api/trips", 200)
        
        # Test get specific trip
        self.run_test("Get Trip Details", "GET", f"api/trips/{self.trip_id}", 200)
        
        # Test update trip
        updated_trip_data = {
            **trip_data,
            "name": "Updated Test Trip",
            "budget": 6000
        }
        self.run_test("Update Trip", "PUT", f"api/trips/{self.trip_id}", 200, data=updated_trip_data)
        
        return True

    def test_itinerary_management(self):
        """Test itinerary management"""
        print("\n=== ITINERARY TESTS ===")
        
        if not self.trip_id:
            print("❌ No trip ID, skipping itinerary tests")
            return False
        
        # Test add itinerary item
        itinerary_item = {
            "trip_id": self.trip_id,
            "day": 1,
            "time": "09:00",
            "activity": "Visit Table Mountain",
            "location": "Table Mountain, Cape Town",
            "notes": "Take the cable car up"
        }
        
        success, response = self.run_test(
            "Add Itinerary Item",
            "POST",
            f"api/trips/{self.trip_id}/itinerary",
            200,
            data=itinerary_item
        )
        
        if success and 'id' in response:
            item_id = response['id']
            print(f"   Itinerary item created with ID: {item_id}")
            
            # Test delete itinerary item
            self.run_test(
                "Delete Itinerary Item",
                "DELETE",
                f"api/trips/{self.trip_id}/itinerary/{item_id}",
                200
            )
        
        return True

    def test_packing_list(self):
        """Test packing list management"""
        print("\n=== PACKING LIST TESTS ===")
        
        if not self.trip_id:
            print("❌ No trip ID, skipping packing tests")
            return False
        
        # Test add packing item
        packing_item = {
            "trip_id": self.trip_id,
            "item": "Sunscreen",
            "category": "Personal Care",
            "assigned_to": "",
            "packed": False
        }
        
        success, response = self.run_test(
            "Add Packing Item",
            "POST",
            f"api/trips/{self.trip_id}/packing",
            200,
            data=packing_item
        )
        
        if success and 'id' in response:
            item_id = response['id']
            print(f"   Packing item created with ID: {item_id}")
            
            # Test toggle packing item
            self.run_test(
                "Toggle Packing Item",
                "PUT",
                f"api/trips/{self.trip_id}/packing/{item_id}",
                200
            )
        
        return True

    def test_budget_management(self):
        """Test budget management"""
        print("\n=== BUDGET TESTS ===")
        
        if not self.trip_id:
            print("❌ No trip ID, skipping budget tests")
            return False
        
        # Test add budget item
        budget_item = {
            "trip_id": self.trip_id,
            "category": "Accommodation",
            "description": "Hotel booking",
            "amount": 1200.00,
            "currency": "USD",
            "paid_by": ""
        }
        
        self.run_test(
            "Add Budget Item",
            "POST",
            f"api/trips/{self.trip_id}/budget",
            200,
            data=budget_item
        )
        
        # Test get budget items
        self.run_test("Get Budget Items", "GET", f"api/trips/{self.trip_id}/budget", 200)
        
        return True

    def test_chat_functionality(self):
        """Test chat functionality"""
        print("\n=== CHAT TESTS ===")
        
        if not self.family_id:
            print("❌ No family ID, skipping chat tests")
            return False
        
        # Test send message
        message_data = {
            "family_id": self.family_id,
            "content": "Hello from API test!"
        }
        
        self.run_test(
            "Send Chat Message",
            "POST",
            "api/chat/send",
            200,
            data=message_data
        )
        
        # Test get messages
        self.run_test("Get Chat Messages", "GET", f"api/chat/{self.family_id}", 200)
        
        return True

    def test_ai_functionality(self):
        """Test AI functionality (may fail if no OpenAI key)"""
        print("\n=== AI ASSISTANT TESTS ===")
        
        # Test AI chat (expect 500 if no API key)
        ai_request = {
            "prompt": "Suggest activities for a family trip to Cape Town",
            "context": "Family with kids aged 8 and 12"
        }
        
        success, response = self.run_test(
            "AI Chat Request",
            "POST",
            "api/ai/chat",
            200,  # Will likely be 500 if no OpenAI key
            data=ai_request
        )
        
        if not success:
            print("   Note: AI functionality may require OpenAI API key configuration")
        
        return True

    def test_admin_functionality(self):
        """Test admin functionality"""
        print("\n=== ADMIN TESTS ===")
        
        # Test admin setup (should work with correct secret)
        # Note: This is just testing the endpoint exists
        self.run_test("Admin Setup Check", "POST", "api/admin/setup", 403, data="wrong-secret")
        
        return True

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Kinship Journeys API Tests")
        print(f"Testing against: {self.base_url}")
        
        # Run test suites in order
        self.test_health_check()
        
        if self.test_auth_flow():
            self.test_family_management()
            self.test_trip_management()
            self.test_itinerary_management()
            self.test_packing_list()
            self.test_budget_management()
            self.test_chat_functionality()
            self.test_ai_functionality()
            self.test_admin_functionality()
        
        # Print final results
        print(f"\n📊 FINAL RESULTS")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = KinshipJourneysAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())