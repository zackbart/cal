
# Sidecar Specification

**Runtime:** Node 20+ (Nest.js)  
**Database:** Neon Postgres  
**Optional Queue:** Upstash Redis (BullMQ)

## Endpoints
- POST /webhooks/cal/booking.created
- POST /forms, /forms/:id/respond
- GET /bookings/:id/secure-notes
- POST /tokens/cal/managed-user
- GET /health

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
