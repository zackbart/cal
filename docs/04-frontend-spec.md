
# Frontend Specification (Next.js + shadcn/ui + Cal Atoms)

**Hosting:** Vercel  
**Tech:** Next.js, TypeScript, Tailwind, shadcn/ui, Cal Atoms.

## Key Routes
- /book/[username] → Pre-booking questionnaire → Cal.com embed booking UI.
- /dashboard → Overview.
- /dashboard/forms → Form builder.
- /dashboard/policies → Policy editor.
- /dashboard/secure-notes/[bookingId] → Intake view + context summary.

## Booking Flow (Phase 2)
1. User visits `/book/[username]`
2. **Multi-step questionnaire** appears first (Typeform/Airtable style)
3. User progresses through steps with smooth transitions
4. **Questionnaire completion** triggers Cal.com embed
5. **Cal.com embed loads** with pre-filled questionnaire data
6. User selects time and completes booking
7. Webhook triggers sidecar processing

## UI
- shadcn/ui components (card, form, dialog, sheet).
- Dark/light mode via next-themes.
- Brutalist-inspired design (bold typography, neutral palette).

## Data
- TanStack Query + Route Handlers.
- Auth via NextAuth or custom JWT.
