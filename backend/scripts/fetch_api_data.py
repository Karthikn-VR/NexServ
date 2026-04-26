import os
import sys
import json
import urllib.request
import urllib.parse
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal, engine
from app.models import Dish, OrderItem

def run():
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE dishes ADD COLUMN description TEXT;"))
        db.execute(text("ALTER TABLE dishes ADD COLUMN category VARCHAR;"))
        db.execute(text("ALTER TABLE dishes ADD COLUMN image_url VARCHAR;"))
        db.commit()
    except Exception as e:
        db.rollback()

    try:
        db.query(OrderItem).delete()
        db.query(Dish).delete()
        db.commit()
    except Exception as e:
        print("Warning deleting old dishes", e)
        db.rollback()

    categories = ["Chicken", "Beef", "Pasta", "Seafood", "Dessert", "Vegetarian", "Starter", "Breakfast"]
    inserted = 0
    seen = set()

    for category in categories:
        url = f"https://www.themealdb.com/api/json/v1/1/filter.php?c={urllib.parse.quote(category)}"
        try:
            req = urllib.request.urlopen(url)
            data = json.loads(req.read().decode('utf-8'))
            meals = data.get('meals') or []
            
            # Take up to 5 per category for quality population
            for meal in meals[:5]:
                name = meal.get('strMeal')
                if not name or name in seen:
                    continue
                seen.add(name)
                
                # Dynamic pricing logic
                price = float(((len(name) % 5) + 3) * 35.50) # Results in reasonable INR prices for eg. ₹106, ₹142, etc
                
                dish = Dish(
                    name=name,
                    price=price,
                    available_today=True,
                    category=category,
                    image_url=meal.get('strMealThumb'),
                    description=f"Delicious {category} dish - {name}"
                )
                db.add(dish)
                inserted += 1
        except Exception as e:
            print(f"Error fetching {category}: {e}")
    
    db.commit()
    print(f"Inserted {inserted} real recipes from TheMealDB!")

if __name__ == '__main__':
    run()
