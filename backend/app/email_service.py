import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import time
from typing import List, Dict, Any


from .core.config import settings

def _get_smtp_config():
    """Read and validate SMTP settings from centralized config."""
    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    user = settings.SMTP_USER
    password = settings.SMTP_PASS

    if not host or not user or not password:
        print(f'[EMAIL] CONFIGURATION ERROR: SMTP settings incomplete. Check .env file.')
        return None
    return {'host': host, 'port': port, 'user': user, 'password': password}


def _send_html_email(to_email: str, subject: str, html_body: str, plain_body: str = '') -> bool:
    """
    Core email sender with HTML support, proper TLS, and retry logic.
    Returns True on success, False on failure.
    """
    config = _get_smtp_config()
    if not config:
        return False

    # Ensure to_email is valid
    if not to_email or '@' not in to_email:
        print(f'[EMAIL] RECIPIENT ERROR: Invalid email address: {to_email!r}')
        return False

    print(f'[EMAIL] ATTEMPTING SEND: to={to_email}, subject="{subject.encode("ascii", "ignore").decode("ascii")}"')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'NexServe <{config["user"]}>'
    msg['To'] = to_email

    if not plain_body:
        plain_body = subject
    msg.attach(MIMEText(plain_body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    max_retries = 2
    retry_delay = 2

    for attempt in range(max_retries + 1):
        try:
            context = ssl.create_default_context()
            # Increase timeout to 30s to be robust against slow SMTP connections
            with smtplib.SMTP(config['host'], config['port'], timeout=30) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(config['user'], config['password'])
                server.send_message(msg)
            print(f'[EMAIL] SUCCESS: Email successfully delivered to {to_email}')
            return True
        except smtplib.SMTPAuthenticationError as e:
            print(f'[EMAIL] AUTHENTICATION FAILED for {config["user"]}: {e}')
            return False  # Don't retry auth failures
        except (smtplib.SMTPException, ConnectionError, TimeoutError) as e:
            if attempt < max_retries:
                print(f'[EMAIL] RETRYING: Attempt {attempt+1} failed ({e}). Retrying in {retry_delay}s...')
                time.sleep(retry_delay)
                continue
            print(f'[EMAIL] FATAL ERROR: All {max_retries+1} attempts failed: {e}')
            return False
        except Exception as e:
            print(f'[EMAIL] UNEXPECTED ERROR: {type(e).__name__}: {e}')
            return False
    return False


def _wrap_html(content: str) -> str:
    """Wrap email content in a styled HTML template."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:-0.5px; display:flex; align-items:center; justify-content:center;">
                🍽️ NexServe
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              {content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc; padding:24px 32px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0; color:#64748b; font-size:14px; font-weight:500;">
                Thanks for choosing nexServ! 🚀
              </p>
              <p style="margin:8px 0 0; color:#94a3b8; font-size:12px;">
                This is an automated notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ---------------------------------------------------------------------------
#  1. Order Placed — Send Bill
# ---------------------------------------------------------------------------

def send_order_bill_email(to_email: str, order_id: int, items: List[Dict[str, Any]], subtotal: float, gst: float = 7.0, service_charge: float = 8.0) -> bool:
    """Send formatted bill when an order is placed."""
    
    total = subtotal + gst + service_charge
    item_rows = ''
    for it in items:
        qty = it.get('quantity', 1)
        price = float(it.get('price', 0))
        name = it.get('name', 'Item')
        line_total = price * qty
        item_rows += f"""
          <tr>
            <td style="padding:12px; border-bottom:1px solid #f1f5f9; color:#1e293b; font-size:15px;">{name}</td>
            <td style="padding:12px; border-bottom:1px solid #f1f5f9; color:#64748b; font-size:15px; text-align:center;">{qty}</td>
            <td style="padding:12px; border-bottom:1px solid #f1f5f9; color:#64748b; font-size:15px; text-align:right;">₹{price:.2f}</td>
            <td style="padding:12px; border-bottom:1px solid #f1f5f9; color:#1e293b; font-size:15px; text-align:right; font-weight:600;">₹{line_total:.2f}</td>
          </tr>"""

    content = f"""
      <h2 style="margin:0 0 8px; color:#0f172a; font-size:24px; font-weight:700;">Order Confirmed! 🎉</h2>
      <p style="margin:0 0 24px; color:#64748b; font-size:16px;">
        Your order <strong style="color:#f97316;">#{order_id}</strong> has been received and is waiting for vendor approval.
      </p>

      <div style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; margin-bottom:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:12px; text-align:left; color:#475569; font-size:12px; text-transform:uppercase; font-weight:700;">Item</th>
              <th style="padding:12px; text-align:center; color:#475569; font-size:12px; text-transform:uppercase; font-weight:700;">Qty</th>
              <th style="padding:12px; text-align:right; color:#475569; font-size:12px; text-transform:uppercase; font-weight:700;">Price</th>
              <th style="padding:12px; text-align:right; color:#475569; font-size:12px; text-transform:uppercase; font-weight:700;">Total</th>
            </tr>
          </thead>
          <tbody>
            {item_rows}
          </tbody>
          <tfoot style="background:#f8fafc;">
            <tr>
              <td colspan="3" style="padding:8px 12px; text-align:right; color:#64748b; font-size:14px;">Subtotal</td>
              <td style="padding:8px 12px; text-align:right; color:#1e293b; font-size:14px; font-weight:600;">₹{subtotal:.2f}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:8px 12px; text-align:right; color:#64748b; font-size:14px;">GST Tax</td>
              <td style="padding:8px 12px; text-align:right; color:#1e293b; font-size:14px; font-weight:600;">₹{gst:.2f}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:8px 12px; text-align:right; color:#64748b; font-size:14px;">Service Charge</td>
              <td style="padding:8px 12px; text-align:right; color:#1e293b; font-size:14px; font-weight:600;">₹{service_charge:.2f}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:8px 12px; text-align:right; color:#64748b; font-size:14px;">Delivery</td>
              <td style="padding:8px 12px; text-align:right; color:#10b981; font-size:14px; font-weight:700;">FREE</td>
            </tr>
            <tr style="background:#fff7ed;">
              <td colspan="3" style="padding:16px 12px; text-align:right; font-weight:700; color:#1e293b; font-size:16px;">Grand Total</td>
              <td style="padding:16px 12px; text-align:right; font-weight:800; color:#ea580c; font-size:20px;">₹{total:.2f}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style="margin:0; color:#64748b; font-size:15px; line-height:1.5;">
        You can track your order status in the <strong>My Orders</strong> section of the app. We'll let you know when the vendor accepts it!
      </p>
    """

    plain = f"Order #{order_id} confirmed!\n\n"
    for it in items:
        plain += f"- {it.get('quantity',1)}x {it.get('name','Item')}: Rs.{float(it.get('price',0))*it.get('quantity',1):.2f}\n"
    plain += f"\nSubtotal: Rs.{subtotal:.2f}"
    plain += f"\nGST: Rs.{gst:.2f}"
    plain += f"\nService Charge: Rs.{service_charge:.2f}"
    plain += f"\nDelivery: FREE"
    plain += f"\nGrand Total: Rs.{total:.2f}"

    return _send_html_email(to_email, f"Order #{order_id} Confirmed — Your Bill", _wrap_html(content), plain)


# ---------------------------------------------------------------------------
#  2. Vendor Accepted — Being Prepared
# ---------------------------------------------------------------------------

def send_order_accepted_email(to_email: str, order_id: int) -> bool:
    """Send email when vendor accepts the order."""
    content = f"""
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:64px; line-height:1;">👨‍🍳</div>
      </div>
      <h2 style="margin:0 0 8px; color:#0f172a; font-size:24px; font-weight:700; text-align:center;">Your Order is Being Prepared!</h2>
      <p style="margin:0 0 24px; color:#64748b; font-size:16px; text-align:center; line-height:1.5;">
        The vendor has accepted your order <strong style="color:#f97316;">#{order_id}</strong>. 
        The kitchen is now busy preparing your fresh meal!
      </p>

      <div style="background:#fff7ed; border-radius:12px; padding:24px; text-align:center; border:1px solid #fed7aa; margin-bottom:24px;">
        <p style="margin:0 0 4px; color:#9a3412; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Current Status</p>
        <p style="margin:0; color:#ea580c; font-weight:800; font-size:24px;">Preparing your food...</p>
      </div>

      <p style="margin:0; color:#64748b; font-size:15px; text-align:center;">
        We'll send you another update as soon as your order is ready for delivery!
      </p>
    """

    plain = f"Your order #{order_id} is being prepared! The vendor has accepted your order and is working on it now."
    return _send_html_email(to_email, f"Order #{order_id} — Your Food is Being Prepared! 👨‍🍳", _wrap_html(content), plain)


# ---------------------------------------------------------------------------
#  3. Delivery Assigned — On the Way
# ---------------------------------------------------------------------------

def send_order_on_the_way_email(to_email: str, order_id: int, otp: str = None) -> bool:
    """Send email when order is picked up for delivery."""
    otp_section = ""
    if otp:
        otp_section = f"""
      <div style="background:#f0f9ff; border-radius:12px; padding:24px; text-align:center; border:1px solid #bae6fd; margin-bottom:24px;">
        <p style="margin:0 0 4px; color:#0369a1; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Delivery Verification OTP</p>
        <p style="margin:0; color:#0284c7; font-weight:800; font-size:32px; letter-spacing:4px;">{otp}</p>
        <p style="margin:8px 0 0; color:#0c4a6e; font-size:12px;">Share this code with the driver to complete your delivery.</p>
      </div>
        """

    content = f"""
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:64px; line-height:1;">🛵</div>
      </div>
      <h2 style="margin:0 0 8px; color:#0f172a; font-size:24px; font-weight:700; text-align:center;">Your Order is On Its Way!</h2>
      <p style="margin:0 0 24px; color:#64748b; font-size:16px; text-align:center; line-height:1.5;">
        Exciting news! Your order <strong style="color:#f97316;">#{order_id}</strong> has been picked up 
        and is heading your way. Get ready!
      </p>

      {otp_section}

      <div style="background:#ecfdf5; border-radius:12px; padding:24px; text-align:center; border:1px solid #a7f3d0; margin-bottom:24px;">
        <p style="margin:0 0 4px; color:#065f46; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Delivery Status</p>
        <p style="margin:0; color:#059669; font-weight:800; font-size:24px;">Out for Delivery</p>
      </div>

      <p style="margin:0; color:#64748b; font-size:15px; text-align:center;">
        You can track the delivery partner's live location in the <strong>Orders</strong> page.
      </p>
    """

    plain = f"Your order #{order_id} is on its way! A delivery partner has picked up your food and is heading to your address."
    if otp:
        plain += f"\n\nYour Delivery OTP is: {otp}"
    
    return _send_html_email(to_email, f"Order #{order_id} — Your Food is On Its Way! 🛵", _wrap_html(content), plain)


# ---------------------------------------------------------------------------
#  4. Order Rejected — Notification
# ---------------------------------------------------------------------------

def send_order_rejected_email(to_email: str, order_id: int, reason: str) -> bool:
    """Send email when vendor rejects the order."""
    content = f"""
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:64px; line-height:1;">😔</div>
      </div>
      <h2 style="margin:0 0 8px; color:#0f172a; font-size:24px; font-weight:700; text-align:center;">Order Could Not Be Fulfilled</h2>
      <p style="margin:0 0 24px; color:#64748b; font-size:16px; text-align:center;">
        Unfortunately, your order <strong style="color:#f97316;">#{order_id}</strong> was not accepted by the vendor.
      </p>

      <div style="background:#fef2f2; border-radius:12px; padding:20px; text-align:center; border:1px solid #fecaca; margin-bottom:24px;">
        <p style="margin:0 0 4px; color:#991b1b; font-weight:700; font-size:14px; text-transform:uppercase;">Reason Provided</p>
        <p style="margin:0; color:#dc2626; font-weight:600; font-size:16px;">{reason}</p>
      </div>

      <p style="margin:0; color:#64748b; font-size:15px; text-align:center;">
        We're sorry for the disappointment. Please try another vendor or check back later!
      </p>
    """

    plain = f"Your order #{order_id} was not accepted. Reason: {reason}. We apologize for the inconvenience."
    return _send_html_email(to_email, f"Order #{order_id} — Update on your order", _wrap_html(content), plain)


# ---------------------------------------------------------------------------
#  5. Order Delivered — Final Notification
# ---------------------------------------------------------------------------

def send_order_delivered_email(to_email: str, order_id: int) -> bool:
    """Send email when order is successfully delivered."""
    content = f"""
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:64px; line-height:1;">🎁</div>
      </div>
      <h2 style="margin:0 0 8px; color:#0f172a; font-size:24px; font-weight:700; text-align:center;">Your Order Has Been Delivered!</h2>
      <p style="margin:0 0 24px; color:#64748b; font-size:16px; text-align:center; line-height:1.5;">
        Bon appétit! Your order <strong style="color:#f97316;">#{order_id}</strong> has been successfully delivered. 
        We hope you enjoy your meal!
      </p>

      <div style="background:#ecfdf5; border-radius:12px; padding:24px; text-align:center; border:1px solid #a7f3d0; margin-bottom:24px;">
        <p style="margin:0 0 4px; color:#065f46; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Delivery Status</p>
        <p style="margin:0; color:#059669; font-weight:800; font-size:24px;">Delivered Successfully</p>
      </div>

      <p style="margin:0; color:#64748b; font-size:15px; text-align:center;">
        Thank you for choosing NexServe. We'd love to hear your feedback on the app!
      </p>
    """

    plain = f"Your order #{order_id} has been delivered! Enjoy your meal. Thank you for choosing NexServe."
    return _send_html_email(to_email, f"Order #{order_id} — Delivered! 🎁", _wrap_html(content), plain)


# ---------------------------------------------------------------------------
#  Backward compatibility
# ---------------------------------------------------------------------------

def send_email(to_email: str, subject: str, body: str) -> bool:
    """Legacy plain-text email sender."""
    html = _wrap_html(f'<p style="color:#1e293b; font-size:16px; line-height:1.6;">{body}</p>')
    return _send_html_email(to_email, subject, html, body)
