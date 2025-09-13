def fetch_business_metrics(user_id):
    """
    Simulated API call to get business performance metrics for a delivery person.
    """
    return {
        "total_deliveries": 325,
        "average_delivery_time_minutes": 28.5,
        "revenue_generated": 87500,
        "repeat_customers": 86,
        "total_customers": 240,
        "delayed_deliveries": 12,
        "average_rating": 4.7,
        "cod_collected": 40500,
        "efficiency_score": 89.3
    }

def handle_business(request: str) -> str:
    """
    Provide a business performance summary in conversational style.
    """
    user_id = "123"  # Static for now — in a real app, extract from user/session
    data = fetch_business_metrics(user_id)

    repeat_rate = (data["repeat_customers"] / data["total_customers"]) * 100

    response = (
        f"You’ve completed **{data['total_deliveries']} deliveries** so far, "
        f"with an impressive average customer rating of **{data['average_rating']} out of 5**. "
        f"Your **average delivery time** is around **{data['average_delivery_time_minutes']} minutes**, "
        f"which shows good speed.\n\n"
        
        f"You’ve generated a total revenue of **₹{data['revenue_generated']}**, "
        f"and collected **₹{data['cod_collected']}** in COD payments. "
        f"About **{repeat_rate:.1f}%** of your customers have booked with you more than once — a strong indicator of trust.\n\n"
        
        f"There were **{data['delayed_deliveries']} delayed_deliveries**, which is something to keep an eye on. "
        f"Your overall efficiency score is **{data['efficiency_score']} out of 100**, "
        f"reflecting solid performance and reliability.\n\n"
    )

    return response
