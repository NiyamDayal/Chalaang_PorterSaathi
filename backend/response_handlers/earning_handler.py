# Cost per km by vehicle type
vehicle_cost_map = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50
}

# This function should replace with your actual API
def fetch_user_earning_data(user_id):
    """Mock API call to get user earnings."""
    # Replace this with actual API request like:
    # response = requests.get(f"https://api.example.com/earnings/{user_id}")
    # return response.json()

    # Mocked response
    return {
        "total_earning": 15000,
        "commission": 2000,
        "penalty": 500,
        "km_travelled": 100,
        "vehicle_type": 3,
        "bonus": 1200
    }

def handle_earning(request: str) -> str:
    """
    Respond with user's earning details.
    You can parse user_id from request or context in real implementation.
    """
    user_id = "123"  # Ideally this would be extracted from the request context
    data = fetch_user_earning_data(user_id)

    total_earning = data.get("total_earning", 0)
    commission = data.get("commission", 0)
    penalty = data.get("penalty", 0)
    km_travelled = data.get("km_travelled", 0)
    vehicle_type = data.get("vehicle_type", 1)
    bonus = data.get("bonus", 0)

    travel_cost_per_km = vehicle_cost_map.get(vehicle_type, 100)
    travel_cost = km_travelled * travel_cost_per_km

    net_earning = (total_earning + bonus) - (commission + penalty + travel_cost)

    response = (
        f"Here is your earnings summary:\n"
        f"1. Total Earning: ₹{total_earning}\n"
        f"2. Commission to Porter: ₹{commission}\n"
        f"3. Penalty Applied: ₹{penalty}\n"
        f"4. Travel Cost (₹{travel_cost_per_km}/km × {km_travelled} km): ₹{travel_cost}\n"
        f"5. Bonus Points: ₹{bonus}\n"
        f"6. 👉 Net Earning: ₹{net_earning}"
    )

    return response
