# Skill Workshop Management System — Frontend Code Review

> **Repository**: `skill-workshop-management-system-frontend`
> **Date**: 2026-04-17
> **Stack**: Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, TanStack Query & Table, Zod, shadcn/ui, Recharts

---

## Table of Contents

1. [Critical Issues](#1-critical-issues)
2. [Security Concerns](#2-security-concerns)
3. [Architecture & Code Organization](#3-architecture--code-organization)
4. [Performance Issues](#4-performance-issues)
5. [Type Safety & TypeScript Issues](#5-type-safety--typescript-issues)
6. [Error Handling](#6-error-handling)
7. [State Management & Data Fetching](#7-state-management--data-fetching)
8. [Accessibility (a11y)](#8-accessibility-a11y)
9. [Code Quality & Best Practices](#9-code-quality--best-practices)
10. [Configuration & Tooling](#10-configuration--tooling)
11. [UI/UX Issues](#11-uiux-issues)
12. [Missing Features / Gaps](#12-missing-features--gaps)

---

## 1. Critical Issues

### 1.1 Inconsistent API Client Patterns — `apiClientPaginated` Lacks CSRF Token

**File**: `src/lib/api-client.ts` (lines 221–270)
**Severity**: **Critical**

`apiClientPaginated` does **not** fetch or attach a CSRF token for mutating requests, unlike `apiClient`. If you ever use it for POST/PUT/DELETE calls, the request will be rejected by the backend CSRF protection.

```typescript
// ❌ apiClientPaginated — no CSRF logic at all
export async function apiClientPaginated<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<PaginatedResult<T>> {
  const fetchHeaders: Record<string, string> = {};
  // ... missing CSRF fetch entirely
}
```

**Fix**: Either consolidate all three clients into a single function with a `returnMeta: boolean` option, or at minimum add CSRF support to `apiClientPaginated`.

### 1.2 Duplicate Workshop Form Implementations

**File**: `src/app/(dashboard)/[role]/workshops/create/page.tsx` and `src/components/workshops/WorkshopForm.tsx`
**Severity**: **Critical**

There are **two completely independent workshop form implementations**:
- `create/page.tsx` has its own `WorkshopFormData` interface, manual state management, inline `DynamicListSection` component, no Zod validation, and no image previews.
- `components/workshops/WorkshopForm.tsx` uses Zod schema validation, proper image handling with previews, and is a well-structured reusable component.

The `create/page.tsx` also **does not use the shared WorkshopForm** at all. This means any bug fix or feature added to one form won't be reflected in the other.

**Fix**: Refactor `create/page.tsx` and `edit/page.tsx` to use the shared `WorkshopForm` component.

### 1.3 Race Condition on Params Promise

**Files**: `src/app/(dashboard)/[role]/dashboard/page.tsx`, `workshops/page.tsx`, `enrollments/page.tsx`, `users/page.tsx`, `profile/page.tsx`, `workshops/create/page.tsx`, `workshops/[id]/edit/page.tsx`
**Severity**: **Critical**

Every dashboard page uses `params.then(p => setRole(p.role))` inside a `useEffect`:

```typescript
useEffect(() => {
  params.then((p) => setRole(p.role));
}, [params]);
```

This causes an **initial render with empty/default role**, followed by a re-render once the promise resolves. The dashboard page starts with `role = "STUDENT"` (default), which triggers the wrong API calls before the actual role is resolved.

```typescript
const [role, setRole] = React.useState<string>("STUDENT"); // ← WRONG DEFAULT
```

**Fix**: Use React's `React.use()` hook (available in React 19) to unwrap the params promise synchronously:

```typescript
const { role } = React.use(params);
```

---

## 2. Security Concerns

### 2.1 Role-Based Authorization Relies Entirely on a Client-Side Cookie

**File**: `src/middleware.ts`, `src/lib/auth-helpers.ts`
**Severity**: **High**

The middleware only checks a `swms_role` cookie to determine if a user can access a route. This cookie is:
- Set by the client via `document.cookie`
- Not signed or encrypted
- Trivially spoofable via browser dev tools

Any user can access any role's dashboard by setting `document.cookie = "swms_role=SUPER_ADMIN"`.

**Fix**: Either validate the cookie against a server-side session/token store, or use middleware to call a backend verification endpoint. At minimum, sign the cookie with an HMAC secret.

### 2.2 Access Token Stored in `sessionStorage`

**File**: `src/lib/api-client.ts` (line 49)
**Severity**: **Medium**

The access token is stored in `sessionStorage`, which is more secure than `localStorage` (cleared on tab close), but still accessible to any JavaScript running on the page. An XSS attack could exfiltrate the token.

**Fix**: Consider using `httpOnly` cookies set by the backend, and only keep a flag in sessionStorage. For the refresh flow, rely on `credentials: "include"` on fetch calls.

### 2.3 No CSRF Token on `apiClientPaginated` for POST Requests

**File**: `src/lib/api-client.ts` (line 239)
**Severity**: **Medium**

As mentioned in 1.1, `apiClientPaginated` sends POST requests without CSRF headers. Even though it currently defaults to `GET`, the `options.method` parameter is exposed.

### 2.4 Hardcoded Backend URL in `constants.ts`

**File**: `src/lib/constants.ts` (lines 1–5)
**Severity**: **Low**

```typescript
export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "https://skill-workshop-management-system-backend.vercel.app/api/v1";
```

The fallback URL exposes the production backend URL in the source code. If the env variable is missing, all requests silently go to production.

**Fix**: Remove the fallback or throw an error if the env variable is not set:

```typescript
if (!process.env.NEXT_PUBLIC_BACKEND_API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_API_URL is not configured");
}
```

### 2.5 Google OAuth Uses Raw `<a>` Instead of `<Link>`

**File**: `src/app/(auth)/login/page.tsx` (line 201), `register/page.tsx` (line 355), `register/instructor/page.tsx`
**Severity**: **Low**

```html
<a href={`${BACKEND_API_URL}/auth/google?redirect=google/callback`}>
```

Using `<a>` instead of Next.js `<Link>` causes a full page reload, losing any client state. It also leaks the backend API URL in the rendered HTML source.

### 2.6 User Data Stored in `localStorage` Without Validation

**File**: `src/lib/auth-helpers.ts` (line 17)
**Severity**: **Medium**

```typescript
export function saveUser(user: SavedUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
```

The user object is stored and retrieved from `localStorage` without signature verification. Malicious scripts can modify it to escalate privileges or inject fake user data.

---

## 3. Architecture & Code Organization

### 3.1 Three Separate API Client Functions with Massive Duplication

**File**: `src/lib/api-client.ts`
**Severity**: **High**

`apiClient`, `apiClientPaginated`, and `apiClientFormData` share ~80% of the same logic (token attachment, 401 refresh, error handling, JSON parsing). Only the meta extraction differs.

**Fix**: Create a single unified `apiRequest<T>()` function with options:

```typescript
export async function apiRequest<T>(endpoint: string, options: {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  returnMeta?: boolean;
  skipCsrf?: boolean;
} = {}): Promise<T | PaginatedResult<T>> {
  // Single implementation
}
```

### 3.2 Mixed Data Fetching Patterns

**File**: `src/app/(dashboard)/[role]/enrollments/page.tsx`
**Severity**: **Medium**

The enrollments page uses **both** React Query (`useQuery`) for the student view and `useEffect` + `useState` for the admin view. This inconsistency makes the code harder to maintain and reason about.

```typescript
// Student: React Query ✅
const { data: studentEnrollments } = useQuery({ ... });

// Admin: useEffect + useState ❌
useEffect(() => { fetchEnrollments(); }, [role, fetchEnrollments]);
```

**Fix**: Use React Query consistently across all views, or use a custom hook that abstracts the fetching pattern.

### 3.3 Service Layer Mixes Raw `fetch` with `apiClient`

**File**: `src/lib/api/services.ts`
**Severity**: **Medium**

Some service functions use `apiClient` (with auth, CSRF, error handling), while others use raw `fetch`:

```typescript
// Uses apiClient ✅
export async function deleteWorkshop(id: string): Promise<void> {
  return apiClient<void>(`/workshop/${id}`, { method: "DELETE" });
}

// Uses raw fetch ❌ (no auth, no error handling, no CSRF)
export async function fetchWorkshops(params?: FetchWorkshopsParams) {
  const res = await fetch(url);
  const json = await res.json();
  return { data: json.data, meta: json.meta };
}
```

`fetchWorkshops`, `fetchWorkshopBySlug`, `fetchWorkshopLevels`, `fetchCategories`, `fetchCategoryBySlug`, and `fetchWorkshopById` all use raw `fetch`. These bypass auth, token refresh, and error handling.

### 3.4 Duplicate Password Validation Logic

**Files**: `src/app/(auth)/register/page.tsx`, `register/instructor/page.tsx`, `src/app/(auth)/reset-password/page.tsx`, `src/app/(dashboard)/[role]/profile/page.tsx`
**Severity**: **Medium**

Password validation logic is reimplemented in **four different files**:
- `getPasswordChecks()` function in register and instructor pages
- `PasswordRule` component in reset-password page
- `checkPasswordStrength()` function in profile page

Each has slightly different rules (register requires 6 chars, profile requires 8 chars).

**Fix**: Extract to a shared `src/lib/validation/password.ts` module and use Zod schemas consistently.

### 3.5 `DynamicListSection` Component Duplicated

**Files**: `src/app/(dashboard)/[role]/workshops/create/page.tsx` (line 474) and `workshops/[id]/edit/page.tsx` (line 560)
**Severity**: **Low**

The `DynamicListSection` component is defined identically in both the create and edit pages instead of being extracted as a shared component.

### 3.6 Local Import Styles in `workshops/page.tsx`

**File**: `src/app/(dashboard)/[role]/workshops/page.tsx` (lines 459–464)
**Severity**: **Low**

Import statements for `DropdownMenu` components appear **after** the main component definition, which violates JavaScript/ESLint best practices:

```typescript
// ... page component ends at line 455

// ❌ Imports after component definition
import {
  DropdownMenu,
  DropdownMenuContent,
  // ...
} from "@/components/ui/dropdown-menu";
```

### 3.7 No Custom Hooks Directory

**Severity**: **Low**

There is no `src/hooks/` directory. Reusable logic like user state management, logout handling, and data fetching is scattered across components. A `useLogout()`, `useAuth()`, or `useWorkshopCrud()` hook would greatly clean up the code.

---

## 4. Performance Issues

### 4.1 `EnrollButton` Fetches All Enrollments to Check One

**File**: `src/components/workshop/EnrollButton.tsx` (lines 51–54)
**Severity**: **High**

```typescript
const { getMyEnrollments } = await import("@/lib/api/services");
const enrollments = await getMyEnrollments(); // Fetches ALL user enrollments
const existing = enrollments.find(
  (e) => { /* ... */ }
);
```

On every page load, this fetches **all** user enrollments from the backend, then searches client-side for a single workshop match. If a page has 5 workshop cards, it makes 5 identical full-list API calls.

**Fix**: Create a dedicated backend endpoint like `GET /enrollment/check?workshop=<id>` that returns a boolean, or cache the enrollments at a higher level.

### 4.2 `fetchCategories` and `fetchWorkshopLevels` Called Independently in Multiple Pages

**Files**: `src/app/(dashboard)/[role]/workshops/page.tsx`, `workshops/create/page.tsx`, `workshops/[id]/edit/page.tsx`, `src/components/workshops/WorkshopForm.tsx`
**Severity**: **Medium**

Categories and levels are refetched independently on every page navigation even though they rarely change. The workshop list page fetches them alongside workshops, and the form pages fetch them again.

**Fix**: These should be fetched once via React Query at a shared layout level, or use `staleTime` of several hours (currently 5 minutes in WorkshopForm, which is better than nothing but still short for reference data).

### 4.3 `useEffect` Chain in Dashboard Page Causes Waterfall

**File**: `src/app/(dashboard)/[role]/dashboard/page.tsx` (lines 180–184, 229–234)
**Severity**: **Medium**

```typescript
useEffect(() => {
  params.then((p) => setRole(p.role));
}, [params]);

useEffect(() => {
  if (!role) return;
  loadDashboard(); // Only starts AFTER role resolves
}, [role]);
```

This creates a sequential waterfall: render → resolve params → set role → start API calls. With `React.use()`, the params can be resolved synchronously before the first render.

### 4.4 Image URLs Used with `next/image` Without Domain Configuration

**File**: `src/components/workshops/WorkshopForm.tsx` (line 607)
**Severity**: **Medium**

```typescript
<Image
  src={url}    // External URL from backend
  alt={`Workshop image ${idx + 1}`}
  fill
  unoptimized // Forces unoptimized mode
/>
```

Multiple external image URLs are used with `next/image` without configuring `next.config.ts` `images.remotePatterns`. The `unoptimized` prop disables Next.js image optimization entirely.

**Fix**: Configure remote image patterns in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
    ],
  },
};
```

### 4.5 No Debouncing on Search Inputs

**File**: `src/app/(dashboard)/[role]/workshops/page.tsx` (line 122), `users/page.tsx` (line 131)
**Severity**: **Medium**

Search inputs trigger API calls on every keystroke:

```typescript
const handleSearch = (value: string) => {
  setSearchTerm(value);  // Immediately triggers useEffect
  setPage(1);
};
```

**Fix**: Add a debounce delay (300–500ms) before making the API call.

### 4.6 `BackButton` Uses Raw `window.history.back()` Check

**File**: `src/components/shared/BackButton.tsx` (line 8)
**Severity**: **Low**

```typescript
onClick={() => typeof window !== "undefined" && window.history.back()}
```

The `typeof window !== "undefined"` check is unnecessary in a `"use client"` component since it only runs in the browser.

### 4.7 `upload/` Directory Contains Images Checked into Git

**Files**: `upload/pasted_image_*.png` (6 files)
**Severity**: **Low**

Six large image files are committed to the repository, increasing clone time and repo size. These should be in `.gitignore`.

---

## 5. Type Safety & TypeScript Issues

### 5.1 Dashboard Layout Uses Unsafe Type Assertion on `role`

**File**: `src/app/(dashboard)/[role]/layout.tsx` (line 30)
**Severity**: **Medium**

```typescript
const { role } = await params;

<DashboardSidebar
  role={role as "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT"}
/>
```

Any arbitrary URL segment like `/foo/dashboard` will pass through. The role is blindly cast without validation.

**Fix**: Validate the role against the allowed values and redirect to a 403/unauthorized page if invalid.

### 5.2 `NavItem.icon` Typed as `string` Instead of Icon Component Type

**File**: `src/types/dashboard.types.ts` (line 4)
**Severity**: **Low**

```typescript
export interface NavItem {
  icon: string; // ← Should be a union of icon names or LucideIcon type
}
```

The icon is a free-form string that is looked up at runtime in `iconMap`. Any typo in the sidebar config will result in a missing icon with no TypeScript warning.

**Fix**: Use a union type of valid icon names:

```typescript
type IconName = "LayoutDashboard" | "Shield" | "Users" | /* ... */;
export interface NavItem {
  icon: IconName;
}
```

### 5.3 `EnrollButton` Uses `as unknown as` Type Assertion

**File**: `src/components/workshop/EnrollButton.tsx` (line 107)
**Severity**: **Low**

```typescript
const data = result as unknown as { paymentUrl?: string };
```

This double assertion bypasses TypeScript's type safety entirely.

### 5.4 `apiClientPaginated` Returns `json.meta!` with Non-Null Assertion

**File**: `src/lib/api-client.ts` (line 268)
**Severity**: **Low**

```typescript
return {
  data: json.data,
  meta: json.meta!,  // ← Unsafe non-null assertion
};
```

If the backend ever returns a response without `meta`, this will silently pass `undefined` where a `PaginationMeta` object is expected.

### 5.5 Login Page Defines Inline Types Instead of Using Shared Types

**File**: `src/app/(auth)/login/page.tsx` (lines 60–74)
**Severity**: **Low**

```typescript
const data = await apiClient<{
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    // ...
  };
}>("/auth/login", { ... });
```

This inline type duplicates `LoginResponse` from `src/lib/api/services.ts`.

---

## 6. Error Handling

### 6.1 Silent Error Swallowing in Catch Blocks

**Files**: Multiple dashboard pages
**Severity**: **High**

Many `catch` blocks silently swallow errors:

```typescript
// workshops/page.tsx
} catch {
  // Error handled silently  ← User never sees any feedback
}

// users/page.tsx (4 occurrences!)
} catch {
  // Error handled silently
}

// workshops/create/page.tsx
} catch {
  // Error handled silently
}
```

When these API calls fail, the user sees no error message, no toast, and no retry option — the page simply shows empty data.

**Fix**: At minimum, show a toast notification. Better yet, implement a retry mechanism or error boundary.

### 6.2 Users Page Handlers Don't Show Toast Notifications

**File**: `src/app/(dashboard)/[role]/users/page.tsx` (lines 150–193)
**Severity**: **Medium**

Unlike the enrollments page (which uses `toast.success`/`toast.error`), the users page's handlers silently catch errors without any user feedback:

```typescript
const handleEditRoleSave = async () => {
  try {
    await updateUser(editUser._id, { role: editRole });
    // ❌ No toast.success("Role updated")
  } catch {
    // ❌ No toast.error("Failed to update role")
  }
};
```

### 6.3 `fetchWorkshops` in `services.ts` Does Not Handle Non-OK Responses

**File**: `src/lib/api/services.ts` (lines 250–259)
**Severity**: **Medium**

```typescript
export async function fetchWorkshops(params?: FetchWorkshopsParams) {
  const res = await fetch(url);
  const json = await res.json();
  return { data: json.data, meta: json.meta }; // No status check!
}
```

If the backend returns a 500 or 404, this will still try to parse the response and return potentially `undefined` data. No error is thrown.

### 6.4 No Global Error Boundary for API Failures

**Severity**: **Medium**

While `src/app/error.tsx` catches React errors and `global-error.tsx` catches root-level errors, there's no centralized error handling for API failures. Each page handles errors independently with inconsistent patterns.

---

## 7. State Management & Data Fetching

### 7.1 No Server-Side Rendering (SSR) for Public Pages

**Severity**: **Medium**

All marketing pages (`/(marketing)/page.tsx`, `/workshops/page.tsx`, `/workshops/[slug]/page.tsx`, etc.) use `"use client"` and `useEffect` for data fetching. None of them use Next.js server components or `fetch` with caching.

This means:
- All content is invisible to search engine crawlers that don't execute JavaScript
- Initial page load shows a loading skeleton instead of content
- No SEO benefit from Next.js SSR capabilities

**Fix**: Convert public pages to server components using `async` functions and `fetch` with `revalidate`. Reserve `"use client"` only for interactive components.

### 7.2 React Query Not Used Consistently

**Severity**: **Medium**

Only two features use React Query properly:
- Student enrollments page (`useQuery`)
- Profile page (`useMe` would benefit from it too)

All other pages use raw `useEffect` + `useState` for data fetching. This means no automatic caching, no background refetch, no deduplication, and no stale-while-revalidate behavior.

### 73 No Optimistic Updates

**Severity**: **Low**

Mutations (delete workshop, update enrollment status, update user role) all follow the pattern: `await API call → refetch data → update state`. Optimistic updates would make the UI feel much faster by updating the local state immediately and rolling back on error.

---

## 8. Accessibility (a11y)

### 8.1 Missing `role="alert"` on Error Messages in Register and Instructor Pages

**File**: `src/app/(auth)/register/page.tsx` (line 328), `register/instructor/page.tsx` (line 372)
**Severity**: **Medium**

The login page properly wraps its error in a `role="alert"` div, but register and instructor registration pages do not:

```tsx
// register/page.tsx ❌
{error && (
  <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
    {error}
  </div>
)}
```

```tsx
// login/page.tsx ✅
{error && (
  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2" role="alert">
    <p className="flex-1 text-sm text-destructive">{error}</p>
  </div>
)}
```

### 8.2 Missing `<title>` on Dialog Content

**Files**: Multiple dialog usages across the codebase
**Severity**: **Medium**

None of the `<DialogContent>` elements include an `<h2>` or `<DialogTitle>` that screen readers use to announce dialog appearance. While shadcn's `DialogTitle` handles this, some dialogs (e.g., enrollment detail dialog) use raw headings without proper semantics.

### 8.3 Missing `aria-label` on Social Links in Footer

**File**: `src/components/layout/PublicFooter.tsx` (lines 44–55)
**Severity**: **Low**

All social media links use the same `Globe` icon and rely solely on the `aria-label` for accessibility. The `aria-label` is correctly set, but each link shows the same globe icon, making them visually indistinguishable.

### 8.4 BackButton Has No `aria-label`

**File**: `src/components/shared/BackButton.tsx` (line 8)
**Severity**: **Low**

The button text "Go back to previous page" is adequate, but there's no focus management after navigation.

### 8.5 No `aria-live` Regions for Dynamic Content Updates

**Severity**: **Low**

When data loads (workshops, enrollments), the content updates are not announced to screen readers. Adding an `aria-live="polite"` region around the main content area would help.

---

## 9. Code Quality & Best Practices

### 9.1 Stale Copyright Year in Footer

**File**: `src/components/layout/PublicFooter.tsx` (line 133)
**Severity**: **Low**

```tsx
<p className="text-center text-sm text-muted-foreground">
  &copy; 2025 Skill Workshop. All rights reserved.
</p>
```

The year is hardcoded. Should use `new Date().getFullYear()`.

### 9.2 Redundant `as` Casting in `auth-helpers.ts`

**File**: `src/lib/auth-helpers.ts` (line 47)
**Severity**: **Low**

```typescript
export function redirectToDashboard(role: string): string {
  return DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] ?? "/login";
}
```

With proper TypeScript typing, this `as` cast would be unnecessary.

### 93 Unused `_userRole` Variable in WorkshopActions

**File**: `src/app/(dashboard)/[role]/workshops/page.tsx` (line 476)
**Severity**: **Low**

```typescript
function WorkshopActions({
  role: _userRole, // ← Unused, suppressed with void
  onView,
  onEdit,
  onDelete,
}: { ... }) {
  void _userRole;
```

The `role` prop is accepted but never used. Either remove it or use it to conditionally show/hide action buttons.

### 9.4 `StatsCard` Empty `className` String

**File**: `src/components/shared/StatsCard.tsx` (line 61)
**Severity**: **Low**

```tsx
<Card className={cn("", className)}>
```

The empty string `""` in `cn()` is unnecessary.

### 9.5 `ConfirmDialog` Missing `DialogDescription`

**File**: `src/components/shared/ConfirmDialog.tsx` (line 49)
**Severity**: **Low**

While `DialogDescription` is present in the JSX, some usages of `ConfirmDialog` pass very long description strings that could overflow visually:

```typescript
description={`Are you sure you want to delete "${deleteTarget?.user?.name}" in "${deleteTarget?.workshop?.title}"? This action cannot be undone.`}
```

### 9.6 `create/page.tsx` Has Minimal Validation

**File**: `src/app/(dashboard)/[role]/workshops/create/page.tsx` (lines 35–39)
**Severity**: **Medium**

```typescript
function validateForm(data: WorkshopFormData): string[] {
  const errors: string[] = [];
  if (!data.title.trim()) errors.push("Title is required");
  return errors;
}
```

Only the title is validated. Category, level, dates, and other required fields are not validated. Compare this to `WorkshopForm.tsx` which has a comprehensive Zod schema.

### 9.7 `WorkshopForm` Uses `z/v4` Import Path

**File**: `src/components/workshops/WorkshopForm.tsx` (line 6)
**Severity**: **Low**

```typescript
import { z } from "zod/v4";
```

While `zod/v4` is valid, it should be consistent with other files. The profile page also uses `zod/v4`, which is fine, but verify that the project-wide import convention is intentional.

---

## 10. Configuration & Tooling

### 10.1 Empty `next.config.ts`

**File**: `next.config.ts`
**Severity**: **Medium**

```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```

Missing configurations:
- `images.remotePatterns` (needed for external workshop images)
- `headers` for security (CSP, X-Frame-Options)
- `experimental` features if needed
- `output: 'standalone'` for Docker deployment

### 10.2 No `.env.example` File

**Severity**: **Low**

Without an `.env.example`, new developers won't know what environment variables are required. Required env vars include:
- `NEXT_PUBLIC_BACKEND_API_URL`
- `NEXT_PUBLIC_FRONTEND_URL`

### 10.3 No `prettier` Configuration

**Severity**: **Low**

There's no `.prettierrc` or prettier config in `package.json`. This can lead to inconsistent formatting across contributors.

### 10.4 Both `bun.lock` and `package-lock.json` Present

**Severity**: **Low**

Having both lock files can cause version mismatches. Choose one package manager (npm or bun) and delete the other.

### 10.5 No `eslint` Rules for Custom Patterns

**Severity**: **Low**

The ESLint config uses only the default Next.js rules. Custom rules could catch issues like:
- Raw `fetch` usage instead of `apiClient`
- Silent `catch {}` blocks
- Missing `aria-*` attributes
- Duplicate logic between create/edit pages

---

## 11. UI/UX Issues

### 11.1 Dashboard Page Shows Same Card Component Instead of Shared `StatsCard`

**File**: `src/app/(dashboard)/[role]/dashboard/page.tsx` (lines 60–89)
**Severity**: **Low**

A local `StatCard` component is defined inside the dashboard page, even though a reusable `StatsCard` component already exists in `src/components/shared/StatsCard.tsx`. The shared version also supports icons, trends, and loading states.

### 11.2 Notification Bell is a Static Placeholder

**File**: `src/components/layout/DashboardHeader.tsx` (line 103)
**Severity**: **Low**

```tsx
<span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
```

The notification bell always shows a dot, regardless of actual notifications. This is misleading to users.

### 11.3 Dashboard Sidebar Logout Button Has No onClick Handler

**Files**: `src/components/layout/DashboardSidebar.tsx` (lines 332–339, 404–412)
**Severity**: **High**

```tsx
<Button variant="ghost" size="sm" className="justify-start gap-3 text-muted-foreground hover:text-destructive">
  <LogOut className="size-4" />
  Logout
</Button>
```

Both the desktop and mobile sidebar Logout buttons have **no `onClick` handler**. Clicking them does nothing. The logout functionality exists in `DashboardHeader` and `PublicNavbar` but was not wired up in the sidebar.

### 11.4 No Loading State for Admin Role Edit/Block/Delete Operations

**File**: `src/app/(dashboard)/[role]/users/page.tsx`
**Severity**: **Low**

When an admin edits a role, blocks/unblocks a user, or deletes a user, there's no loading indicator on the specific row being affected. Only a general `updating` state disables buttons.

### 11.5 `Wishlist`/`Help Center`/`Terms of Service`/`Privacy Policy` Links Point to `#`

**File**: `src/components/layout/PublicFooter.tsx` (lines 13–25)
**Severity**: **Low**

```typescript
const supportLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Help Center", href: "#" },  // ❌ Dead link
  { label: "Terms of Service", href: "#" },  // ❌ Dead link
  { label: "Privacy Policy", href: "#" },  // ❌ Dead link
];
```

Social media links are also all `#`.

---

## 12. Missing Features / Gaps

### 12.1 No Test Files

**Severity**: **High**

There are zero test files in the project. No unit tests, integration tests, or E2E tests. For a management system handling payments and user data, this is a significant gap.

### 12.2 No API Rate Limiting or Request Deduplication

**Severity**: **Medium**

Rapid clicks on "Enroll", "Delete", or "Submit" buttons can trigger duplicate API calls. The enroll button doesn't disable during the API call (there's a brief `enrolling` state but race conditions are possible).

### 12.3 No Offline/Poor Network Handling

**Severity**: **Medium**

There's no indication of what happens when the user loses internet connectivity mid-action. No offline banner, no queued mutations, no retry logic.

### 12.4 No `robots.txt` Entry for Dashboard Routes

**File**: `src/app/robots.ts`
**Severity**: **Low** (already partially addressed)

The robots.ts correctly blocks dashboard routes, but it doesn't block `/super-admin/*` individually. The `/(dashboard)/[role]` pattern handles this at the route level.

### 12.5 No Responsive Image Sizes for Workshop Cards

**Severity**: **Low**

Workshop images use fixed sizes without responsive `sizes` attribute for `next/image`, reducing performance benefits of responsive image delivery.

### 12.6 No Skeleton/Loading for Marketing Pages

**Severity**: **Medium**

Marketing pages (`/(marketing)/page.tsx`, `/workshops/page.tsx`, etc.) have skeleton components defined but are **not used** for server-side data loading. They rely entirely on client-side loading which may show a flash of empty content.

---

## Summary of Issues by Severity

| Severity | Count |
|----------|-------|
| **Critical** | 3 |
| **High** | 5 |
| **Medium** | 19 |
| **Low** | 20 |

## Top Priority Fixes (Recommended Order)

1. **Wire up Logout button in DashboardSidebar** — currently broken, users can't log out from sidebar
2. **Replace `params.then()` pattern with `React.use()`** — fixes race conditions across all dashboard pages
3. **Fix security: sign or validate the role cookie** — prevents trivial privilege escalation
4. **Consolidate API client functions** — eliminates CSRF gaps and code duplication
5. **Refactor create/edit workshop pages to use shared `WorkshopForm`** — eliminates duplicate code and inconsistent validation
6. **Add server-side rendering for public pages** — major SEO and performance improvement
7. **Add toast notifications to all error handlers** — stop silently swallowing errors
8. **Create a dedicated enrollment-check API endpoint** — fix performance issue in `EnrollButton`
9. **Configure `next.config.ts`** — add image domains, security headers
10. **Add basic tests** — critical for a payment-handling application
