# SWMS — Premium UI/UX Redesign Blueprint

### Skill Workshop Management System · Bangladesh Market · Production-Ready

> **How to read this document**: Every section is implementation-ready. No guesswork. Every value is exact. Every behavior is described. A developer who has never seen this product should be able to build it from this document alone.

---

# PART 1 — GLOBAL DESIGN SYSTEM

---

## 1.1 🎨 Color System

### Rationale

The existing blue-violet is too corporate and cold for a skills marketplace in Bangladesh. We evolve to a richer, more saturated **Deep Violet** primary paired with **Warm Amber** as the accent — creating the emotional register of "premium knowledge, warm guidance." The palette is built in oklch for perceptual uniformity across light/dark modes.

### Primary Palette (oklch)

```css
:root {
  /* === PRIMARY — Deep Violet === */
  --primary: oklch(0.42 0.25 272); /* #4318A8 equiv — rich, authoritative */
  --primary-hover: oklch(0.38 0.25 272); /* 10% darker on hover */
  --primary-active: oklch(0.34 0.25 272); /* pressed state */
  --primary-subtle: oklch(0.95 0.06 272); /* tinted background fills */
  --primary-foreground: oklch(0.99 0.005 272); /* white text on primary */

  /* === ACCENT — Warm Amber === */
  --accent: oklch(0.78 0.18 68); /* #F5A623 equiv — energy, warmth */
  --accent-hover: oklch(0.73 0.18 68);
  --accent-foreground: oklch(0.18 0.05 68); /* near-black text on amber */
  --accent-subtle: oklch(0.96 0.06 68); /* amber tint for badges */

  /* === SUCCESS — Rich Green === */
  --success: oklch(0.55 0.2 148); /* #1D8A4E */
  --success-subtle: oklch(0.95 0.06 148);
  --success-foreground: oklch(0.99 0.01 148);

  /* === DANGER — Vivid Crimson === */
  --danger: oklch(0.52 0.24 22); /* #D93025 */
  --danger-hover: oklch(0.47 0.24 22);
  --danger-subtle: oklch(0.96 0.06 22);
  --danger-foreground: oklch(0.99 0.01 22);

  /* === WARNING — Saffron === */
  --warning: oklch(0.72 0.17 50); /* #E87C00 */
  --warning-subtle: oklch(0.97 0.05 50);
  --warning-foreground: oklch(0.2 0.05 50);

  /* === INFO — Cerulean === */
  --info: oklch(0.58 0.18 230);
  --info-subtle: oklch(0.95 0.05 230);
  --info-foreground: oklch(0.99 0.01 230);

  /* === BACKGROUND SYSTEM (Light) === */
  --background: oklch(0.988 0.006 270); /* warm near-white, violet undertone */
  --surface-1: oklch(0.975 0.01 270); /* cards on page background */
  --surface-2: oklch(0.96 0.014 270); /* modals, elevated cards */
  --surface-3: oklch(0.94 0.018 272); /* hovered cards, inputs */

  /* === FOREGROUND / TEXT === */
  --foreground: oklch(0.16 0.04 270); /* near-black, slight violet cast */
  --foreground-subtle: oklch(0.4 0.04 270); /* secondary text */
  --foreground-muted: oklch(0.62 0.03 270); /* placeholders, captions */
  --foreground-disabled: oklch(0.75 0.02 270);

  /* === BORDER / DIVIDER === */
  --border: oklch(0.88 0.02 270);
  --border-strong: oklch(0.74 0.04 270);
  --border-focus: oklch(0.42 0.25 272); /* = primary, for focus rings */

  /* === SPECIAL SURFACES === */
  --sidebar-bg: oklch(0.1 0.04 272); /* dashboard sidebar — near-black */
  --sidebar-text: oklch(0.92 0.02 270);
  --sidebar-text-muted: oklch(0.58 0.04 270);
  --sidebar-active: oklch(0.42 0.25 272); /* active nav item */
  --sidebar-hover: oklch(0.18 0.05 272);
  --sidebar-border: oklch(0.2 0.05 272);
}

.dark {
  --primary: oklch(0.68 0.22 272); /* lighter for dark bg readability */
  --primary-hover: oklch(0.73 0.22 272);
  --primary-subtle: oklch(0.18 0.08 272);
  --primary-foreground: oklch(0.1 0.03 272); /* dark text on light primary */

  --accent: oklch(0.78 0.18 68);
  --accent-subtle: oklch(0.18 0.07 68);

  --background: oklch(0.1 0.025 270); /* rich near-black */
  --surface-1: oklch(0.14 0.03 270);
  --surface-2: oklch(0.18 0.035 272);
  --surface-3: oklch(0.22 0.04 272);

  --foreground: oklch(0.94 0.012 270);
  --foreground-subtle: oklch(0.72 0.025 270);
  --foreground-muted: oklch(0.52 0.025 270);
  --foreground-disabled: oklch(0.35 0.02 270);

  --border: oklch(0.24 0.04 270);
  --border-strong: oklch(0.34 0.05 270);

  --success-subtle: oklch(0.16 0.07 148);
  --danger-subtle: oklch(0.16 0.08 22);
  --warning-subtle: oklch(0.16 0.06 50);
  --info-subtle: oklch(0.15 0.06 230);
}
```

### Status Badge Color Map (extends existing StatusBadge component)

```
PENDING / PENDING_PAYMENT    → warning   (amber, --warning-subtle bg, --warning text)
COMPLETE / PAID / ACTIVE     → success   (green, --success-subtle bg, --success text)
CANCEL / FAILED / BLOCKED    → danger    (red, --danger-subtle bg, --danger text)
DRAFT / UNPAID               → muted     (--surface-3 bg, --foreground-muted text)
REFUNDED / PROCESSING        → info      (blue, --info-subtle bg, --info text)
```

---

## 1.2 🔤 Typography

### Font Stack Decision

**Replace Geist Sans** with a more characterful pairing:

- **Display / Headings**: `"Bricolage Grotesque"` — highly expressive variable grotesque; conveys confidence and modernity without feeling cold. Self-hosted via `next/font/google`.
- **UI / Body**: `"DM Sans"` — geometric, neutral, excellent x-height, superior legibility at small sizes. Self-hosted.
- **Mono**: `"JetBrains Mono"` — used only for transaction IDs, code displays.

```tsx
// app/layout.tsx — Font loading
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});
```

### Type Scale

```css
/* Add to globals.css */
:root {
  --font-display: "Bricolage Grotesque", sans-serif;
  --font-body: "DM Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

/* Body base */
body {
  font-family: var(--font-body);
}
```

| Token         | Tailwind Class | Size | Weight | Line Height | Letter Spacing | Usage                  |
| ------------- | -------------- | ---- | ------ | ----------- | -------------- | ---------------------- |
| `display-2xl` | `text-[72px]`  | 72px | 800    | 1.0         | -0.04em        | Hero H1 only           |
| `display-xl`  | `text-[56px]`  | 56px | 700    | 1.08        | -0.03em        | Page H1                |
| `display-lg`  | `text-[40px]`  | 40px | 700    | 1.12        | -0.02em        | Section headings       |
| `display-md`  | `text-[32px]`  | 32px | 700    | 1.18        | -0.015em       | Card headings          |
| `display-sm`  | `text-[24px]`  | 24px | 600    | 1.25        | -0.01em        | Sub-headings           |
| `text-xl`     | `text-xl`      | 20px | 500    | 1.4         | 0              | Lead text, card titles |
| `text-lg`     | `text-lg`      | 18px | 400    | 1.55        | 0              | Body large             |
| `text-base`   | `text-base`    | 16px | 400    | 1.6         | 0              | Body default           |
| `text-sm`     | `text-sm`      | 14px | 400    | 1.55        | 0.01em         | UI labels, small body  |
| `text-xs`     | `text-xs`      | 12px | 500    | 1.5         | 0.02em         | Captions, tags         |
| `text-2xs`    | `text-[11px]`  | 11px | 600    | 1.4         | 0.04em         | Eyebrows, overlines    |

### Font Family Application Rules

- `font-display` class → apply `Bricolage Grotesque` → use on: ALL headings (H1–H3), hero text, section titles, stat numbers, card titles, CTA buttons (not form buttons)
- `font-body` → default everywhere else
- `font-mono` → transaction IDs, timestamps in admin tables, code snippets

### Custom Tailwind Plugin (add to tailwind.config)

```js
// tailwind.config.ts additions
theme: {
  extend: {
    fontFamily: {
      display: ["var(--font-display)", "sans-serif"],
      body:    ["var(--font-body)",    "sans-serif"],
      mono:    ["var(--font-mono)",    "monospace"],
    }
  }
}
```

---

## 1.3 🧩 Component Style System

### Buttons

**Primary Button** (the single most important element on any conversion-critical page)

```css
/* Default */
bg: --primary | text: --primary-foreground | border-radius: 10px
padding: 10px 20px | font: DM Sans 15px/500 | letter-spacing: 0.01em
box-shadow: 0 1px 3px oklch(0 0 0 / 0.12), 0 4px 12px oklch(0.42 0.25 272 / 0.30)

/* Hover (translate + shadow lift) */
transform: translateY(-1px)
box-shadow: 0 2px 6px oklch(0 0 0 / 0.15), 0 8px 24px oklch(0.42 0.25 272 / 0.35)
transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)  /* spring */

/* Active (sink back) */
transform: translateY(0px) scale(0.98)
box-shadow: 0 1px 2px oklch(0 0 0 / 0.10)

/* Disabled */
opacity: 0.45 | cursor: not-allowed | no transform
```

**Secondary Button (outlined)**

```css
bg: transparent | border: 1.5px solid --border-strong | text: --foreground
border-radius: 10px | padding: 9px 19px (1px less to compensate border)

/* Hover */
bg: --surface-2 | border-color: --primary | text: --primary
transform: translateY(-1px) | transition: 200ms spring
```

**Destructive Button**

```css
bg: --danger | text: --danger-foreground
/* same spring hover/active as primary */
box-shadow: 0 4px 12px oklch(0.52 0.24 22 / 0.30)
```

**Ghost Button** (sidebar items, toolbar actions)

```css
bg: transparent | text: --foreground-subtle | border-radius: 8px
padding: 8px 12px

/* Hover */
bg: --surface-2 | text: --foreground | no border
transition: 150ms ease
```

**Icon Button** (table actions, header icons)

```css
width: 36px | height: 36px | border-radius: 8px
display: flex | align-items: center | justify-content: center

/* Hover */
bg: --surface-2 | scale(1.05) | transition: 150ms ease
```

**Loading State (all buttons)**

```tsx
// Spinner replaces icon/text, button stays same width
// Use Framer Motion AnimatePresence for smooth swap
<AnimatePresence mode="wait">
  {loading ? (
    <motion.span key="spinner" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
      <Loader2 className="animate-spin" />
    </motion.span>
  ) : (
    <motion.span key="label" ...>Label</motion.span>
  )}
</AnimatePresence>
```

---

### Cards

**Base Card**

```css
bg: --surface-1 | border: 1px solid --border | border-radius: 16px
box-shadow: 0 1px 4px oklch(0 0 0 / 0.06), 0 0 0 1px oklch(0 0 0 / 0.02)
padding: 24px

/* Hover (interactive cards only) */
border-color: --border-strong
box-shadow: 0 4px 16px oklch(0 0 0 / 0.10), 0 1px 4px oklch(0 0 0 / 0.06)
transform: translateY(-2px)
transition: all 250ms cubic-bezier(0.22, 1, 0.36, 1)
```

**Workshop Card (catalog)**

```css
border-radius: 20px | overflow: hidden
/* Image top 56.25% (16:9) with object-fit: cover */
/* Body padding: 20px */
/* Badges: top-left absolute overlay on image */
/* Price: highlighted in --accent text color */
```

**Stats Card (dashboard)**

```css
border-radius: 16px | padding: 24px
/* Icon: 48×48 pill in --primary-subtle bg */
/* Number: 36px Bricolage Grotesque 700 */
/* Trend arrow: colored icon + percentage text */
```

**Category Card (marketing)**

```css
border-radius: 20px | aspect-ratio: 1 | overflow: hidden
/* Background: category thumbnail or gradient placeholder */
/* Text overlay: white text on dark gradient overlay */
/* Hover: scale(1.03) on image + overlay darkens */
```

---

### Inputs

```css
/* Base */
height: 44px | border-radius: 10px | border: 1.5px solid --border
bg: --background | padding: 0 14px | font-size: 15px | font-family: DM Sans
color: --foreground | placeholder-color: --foreground-muted
transition: border-color 150ms ease, box-shadow 150ms ease

/* Focus */
border-color: --border-focus | outline: none
box-shadow: 0 0 0 3px oklch(0.42 0.25 272 / 0.12)

/* Error */
border-color: --danger
box-shadow: 0 0 0 3px oklch(0.52 0.24 22 / 0.10)

/* Disabled */
bg: --surface-3 | opacity: 0.65 | cursor: not-allowed

/* Textarea */
min-height: 120px | padding: 12px 14px | resize: vertical
```

**Search Input (catalog/tables)**

```css
/* Prepend: Search icon in muted color, 20px, left: 14px */
/* Input padding-left: 44px */
/* When focused: icon turns primary */
/* Has X button (clear) when value !== "" */
```

---

### Badges / Tags

```css
/* Base badge */
height: 24px | padding: 0 10px | border-radius: 6px
font-size: 12px | font-weight: 600 | letter-spacing: 0.02em
font-family: DM Sans | display: inline-flex | align-items: center | gap: 5px

/* Dot variant (status indicator) */
/* Prepend 6px circle in matching foreground color */

/* Large badge (on Workshop Detail hero) */
height: 30px | padding: 0 14px | border-radius: 8px | font-size: 13px
```

---

### Modals / Dialogs

```css
/* Overlay */
bg: oklch(0 0 0 / 0.50) | backdrop-filter: blur(4px)

/* Panel */
bg: --surface-2 | border-radius: 20px | border: 1px solid --border
box-shadow: 0 24px 64px oklch(0 0 0 / 0.24), 0 8px 24px oklch(0 0 0 / 0.12)
max-width: 520px | padding: 32px

/* Header */
font: Bricolage Grotesque 24px/700 | margin-bottom: 8px

/* Animation (Framer Motion) */
initial: { opacity: 0, scale: 0.95, y: 8 }
animate: { opacity: 1, scale: 1, y: 0 }
exit:    { opacity: 0, scale: 0.95, y: 8 }
transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
```

---

### Tables

```css
/* Table container */
border-radius: 16px | border: 1px solid --border | overflow: hidden

/* Header row */
bg: --surface-2 | height: 44px | font: DM Sans 12px/600
letter-spacing: 0.04em | text-transform: uppercase | color: --foreground-muted
border-bottom: 1px solid --border

/* Data row */
height: 60px | border-bottom: 1px solid --border
transition: background 120ms ease

/* Row hover */
bg: --surface-1

/* Last row */
border-bottom: none

/* Cell padding */
padding: 0 16px

/* Action cell */
width: 120px | display: flex | gap: 4px | justify-content: flex-end
```

---

## 1.4 🌫 Shadows & Depth (Elevation System)

| Level         | CSS                                                         | Usage                               |
| ------------- | ----------------------------------------------------------- | ----------------------------------- |
| 0 — Flat      | `none`                                                      | Inline elements, disabled cards     |
| 1 — Raised    | `0 1px 3px oklch(0 0 0/.08), 0 1px 2px oklch(0 0 0/.06)`    | Cards at rest, inputs               |
| 2 — Float     | `0 4px 12px oklch(0 0 0/.10), 0 2px 6px oklch(0 0 0/.08)`   | Hovered cards, dropdowns            |
| 3 — Overlay   | `0 8px 24px oklch(0 0 0/.14), 0 4px 12px oklch(0 0 0/.10)`  | Sticky sidebar, fixed headers       |
| 4 — Modal     | `0 24px 64px oklch(0 0 0/.24), 0 8px 24px oklch(0 0 0/.12)` | Dialogs, modals                     |
| 5 — Spotlight | `0 32px 80px oklch(0.42 0.25 272 / 0.20)`                   | Primary CTA buttons, featured cards |

**Primary Glow** (use on primary buttons, featured CTAs):
`box-shadow: 0 4px 20px oklch(0.42 0.25 272 / 0.35)`

**Amber Glow** (use on accent elements, "Enroll Now" button):
`box-shadow: 0 4px 20px oklch(0.78 0.18 68 / 0.40)`

**Dark mode**: reduce all opacity values by 0.3 (shadows are less needed on dark surfaces).

---

## 1.5 🎞 Motion System

### Core Easing Functions

```css
:root {
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy, feels alive */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); /* smooth deceleration */
  --ease-out-circ: cubic-bezier(0, 0.55, 0.45, 1); /* snappy exit */
  --ease-in-expo: cubic-bezier(0.7, 0, 0.84, 0); /* elements leaving screen */
}
```

### Timing Standards

| Action                       | Duration      | Easing          |
| ---------------------------- | ------------- | --------------- |
| Hover state (color/bg)       | 150ms         | ease            |
| Hover state (transform)      | 200ms         | --ease-spring   |
| Button press (active)        | 80ms          | ease-out        |
| Page transition (fade+slide) | 300ms         | --ease-out-expo |
| Modal open                   | 200ms         | --ease-out-expo |
| Modal close                  | 150ms         | --ease-in-expo  |
| Card reveal (scroll)         | 500ms         | --ease-out-expo |
| Stagger delay (list items)   | 60ms per item | —               |
| Skeleton shimmer             | 1.8s          | linear infinite |
| Toast in                     | 250ms         | --ease-spring   |
| Toast out                    | 200ms         | --ease-in-expo  |
| Number counter (stats)       | 1200ms        | --ease-out-expo |

### Framer Motion Reusable Variants

Define these once in `lib/motion-variants.ts` and import everywhere:

```ts
export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export const slideInRight = {
  initial: { opacity: 0, x: 32 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export const countUp = {
  // Used with useSpring from framer-motion for number animation
  // spring: { stiffness: 80, damping: 20 }
};
```

### When Motion Should Fire

- **On mount**: Hero content, dashboard greeting, first-visit only (no repeat on route change)
- **On scroll**: Cards, section headings — use Intersection Observer (not scroll-distance). Trigger at 15% visible.
- **On hover**: Buttons (transform), cards (elevation), nav items (underline grow), icons (rotate/scale)
- **On interaction**: Button press, form submit, dialog open/close, toast, tab switch
- **Never**: Motion on every keystroke, motion on data refetch, motion on resize

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# PART 2 — CORE UX PRINCIPLES FOR THIS PRODUCT

---

## 2.1 What the User Should FEEL

| User Type      | Emotion on Entry                                           | Emotion on Exit                                      |
| -------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| **Student**    | "This platform is legit. People get real skills here."     | "I want this. I'm enrolling right now."              |
| **Instructor** | "I can build my reputation here. This feels professional." | "Creating a workshop is easy. My time is respected." |
| **Admin**      | "I have full visibility. Everything is organized."         | "I controlled everything I needed to."               |

---

## 2.2 The Conversion Hierarchy (what the UI must always optimize for)

```
1st Priority → Student clicks "Enroll Now" on Workshop Detail
2nd Priority → Student registers (account creation)
3rd Priority → Instructor creates their first workshop
4th Priority → Returning user completes a pending payment
```

**Every UI decision must be evaluated against this hierarchy.**

---

## 2.3 How the UI Guides the Primary Action

### Rule 1: One CTA per screen section

Never put two equal-weight CTAs side by side. One is Primary (filled), one is Ghost.

### Rule 2: The Enrollment Button is sacred

On Workshop Detail: The right sidebar `EnrollButton` must be permanently visible (sticky on desktop, bottom-fixed on mobile). Its state must be crystal clear. No cognitive friction between "want" and "enroll."

### Rule 3: Trust before transaction

Always show: Instructor credibility → social proof (seat count) → money-back guarantee → THEN the price. Order matters.

### Rule 4: Progress reduces abandonment

Multi-step forms (registration, workshop creation) need a visible step indicator. Users who can see progress continue.

### Rule 5: Empty states are opportunities

Never show a blank screen. Every empty state gets: an illustration, a clear explanation, and one primary action. Students with no enrollments see "Browse Popular Workshops." Instructors with no workshops see "Create your first workshop."

---

# PART 3 — PAGE-BY-PAGE REDESIGN

---

## PAGE 1: HOMEPAGE (`/`)

### 🎯 Goal

Convert browser into registrant. Create immediate impression of quality and trust. Push to Workshop Catalog.

---

### Section 1: Navigation (PublicNavbar)

**Height**: 72px fixed sticky. **Background**: `--background / 92%` with `backdrop-filter: blur(20px)`. 1px bottom border `--border`. `box-shadow: 0 1px 0 --border` (subtle, not heavy).

**Layout**: `max-w-7xl` centered, 3-column flex:

- Left: Logo (text mark "Skill Workshop" — "Skill" in `--foreground` Bricolage Grotesque 700, "Workshop" in `--primary` 700)
- Center: Nav links (Home, Workshops, Categories, About, Contact) — DM Sans 15px/500, `--foreground-subtle`. On hover: color transitions to `--foreground` in 150ms + 2px underline grows from center (width: 0→100%, `transform-origin: center`, 200ms ease-out)
- Right: ThemeToggle icon button + Login (ghost) + "Get Started" (primary, small)

**Mobile (<768px)**: Logo + hamburger icon. Hamburger opens a Sheet from right. Sheet contains stacked nav links, ThemeToggle, Login, Register. Sheet has 80% width, closes on link click.

**Auth state**: When logged in, right side replaces Login/Register with: Notification bell + Avatar dropdown (Dashboard, Profile, Logout).

**Scroll behavior**: On scroll > 50px: increase shadow to elevation-3, reduce height to 64px (100ms transition).

---

### Section 2: Hero

**Layout**: Full width, `min-height: calc(100vh - 72px)` (fills above fold). `padding: 100px 0 80px`.

**Background construction** (critical — creates "WOW" immediately):

```css
/* Layer stack (bottom to top): */
1. Base: --background
2. Radial gradient blob (top-right): 800px circle, --primary at 5% opacity, blurred 120px. CSS: `background: radial-gradient(ellipse 800px 600px at 78% 20%, oklch(0.42 0.25 272 / 0.08) 0%, transparent 70%)`
3. Dot grid pattern: `background-image: radial-gradient(oklch(0.42 0.25 272 / 0.12) 1px, transparent 1px); background-size: 24px 24px`
4. Amber blob (bottom-left): `radial-gradient(ellipse 500px 400px at 15% 85%, oklch(0.78 0.18 68 / 0.06) 0%, transparent 60%)`
5. Top fade: `linear-gradient(to bottom, transparent 60%, --background 100%)`
```

**Content**: Two-column, 50/50, center-aligned vertically. Gap: 64px.

**Left column**:

- Eyebrow: Pill badge — "🇧🇩 Made for Bangladesh" — `--accent-subtle` bg, `--accent-foreground` text, 12px/600, border-radius: 999px, padding: 4px 12px. Appears with `fadeInUp` 0ms delay.
- H1: "Unlock Real Skills. Build Your Future." — `font-display`, 56px/800, `--foreground`, letter-spacing: -0.03em, line-height: 1.08. "Real Skills" underlined with hand-drawn SVG underline in `--accent`. Appears at 100ms delay.
- Lead text: "Connect with industry experts across Bangladesh through hands-on workshops designed for real-world results." — DM Sans 18px/400, `--foreground-subtle`, max-width: 480px. Appears at 200ms.
- CTA row: `gap: 12px`. "Browse Workshops" (primary large) + "Watch How It Works" (ghost with play icon). At 300ms.
- Stats row: 4 stats separated by `|` dividers. Animated counter on mount. Format: Number in `font-display 28px/700 --foreground` + Label in `12px/600 --foreground-muted uppercase`. Stats: `500+ Students · 50+ Workshops · 30+ Instructors · 4.8★ Rating`. At 400ms.

**Right column**: Hero illustration — DO NOT use stock photo. Instead: Abstract 3D-style composition built in SVG/CSS:

- Central floating card element showing a mini workshop preview (title, instructor avatar, price in BDT)
- 3 orbiting smaller badges: "Certificate", "Live Sessions", "Expert Mentors"
- Floating emoji/icon elements: 📊 💻 🎨 🔧 (relevant to workshop categories)
- Subtle rotation animation: the whole composition rotates 2deg → -2deg infinitely at 6s/ease-in-out
- Drop shadow: elevation-5 primary glow under the card

**Mobile**: Stack vertically. Illustration moves to top (60% width, centered). Left content below. Stats become 2×2 grid.

---

### Section 3: Stats Bar (Social Proof Strip)

**Position**: Right below hero, `padding: 24px 0`. `border-top: 1px solid --border; border-bottom: 1px solid --border`. `bg: --surface-1`.

**Layout**: 4 stats in a horizontal flex (space-evenly) with vertical separators. On mobile: 2×2 grid.

**Each stat**:

```
[Icon 24px in --primary-subtle circle]
[Number font-display 32px/700 --foreground]
[Label DM Sans 13px/500 --foreground-muted]
```

---

### Section 4: Featured Workshops

**Section header** (applies to all sections):

- Eyebrow: `font: DM Sans 12px/600 uppercase letter-spacing: 0.08em color: --primary`
- H2: `font: Bricolage Grotesque 40px/700 --foreground letter-spacing: -0.02em`
- Subtext: `DM Sans 17px/400 --foreground-subtle max-width: 560px`
- Right side: "View All Workshops →" ghost link button

**Grid**: 2×2 at desktop, `gap: 24px`. On tablet: 2 columns. On mobile: 1 column.

**Workshop Card (Featured variant)**:

```
border-radius: 20px | overflow: hidden | bg: --surface-1 | border: 1px solid --border
elevation-1 | hover → elevation-2 + translateY(-3px) | transition: 280ms ease-out-expo

[IMAGE]
height: 220px | object-fit: cover | background: --surface-3 (placeholder)
Image overlay (bottom): linear-gradient(to top, oklch(0 0 0 / 0.6), transparent 50%)

[BADGES — absolute top-left, 12px margin, flex gap-8px]
Level badge: --primary-subtle bg, --primary text
Category badge: --accent-subtle bg, --accent-foreground text

[PRICE — absolute top-right, 12px margin]
"৳12,500" — Bricolage Grotesque 16px/700 bg: --background/90 backdrop-blur:4px
padding: 4px 10px | border-radius: 8px

[BODY — padding: 20px]
Title: Bricolage Grotesque 18px/700 --foreground, 2-line clamp
Meta row: 📍 Location · 📅 Date — DM Sans 13px/400 --foreground-muted
[bottom row] Seats progress bar (thin, 4px, green→red based on capacity) + "Enroll →" link
```

---

### Section 5: Categories

**BG**: `--surface-1` band. `padding: 80px 0`.

**Grid**: 3 columns at desktop, auto-scroll carousel on mobile (snap-x, overflow-x-auto, no scrollbar).

**Category Card**:

```
border-radius: 20px | height: 200px | overflow: hidden | cursor: pointer
position: relative | border: 1px solid --border

[BACKGROUND]
Thumbnail image with object-fit: cover
Dark overlay: linear-gradient(to top, oklch(0 0 0 / 0.72) 30%, oklch(0 0 0 / 0.20) 100%)

[CONTENT — absolute bottom-0, padding: 20px]
Icon: 40px circle in --primary bg, white icon, margin-bottom: 12px
Name: Bricolage Grotesque 20px/700 white
Description: DM Sans 13px/400 oklch(1 0 0 / 0.75), 2-line clamp
Link: "Explore →" 13px/600 --accent

[HOVER]
Image scale: 1.06 (transition 400ms ease-out)
Overlay darkens slightly (0.72 → 0.80)
"Explore →" slides right 4px
```

---

### Section 6: Why Choose Us

**BG**: gradient from `--background` to `--primary-subtle`. `padding: 80px 0`.

**Grid**: 2×2 at desktop. On mobile: 1 column.

**Feature Card**:

```
bg: --background | border: 1px solid --border | border-radius: 20px | padding: 28px
elevation-1 | group | hover → elevation-2 + border-color: --primary/40

[Icon container]
width: 56px | height: 56px | border-radius: 14px | bg: --primary-subtle
Icon: 26px --primary | group-hover → scale(1.10) + bg: --primary + icon: white
transition: 250ms spring

[Content]
H3: Bricolage Grotesque 20px/700 --foreground | margin-top: 16px
P: DM Sans 15px/400 --foreground-subtle | line-height: 1.65 | margin-top: 8px
```

Features (in this order, anti-clockwise importance):

1. Expert Instructors — "Learn from verified industry professionals with years of real-world experience"
2. Hands-on Learning — "Practical workshops, not passive lectures. Build skills you can use on Day 1"
3. Flexible Schedule — "Choose workshops that fit your life. Weekend and evening batches available"
4. Industry Certificate — "Earn recognized certificates to boost your professional profile"

---

### Section 7: Testimonials

**BG**: `--background`. `padding: 80px 0`.

**Layout**: Masonry-style 2-column grid. 4 testimonials. Add 1 more for asymmetry (5 total in a 3+2 layout).

**Testimonial Card**:

```
bg: --surface-1 | border: 1px solid --border | border-radius: 20px | padding: 28px
elevation-1

[Quote mark]
font-size: 72px | color: --primary | opacity: 0.15 | line-height: 0 | margin-bottom: 16px
font-family: Georgia, serif (decorative only)

[Quote text]
DM Sans 16px/400 --foreground | line-height: 1.7 | margin-bottom: 20px

[Stars]
5 × ★ in --accent | font-size: 14px | gap: 2px

[Author row — margin-top: 20px | border-top: 1px solid --border | padding-top: 20px]
Avatar: 44px circle | initials fallback | bg: --primary text: white
Name: DM Sans 15px/600 --foreground
Role + Workshop: DM Sans 13px/400 --foreground-muted
```

---

### Section 8: CTA Banner

**BG**: `--primary` solid. `padding: 80px 0`.

**Layout**: Center-aligned text + 2 buttons.

**Content**:

- Eyebrow: "Join 500+ learners across Bangladesh" — `--primary-foreground/70` 12px/600 uppercase
- H2: "Your skills upgrade starts today." — Bricolage 40px/700 white
- Subtext: DM Sans 17px/400 `--primary-foreground/80`
- Buttons: "Browse Workshops" (white bg, --primary text) + "Become an Instructor" (outlined white border, white text)
- BG decoration: same dot pattern at 6% white opacity

---

### Section 9: Footer

**BG**: `oklch(0.08 0.03 272)` (near-black). **Color**: light text.

**Layout**: `padding: 64px 0 32px`. 4-column grid + bottom bar.

**Columns**:

1. Brand: Logo, 2-line tagline, social icons (Facebook, LinkedIn, Twitter, YouTube) as ghost icon buttons
2. Platform: Workshop Catalog, Categories, About Us, Contact, FAQ
3. For Instructors: Become an Instructor, Instructor Dashboard, Resources, Support
4. Contact: email, phone, address, office hours — with icons in --primary-subtle bg

**Bottom bar**: `border-top: 1px solid oklch(1 0 0 / 0.10)`. `padding-top: 24px`. Flex between copyright + Privacy Policy / Terms of Service links.

---

### 🎞 Homepage Interactions & Animations

- **Page load sequence**: Eyebrow badge (0ms) → H1 (100ms) → Lead (200ms) → CTAs (300ms) → Stats (400ms) → Hero illustration floats in from right (250ms)
- **Scroll reveals**: Each section fades up as it enters viewport. Use `IntersectionObserver` threshold: 0.15. One-time only (don't re-animate on scroll back up).
- **Stats counter**: Numbers animate from 0 to their value using `useSpring` from framer-motion. Triggers when stats bar enters viewport.
- **Workshop card hover**: The image zooms 1.04×, the bottom gradient becomes darker, the "Enroll →" link underline grows.
- **Navbar CTA glow**: The "Get Started" button has a subtle pulsing glow animation (keyframe: shadow 0 → primary shadow → 0, 2.5s infinite) to draw attention without being annoying.

### 📱 Mobile Homepage

- Hero: single column. Illustration above content (centered, 80% width). H1 reduced to `text-[38px]`.
- Featured workshops: 1 column, horizontal scroll on mobile (not grid). Show 1.5 cards to hint scrollability.
- Categories: Horizontal scroll carousel with `scroll-snap-type: x mandatory`.
- Stats bar: 2×2 grid.
- Footer: single column stack.

---

## PAGE 2: WORKSHOPS CATALOG (`/workshops`)

### 🎯 Goal

Help student find the right workshop quickly. Remove friction between discovery and enrollment.

---

### Section 1: Page Header

```
[Hero band — padding: 60px 0 | bg: --primary-subtle gradient to --background]
Eyebrow: "Explore Workshops"
H1: "Find Your Perfect Workshop"
Subtext: "Browse {total} workshops taught by verified experts across Bangladesh"
(total fetched from API pagination meta)
```

---

### Section 2: Filter Bar (sticky on scroll)

**Behavior**: Not sticky by default. On scroll past the hero, filter bar becomes `position: sticky; top: 72px` (below navbar). Gets `elevation-3` + blur backdrop when sticky.

**Layout**: Single row at desktop. `bg: --background/95 backdrop-blur: 12px`. `padding: 16px 0`. `border-bottom: 1px solid --border`.

**Elements** (left to right):

1. Search input: `width: 280px` — magnifying glass icon prepend + clear X button
2. Category Select: Shadcn Select, width 180px, "All Categories"
3. Level Select: width 160px, "All Levels"
4. Sort Select: width 200px, "Sort: Newest First"
5. [spacer flex-1]
6. Active filter count badge: `{n} Filters` pill in --primary-subtle — only shows when filters are active. Click to clear all.
7. Results count: "Showing 24 workshops" — DM Sans 13px --foreground-muted

**Mobile**: Filter bar collapses to a single row: Search + "Filters (n)" button. Tapping Filters opens a bottom Sheet with all filter selects stacked vertically. "Apply Filters" + "Clear All" at bottom.

---

### Section 3: Workshop Grid

**Layout**: `grid-template-columns: repeat(3, 1fr)` at lg, `repeat(2, 1fr)` at md, `1fr` at sm. `gap: 24px`.

**Workshop Card (Catalog variant)** — slightly more detailed than homepage variant:

```
border-radius: 20px | overflow: hidden | bg: --surface-1 | border: 1px solid --border
elevation-1 | hover → elevation-2 + translateY(-3px) | cursor: pointer

[IMAGE — height: 200px]
object-fit: cover | bg: --surface-3 (placeholder with shimmer)
[TOP-LEFT badges: Level + Category (stacked vertically if both)]
[TOP-RIGHT: Price pill]

[BODY — padding: 20px]
[Row: Category dot + Category Name — 12px/600 --primary]
Title: Bricolage 18px/700 --foreground | 2-line clamp | margin: 8px 0
Description: DM Sans 14px/400 --foreground-subtle | 3-line clamp | margin-bottom: 16px

[Meta row — gap: 12px]
📍 Location | 📅 Start Date | ⏱ Duration

[Divider: 1px --border | margin: 14px 0]

[Footer row: flex space-between align-center]
LEFT: Seats remaining
  → Progress bar: 100% width, 5px height, border-radius 999px
  → bg: --border | fill: green (>50% seats) → amber (25-50%) → red (<25% or full)
  → "8 seats left" text below: 12px/600 appropriate status color
RIGHT: "Enroll Now →" ghost button — transforms to primary on card hover
```

**Card Skeleton (loading)**:

```
Same dimensions | bg: --surface-2
All content: shimmer rectangles
Image: full-width shimmer block
Animation: shimmer gradient moves left-to-right
```

**Empty State**:

```
Center of grid | padding: 80px 0
Illustration: Large SVG of a telescope (searching metaphor) in --primary muted colors
H3: "No workshops match your filters"
P: "Try adjusting your search or clearing the filters"
Buttons: "Clear Filters" (primary) + "Browse All" (ghost)
```

---

### Section 4: Pagination

**Layout**: `flex justify-center align-center gap: 8px | padding: 40px 0`

**Controls**: Previous button | Page numbers (show 5, ellipsis for overflow) | Next button

- Current page: `bg: --primary, color: --primary-foreground, border-radius: 8px`
- Other pages: ghost buttons, hover → --surface-2
- Disabled prev/next: opacity 0.4

---

### 🎞 Catalog Interactions

- **Debounced search** (already implemented): Add visual feedback — search input gets spinner icon during debounce period.
- **Filter change**: Grid fades out (150ms) → new results fade in (200ms). Use TanStack Query invalidation.
- **Card hover**: Image zooms 1.04×, "Enroll Now →" text becomes primary color with arrow movement.
- **Skeleton → content transition**: Cards fade in staggered (60ms apart).
- **Filter badge**: When no filters active, badge is absent. When filters are added, badge appears with `scaleIn` animation and shows count.

---

## PAGE 3: WORKSHOP DETAIL (`/workshops/[slug]`) ⭐ MOST CRITICAL

### 🎯 Goal

Remove every barrier between the user's interest and clicking "Enroll Now." Build maximum trust in minimum time.

---

### Section 1: Breadcrumb Bar

```
[full width | padding: 16px 0 | border-bottom: 1px solid --border | bg: --background]
Breadcrumb: Home > Workshops > [Workshop Title (truncated 40 chars)]
[DM Sans 13px/500 --foreground-muted | separators: "/" in --foreground-muted/50]
```

---

### Section 2: Workshop Hero (Left-Right Split)

**Layout**: `grid grid-cols-[1fr_380px] gap-12` at desktop (lg). Below lg: single column.

**LEFT — Main content (scrollable)**:

**Hero block** (first thing visible):

```
[IMAGE CAROUSEL]
height: 440px | border-radius: 20px | overflow: hidden
Multiple images: thumbnails strip at bottom (if >1 image)
Active image: full width, object-fit: cover
Thumbnails: 80×60px, border-radius: 8px, opacity: 0.6 → 1 when selected
Arrows: absolute left/right, semi-transparent white circle buttons
If no images: illustrated placeholder (workshop silhouette in --primary-subtle)

[HERO CONTENT — margin-top: 28px]
[Badges row: Level badge + Category badge + gap: 8px]
H1: Bricolage 40px/700 --foreground letter-spacing: -0.02em | margin: 12px 0
[Meta pills row — flex wrap gap: 12px]
Each pill: bg --surface-2 | border: 1px solid --border | border-radius: 8px | padding: 8px 14px
  📍 [Location] | 📅 [Start Date] | ⏱ [Duration: endDate - startDate]
  👥 [N seats total] | 🎯 [Level] | 💰 [Price]
```

**Content sections (below hero block)**:

Each content section uses this pattern:

```
[Section heading: Bricolage 24px/700 --foreground | margin: 32px 0 16px]
[1px --border divider under heading]
[Content]
```

**About this Workshop**:

```
DM Sans 16px/400 --foreground | line-height: 1.75
```

**What You'll Learn** (whatYouLearn array):

```
2-column grid | gap: 12px
Each item: flex | gap: 10px
  Check icon: 20px circle bg --success-subtle | ✓ in --success
  Text: DM Sans 15px/400 --foreground
```

**Prerequisites** (prerequisites array):

```
Vertical list | gap: 8px
Each item: flex | gap: 10px
  Dot icon: 6px circle bg --foreground-muted
  Text: DM Sans 15px/400 --foreground-subtle
```

**Benefits** (benefits array):

```
Same visual as "What You'll Learn" but with star ⭐ icon in --accent bg
```

**Syllabus** (syllabus array):

```
Accordion-style numbered list
Each item: flex | gap: 14px
  Number: Bricolage 18px/700 --primary, min-width: 28px
  Text: DM Sans 15px/400 --foreground
  Subtle top border between items (except first)
```

**Instructor Card**:

```
bg: --surface-1 | border: 1px solid --border | border-radius: 20px | padding: 28px
flex gap: 20px

Avatar: 80px circle | initials fallback (gradient bg: --primary → darken)
  If picture: next/image with fill
Name: Bricolage 20px/700 --foreground
Title: "Expert Instructor" + expertise — DM Sans 14px/500 --primary
Bio: DM Sans 15px/400 --foreground-subtle | line-height: 1.65 | 4-line clamp with "Read more"
```

**Similar Workshops** (3 horizontal cards, scrollable on mobile):

```
Section: "You Might Also Like"
3 compact cards in a row | same catalog card variant | smaller (no description)
On mobile: horizontal scroll
```

---

**RIGHT — Sticky Sidebar** ⭐ (conversion engine):

```css
/* Sidebar container */
position: sticky;
top: calc(72px + 20px); /* below nav */
height: fit-content;
max-height: calc(100vh - 100px);
overflow-y: auto;
border-radius: 24px;
border: 1px solid --border;
bg: --surface-1;
padding: 28px;
elevation-2;
```

**Sidebar content order (TOP to BOTTOM)**:

```
[PRICE BLOCK]
"৳" symbol: DM Sans 16px/600 --foreground-subtle
Amount: Bricolage 48px/800 --foreground | letter-spacing: -0.03em
"per student": DM Sans 13px/400 --foreground-muted

[DIVIDER]

[SEATS BLOCK]
Label: DM Sans 13px/600 uppercase letter-spacing:0.04em --foreground-muted → "SEATS AVAILABLE"
Progress bar: 100% width | 8px height | border-radius: 999px
  bg: --border | fill: color based on remaining %
Count text: "12 of 30 seats remaining" | 14px/500
  [When < 5 seats]: text turns --danger + "⚠ Almost full!"
  [When 0 seats]: text is "--danger 700" + "WORKSHOP FULL"

[ENROLL BUTTON — THE MOST IMPORTANT ELEMENT ON THE PAGE]
width: 100%
height: 52px
border-radius: 12px
font: DM Sans 16px/600
bg: --accent | color: --accent-foreground
box-shadow: 0 6px 24px oklch(0.78 0.18 68 / 0.40)  /* amber glow */
hover: translateY(-2px) + shadow intensifies
active: translateY(0) scale(0.98)

States (matches existing EnrollButton state machine):
  "checking"  → skeleton width pulse inside button
  "idle"      → "Enroll Now →" with graduation cap icon
  "enrolled"  → green bg + ✓ "Already Enrolled" (disabled)
  "enrolling" → spinner + "Processing..." (disabled)
  "payment"   → spinner + "Redirecting to Payment..."
  "error"     → --danger bg + "Retry ↺" + error tooltip

[TRUST SIGNALS — below button, padding-top: 16px]
3 rows, each: flex gap: 8px | DM Sans 13px/400 --foreground-subtle
  🔒 "Secure payment via SSLCommerz"
  ↩ "7-day money-back guarantee"
  📧 "Instant confirmation email"

[DIVIDER]

[DATES BLOCK]
2 rows:
  "Starts": [formatted date] bold
  "Ends":   [formatted date]

[DIVIDER]

[SHARE SECTION]
"Share this workshop:" label + 3 icon buttons: Copy Link, Facebook, LinkedIn
Icon buttons: 36px ghost circles
```

**Mobile Sidebar behavior**:

- Sidebar disappears from right column (single-column layout)
- Enroll button becomes a **fixed bottom bar**: `position: fixed; bottom: 0; left: 0; right: 0`
- Bar: `bg: --background/95 backdrop-blur: 12px; border-top: 1px solid --border; padding: 12px 16px; safe-area-inset-bottom`
- Contains: Price left-aligned + "Enroll Now" full-width button right
- This bar does NOT show on desktop

---

### 🎞 Workshop Detail Interactions

- **Image carousel**: Swipe on mobile (touch events). Keyboard arrows. Dot indicators at bottom.
- **Syllabus**: Each item has hover bg `--surface-2` to hint interactivity.
- **Enroll button pulse**: When user scrolls to bottom and sidebar becomes out-of-viewport, the mobile fixed bar pulses once (glow animation) to draw attention.
- **Share button**: Clicking "Copy Link" shows a checkmark animation replacing the copy icon for 2 seconds.
- **Seats counter**: If < 5 seats, the progress bar has a pulsing red animation (CSS keyframe: opacity 0.6 → 1.0 → 0.6, 1.5s infinite).

---

## PAGE 4: AUTH PAGES (`/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`)

### 🎯 Goal

Fast, frictionless auth. Build confidence at the exact moment of commitment.

---

### Auth Layout Shell

**Background**: full-viewport. Split-screen at desktop (lg+):

- **Left panel** (40% width): `bg: --primary`. Contains brand storytelling:
  ```
  Vertical center
  Logo (white)
  H2: "Learn. Grow. Succeed." — Bricolage 36px/700 white
  Subtext: "Join 500+ students building their futures with verified experts"
  3 trust checkpoints: ✓ Real workshops ✓ Expert instructors ✓ BDT payments
  Bottom: Rotating testimonial quote (3 quotes, auto-rotate 5s)
  BG decoration: dot pattern at 8% white opacity + primary-darker radial blob
  ```
- **Right panel** (60% width): Centered card `max-width: 480px`.

**Mobile**: No split. Full-page centered card. Logo at top. Left panel content collapses to a small trust row beneath the submit button.

**Auth Card**:

```
bg: --surface-1 | border: 1px solid --border | border-radius: 24px | padding: 40px
elevation-3
```

---

### Login Page

**Card content order**:

```
Logo mark (36px height) + "Skill Workshop" text | center-aligned | margin-bottom: 32px

H2: "Welcome back" | Bricolage 28px/700
Subtext: "Sign in to continue your learning journey" | DM Sans 14px/400 --foreground-muted
Margin-bottom: 28px

[Google Sign In]
height: 44px | border-radius: 10px | border: 1.5px solid --border
flex gap: 12px | center | bg: --background
"G" icon (real Google SVG, not emoji) | "Continue with Google" | DM Sans 15px/500 --foreground
Hover: bg --surface-2 | border-color --border-strong

[OR divider]
flex: line - "or sign in with email" - line
lines: 1px --border | text: DM Sans 12px/400 --foreground-muted | padding: 16px 0

[Email field] — Label: DM Sans 13px/600 --foreground | margin-bottom: 6px
[Password field] — "Forgot password?" link floated right of label (13px/500 --primary)
[Show/hide toggle inside input right side]

[Error Alert — conditionally shown]
bg: --danger-subtle | border-left: 3px solid --danger | border-radius: 8px | padding: 12px 16px
Icon ⚠ + message | DM Sans 14px/400 --danger
X dismiss button top-right

[Submit button] — full width | height: 48px | primary | "Sign In" | loading state

[Divider]
"Don't have an account?" | "Sign up as Student" (link --primary) | "·" | "Sign up as Instructor" (link)
DM Sans 14px/400 --foreground-muted | center-aligned
```

---

### Register Page (Student + Instructor variants)

**Step indicator** (NEW — does not exist currently but adds massive UX value):

```
3 steps: [1 Account Details] → [2 Verify Email] → [3 You're In!]
Step bar: flex | gap: 0 | margin-bottom: 32px
Each step: circle (28px, --border bg, number DM Sans 13px/600) + connecting line + label
Active step: --primary bg, white text
Completed step: --success bg, white ✓ icon
Upcoming step: --surface-3 bg, --foreground-muted text
```

**Student fields**:

- Full Name | Email | Phone | Password | Confirm Password
- Password strength meter (PasswordChecklist below field — existing component, style upgrade)
- Existing `PasswordChecklist` component: redesign each item as `flex gap: 8px | DM Sans 13px | icon: circle check (green filled when met, gray outline when not)`

**Instructor additional fields** (collapsible card appears below base fields):

```
[Section divider: "Instructor Profile"]
Expertise (text input) | Short Bio (textarea, 300 char counter bottom-right)
```

---

### OTP Verify Page

**Card content**:

```
[Email icon illustration — 64px envelope in --primary-subtle circle]

H2: "Check your inbox" | Bricolage 28px/700
Subtext: "We sent a 6-digit code to {email}"
  Email in --primary 500 weight

[OTP Input — existing input-otp, style upgrade]
6 slots | each slot: 52px × 64px | border-radius: 12px | border: 1.5px solid --border
Active slot: border-color --primary + box-shadow focus ring
Filled slot: bg --primary-subtle + text --foreground Bricolage 24px/700
Gap between slots: 8px
Slots 3-4 have a wider gap (visual grouping: 3|3)

[Countdown timer]
"Code expires in 0:28" | DM Sans 13px/400 --foreground-muted | center
Progress ring: SVG circle that depletes (30s countdown visualized as circle stroke)

[Resend]
Disabled during countdown: "Resend code (0:14)" gray
Active after: "Resend code" --primary underline link

[Submit button] — auto-submits when 6 digits filled (no manual click needed)
"Verify Email" | full width | height: 48px | primary

[Back link] — "← Back to registration" | 13px --foreground-muted
```

**Auto-submit behavior**: When the 6th digit is entered, the button automatically triggers. Show spinner + "Verifying..." immediately.

---

### Forgot Password

**Two-state flow** (existing behavior, visual upgrade):

**State 1 (Input)**:

```
[Icon: Lock with question mark — 64px in --warning-subtle circle]
H2: "Reset your password"
Subtext: "Enter your email and we'll send you reset instructions"
[Email field]
[Submit button: "Send Reset Link"]
[Back to login link]
```

**State 2 (Success)**:

```
[Animated checkmark — Framer Motion drawing SVG check in --success circle]
H2: "Check your email"
Subtext: "If {email} has an account, you'll receive instructions shortly"
[Button: "Back to Sign In"] (primary)
Note: DM Sans 12px --foreground-muted "Didn't receive it? Check spam or try again in 5 minutes"
```

---

### Reset Password

```
[Token invalid state: full-card error state with "🔑 Invalid Reset Link" + CTA to request new one]

[Valid state:]
H2: "Set new password"
[New Password field + strength meter]
[Confirm Password field]
[PasswordChecklist — all requirements]
[Submit: "Update Password" — disabled until all requirements met]
```

---

## PAGE 5: STUDENT DASHBOARD (`/student/dashboard`)

### 🎯 Goal

Give student a clear picture of their progress and guide next action (browse more workshops / complete payment).

---

### Layout: Dashboard Shell

**Sidebar** (dark, 260px fixed left):

```
bg: --sidebar-bg | border-right: 1px solid --sidebar-border | padding: 24px 0
position: fixed | height: 100vh | z-index: 40

[Logo — padding: 0 20px 24px]
Logo mark + "Skill Workshop" white

[Nav sections — padding: 0 12px]
Each nav item:
  height: 44px | border-radius: 10px | padding: 0 12px
  Icon: 20px --sidebar-text-muted | Label: DM Sans 14px/500 --sidebar-text-muted
  gap: 12px | flex align-center

  Active: bg --sidebar-active | icon + text --primary-foreground | elevation-1
  Hover: bg --sidebar-hover | text --sidebar-text

[Bottom: User card]
border-top: 1px solid --sidebar-border | padding: 16px 20px 24px
Avatar 40px + Name DM Sans 14px/600 white + Role badge
Logout button: ghost, full width, --danger text on hover
```

**Main content area**: `margin-left: 260px | padding: 32px`. `bg: --background`. Min-height: 100vh.

**Header bar** (top of main content):

```
height: 64px | flex justify-between align-center | margin-bottom: 32px
LEFT: Breadcrumbs (auto from URL) | DM Sans 13px/400 --foreground-muted
RIGHT: ThemeToggle + Notification bell (with unread count badge) + Avatar (40px, opens dropdown)
```

**Mobile sidebar**: Sidebar hides off-screen (translate-x-full). Hamburger in header. Opens as Sheet overlay.

---

### Student Dashboard Home — Section Breakdown

**Section 1: Greeting**

```
[padding-bottom: 32px | border-bottom: 1px solid --border]

Good [morning/afternoon/evening] emoji (time-based: ☀️/🌤/🌙),
H1: "Welcome back, {firstName}!" | Bricolage 32px/700 --foreground
Subtext: DM Sans 16px/400 --foreground-muted | "You have {N} active enrollments."
If no enrollments: "You haven't enrolled in any workshops yet. Browse what's available!"
Right side (absolute at desktop): Quick action button "Browse Workshops →"
```

**Section 2: Stats Cards**

```
Grid: 4 columns at lg, 2 at md, 1 at sm | gap: 20px | margin-bottom: 32px
```

4 cards: **Enrolled, Completed, Total Spent (BDT), Pending Payments**

Each `StatsCard` (upgraded from existing):

```
bg: --surface-1 | border: 1px solid --border | border-radius: 16px | padding: 24px
elevation-1

[Top row: flex space-between]
LEFT: Label — DM Sans 12px/600 uppercase letter-spacing:0.04em --foreground-muted
RIGHT: Icon container 44px × 44px border-radius: 12px [specific bg per card]

[Number]
Bricolage 36px/800 --foreground | margin: 12px 0 4px
Number animates from 0 on mount (useSpring, duration 1.2s)

[Trend]
"↑ +2 this month" | DM Sans 12px/500 | --success (positive) or --danger (negative)
If neutral: "--foreground-muted"
```

Icon colors per stat:

- Enrolled: `bg: --primary-subtle` | BookOpen icon `--primary`
- Completed: `bg: --success-subtle` | CheckCircle `--success`
- Total Spent: `bg: --accent-subtle` | BanknoteIcon `--accent-foreground`
- Pending Payments: `bg: --warning-subtle` | Clock `--warning`

**Section 3: My Enrollments (Recent)**

```
[Section header: "My Recent Enrollments" + "View All →" right link]

List of last 5 enrollments:
Each row: bg --surface-1 | border: 1px solid --border | border-radius: 14px | padding: 16px 20px
  flex align-center gap: 16px

  Image: 60px × 60px border-radius: 10px | object-fit: cover | bg --surface-3 (fallback)

  LEFT content:
    Workshop title: DM Sans 16px/600 --foreground | 1-line clamp | link to /workshops/[slug]
    Meta: "📅 Starts Jan 5, 2025 · 👥 2 students" | 13px/400 --foreground-muted

  RIGHT content:
    StatusBadge (existing component, style upgraded per new palette)

    [If status === "PENDING" and payment UNPAID]
    "Complete Payment →" — --warning text 13px/600 link

Empty state:
  SVG illustration: student at desk (simple geometric)
  "You haven't enrolled yet"
  "Browse available workshops →" [primary button]
```

**Section 4: Quick Actions**

```
[Section: "Quick Actions" | 3-column grid | gap: 16px]

Action card: bg --primary-subtle | border: 1px solid --primary/20 | border-radius: 14px
padding: 20px | cursor: pointer | hover: bg --primary | hover: text white (transition 200ms)
Icon: 32px --primary (→ white on hover) | Title: 15px/600 | Desc: 13px/400

Actions:
1. Browse New Workshops — (links to /workshops)
2. Download Certificates — (links to /student/payments)
3. Update Profile — (links to /student/profile)
```

---

## PAGE 6: INSTRUCTOR DASHBOARD (`/instructor/dashboard`)

### 🎯 Goal

Motivate instructor through visible progress metrics. Surface fastest path to more students.

---

**Stats Grid (3 columns)**:

- My Workshops (total count + "N published, N draft")
- Total Students (across all workshops)
- Total Revenue (in BDT, formatted: "৳1,25,000")

**Revenue Chart (Recharts — currently underutilized)**:

```
[Section: "Monthly Revenue" + Month selector (last 3/6/12 months tabs)]

AreaChart from Recharts:
  height: 280px | width: 100%
  xAxis: Month labels (Jan, Feb, ...) | DM Sans 12px --foreground-muted
  yAxis: BDT values | DM Sans 12px --foreground-muted
  Area: fill gradient from --primary/30 → transparent | stroke: --primary 2px
  Dots: 6px circle --primary fill on data points
  Tooltip: bg --surface-2 | border: 1px solid --border | border-radius: 10px | Bricolage 16px/700 for value
  Responsive: yes (ResponsiveContainer)
  Animation: animationDuration: 800ms on mount
```

**My Workshops Table** (compact, top 5 by recent):

```
[Section header + "Manage Workshops →" link]

Table:
  Workshop thumbnail (40px) | Title | Students | Revenue | Status badge | Edit link
  Compact: 52px row height
  "Create New Workshop" row at bottom: dashed border, + icon, --primary text
```

**Recent Enrollments** (list, last 5):

```
Each: Student avatar + Name + Workshop name + Date + Status badge
Compact row style
```

**Enrollment Trend Chart**:

```
BarChart (Recharts):
  Last 8 weeks of enrollment counts
  Bar color: --primary
  Same tooltip style as revenue chart
```

---

## PAGE 7: ADMIN / SUPER-ADMIN DASHBOARD

### 🎯 Goal

Full platform visibility at a glance. Surface anomalies instantly.

---

**Stats Grid (4 columns at lg)**:

- Total Users | Total Workshops | Total Revenue (BDT) | Total Enrollments

Each card upgraded with: `sparkline mini-chart` (7-day trend, 80px wide, Recharts LineChart with no axes, just the line in --primary) rendered in bottom-right of each stats card.

**Main Dashboard Content — 2 columns (3fr + 2fr)**:

**Left (3fr)**:

```
[Revenue Chart: AreaChart, 12-month view, tabs: Revenue / Enrollments / Users]
[Recent Audit Logs: compact table, last 10 | Action badge | Collection | Who | When]
```

**Right (2fr)**:

```
[User Growth PieChart: Students vs Instructors vs Admins | Recharts PieChart with legend]
[Workshop Distribution BarChart: Enrollments by category | horizontal BarChart]
[Platform Health: 3 status indicators — API / Database / Payment Gateway]
  Each: green dot (HEALTHY) + service name + response time
```

**Platform Health Section**:

```
Fetches GET /health/health-check and /health/dashboard
3 cards: API Server | MongoDB | Redis
Each: colored dot (green/red/yellow) + status text + latency in ms
Auto-refreshes every 60s (TanStack Query refetchInterval)
```

---

## PAGE 8: WORKSHOP MANAGEMENT (CRUD)

### LIST PAGE (`/{role}/workshops`)

**Page Header**:

```
[flex space-between align-center | margin-bottom: 24px]
LEFT: H1 "Workshops" | Breadcrumb above
RIGHT: "+ Create Workshop" primary button
```

**Table improvements** (on top of existing TanStack Table):

```
[Search row: debounced search input (280px) | Status filter select | margin-bottom: 16px]

[Table — full upgrade per design system table styles]

Columns:
1. [Image 52×40px border-radius: 6px] + [Title DM Sans 15px/600 + slug below 12px muted]
2. Category — badge (--accent-subtle)
3. Level — badge (--primary-subtle)
4. Price — Bricolage 16px/600 "৳12,500" or "Free"
5. Seats — [n/max] | bar-fill visualization inline | "FULL" danger badge if full
6. Status — StatusBadge (Published / Draft)
7. Created — relative date ("2 days ago") with tooltip showing full date
8. Actions — Icon button group: 👁 View | ✏ Edit | 🗑 Delete

[Action dropdown → upgrade to inline icon buttons]
  View: EyeIcon ghost | Edit: PenIcon ghost | Delete: TrashIcon --danger ghost
  All 36px icon buttons with tooltips
```

### CREATE / EDIT FORM

**Form Layout**: Single-column max-width: 720px, left-aligned within content area. Split into collapsible card sections.

**Section Cards**:

```
Each section: bg --surface-1 | border: 1px solid --border | border-radius: 16px | padding: 28px | margin-bottom: 20px

Section header: Bricolage 18px/700 --foreground + icon (20px --primary) | margin-bottom: 20px | flex gap: 10px

Sections:
1. 📝 Basic Information (title, description)
2. 📅 Schedule (startDate, endDate, location)
3. 🏷 Classification (category, level select)
4. 👥 Capacity (maxSeats, minAge)
5. 📚 Learning Content (whatYouLearn, prerequisites, benefits, syllabus — list editors)
6. 🖼 Media (image upload)
```

**List Field Editor** (whatYouLearn, etc.):

```
Existing: each item shown as chip/tag with remove button
Upgrade:
  Add item row: input + "+" button or Enter key
  Items: bg --surface-2 | border: 1px solid --border | border-radius: 8px | padding: 8px 12px
  flex align-center gap: 8px
  Item text: DM Sans 14px/400 --foreground
  Remove: X button (16px --foreground-muted → --danger on hover)
  Drag handle: ⠿ icon on left (for potential future reorder)
```

**Image Upload Area**:

```
Upload zone: dashed border 2px --border | border-radius: 16px | padding: 40px
  Center content: Cloud upload icon (40px --primary) + "Drag & drop images here"
  + "or click to browse" (--primary link) + "Max 5 images, JPG/PNG"
  Hover: border-color --primary | bg --primary-subtle/30

Uploaded images grid: 3 columns | each:
  position: relative | border-radius: 12px | overflow: hidden
  [Image: object-fit cover | aspect-ratio: 16/9]
  [Hover overlay: dark 50% | X button center-top-right | "Set as Cover" button if first]
```

---

## PAGE 9: PAYMENT & ENROLLMENT PAGES

### Student: My Payments (`/student/payments`)

**Layout**: Tabs at top (All | Paid | Unpaid | Failed) with counts in badges.

**Payment card** (replaces plain table for student view):

```
bg: --surface-1 | border: 1px solid --border | border-radius: 16px | padding: 20px
flex gap: 16px | margin-bottom: 12px

LEFT: Workshop thumbnail 72×56px border-radius: 10px
CENTER:
  Workshop title: 15px/600 --foreground | link
  Transaction ID: font-mono 12px --foreground-muted "TXN: ssl_xxxxx"
  Date: 13px/400 --foreground-muted
RIGHT (flex column align-end):
  Amount: Bricolage 20px/700 "৳12,500"
  StatusBadge (PAID/UNPAID/FAILED)
  [If PAID] "Download Invoice" — ghost small button with Download icon
  [If UNPAID] "Complete Payment →" — --warning text link with arrow
```

### Payment Success Page

After SSLCommerz redirect, this is the most emotional moment in the user journey.

```
[Full page center | bg --background]

[Animated success: Framer Motion]
Step 1 (0-300ms): Large circle expands from center (--success-subtle)
Step 2 (300-500ms): ✓ icon draws in (SVG path animation)
Step 3 (500ms+): Content fades up

[Content]
H2: "You're enrolled! 🎉" | Bricolage 36px/700 --success
Subtext: "Payment confirmed. Check your inbox for enrollment details."
Workshop name in a card (mini workshop card)
Transaction ID: mono font, muted
Amount paid: Bricolage 24px/700

[Actions: 2 buttons]
"Go to My Dashboard" (primary)
"Browse More Workshops" (ghost)
```

### Payment Fail Page

```
[Same animated circle but --danger-subtle with ✗ icon in --danger]
H2: "Payment was not completed"
Subtext: "Your enrollment is still pending. No charge was made."
"Try Again" (primary) + "Contact Support" (ghost)
```

---

## PAGE 10: CATEGORIES PAGE (`/categories`)

### 🎯 Goal

Help students find workshops by domain. Make exploration feel exciting.

**Hero**:

```
padding: 60px 0 | bg: linear-gradient(to bottom, --primary-subtle, --background)
H1: "Explore by Category" | eyebrow: "All Disciplines"
```

**Category Grid**: 4 columns at desktop. 2 at tablet. 1 at mobile. `gap: 24px`.

**Category Card (detailed variant)**:

```
border-radius: 24px | overflow: hidden | cursor: pointer | aspect-ratio: 4/3
position: relative | border: 1px solid --border

[TOP 60%: Thumbnail with object-fit cover]
[If no thumbnail: gradient bg from category color (seeded from category name hash)]

[BOTTOM 40%: bg --surface-1 | padding: 20px]
[Eyebrow: icon 20px in --primary-subtle + category name in --primary 12px/600]
[Name: Bricolage 20px/700 --foreground]
[Description: DM Sans 13px/400 --foreground-subtle | 2-line clamp]
[Footer: "N workshops →" | DM Sans 13px/600 --primary | link]

[HOVER]
Thumbnail: scale(1.06)
Card: translateY(-4px) + elevation-2
"→" arrow moves right 4px
transition: 300ms --ease-out-expo
```

---

## PAGE 11: SHARED CRITICAL COMPONENTS

### DataTable (full system upgrade)

The DataTable is used across 8+ pages. A single upgrade here improves the entire product.

```
[Container: bg --surface-1 | border: 1px solid --border | border-radius: 16px | overflow: hidden]

[Toolbar row: padding: 16px | bg --surface-2 | border-bottom: 1px solid --border]
  flex gap: 12px align-center
  Search: 240px | Category/Status filters | flex-1 spacer | [Column visibility toggle] | [Export button ghost]

[Table header: bg --surface-2/50 | 44px height]
  th: DM Sans 12px/600 uppercase letter-spacing:0.04em --foreground-muted | padding: 0 16px
  Sortable columns: cursor-pointer | hover → --foreground | sort icon (chevrons) appears on hover
  Active sort: --foreground + filled arrow icon

[Table body]
  tr: border-bottom: 1px solid --border (except last) | hover: bg --surface-1
  td: DM Sans 14px/400 --foreground | padding: 0 16px | height: 60px

[Pagination bar: padding: 16px | bg --surface-2/50 | border-top: 1px solid --border]
  flex space-between align-center
  LEFT: "Showing 1–10 of 47 results" | DM Sans 13px --foreground-muted
  CENTER: Page buttons (existing style per design system)
  RIGHT: Page size select (10/25/50)
```

### EmptyState (redesign)

Current: basic text + button. New:

```
[Container: padding: 80px 32px | center-aligned | max-width: 400px | margin: 0 auto]

[Illustration: 160px width | specific per context]
  Workshops list: stack of books SVG
  Enrollments: graduation cap SVG
  Payments: receipt SVG
  Users: people SVG
  All: simple geometric style, --primary muted colors

[Title: Bricolage 22px/700 --foreground | margin: 24px 0 8px]
[Description: DM Sans 15px/400 --foreground-muted | line-height: 1.65]
[CTA button: primary | margin-top: 24px]
[Secondary action: ghost link | margin-top: 12px]
```

### Notification Bell (currently placeholder — ship real notifications)

```
[Bell icon button — 40px | relative]
[Unread badge: 20px circle --danger bg | white 11px/700 | absolute top-0 right-0]
  Badge: scale(0) → scale(1) with spring when new notification arrives

[Dropdown panel: 380px width | max-height: 440px | overflow-y: auto]
bg: --surface-2 | border: 1px solid --border | border-radius: 16px | elevation-4
position: absolute top: calc(100%+8px) right: 0

[Notification item]
  padding: 14px 16px | border-bottom: 1px solid --border | flex gap: 12px
  [Icon: 36px circle, color based on type]
  [Content: title DM Sans 14px/600 + description 13px/400 --foreground-muted + time 12px/400 muted]
  [Unread indicator: 8px circle --primary absolute right: 16px]
  hover: bg --surface-3

Notification types use API data:
  New enrollment (instructor) | Payment confirmed (student) | Workshop update | System notice
```

### LoadingSkeleton Upgrade

All skeleton variants must use the new shimmer animation:

```css
/* globals.css — upgrade shimmer */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-2) 25%,
    var(--surface-3) 50%,
    var(--surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### ConfirmDialog (destructive flow)

Current: basic. New:

```
[Dialog — max-width: 420px]

[Icon: 56px circle]
  Danger action: --danger-subtle bg + Trash icon --danger
  Cancel action: --warning-subtle bg + XCircle --warning

[Title: Bricolage 22px/700 --foreground]
[Description: DM Sans 15px/400 --foreground-muted | line-height: 1.65]

[Input confirmation for critical deletes:]
"Type 'DELETE' to confirm" label
Input field: checks value matches before enabling button
[This prevents accidental critical actions — admin deleting users/workshops]

[Button row: flex gap: 12px justify-end | margin-top: 24px]
  Cancel (ghost) | Confirm (--danger primary)
  Confirm is DISABLED until input matches (if applicable)
```

### PageHeader (shared dashboard header)

```
[flex space-between align-center | margin-bottom: 28px]

LEFT:
  [Breadcrumb: 13px --foreground-muted | margin-bottom: 4px]
  H1: Bricolage 28px/700 --foreground
  Subtext: DM Sans 15px/400 --foreground-subtle [if provided]

RIGHT:
  [Action buttons slot — typically "Create +" primary button]
```

---

# PART 4 — HIGH-IMPACT IMPROVEMENTS (Ranked by WOW Factor)

---

### Rank 1 ⚡ Workshop Detail Sidebar — Fixed Mobile Enroll Bar

**Impact**: Highest. Every mobile user (likely 60%+ in Bangladesh) will see this. Removes the #1 conversion drop-off point. A user shouldn't have to scroll to enroll.
**Effort**: Low (position: fixed, existing EnrollButton component).
**Ship in**: Sprint 1.

---

### Rank 2 ⚡ Animated Stats Counters on Dashboard & Homepage

**Impact**: Creates immediate "this feels premium" perception. Numbers counting up from 0 create emotional investment in the data.
**Effort**: Low (Framer Motion useSpring, 20 lines of code).
**Ship in**: Sprint 1.

---

### Rank 3 ⚡ Revenue & Enrollment Charts on Dashboards

**Impact**: Recharts is already installed but unused. Adding real charts (AreaChart for revenue, BarChart for enrollments) transforms the dashboard from a table viewer into a genuine analytics tool. Instructors and admins will feel the product's value every day.
**Effort**: Medium (TanStack Query for stats endpoints + Recharts setup).
**Ship in**: Sprint 1-2.

---

### Rank 4 ⚡ Workshop Card Image Carousel (Detail Page)

**Impact**: The model already supports up to 10 images. Using only the first image wastes massive conversion potential. A swipeable image gallery increases trust and session time.
**Effort**: Medium (custom carousel component or import `embla-carousel-react`).
**Ship in**: Sprint 2.

---

### Rank 5 ⚡ Registration Step Indicator

**Impact**: Multi-field registration (especially instructor: 7 fields + OTP) has high abandonment. A visible "Step 1 of 3" indicator reduces drop-off by ~25-40% (industry data).
**Effort**: Low (UI state machine, existing registration flow unchanged).
**Ship in**: Sprint 1.

---

### Rank 6 ⚡ Hero Illustration (Homepage)

**Impact**: Replaces the current "generic blob + text" pattern with a distinctive, memorable visual that communicates the product in 1 second. First impression is everything for new visitors.
**Effort**: Medium-High (custom SVG illustration, CSS animations).
**Ship in**: Sprint 2.

---

### Rank 7 ⚡ Payment Success Animated Page

**Impact**: The post-payment moment is the highest-emotion touchpoint. A generic redirect page wastes the euphoria moment. An animated success screen creates a shareable, memorable moment.
**Effort**: Low (Framer Motion SVG animation, replace the existing static page).
**Ship in**: Sprint 1.

---

### Rank 8 ⚡ Font Replacement (Geist → Bricolage Grotesque + DM Sans)

**Impact**: Typography is 70% of design. This single change makes the entire platform feel more premium with zero layout changes. Bricolage Grotesque on headings creates instant character.
**Effort**: Very Low (2 font imports + CSS variable update).
**Ship in**: Sprint 1, Day 1.

---

### Rank 9 ⚡ Notification System (real data, not placeholder)

**Impact**: The bell currently shows static "Coming Soon." Wiring it to actual events (new enrollment for instructors, payment confirmation for students) adds a retention loop that brings users back.
**Effort**: Medium (no backend changes needed — poll from existing enrollment/payment endpoints).
**Ship in**: Sprint 2-3.

---

### Rank 10 ⚡ Sticky Filter Bar on Workshop Catalog

**Impact**: Users who filter and then scroll down lose context. Making the filter bar sticky (below the navbar) lets them refine without scrolling back up, reducing filter friction by significant margin.
**Effort**: Very Low (1 line of CSS position: sticky).
**Ship in**: Sprint 1, Day 1.

---

# PART 5 — DESIGN MISTAKES TO AVOID

---

### ❌ NEVER: Two primary CTAs in the same visual hierarchy

**Why it's happening**: "Browse Workshops" and "Learn More" both styled the same way in hero.
**Fix**: "Browse Workshops" = primary (filled). "Learn More" = ghost. Always exactly one primary CTA per section.

---

### ❌ NEVER: Placeholders that look like content

**Why it's happening**: When thumbnail is null, the card shows a gray box. Users don't know if it's loading or intentional.
**Fix**: Add a real placeholder: workshop icon in a gradient background using the category name as seed. Never show bare gray.

---

### ❌ NEVER: Using the same color for primary + accent actions

**Why it's happening**: The Enroll button and nav links both use --primary.
**Fix**: Enroll button = --accent (amber). Nav links, secondary actions = --primary. Create visual distinction between "explore" and "commit" actions.

---

### ❌ NEVER: Inconsistent border-radius within the same page

**Current state**: Some cards use rounded-md, some rounded-lg, some rounded-xl.
**Fix**: Strict system: Cards = 20px, dialogs = 20px, inputs = 10px, badges = 6px, buttons = 10px, pills = 999px. Define these as Tailwind theme values.

---

### ❌ NEVER: Tables without empty states

**Why it's happening**: When a student/instructor has no data, the DataTable renders with just headers.
**Fix**: Every DataTable has an EmptyState component. Pass `emptyMessage` and `emptyAction` as props. This is already possible with the existing DataTable — just not implemented everywhere.

---

### ❌ NEVER: Form errors only at the top

**Current state**: API errors show as a top-of-form alert. Field-level errors show below fields.
**Fix**: Keep both. But the top alert should also list which fields failed (from API `errors` array). And auto-scroll to the first errored field on submit.

---

### ❌ NEVER: Price displayed without formatting

**Current state**: Some places show `12500` raw.
**Fix**: Always use `formatCurrency()` from `lib/formatters.ts`. Should output: `৳12,500` with BDT Taka symbol, comma-separated. On cards: `৳12,500`. On checkout: `BDT 12,500.00`.

---

### ❌ NEVER: Loading states that block the entire page

**Current state**: Some components show full page spinners during data fetching.
**Fix**: Use skeleton screens that match the final layout's dimensions. The user should never see a blank rectangle or a centered spinner that replaces meaningful content.

---

### ❌ NEVER: Motion that isn't meaningful

**Rule**: If an animation doesn't communicate state change, status, or direction — remove it. Decorative-only animations that repeat infinitely (except very slow ones) feel cheap.
**Fix**: Audit all animations. Each must answer: "What does this communicate to the user?"

---

### ❌ NEVER: Instructor registration using manual useState instead of react-hook-form

**Current state (from context)**: Instructor registration uses manual `useState`, while student uses `react-hook-form + Zod`.
**Fix**: Unify both on `react-hook-form + Zod`. The inconsistency creates bugs, inconsistent validation feedback, and code debt.

---

# PART 6 — FINAL IMPLEMENTATION STRATEGY

---

## Sprint 0 (1 day) — Design Tokens Only

**Zero risk, maximum leverage. No component changes.**

1. Add `Bricolage Grotesque` + `DM Sans` to `app/layout.tsx` via `next/font/google`
2. Update all CSS custom properties in `globals.css` per the new color system in Part 1
3. Update Tailwind `theme.extend` with new font families, border-radius tokens, box-shadow tokens
4. Update `lib/motion-variants.ts` (create this file) with all Framer Motion variants
5. Run the app. Every component inherits the new palette and fonts instantly.

**Deliverable**: Product looks noticeably more premium. Zero breaking changes.

---

## Sprint 1 (1 week) — Core Conversion Elements

**Target: Homepage + Workshop Detail + Auth + Critical micro-animations**

Priority order:

1. `globals.css` — shimmer skeleton upgrade + animation easing variables
2. `PublicNavbar` — backdrop blur, scroll behavior, auth state upgrade
3. Homepage Hero — new background layers (pure CSS), stats counter animation
4. Workshop Detail — sidebar sticky, mobile fixed enroll bar, image carousel (basic)
5. Auth pages — left panel split-screen layout, step indicator for registration
6. EnrollButton — state animation upgrade with Framer Motion AnimatePresence
7. Payment success/fail pages — animated SVG checkmark/X

---

## Sprint 2 (1 week) — Dashboard & Data Visualization

**Target: All dashboards functional with charts**

1. Dashboard Sidebar — dark theme, role-based nav items, mobile sheet
2. `StatsCard` — animated counters, sparkline mini-charts
3. Admin Dashboard — AreaChart (revenue), BarChart (enrollments), PieChart (user breakdown)
4. Instructor Dashboard — revenue AreaChart, enrollment BarChart
5. `DataTable` — full visual upgrade (toolbar, row hover, sorting indicators)
6. `EmptyState` — new illustrations per context

---

## Sprint 3 (1 week) — Catalog & Content Pages

**Target: Workshop catalog, categories, about, FAQ**

1. Workshop Catalog — card upgrade, sticky filter bar, mobile filter Sheet
2. Categories page — new card design with gradient backgrounds
3. Homepage sections — full scroll-reveal animations, testimonials masonry
4. About + Contact + FAQ — typography and spacing system applied
5. `EmptyState` catalog variant

---

## Sprint 4 (1 week) — Management & Polish

**Target: CRUD forms, tables, modals, notification system**

1. `WorkshopForm` — section card layout, list editor upgrade, image upload zone
2. Payment management — student card view, admin table upgrade
3. Enrollment management — status update flows, dialogs
4. User management — optimistic UI visual feedback upgrade
5. `ConfirmDialog` — input confirmation for critical deletes
6. Notification bell — wire to real data via polling
7. Custom 404 + 500 pages

---

## Sprint 5 (1 week) — Performance & Accessibility

**Target: Production-readiness**

1. Audit all images → `next/image` with proper `sizes` and `priority` attributes
2. Dynamic imports for heavy components (Recharts, Dialog contents)
3. ARIA labels on all interactive elements (icons must have `aria-label`)
4. Keyboard navigation audit (focus rings, tab order)
5. `prefers-reduced-motion` media query in all animation components
6. Lighthouse audit target: 90+ on Performance, Accessibility, Best Practices

---

## What to Delay

- **Real-time WebSocket notifications**: Polling is sufficient for V1. WebSockets are a Phase 2 feature.
- **Multi-language (i18n)**: Ship English-first. i18n adds 20% development overhead. Plan for it structurally (no hardcoded strings), but don't implement yet.
- **PWA offline support**: Only valuable when users have unreliable connections. Revisit after analytics.
- **Advanced search autocomplete**: The existing debounced search is sufficient. Autocomplete requires additional backend endpoint or Algolia.
- **Storybook component documentation**: Valuable for teams >3 developers. Implement in parallel after Sprint 3.
- **E2E tests (Playwright)**: Critical paths should be tested after the UI stabilizes in Sprint 4.

---

## File-Level Implementation Map

To avoid confusion, here is exactly which file to modify for each change:

| Change              | File                                        |
| ------------------- | ------------------------------------------- |
| Fonts + CSS tokens  | `app/globals.css` + `app/layout.tsx`        |
| Tailwind config     | `tailwind.config.ts`                        |
| Motion variants     | `lib/motion-variants.ts` (CREATE)           |
| Navbar              | `components/layout/PublicNavbar.tsx`        |
| Footer              | `components/layout/PublicFooter.tsx`        |
| Sidebar             | `components/layout/DashboardSidebar.tsx`    |
| Dashboard header    | `components/layout/DashboardHeader.tsx`     |
| Homepage            | `app/(marketing)/page.tsx`                  |
| Catalog             | `app/(marketing)/workshops/page.tsx`        |
| Workshop detail     | `app/(marketing)/workshops/[slug]/page.tsx` |
| EnrollButton        | `components/workshop/EnrollButton.tsx`      |
| WorkshopForm        | `components/workshops/WorkshopForm.tsx`     |
| DataTable           | `components/shared/DataTable.tsx`           |
| EmptyState          | `components/shared/EmptyState.tsx`          |
| StatsCard           | `components/shared/StatsCard.tsx`           |
| LoadingSkeleton     | `components/shared/LoadingSkeleton.tsx`     |
| ConfirmDialog       | `components/shared/ConfirmDialog.tsx`       |
| StatusBadge         | `components/shared/StatusBadge.tsx`         |
| Login               | `app/(auth)/login/page.tsx`                 |
| Register            | `app/(auth)/register/page.tsx`              |
| OTP                 | `app/(auth)/verify-otp/page.tsx`            |
| All dashboard pages | `app/(dashboard)/[role]/*/page.tsx`         |

---

_Blueprint version 1.0 — Skill Workshop Management System_
_Target: Next.js 16 + Tailwind 4.0 + Shadcn UI + Framer Motion + Recharts_
_Market: Bangladesh · Currency: BDT · Payment: SSLCommerz_
