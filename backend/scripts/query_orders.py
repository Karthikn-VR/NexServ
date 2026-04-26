import os
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL') or 'postgresql://postgres:%40NexServ2004@db.vmlntftrjqmpydaweeem.supabase.co:5432/postgres'
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
cur.execute('SELECT id, customer_id, status, total, address, created_at FROM public.orders ORDER BY id DESC LIMIT 10')
rows = cur.fetchall()
for r in rows:
    print(r)
cur.close()
conn.close()
