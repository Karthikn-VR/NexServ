import sys
import os
import psycopg2

order_id = int(sys.argv[1]) if len(sys.argv) > 1 else None
DATABASE_URL = os.environ.get('DATABASE_URL') or 'postgresql://postgres:%40NexServ2004@db.vmlntftrjqmpydaweeem.supabase.co:5432/postgres'
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
if order_id:
    cur.execute('SELECT id, customer_id, status, rejection_reason FROM public.orders WHERE id=%s', (order_id,))
else:
    cur.execute('SELECT id, customer_id, status, rejection_reason FROM public.orders ORDER BY id DESC LIMIT 5')
rows = cur.fetchall()
for r in rows:
    print(r)
cur.close()
conn.close()
