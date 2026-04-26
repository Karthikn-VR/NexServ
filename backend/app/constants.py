"""Centralized status constants to match DB enum labels.
Use these constants throughout the backend to avoid typos and make future changes easier.
"""

STATUS_PLACED = 'PLACED'
STATUS_ACCEPTED = 'ACCEPTED'
STATUS_REJECTED = 'REJECTED'
STATUS_ASSIGNED = 'ASSIGNED'
STATUS_IN_TRANSIT = 'IN_TRANSIT'
STATUS_DELIVERED = 'DELIVERED'

# Mapping from common lower/old names to DB labels
STATUS_MAP = {
    'pending': STATUS_PLACED,
    'PENDING': STATUS_PLACED,
    'approved': STATUS_ACCEPTED,
    'APPROVED': STATUS_ACCEPTED,
    'rejected': STATUS_REJECTED,
    'REJECTED': STATUS_REJECTED,
    'assigned': STATUS_ASSIGNED,
    'in_transit': STATUS_IN_TRANSIT,
    'delivered': STATUS_DELIVERED,
}
