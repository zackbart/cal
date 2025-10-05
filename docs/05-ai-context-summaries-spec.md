
# Context-Only Summaries Specification

**Goal:** One or two sentences describing the meeting context, no advice or recommendations.

## Output Schema
topic, participants, sensitivity, location, when, duration, plainText.

## Worker Flow
- Trigger on booking.updated or T-24h.
- Decrypt intake, sanitize, summarize, store encrypted.

## Privacy
- AES-GCM encryption, no PII in summaries.
- Never emailed; only shown in Secure Notes.
