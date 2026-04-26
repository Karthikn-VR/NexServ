import requests
import os

BASE = 'http://127.0.0.1:8000'
VENDOR_EMAIL = 'e2e_vendor@example.com'
VENDOR_PW = 'secret123'

def main(order_id):
    # login vendor
    r = requests.post(f'{BASE}/api/auth/login', json={'email': VENDOR_EMAIL, 'password': VENDOR_PW})
    print('login', r.status_code, r.text)
    tok = r.json().get('access_token')
    if not tok:
        raise SystemExit('vendor login failed')
    headers = {'Authorization': f'Bearer {tok}'}
    r = requests.post(f'{BASE}/api/orders/{order_id}/approve', headers=headers)
    print('approve', r.status_code, r.text)


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print('usage: python approve_order.py <order_id>')
        raise SystemExit(1)
    main(sys.argv[1])
