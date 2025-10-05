
# ChurchHub Scheduler — Development Plan

**Hosting:** Managed (Vercel + Railway + Neon + optional Upstash)

## Phase 0 – Setup
- Repos for web, API, worker.
- Configure Cal Platform OAuth + webhooks.
- Provision Neon + Railway.

## Phase 1 – Cal Atoms Integration
- /book/[username] with <Booker/>.
- Mint managed-user tokens via API route.
- Handle webhooks booking.created|updated.

## Phase 2 – Questionnaires & Sensitive Mode
- Questionnaire builder (shadcn + RHF + Zod).
- Encrypt intake; support anonymity & redaction.
- Secure Notes page.

## Phase 3 – Policy Enforcement
- Caps/day-week, buffers, quiet hours.
- Inline validation before booking commit.

## Phase 4 – Reminders & Notifications
- Use Postgres or Redis-based jobs.
- Send via SendGrid/Twilio.

## Phase 5 – Context Summaries
- Rule-based fallback.
- AI summaries (optional).

## Phase 6 – Beta & Hardening
- E2E & integration tests.
- Audit & observability.
