import os
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print('DATABASE_URL not set in env')
    raise SystemExit(1)

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'orderstatus'")
rows = cur.fetchall()
print('orderstatus enum labels:', [r[0] for r in rows])
cur.close()
conn.close()
