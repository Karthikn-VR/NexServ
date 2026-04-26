from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import urllib.request
import urllib.parse
import json
import os
import uuid
import shutil
from supabase import create_client, Client

from .. import schemas, models
from ..db.database import get_db
from ..services import dish_service
from ..auth_v2.deps import require_vendor
from ..core.config import settings

router = APIRouter(prefix='/api/dishes', tags=['dishes'])

def get_supabase() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@router.post('/upload')
async def upload_image(
    file: UploadFile = File(...),
    user: models.User = Depends(require_vendor)
):
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    
    # Try Supabase Storage first
    supabase = get_supabase()
    if supabase:
        try:
            # Read file content
            content = await file.read()
            
            # Upload to Supabase
            # Note: We assume the bucket 'dishes' exists
            res = supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
                path=filename,
                file=content,
                file_options={"content-type": file.content_type}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(filename)
            return {"url": public_url}
        except Exception as e:
            # If Supabase fails, fallback to local storage
            print(f"Supabase upload failed: {str(e)}")
            # Reset file pointer for local save
            await file.seek(0)
    
    # Fallback to local storage
    # Ensure directory exists
    static_path = os.path.join(os.path.dirname(__file__), "image")
    if not os.path.exists(static_path):
        os.makedirs(static_path)

    file_path = os.path.join(static_path, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/static/{filename}"}

@router.get('/', response_model=List[schemas.DishOut])
def list_dishes(db: Session = Depends(get_db)):
    return dish_service.get_available_dishes(db)

@router.post('/', response_model=schemas.DishOut)
def create_dish(
    payload: schemas.DishIn, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(require_vendor)
):
    return dish_service.create_dish(
        db, 
        name=payload.name, 
        price=payload.price, 
        available_today=payload.available_today, 
        description=payload.description, 
        category=payload.category, 
        image_url=payload.image_url
    )

@router.put('/{id}', response_model=schemas.DishOut)
def update_dish(
    id: int, 
    payload: schemas.DishIn, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(require_vendor)
):
    dish = dish_service.get_dish(db, id)
    if not dish:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dish not found")
    
    dish.name = payload.name
    dish.price = payload.price
    dish.available_today = payload.available_today
    dish.description = payload.description
    dish.category = payload.category
    dish.image_url = payload.image_url
    
    db.commit()
    db.refresh(dish)
    return dish

@router.post('/import-public', response_model=dict)
def import_public_dishes(db: Session = Depends(get_db), user: models.User = Depends(require_vendor)):
    terms = ["chicken", "beef", "fish", "pasta", "salad", "dessert"]
    inserted = 0
    seen_names = set()
    
    for term in terms:
        try:
            q = urllib.parse.quote(term)
            with urllib.request.urlopen(f"https://www.themealdb.com/api/json/v1/1/search.php?s={q}") as resp:
                data = json.loads(resp.read().decode("utf-8"))
                meals = data.get("meals") or []
                for meal in meals:
                    name = meal.get("strMeal")
                    if not name or name in seen_names:
                        continue
                    seen_names.add(name)
                    price = float(((len(name) % 7) + 1) * 40)
                    dish_service.create_dish(
                        db, 
                        name=name, 
                        price=price, 
                        available_today=True,
                        description=meal.get("strCategory", "Imported dish"),
                        image_url=meal.get("strMealThumb")
                    )
                    inserted += 1
        except Exception as e:
            print(f"Error importing {term}: {e}")
            continue

    return {"imported": inserted}
