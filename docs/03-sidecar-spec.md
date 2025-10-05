
# Sidecar Specification

**Runtime:** Node 20+ (Nest.js)  
**Database:** Neon Postgres  
**Optional Queue:** Upstash Redis (BullMQ)

## Endpoints
- POST /webhooks/cal/booking.created
- POST /webhooks/cal/booking.updated
- POST /forms, /forms/:id/respond
- GET /bookings/:id/secure-notes
- POST /tokens/cal/managed-user
- GET /health

## Pre-Booking Questionnaire Flow
1. **Questionnaire Storage**: Store questionnaire responses before booking
2. **Data Association**: Link questionnaire data to booking via webhook
3. **Encryption**: Encrypt sensitive questionnaire responses
4. **Validation**: Validate questionnaire data before allowing booking

## Workers (optional)
- jit_validate_slot – verify conflicts.
- send_reminder – delayed notifications.
- generate_summary – context-only summary.
- purge_sensitive – retention enforcement.

## Data Model
users, bookings, forms, responses, policies, context_summaries, audits.

## Security
- AES-GCM encryption for responses and summaries.
- RBAC + audit logs.
