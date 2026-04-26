import os
from urllib.parse import urlparse

# Load backend .env manually
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for ln in f:
            ln = ln.strip()
            if ln.startswith('DATABASE_URL='):
                os.environ['DATABASE_URL'] = ln.split('=',1)[1]

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print('DATABASE_URL not set in backend/.env or environment')
    raise SystemExit(1)

print('Using DATABASE_URL:', DATABASE_URL)

try:
    import psycopg2
except Exception as e:
    print('psycopg2 not available:', e)
    print('Please install with: pip install psycopg2-binary')
    raise

# Connect and query information_schema
try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    tables = ['users','dishes','orders','order_items','coupons']
    for t in tables:
        print('\nTable:', t)
        cur.execute("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name=%s ORDER BY ordinal_position", (t,))
        rows = cur.fetchall()
        if not rows:
            print('  (no rows or table not found)')
        for r in rows:
            print('  ', r[0], '|', r[1], '|', r[2])
    cur.close()
    conn.close()
except Exception as e:
    print('DB query failed:', repr(e))
    raise
