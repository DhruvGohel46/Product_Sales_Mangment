import requests
import json

BASE_URL = "http://localhost:5050/api" # Updated port

def test_create_order():
    url = f"{BASE_URL}/orders"
    payload = {
        "supplier_name": "Test Supplier",
        "category": "Inventory Purchase",
        "total_amount": 1000.50,
        "payment_method": "Cash",
        "product_name": "Test Product",
        "quantity": "5 units",
        "items": [
            {
                "name": "Test Product",
                "quantity": "5 units",
                "purchase_price": 1000.50,
                "subtotal": 1000.50
            }
        ]
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_create_order()
