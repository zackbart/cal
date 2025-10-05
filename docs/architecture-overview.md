
# ChurchHub Scheduler — Architecture Overview

**Version:** 1.0  
**Hosting:** Vercel (frontend), Railway (API/workers), Neon (Postgres), Upstash (Redis optional).  
**Integration:** Cal.com Platform + Atoms.

## Components
- **Frontend (Next.js, shadcn/ui)** — Booking and dashboard UI, uses Cal Atoms.
- **Sidecar API (Nest.js)** — Handles questionnaires, Sensitive Mode, policies, redaction, webhooks, summaries.
- **Workers (Railway)** — Optional background tasks for reminders, AI summaries, sync.
- **Database:** Neon (Postgres).
- **Cache/Queue:** optional Upstash Redis (for BullMQ).

## Data Boundaries
| Layer | Responsible Data |
|-------|------------------|
| Cal Platform | Events, availability, provider integrations |
| Sidecar | Encrypted intake, summaries, policies, logs |
| Frontend | Display and user input only |

## Security
- AES-GCM encryption for sensitive fields.
- JWT for dashboard auth; short-lived tokens for Atoms.
- Audit all decrypts, enforce retention policies.

## Observability
- Logs: structured JSON.
- Metrics: queue depth, webhook latency.
- Alerts: webhook failure, token errors.
