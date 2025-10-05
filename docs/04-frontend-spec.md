
# Frontend Specification (Next.js + shadcn/ui + Cal Atoms)

**Hosting:** Vercel  
**Tech:** Next.js, TypeScript, Tailwind, shadcn/ui, Cal Atoms.

## Key Routes
- /book/[username] → Atoms booking UI.
- /dashboard → Overview.
- /dashboard/forms → Form builder.
- /dashboard/policies → Policy editor.
- /dashboard/secure-notes/[bookingId] → Intake view + context summary.

## UI
- shadcn/ui components (card, form, dialog, sheet).
- Dark/light mode via next-themes.
- Brutalist-inspired design (bold typography, neutral palette).

## Data
- TanStack Query + Route Handlers.
- Auth via NextAuth or custom JWT.
