from app.database.base import SessionLocal, engine, Base
from app.models import User, UserRole, MenuItem, Order, OrderStatus
from datetime import datetime
import sys

def seed_database():
    db = SessionLocal()
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)

        # Check if data already exists
        if db.query(User).first():
            print("Database already has data. Skipping seed.")
            return

        # Create vendor user
        vendor = User(
            phone="9876543210",
            role=UserRole.VENDOR,
            name="Biteful Kitchen",
            otp_verified=True
        )
        db.add(vendor)
        db.flush()

        # Create customer user
        customer = User(
            phone="9123456789",
            role=UserRole.CUSTOMER,
            name="John Doe",
            otp_verified=True
        )
        db.add(customer)
        db.flush()

        # Create menu items
        menu_items = [
            MenuItem(
                vendor_id=vendor.id,
                name="Margherita Pizza",
                description="Fresh tomatoes, mozzarella, basil on a crispy thin crust",
                price=299.0,
                category="Pizza",
                image_url="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
                is_available=True
            ),
            MenuItem(
                vendor_id=vendor.id,
                name="Double Cheese Burger",
                description="Juicy beef patty with double cheese, lettuce, tomato",
                price=199.0,
                category="Burgers",
                image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
                is_available=True
            ),
            MenuItem(
                vendor_id=vendor.id,
                name="California Roll",
                description="Crab, avocado, cucumber wrapped in seaweed and rice",
                price=349.0,
                category="Sushi",
                image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop",
                is_available=True
            ),
            MenuItem(
                vendor_id=vendor.id,
                name="Caesar Salad",
                description="Romaine lettuce, croutons, parmesan, Caesar dressing",
                price=149.0,
                category="Salads",
                image_url="https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
                is_available=True
            ),
            MenuItem(
                vendor_id=vendor.id,
                name="Pepperoni Pizza",
                description="Spicy pepperoni, mozzarella cheese, tomato sauce",
                price=329.0,
                category="Pizza",
                image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
                is_available=True
            ),
            MenuItem(
                vendor_id=vendor.id,
                name="Veggie Burger",
                description="Grilled veggie patty with avocado and sprouts",
                price=179.0,
                category="Burgers",
                image_url="https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop",
                is_available=True
            )
        ]

        for item in menu_items:
            db.add(item)

        db.commit()
        print("Database seeded successfully!")
        print(f"Vendor ID: {vendor.id}, Phone: {vendor.phone}")
        print(f"Customer ID: {customer.id}, Phone: {customer.phone}")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
