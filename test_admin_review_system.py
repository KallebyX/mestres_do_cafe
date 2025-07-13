#!/usr/bin/env python3
"""
Admin Review System Test
Tests the complete review system functionality with admin login
"""

import requests
import json
import sys

def test_admin_review_system():
    """Test complete admin review system"""
    
    # API endpoints
    BASE_URL = "http://localhost:5001"
    PRODUCT_ID = "e2d1d1e9-eec7-4db4-a3c9-348d1c4be9b1"
    
    print("🧪 Testing Admin Review System")
    print("=" * 50)
    
    # 1. Test admin login
    print("\n1. Testing admin login...")
    login_data = {
        "email": "admin@mestres.cafe",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        login_result = response.json()
        
        if login_result.get('success'):
            token = login_result.get('access_token')
            user_info = login_result.get('user', {})
            
            print(f"✅ Admin login successful!")
            print(f"   - User ID: {user_info.get('id')}")
            print(f"   - Email: {user_info.get('email')}")
            print(f"   - Is Admin: {user_info.get('is_admin')}")
            print(f"   - Token: {token[:20]}...")
        else:
            print(f"❌ Admin login failed: {login_result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return False
    
    # 2. Test product stats
    print("\n2. Testing product stats endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/reviews/product/{PRODUCT_ID}/stats")
        stats_result = response.json()
        
        if stats_result.get('success'):
            stats = stats_result.get('stats', {})
            print(f"✅ Product stats loaded!")
            print(f"   - Total Reviews: {stats.get('total_reviews')}")
            print(f"   - Average Rating: {stats.get('average_rating')}")
            print(f"   - Recommendations: {stats.get('recommendations_count')}")
            print(f"   - Quality Score: {stats.get('quality_score')}")
        else:
            print(f"❌ Stats loading failed: {stats_result}")
            return False
            
    except Exception as e:
        print(f"❌ Stats request failed: {e}")
        return False
    
    # 3. Test rating distribution
    print("\n3. Testing rating distribution...")
    try:
        response = requests.get(f"{BASE_URL}/api/reviews/product/{PRODUCT_ID}/rating-distribution")
        dist_result = response.json()
        
        if dist_result.get('success'):
            distribution = dist_result.get('distribution', {})
            print(f"✅ Rating distribution loaded!")
            for rating in ['5', '4', '3', '2', '1']:
                data = distribution.get(rating, {})
                count = data.get('count', 0)
                percentage = data.get('percentage', 0)
                print(f"   - {rating} stars: {count} ({percentage}%)")
        else:
            print(f"❌ Distribution loading failed: {dist_result}")
            return False
            
    except Exception as e:
        print(f"❌ Distribution request failed: {e}")
        return False
    
    # 4. Test engagement metrics
    print("\n4. Testing engagement metrics...")
    try:
        response = requests.get(f"{BASE_URL}/api/reviews/product/{PRODUCT_ID}/engagement")
        eng_result = response.json()
        
        if eng_result.get('success'):
            engagement = eng_result.get('engagement', {})
            print(f"✅ Engagement metrics loaded!")
            print(f"   - Average Helpful Votes: {engagement.get('average_helpful_votes')}")
            print(f"   - Reviews with Images: {engagement.get('reviews_with_images')}")
            print(f"   - Detailed Reviews: {engagement.get('detailed_reviews')}")
            print(f"   - Response Rate: {engagement.get('company_response_rate')}%")
            print(f"   - Avg Response Time: {engagement.get('avg_response_time')}")
        else:
            print(f"❌ Engagement loading failed: {eng_result}")
            return False
            
    except Exception as e:
        print(f"❌ Engagement request failed: {e}")
        return False
    
    # 5. Test featured reviews
    print("\n5. Testing featured reviews...")
    try:
        response = requests.get(f"{BASE_URL}/api/reviews/product/{PRODUCT_ID}/featured")
        featured_result = response.json()
        
        if featured_result.get('success'):
            reviews = featured_result.get('reviews', [])
            print(f"✅ Featured reviews loaded!")
            print(f"   - Count: {len(reviews)}")
            for i, review in enumerate(reviews[:2]):  # Show first 2
                print(f"   - Review {i+1}: {review.get('rating')}⭐ - {review.get('title')}")
        else:
            print(f"❌ Featured reviews loading failed: {featured_result}")
            return False
            
    except Exception as e:
        print(f"❌ Featured reviews request failed: {e}")
        return False
    
    # 6. Test recent reviews
    print("\n6. Testing recent reviews...")
    try:
        response = requests.get(f"{BASE_URL}/api/reviews/product/{PRODUCT_ID}/recent")
        recent_result = response.json()
        
        if recent_result.get('success'):
            reviews = recent_result.get('reviews', [])
            print(f"✅ Recent reviews loaded!")
            print(f"   - Count: {len(reviews)}")
            for i, review in enumerate(reviews[:2]):  # Show first 2
                print(f"   - Review {i+1}: {review.get('rating')}⭐ by {review.get('user', {}).get('name', 'Unknown')}")
        else:
            print(f"❌ Recent reviews loading failed: {recent_result}")
            return False
            
    except Exception as e:
        print(f"❌ Recent reviews request failed: {e}")
        return False
    
    # 7. Test with authentication header
    print("\n7. Testing authenticated requests...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/reviews/product/{PRODUCT_ID}", headers=headers)
        auth_result = response.json()
        
        if auth_result.get('success'):
            reviews = auth_result.get('reviews', [])
            pagination = auth_result.get('pagination', {})
            print(f"✅ Authenticated review access successful!")
            print(f"   - Reviews loaded: {len(reviews)}")
            print(f"   - Total available: {pagination.get('total')}")
            print(f"   - Pages: {pagination.get('page')}/{pagination.get('pages')}")
        else:
            print(f"❌ Authenticated access failed: {auth_result}")
            return False
            
    except Exception as e:
        print(f"❌ Authenticated request failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All admin review system tests passed!")
    print("\n✨ Summary:")
    print("   - Admin authentication: ✅")
    print("   - Product statistics: ✅") 
    print("   - Rating distribution: ✅")
    print("   - Engagement metrics: ✅")
    print("   - Featured reviews: ✅")
    print("   - Recent reviews: ✅")
    print("   - Authenticated access: ✅")
    
    print(f"\n🌐 Frontend URL: http://localhost:3000/produto/{PRODUCT_ID}")
    print("   Use admin credentials: admin@mestres.cafe / admin123")
    
    return True

if __name__ == "__main__":
    success = test_admin_review_system()
    sys.exit(0 if success else 1)