# Temporary storage for real-time notifications
received_orders = []

def notify_driver(order_data: dict):
    global received_orders
    # Check if order already in list to avoid duplicates (based on order_id)
    order_id = order_data.get('order_id')
    received_orders = [o for o in received_orders if o.get('order_id') != order_id]
    received_orders.append(order_data)
    
    # Keep only the latest 50 orders to prevent memory issues
    if len(received_orders) > 50:
        received_orders.pop(0)
        
    print(f"=== 🚚 DRIVER NOTIFIED ABOUT NEW ORDER #{order_id} ===")
    return {"status": "success", "message": "Driver notified"}

def get_received_orders():
    return received_orders
