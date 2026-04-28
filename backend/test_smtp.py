#!/usr/bin/env python3
"""
Quick SMTP connection test script
"""
import smtplib
import ssl
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get SMTP configuration
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')

print("Testing SMTP Configuration:")
print(f"Host: {SMTP_HOST}")
print(f"Port: {SMTP_PORT}")
print(f"User: {SMTP_USER}")
print(f"Password: {'*' * len(SMTP_PASS) if SMTP_PASS else 'None'}")

if not all([SMTP_HOST, SMTP_USER, SMTP_PASS]):
    print("❌ ERROR: Missing SMTP configuration in .env file")
    exit(1)

try:
    # Test connection
    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
        print("✅ Connected to SMTP server")
        server.ehlo()
        
        if server.has_extn('STARTTLS'):
            server.starttls(context=context)
            server.ehlo()
            print("✅ TLS encryption enabled")
        
        # Test authentication
        server.login(SMTP_USER, SMTP_PASS)
        print("✅ SMTP authentication successful")
        
        print("\n🎉 SMTP configuration is working correctly!")
        
except smtplib.SMTPAuthenticationError as e:
    print(f"❌ SMTP Authentication Failed: {e}")
    print("\n🔧 Troubleshooting:")
    print("1. Check if Gmail app password is correct")
    print("2. Enable 2-factor authentication on Gmail")
    print("3. Generate a new app password at: https://myaccount.google.com/apppasswords")
    print("4. Make sure 'Less secure app access' is enabled (if using password)")
    
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")