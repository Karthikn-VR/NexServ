"""Safe schema fixes for public.users
- Adds `name` column if missing
- Sets default for created_at to now() if missing
- Backfills existing NULL created_at with now()

Run from project backend folder:
python scripts/db_fix_schema.py
"""
import os
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras

base = os.path.dirname(os.path.dirname(__file__))
# load backend/.env then project root .env
load_dotenv(os.path.join(base, '.env'))
load_dotenv(os.path.join(base, '..', '.env'))

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print('ERROR: DATABASE_URL not found in env. Set backend/.env or environment.')
    raise SystemExit(1)

print('Connecting to database...')
conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = False
cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

try:
    # Check columns
    cur.execute("SELECT column_name, column_default, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users';")
    cols = {r['column_name']: r for r in cur.fetchall()}
    print('Current users columns:')
    for k, v in cols.items():
        print(' -', k, '|', v['data_type'], '| default=', v['column_default'])

    # Add name column if missing
    if 'name' not in cols:
        print('Adding name column...')
        cur.execute("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;")
    else:
        print('name column already exists')

    # Ensure created_at default
    created_def = cols.get('created_at', {}).get('column_default') if 'created_at' in cols else None
    if not created_def:
        print('Setting created_at default to now()...')
        cur.execute("ALTER TABLE public.users ALTER COLUMN created_at SET DEFAULT now();")
    else:
        print('created_at already has default:', created_def)

    # Backfill existing nulls
    print('Backfilling NULL created_at values...')
    cur.execute("UPDATE public.users SET created_at = now() WHERE created_at IS NULL RETURNING id, email, created_at;")
    updated = cur.fetchall()
    print('Updated rows count:', len(updated))
    for r in updated[:10]:
        print(' -', r['id'], r['email'], r['created_at'])

    conn.commit()
    print('Schema fixes applied successfully.')

    # Print final sample rows
    cur.execute("SELECT id, name, email, created_at FROM public.users ORDER BY id LIMIT 5;")
    rows = cur.fetchall()
    print('Sample users:')
    for r in rows:
        print(dict(r))

except Exception as e:
    conn.rollback()
    print('ERROR during schema fix:', repr(e))
    raise
finally:
    cur.close()
    conn.close()
