import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load explicitly from .env to get the remote database URL
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment")
    sys.exit(1)

def migrate():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    columns_to_add = [
        ("delivery_start_time", "TIMESTAMP"),
        ("delivery_duration_seconds", "INTEGER"),
        ("start_lat", "FLOAT"),
        ("start_lng", "FLOAT"),
        ("end_lat", "FLOAT"),
        ("end_lng", "FLOAT")
    ]

    for col_name, dt in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE public.orders ADD COLUMN {col_name} {dt}")
            print(f"Successfully added column {col_name}")
        except psycopg2.errors.DuplicateColumn:
            print(f"Column {col_name} already exists. Skipping.")
        except Exception as e:
            print(f"Error adding {col_name}: {e}")

    cursor.close()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
