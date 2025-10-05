
# ChurchHub Product Style Guide (Single Source of Truth)
**Version:** 1.0 • **Last Updated:** 2025-10-05  
**Applies to:** *All* user‑facing features (public booking, dashboard, admin, email templates where applicable)

This guide defines **foundations (color, type, space, motion)** and **usage rules** for a consistent, accessible, pastoral-friendly UI.

---

## 1) Brand Principles
- **Clear, calm, compassionate.** Reflect pastoral care: reduce anxiety, avoid hype.
- **Privacy by design.** Avoid exposing sensitive content; use 🔒 affordances.
- **Accessible by default.** Contrast ≥ 4.5:1, keyboard-first, screen reader aware.
- **Consistent, predictable, minimal.** One token system; fewer variants over more.

---

## 2) Color System
All colors are defined as CSS variables (HSL) and mapped to Tailwind for utility usage.

### 2.1 Semantic Palette (Light Mode)
| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--bg` | `0 0% 100%` | `#FFFFFF` | App background |
| `--bg-elevated` | `0 0% 98%` | `#FAFAFA` | Cards, panels |
| `--fg` | `222 47% 11%` | `#0F172A` | Primary text |
| `--fg-muted` | `222 8% 40%` | `#666D77` | Secondary text |
| `--fg-subtle` | `222 8% 55%` | `#8B919A` | Tertiary text |
| `--border` | `220 13% 91%` | `#E5E7EB` | Dividers, inputs |
| `--ring` | `217 91% 60%` | `#60A5FA` | Focus ring |
| `--brand` | `222 47% 11%` | `#0F172A` | Brand surfaces/primary |
| `--brand-foreground` | `0 0% 100%` | `#FFFFFF` | Text on brand |
| `--accent` | `221 83% 53%` | `#2563EB` | Info, links |
| `--success` | `142 72% 29%` | `#15803D` | Success states |
| `--warning` | `38 92% 50%` | `#F59E0B` | Caution states |
| `--danger` | `0 84% 60%` | `#EF4444` | Destructive states |

### 2.2 Dark Mode Overrides
```css
.dark {
  --bg: 222 47% 6%;
  --bg-elevated: 222 47% 9%;
  --fg: 210 40% 98%;
  --fg-muted: 215 20% 65%;
  --fg-subtle: 215 20% 55%;
  --border: 217 33% 17%;
  --ring: 217 91% 60%;
  /* Slightly brighter brand for contrast */
  --brand: 222 47% 60%;
  --brand-foreground: 222 47% 6%;
}
```

### 2.3 CSS Variables (Foundations)
```css
:root {
  /* color tokens (HSL values only) */
  --bg: 0 0% 100%;
  --bg-elevated: 0 0% 98%;
  --fg: 222 47% 11%;
  --fg-muted: 222 8% 40%;
  --fg-subtle: 222 8% 55%;
  --brand: 222 47% 11%;
  --brand-foreground: 0 0% 100%;
  --accent: 221 83% 53%;
  --success: 142 72% 29%;
  --warning: 38 92% 50%;
  --danger: 0 84% 60%;
  --border: 220 13% 91%;
  --ring: 217 91% 60%;
}
```

---

## 3) Typography
### 3.1 Font Stack
- **Primary:** Inter (variable)  
- **Fallbacks:** ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Helvetica Neue, Arial

Load via CSS (self-host or Google Fonts) and set in `:root` body.

### 3.2 Type Scale & Weights
| Token | Size | Line | Weight | Use |
|---|---|---|---|---|
| `--text-3xl` | 30px | 36px | 700 | H1 |
| `--text-2xl` | 24px | 32px | 700 | H2 |
| `--text-xl` | 20px | 28px | 600 | H3 |
| `--text-lg` | 18px | 26px | 600 | Section headings |
| `--text-md` | 16px | 24px | 400–500 | Body |
| `--text-sm` | 14px | 20px | 400–500 | Secondary |
| `--text-xs` | 12px | 18px | 400–500 | Meta |

**Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold).  
**Rules:** Headings use 600+; body 400–500; avoid >700 except display hero.

### 3.3 CSS Tokens
```css
:root {
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-md: 1rem;      /* 16px */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.25rem;   /* 20px */
  --text-2xl: 1.5rem;   /* 24px */
  --text-3xl: 1.875rem; /* 30px */
}
body { font-family: Inter, ui-sans-serif, system-ui; font-weight: 400; }
h1, h2, h3 { font-weight: 700; }
```

**Writing style:** sentence case; concise; no exclamation points in app UI; avoid jargon.

---

## 4) Spacing, Radius, Elevation, Motion
### 4.1 Spacing Scale
`2, 4, 6, 8, 12, 16, 24, 32` (px). Use Tailwind utilities (`p-4`, `gap-6`).

### 4.2 Radius
`--radius-0: 0px; --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;`  
Cards/inputs: md; dialogs: lg; buttons follow variant.

### 4.3 Elevation
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 8px -2px rgb(0 0 0 / 0.10);
  --shadow-lg: 0 12px 20px -4px rgb(0 0 0 / 0.15);
}
```

### 4.4 Motion
Durations: 100/150/200/250ms, easing: `cubic-bezier(0.2, 0.0, 0.2, 1)`  
Respect `prefers-reduced-motion` (disable non-essential transitions).

---

## 5) Tailwind Mapping (Snippet)
```ts
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        "bg-elevated": "hsl(var(--bg-elevated))",
        fg: "hsl(var(--fg))",
        "fg-muted": "hsl(var(--fg-muted))",
        "fg-subtle": "hsl(var(--fg-subtle))",
        brand: "hsl(var(--brand))",
        "brand-foreground": "hsl(var(--brand-foreground))",
        accent: "hsl(var(--accent))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        none: "var(--radius-0)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-md)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
      },
    },
  },
  plugins: [],
}
```

---

## 6) Component Standards (shadcn/ui)
### Buttons
- **Variants:** `primary` (brand bg / brand-foreground), `secondary` (bg-elevated / fg), `ghost` (transparent fg), `destructive` (danger / white).
- **Sizes:** `sm` (32px), `md` (40px), `lg` (48px).  
- **Loading:** spinner left, keep width stable, disable pointer events.  
- **Icon-only:** 36×36 min; add `aria-label`.

### Inputs & Forms
- Always pair with `<Label>`; placeholders are hints only.  
- Validation: RHF + Zod; errors below field (sm, muted red text).  
- Required fields marked with an asterisk in label text, not only color.

### Cards
- Flat by default; `shadow-md` only when clickable or elevated content.  
- Padding: 16–24px; use `--bg-elevated` background.

### Dialog/Sheet
- Trap focus; `Esc` closes; close button visible to screen readers.  
- Use Dialog for small forms; Sheet (drawer) for multi-field flows.

### Table
- Use zebra striping, sticky header when >8 rows.  
- Provide rows-per-page and search where applicable.

### Badges & Status
- Info → `accent`; Success → `success`; Warning → `warning`; Danger → `danger`.  
- **Sensitive** badge shows 🔒 icon and tooltip: “Sensitive—details are restricted.”

---

## 7) Layout Patterns
- **Public booking:** Centered container (`max-w-3xl`) → Card → `<CalProvider><Booker/></CalProvider>`.
- **Dashboard:** Sidebar (240px) + Content with 24px padding; 2–3 column cards on desktop.
- **Secure Notes:** Single column, Summary card at top, “View history” collapsible.

---

## 8) Accessibility Rules (Do/Don’t)
**Do**
- Keep focus rings visible (`outline: 2px solid hsl(var(--ring))`).  
- Ensure all interactive elements have accessible names.  
- Announce validation errors with ARIA live region.

**Don’t**
- Hide labels; don’t rely on color only for state.  
- Put sensitive info in toasts/snackbars.

---

## 9) Content & Tone
- **Neutral, respectful** language.  
- Sentence case titles (3–6 words).  
- Never include sensitive details in notifications; use “Secure notes updated” instead.

---

## 10) Iconography
- **Lucide** icons, 20–24px, stroke 1.5.  
- Pair with text except universal icons (close, chevron).  
- Icons are `aria-hidden="true"` unless standalone.

---

## 11) Email Styling (Transactional)
- Use same typography tokens; plain layout; high contrast.  
- Avoid sensitive content—link back to secure notes.

---

## 12) Implementation Snippets
### 12.1 Global CSS
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { /* tokens here (see sections above) */ }
.dark { /* dark tokens */ }

/* Focus ring */
:focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }
```

### 12.2 Example Button Variant (shadcn/ui)
```tsx
// button.tsx (variant map idea)
const variants = {
  primary: "bg-brand text-brand-foreground hover:opacity-95",
  secondary: "bg-bg-elevated text-fg hover:bg-white/60",
  ghost: "bg-transparent hover:bg-bg-elevated",
  destructive: "bg-danger text-white hover:opacity-95",
}
```

### 12.3 Sample Summary Card
```tsx
export function SummaryCard({ text, chips }: { text: string; chips: string[] }) {
  return (
    <div className="rounded-md border border-border bg-bg-elevated p-4 shadow-sm">
      <div className="text-sm text-fg">{text}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="inline-flex items-center rounded-full border px-2 py-1 text-xs text-fg-muted">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
```

---

## 13) Governance
- All new components must use tokens—no hard-coded colors/sizes.  
- Run accessibility checks in CI (axe, Playwright).  
- Changes to tokens require a minor version bump of this guide.

---

### Appendix A — Token Reference (Copy/Paste)
```css
:root {
  --bg: 0 0% 100%;
  --bg-elevated: 0 0% 98%;
  --fg: 222 47% 11%;
  --fg-muted: 222 8% 40%;
  --fg-subtle: 222 8% 55%;
  --brand: 222 47% 11%;
  --brand-foreground: 0 0% 100%;
  --accent: 221 83% 53%;
  --success: 142 72% 29%;
  --warning: 38 92% 50%;
  --danger: 0 84% 60%;
  --border: 220 13% 91%;
  --ring: 217 91% 60%;

  --radius-0: 0px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 8px -2px rgb(0 0 0 / 0.10);
  --shadow-lg: 0 12px 20px -4px rgb(0 0 0 / 0.15);

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
}
```
