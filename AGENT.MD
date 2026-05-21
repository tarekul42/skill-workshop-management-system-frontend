# SWMS Agent Context
## Skill Workshop Management System — Frontend AI Agent Instructions

> This file is the single source of truth for the AI agent working on this codebase. Read every section before touching any file. Never guess — every convention is defined here.

---

## 1. PROJECT IDENTITY

**Name**: Skill Workshop Management System (SWMS)  
**Market**: Bangladesh  
**Currency**: BDT (Bangladeshi Taka) — symbol `৳`  
**Payment Gateway**: SSLCommerz (never Stripe, never Razorpay)  
**Deployment**: Vercel (frontend) + Railway/Vercel (backend)  
**Stage**: Production frontend rebuild — backend is complete and stable

---

## 2. TECH STACK (exact versions — never upgrade without asking)

```
next                  16.2.3       (App Router, RSC, Server Actions)
react                 19.2.4
typescript            5.9.3
tailwindcss           4.2.2        (v4 syntax — no tailwind.config.js needed for most things)
@tanstack/react-query 5.99.0       (v5 API — useQuery, useMutation, queryOptions)
@tanstack/react-table 8.21.3
react-hook-form       7.72.1       (ALL forms — no manual useState for forms)
zod                   4.3.6        (ALL validation — schemas in lib/validation/)
framer-motion         12.38.0      (ALL animations — import from "motion/react" not "framer-motion")
recharts              3.8.1        (ALL charts — ResponsiveContainer always wraps charts)
shadcn (radix-nova)   4.3.0        (22 UI primitives in components/ui/)
lucide-react          1.8.0        (ALL icons — never heroicons, never react-icons)
next-themes           0.4.6        (useTheme hook for dark/light)
sonner                2.0.7        (ALL toasts — import toast from "sonner")
input-otp             1.4.2        (OTP input only)
date-fns              4.1.0        (ALL date formatting)
jose                  6.2.2        (JWT decode only on client)
```

---

## 3. CRITICAL IMPORT RULES

```typescript
// ✅ CORRECT — Framer Motion (v12 uses "motion/react")
import { motion, AnimatePresence, useSpring, useInView } from "motion/react";

// ❌ WRONG
import { motion } from "framer-motion";

// ✅ CORRECT — Icons
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";

// ✅ CORRECT — Toast
import { toast } from "sonner";

// ✅ CORRECT — TanStack Query v5
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ✅ CORRECT — cn utility
import { cn } from "@/lib/utils";

// ✅ CORRECT — Design tokens (TypeScript, not CSS raw values)
import { tokens } from "@/lib/design-tokens";

// ✅ CORRECT — Currency formatting
import { formatCurrency, formatDate } from "@/lib/formatters";
// formatCurrency(12500) → "৳12,500"
// formatDate("2025-01-15") → "Jan 15, 2025"
```

---

## 4. REPOSITORY STRUCTURE

```
src/
├── app/
│   ├── layout.tsx                    # Root: fonts, Toaster, ThemeProvider, QueryProvider
│   ├── globals.css                   # Tailwind config + CSS custom properties + animations
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   ├── global-error.tsx
│   ├── actions/auth.ts               # Server action: setSecureAuthCookie(role)
│   │
│   ├── (marketing)/                  # PUBLIC — PublicNavbar + PublicFooter layout
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── categories/page.tsx
│   │   └── workshops/
│   │       ├── page.tsx              # Catalog
│   │       └── [slug]/page.tsx       # Detail (Server Component for SEO)
│   │
│   ├── (auth)/                       # AUTH — centered card layout
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── register/instructor/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-otp/page.tsx
│   │   └── google/callback/page.tsx
│   │
│   └── (dashboard)/[role]/           # DASHBOARD — Sidebar + Header layout
│       ├── layout.tsx                # Validates role, renders DashboardSidebar + DashboardHeader
│       ├── dashboard/page.tsx
│       ├── workshops/page.tsx
│       ├── workshops/create/page.tsx
│       ├── workshops/[id]/edit/page.tsx
│       ├── enrollments/page.tsx
│       ├── students/page.tsx         # INSTRUCTOR only
│       ├── payments/page.tsx
│       ├── users/page.tsx            # ADMIN/SA only
│       ├── categories/page.tsx
│       ├── levels/page.tsx
│       ├── audit-logs/page.tsx       # ADMIN/SA only
│       └── profile/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── PublicNavbar.tsx
│   │   ├── PublicFooter.tsx
│   │   ├── DashboardSidebar.tsx
│   │   └── DashboardHeader.tsx
│   ├── shared/
│   │   ├── index.ts                  # Barrel — import shared components from here
│   │   ├── AnimatedPage.tsx
│   │   ├── BackButton.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── DataTable.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PasswordChecklist.tsx
│   │   ├── StatsCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ThemeToggle.tsx
│   ├── workshop/
│   │   └── EnrollButton.tsx
│   ├── workshops/
│   │   └── WorkshopForm.tsx
│   └── ui/                           # Shadcn primitives — NEVER edit directly
│
├── lib/
│   ├── api/
│   │   ├── api-client.ts             # Unified fetch — handles CSRF, token refresh, errors
│   │   └── services.ts               # All API service functions
│   ├── design-tokens.ts              # ← THE SINGLE SOURCE OF TRUTH for all tokens
│   ├── motion-variants.ts            # All Framer Motion variants (CREATE if missing)
│   ├── auth-helpers.ts
│   ├── constants.ts                  # BACKEND_API_URL, FRONTEND_URL, DASHBOARD_ROUTES
│   ├── formatters.ts                 # formatCurrency, formatDate, getInitials, truncate
│   ├── utils.ts                      # cn() — clsx + tailwind-merge
│   └── validation/
│       ├── auth.ts
│       └── password.ts
│
├── providers/
│   ├── QueryProvider.tsx             # TanStack Query — staleTime: 60_000
│   └── ThemeProvider.tsx             # next-themes
│
├── types/
│   ├── index.ts                      # Barrel
│   ├── api.types.ts                  # ApiResponse, PaginatedResponse, ApiErrorResponse
│   ├── workshop.types.ts             # IWorkshop, ICategory, ILevel
│   ├── enrollment.types.ts           # IEnrollment, EnrollmentStatus
│   ├── user.types.ts                 # IUser, UserRole, IsActive
│   ├── payment.types.ts              # IPayment, PaymentStatus
│   ├── audit.types.ts                # IAuditLog, AuditAction
│   ├── stats.types.ts                # UserStats, WorkshopStats, EnrollmentStats, PaymentStats
│   └── dashboard.types.ts            # NavItem, NavSection
│
└── proxy.ts                          # Next.js middleware — JWT role cookie validation
```

---

## 5. DESIGN SYSTEM RULES (non-negotiable)

### Typography
- **Display / Headings**: `font-display` class → Bricolage Grotesque (variable: `--font-display`)
- **UI / Body**: `font-body` class → DM Sans (variable: `--font-body`) — this is the default body font
- **Mono**: `font-mono` class → JetBrains Mono — ONLY for transaction IDs, timestamps in tables

Apply `font-display` on: ALL `h1`–`h3` tags, stat numbers, card titles, CTA button text.  
Never use `font-display` on: body paragraphs, form labels, table cells, badges.

### Color — Always Use CSS Variables
```typescript
// ✅ Use CSS variable tokens via Tailwind
className="bg-[--primary] text-[--primary-foreground]"
className="border-[--border] hover:border-[--border-strong]"

// ✅ Or use the tokens object for inline styles
import { tokens } from "@/lib/design-tokens";
style={{ backgroundColor: tokens.color.primary }}

// ❌ NEVER hardcode hex/oklch values in components
className="bg-[oklch(0.42_0.25_272)]"  // WRONG
```

### Spacing System
All spacing uses Tailwind's default scale. Site max-width container:
```tsx
// Every page uses this wrapper
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Border Radius — strict rules
| Element | Value | Tailwind |
|---|---|---|
| Cards | 20px | `rounded-[20px]` |
| Dialogs / Modals | 20px | `rounded-[20px]` |
| Dashboard cards | 16px | `rounded-2xl` |
| Inputs | 10px | `rounded-[10px]` |
| Buttons | 10px | `rounded-[10px]` |
| Badges / Tags | 6px | `rounded-[6px]` |
| Pills / Counters | 999px | `rounded-full` |
| Icon containers | 12px–14px | `rounded-xl` |
| Image thumbnails in tables | 6px | `rounded-[6px]` |

### Elevation — always use CSS custom properties
```css
/* Use these class-based shadows — defined in globals.css */
.shadow-1  /* cards at rest */
.shadow-2  /* hovered cards, dropdowns */
.shadow-3  /* sticky elements, fixed bars */
.shadow-4  /* modals, dialogs */
.shadow-primary-glow   /* primary buttons */
.shadow-accent-glow    /* enroll/pay buttons */
```

---

## 6. COMPONENT CONVENTIONS

### Every component file structure
```typescript
// 1. React imports
// 2. Third-party imports (alphabetical)
// 3. Internal imports — @/lib, @/components, @/types (alphabetical)
// 4. Types/interfaces (local to this file)
// 5. Component function
// 6. Default export

"use client"; // Only when needed. Prefer RSC for data-fetching components.
```

### "use client" rules
Add `"use client"` ONLY when the component uses:
- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- Any Framer Motion component (`motion.*`, `AnimatePresence`)
- `useRouter`, `usePathname`, `useSearchParams`
- Browser APIs (localStorage, sessionStorage, window)
- Event handlers that require client state

**Prefer Server Components** for anything that only fetches data and renders HTML.

### Props interface naming
```typescript
// Always named [ComponentName]Props
interface StatsCardProps {
  label: string;
  value: number;
  trend?: number;
  icon: LucideIcon;
}
```

### Loading states — NEVER use boolean `isLoading` prop
```typescript
// ✅ Use TanStack Query status
const { data, isLoading, isError } = useQuery(...)

// ✅ Return skeleton in loading branch
if (isLoading) return <WorkshopCardSkeleton count={6} />;
if (isError) return <ErrorDisplay />;
return <WorkshopGrid data={data} />;
```

### Error handling — always use ErrorDisplay component
```typescript
// ✅ Pattern for all data-fetching components
if (isError) {
  return (
    <ErrorDisplay
      title="Failed to load workshops"
      description={error.message}
      onRetry={() => refetch()}
    />
  );
}
```

---

## 7. FORMS — MANDATORY PATTERN

**ALL forms use react-hook-form + Zod.** No exceptions. No manual useState for form values.

```typescript
// Standard form pattern
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => loginUser(data),
    onSuccess: () => toast.success("Logged in!"),
    onError: (err: ApiError) => toast.error(err.message),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 8. TANSTACK QUERY PATTERNS

```typescript
// Standard query — always provide queryKey + queryFn + staleTime
const { data: workshops, isLoading } = useQuery({
  queryKey: ["workshops", { page, search, category }],
  queryFn: () => fetchWorkshops({ page, search, category }),
  staleTime: 60_000,          // 60 seconds — matches QueryProvider default
  placeholderData: keepPreviousData,  // prevents layout shift on page change
});

// Standard mutation
const { mutate: deleteWorkshop, isPending } = useMutation({
  mutationFn: (id: string) => deleteWorkshopById(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["workshops"] });
    toast.success("Workshop deleted");
  },
  onError: (err: ApiError) => toast.error(err.message),
});

// Prefetch in Server Component (pass data as prop to Client Component)
// Avoid useEffect for initial data fetch — use RSC + props instead
```

### Query Key Conventions
```typescript
["workshops"]                         // all workshops
["workshops", { page, search }]       // paginated/filtered list
["workshop", slug]                    // single workshop
["categories"]                        // all categories
["enrollments", "my"]                 // current user's enrollments
["enrollment", enrollmentId]          // single enrollment
["stats", "users"]                    // user stats
["stats", "payments"]                 // payment stats
["user", "me"]                        // current user profile
["audit-logs", { filters }]           // audit logs with filters
```

---

## 9. ANIMATION PATTERNS

Import variants from `lib/motion-variants.ts`:

```typescript
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
  slideInRight,
} from "@/lib/motion-variants";

// Page-level animation wrapper (already exists as AnimatedPage component)
<AnimatedPage>
  <YourContent />
</AnimatedPage>

// Staggered list
<motion.ul variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.li key={item.id} variants={fadeInUp}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>

// Scroll-triggered reveal
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-15%" });

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 24 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>

// Animated number counter (stats cards)
const springValue = useSpring(0, { stiffness: 80, damping: 20 });
// Set springValue to target on mount
```

### Animation rules
- `once: true` on all `useInView` — never re-animate on scroll back
- `prefers-reduced-motion`: wrap all motion in `useReducedMotion()` check
- No animation duration > 600ms for UI interactions
- No animation duration > 1200ms for counters/reveals
- Always provide `exit` variants when using `AnimatePresence`

---

## 10. API CLIENT USAGE

```typescript
// All API calls go through lib/api/services.ts
// NEVER call fetch() directly in components
// The api-client.ts handles: CSRF tokens, token refresh, error normalization

// ✅ CORRECT
import { fetchWorkshops, createWorkshop } from "@/lib/api/services";

// ❌ WRONG
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/workshop`);
```

### Error type
```typescript
// All API errors are typed as ApiError
import type { ApiError } from "@/lib/api/api-client";

// In useMutation onError:
onError: (error: ApiError) => {
  toast.error(error.message);
  // error.status — HTTP status code
  // error.data — raw error response body
}
```

### FormData for file uploads
```typescript
// Workshop + Category creation uses multipart/form-data
const formData = new FormData();
formData.append("data", JSON.stringify(workshopPayload));
images.forEach((file) => formData.append("files", file));
await createWorkshop(formData);
// api-client.ts automatically detects FormData and skips Content-Type header
```

---

## 11. AUTH & ROLE SYSTEM

### Storage keys (exact strings — never change)
```typescript
const STORAGE_KEYS = {
  user:        "skillworkshop_user",          // localStorage
  accessToken: "skillworkshop_access_token",  // sessionStorage
  otpEmail:    "otp_email",                   // sessionStorage (OTP flow)
} as const;
```

### User roles
```typescript
type UserRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";

// Route segment mapping
const ROLE_SEGMENTS = {
  SUPER_ADMIN: "super-admin",
  ADMIN:       "admin",
  INSTRUCTOR:  "instructor",
  STUDENT:     "student",
} as const;
```

### Checking current user role
```typescript
// In Client Components:
const user = JSON.parse(localStorage.getItem("skillworkshop_user") ?? "null");
const role: UserRole = user?.role;

// Role guards in dashboard layout — already handled by proxy.ts middleware
// Do NOT duplicate role checks in individual page components
```

### Sidebar nav per role
| Role | Pages |
|---|---|
| SUPER_ADMIN | Dashboard, Admins, Users, Workshops, Enrollments, Payments, Categories, Levels, Audit Logs |
| ADMIN | Dashboard, Users, Workshops, Enrollments, Payments, Categories, Levels, Audit Logs |
| INSTRUCTOR | Dashboard, My Workshops, Create Workshop, My Students, Enrollments, Profile |
| STUDENT | Dashboard, Browse Workshops, My Enrollments, Payments, Profile |

---

## 12. DATA FORMATTING RULES

```typescript
// Currency — ALWAYS use formatCurrency from lib/formatters.ts
formatCurrency(12500)        // → "৳12,500"
formatCurrency(0)            // → "Free"
formatCurrency(null)         // → "Free"

// Date — ALWAYS use formatDate from lib/formatters.ts
formatDate("2025-01-15T00:00:00Z")  // → "Jan 15, 2025"
formatDate(null)                     // → "TBA"

// Relative time (for tables)
// Use date-fns formatDistanceToNow
import { formatDistanceToNow } from "date-fns";
formatDistanceToNow(new Date(createdAt), { addSuffix: true }) // "2 days ago"

// Initials (avatars)
import { getInitials } from "@/lib/formatters";
getInitials("Mohammad Rahman")  // → "MR"

// Truncate text
import { truncate } from "@/lib/formatters";
truncate("Long workshop title here...", 40)  // → "Long workshop title here..."
```

---

## 13. STATUS BADGE RULES

The `StatusBadge` component auto-maps statuses to colors. Never pass manual colors.

```typescript
// ✅ CORRECT — just pass the status string
<StatusBadge status={enrollment.status} />
// StatusBadge resolves: COMPLETE → success, PENDING → warning, etc.

// Internal mapping (do NOT replicate in other components):
// success:  COMPLETE, COMPLETED, PAID, ACTIVE, APPROVED, VERIFIED, PUBLISHED
// warning:  PENDING, PENDING_PAYMENT, PENDING_REVIEW, UNPAID, DRAFT
// danger:   CANCEL, CANCELLED, FAILED, BLOCKED, REJECTED, EXPIRED, DELETED
// info:     REFUNDED, PROCESSING
```

---

## 14. IMAGES & MEDIA

```typescript
// ALWAYS use next/image for all images
import Image from "next/image";

// Workshop cards
<Image
  src={workshop.images[0]}
  alt={workshop.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>

// Avatars
<Image
  src={user.picture}
  alt={user.name}
  width={40}
  height={40}
  className="rounded-full object-cover"
/>

// Placeholder when no image (NEVER show gray box):
// Use a gradient div seeded from the workshop/category name
// Or an SVG placeholder with the item's initials/icon
```

### Cloudinary transforms
```typescript
// Append Cloudinary transforms to URLs for optimized sizes
// Thumbnail (card): add /w_400,q_auto,f_auto/ before the filename
// Hero image: /w_1200,q_auto,f_auto/
// Avatar: /w_80,h_80,c_fill,q_auto,f_auto/
```

---

## 15. WHAT NOT TO DO

```
❌ Never edit files in components/ui/ — they are Shadcn primitives
❌ Never use manual useState for form field values — use react-hook-form
❌ Never call fetch() directly — always use services.ts
❌ Never hardcode colors — always use CSS variables via tokens
❌ Never import from "framer-motion" — use "motion/react"
❌ Never use toast without a message — always pass a meaningful string
❌ Never use <a> tags for internal navigation — always use next/link <Link>
❌ Never skip the "use client" directive when using hooks
❌ Never skip loading and error states in data-fetching components
❌ Never use inline styles for design tokens — use CSS variables via Tailwind
❌ Never show a raw gray placeholder when image is null — use a real fallback
❌ Never display unformatted prices — always use formatCurrency()
❌ Never display unformatted dates — always use formatDate() or date-fns
❌ Never put two primary-weight CTAs in the same visual section
❌ Never duplicate role-based access control logic — proxy.ts handles it
❌ Never use Recharts without ResponsiveContainer wrapping the chart
```

---

## 16. ENVIRONMENT VARIABLES

```bash
# .env.local
NEXT_PUBLIC_BACKEND_API_URL=https://skill-workshop-management-system-backend.vercel.app/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_URL_DEV=http://localhost:5000/api/v1
JWT_SECRET=<your-secret-for-role-cookie>
```

Access in code:
```typescript
// Public (available in browser)
process.env.NEXT_PUBLIC_BACKEND_API_URL

// Server-only (server components, API routes, middleware only)
process.env.JWT_SECRET
```

---

## 17. PAYMENT FLOW (read before touching enrollment/payment code)

```
Student clicks "Enroll Now"
  → POST /enrollment  (creates PENDING enrollment + UNPAID payment record)
  → Response includes SSLCommerz payment URL
  → Browser redirects to SSLCommerz (external page — we don't control this)
  → Student pays on SSLCommerz
  → SSLCommerz POSTs to /payment/ipn (backend validates, updates statuses)
  → SSLCommerz redirects browser to /payment/success OR /payment/fail
  → These pages show success/fail UI, NOT the dashboard
  → Student manually navigates to dashboard
```

**Never** attempt to validate payment on the frontend. Payment status is backend truth only.  
**Never** modify the IPN endpoint or payment flow — it is production-tested.

---

## 18. BACKEND API REFERENCE (quick lookup)

**Base URL**: `process.env.NEXT_PUBLIC_BACKEND_API_URL` (already in api-client.ts)

| Resource | List | Single | Create | Update | Delete |
|---|---|---|---|---|---|
| Workshops | `GET /workshop` | `GET /workshop/:slug` | `POST /workshop/create` | `PATCH /workshop/:id` | `DELETE /workshop/:id` |
| Categories | `GET /category` | `GET /category/:slug` | `POST /category/create` | `PATCH /category/:id` | `DELETE /category/:id` |
| Levels | `GET /workshop/levels` | `GET /workshop/levels/:id` | `POST /workshop/create-level` | `PATCH /workshop/levels/:id` | `DELETE /workshop/levels/:id` |
| Users | `GET /user/all-users` | `GET /user/:id` | `POST /user/register` | `PATCH /user/:id` | `DELETE /user/:id` |
| Enrollments | `GET /enrollment` | `GET /enrollment/:id` | `POST /enrollment` | `PATCH /enrollment/:id/status` | `DELETE /enrollment/:id` |
| Payments | — | — | — | — | — |
| Stats | `GET /stats/users` `GET /stats/enrollment` `GET /stats/payment` `GET /stats/workshop` | — | — | — | — |
| Audit | `GET /audit` | `GET /audit/:id` | — | — | — |

**Pagination params**: `?page=1&limit=10&search=keyword&sortBy=createdAt&sortOrder=desc`  
**Auth header**: Access token auto-attached by api-client.ts from sessionStorage.

---

## 19. ACCESSIBILITY REQUIREMENTS

Every interactive element must have:
```typescript
// Buttons without visible text (icon-only)
<button aria-label="Delete workshop">
  <Trash2 className="h-4 w-4" />
</button>

// Images
<Image alt="Workshop title or meaningful description" ... />

// Form inputs — always paired with Label
<Label htmlFor="email">Email address</Label>
<Input id="email" ... />

// Status badges — add screen reader text
<span className="sr-only">Status: </span><StatusBadge status={...} />

// Loading states
<div role="status" aria-live="polite">
  <LoadingSkeleton />
  <span className="sr-only">Loading...</span>
</div>
```

Focus ring — never `outline-none` without a replacement:
```css
/* globals.css — ensure focus-visible ring uses primary color */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 20. RESPONSIVE BREAKPOINTS

```typescript
// Tailwind breakpoints used in this project
// sm:  640px  — mobile landscape
// md:  768px  — tablet
// lg:  1024px — small desktop / tablet landscape
// xl:  1280px — desktop
// 2xl: 1536px — large desktop (rarely used)

// Mobile-first approach — write base styles for mobile, add breakpoints for larger
// Dashboard sidebar: hidden on mobile (< lg), translate-x-full when closed

// Target grid patterns:
// 1 col (mobile) → 2 col (md) → 3 col (lg) → 4 col (xl)
// Workshop cards: 1 → 2 → 3
// Stats cards:    1 → 2 → 4
// Category cards: 1 → 2 → 4
```

---

## 21. FILE NAMING CONVENTIONS

```
Components:    PascalCase.tsx         (WorkshopCard.tsx)
Pages:         page.tsx               (Next.js App Router)
Layouts:       layout.tsx
Loading:       loading.tsx
Error:         error.tsx
Not Found:     not-found.tsx
Hooks:         use-kebab-case.ts      (use-workshop-filter.ts)
Utilities:     kebab-case.ts          (design-tokens.ts)
Types:         kebab-case.types.ts    (workshop.types.ts)
Constants:     SCREAMING_SNAKE_CASE in constants.ts
```

---

## 22. GIT COMMIT CONVENTIONS

```
feat(catalog): add sticky filter bar with mobile sheet
fix(auth): resolve token refresh loop on 401
style(tokens): update primary color to new oklch value
refactor(datatable): extract toolbar into separate component
chore(deps): upgrade recharts to 3.8.1
perf(images): add priority prop to above-fold workshop images
a11y(forms): add aria-describedby to all form inputs
```

Format: `type(scope): lowercase description`  
Types: `feat` | `fix` | `style` | `refactor` | `chore` | `perf` | `a11y` | `test` | `docs`

---

*Agent context v1.0 — SWMS Frontend*  
*Keep this file updated when architecture decisions change.*