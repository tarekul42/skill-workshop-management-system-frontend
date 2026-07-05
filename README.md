# Skill Workshop Management System — Frontend

> A modern, high-performance frontend for a production-grade educational platform where industry experts host workshops and students enroll. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. Achieves **95+ Lighthouse Performance scores** and ships with **282 unit tests (Vitest) + 80 E2E tests (Playwright) across 5 browsers**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://skill-workshop-management-system-frontend.vercel.app)
[![Backend Repo](https://img.shields.io/badge/Backend_Repo-GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/tarekul42/skill-workshop-management-system-backend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 📋 Overview

This is the student/instructor/admin-facing frontend for the **Skill Workshop Management System** — a platform where industry experts host workshops and students discover, enroll in, and complete them. The app handles the full lifecycle: workshop discovery, OTP-verified registration, SSLCommerz checkout with PDF invoices, role-based dashboards, and admin analytics.

The frontend is built on **Next.js 16 App Router** with server components, role-based route protection via middleware, and a unified API client that handles CSRF tokens and silent token refresh. It achieves **95+ Lighthouse Performance scores** through aggressive code-splitting, image optimization, and Turbopack builds.

---

## 🛠️ Tech Stack

| Category        | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack) |
| UI Runtime      | React 19.2                         |
| Language        | TypeScript 5.9                     |
| Styling         | Tailwind CSS 4 + shadcn/ui (Radix) |
| Server State    | TanStack Query v5                  |
| Forms           | React Hook Form + Zod              |
| Animation       | Framer Motion 12                   |
| Charts          | Recharts 3                         |
| Notifications   | Sonner                             |
| Icons           | Lucide React                       |
| Theme           | next-themes (light/dark/system)    |
| Testing         | Vitest 4 + Playwright 1.61         |
| Package Manager | Bun                                |

---

## ✨ Main Features

- **Role-based dashboards** — separate, middleware-protected routes for Student / Instructor / Admin / Super Admin with granular access control
- **Consolidated admin analytics endpoint** — one API call replaces 7 separate admin calls, loading the dashboard **6× faster** than the naive approach
- **OTP-verified registration** — smooth sign-up flow with Redis-backed OTP, integrated with the backend's automated verification system
- **SSLCommerz payment flow** — secure checkout with success/fail/cancel callback routes and PDF invoice download
- **Unified API client** — auto-attaches CSRF tokens + Bearer credentials, silently refreshes on 401 without race conditions
- **95+ Lighthouse Performance scores** — achieved through code-splitting, image optimization, and Turbopack
- **282 unit tests (Vitest) + 80 E2E tests (Playwright)** across 5 browsers — Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **7 GitHub Actions CI/CD workflows** — format check → lint → typecheck → unit tests → E2E tests → build → deploy, plus secret scanning (TruffleHog) + security audit (CodeQL)
- **Light / Dark / System theme** with persisted preference
- **One-click demo login** — Student / Admin / Instructor buttons auto-fill seeded credentials from env vars

---

## 📦 Main Dependencies

### Runtime Dependencies

| Package                                                  | Purpose                        |
| -------------------------------------------------------- | ------------------------------ |
| `next@16.2.3`                                            | App Router framework           |
| `react@19.2.4` / `react-dom@19.2.4`                      | UI runtime                     |
| `@tanstack/react-query@^5.101.0`                         | Server state & data fetching   |
| `@tanstack/react-table@^8.21.3`                          | Data tables (admin dashboards) |
| `react-hook-form@^7.79.0` + `@hookform/resolvers@^5.4.0` | Form management                |
| `zod@^4.4.3`                                             | Schema validation              |
| `framer-motion@^12.40.0`                                 | Animations                     |
| `recharts@^3.8.1`                                        | Charts (analytics)             |
| `radix-ui@^1.6.0`                                        | Accessible UI primitives       |
| `lucide-react@^1.20.0`                                   | Icons                          |
| `sonner@^2.0.7`                                          | Toast notifications            |
| `next-themes@^0.4.6`                                     | Theme switching                |
| `jose@^6.2.3`                                            | JWT (client-side decoding)     |
| `input-otp@^1.4.2`                                       | OTP input UI                   |
| `date-fns@^4.4.0`                                        | Date formatting                |
| `class-variance-authority` + `clsx` + `tailwind-merge`   | Class utilities                |

### Dev Dependencies (key ones)

| Package                                           | Purpose                   |
| ------------------------------------------------- | ------------------------- |
| `vitest@^4.1.9` + `@vitest/coverage-v8`           | Unit testing              |
| `@playwright/test@^1.61.0`                        | E2E testing (5 browsers)  |
| `@testing-library/react@^16.3.2`                  | Component testing         |
| `eslint@^9.39.4` + `eslint-config-next@16.2.3`    | Linting                   |
| `prettier@^3.8.4` + `prettier-plugin-tailwindcss` | Code formatting           |
| `husky@^9.1.7` + `lint-staged@^17.0.7`            | Pre-commit hooks          |
| `shadcn@^4.11.0`                                  | UI component CLI          |
| `tailwindcss@^4.3.1` + `@tailwindcss/postcss`     | Styling                   |
| `jsdom@^29.1.1`                                   | DOM environment for tests |

---

## 🚀 Run Locally

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Backend API running — see the [Backend Repository](https://github.com/tarekul42/skill-workshop-management-system-backend)

### Installation

```bash
# 1. Clone
git clone https://github.com/tarekul42/skill-workshop-management-system-frontend.git
cd skill-workshop-management-system-frontend

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your values (see table below)

# 4. Run dev server
bun run dev
```

Open http://localhost:3000 in your browser.

### Environment Variables

| Variable                      | Description                        | Example                 |
| ----------------------------- | ---------------------------------- | ----------------------- |
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API base URL               | `http://localhost:5000` |
| `NEXT_PUBLIC_FRONTEND_URL`    | Frontend URL (for OAuth redirects) | `http://localhost:3000` |

### Available Scripts

| Command             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `bun run dev`       | Start dev server                                                  |
| `bun run build`     | Production build                                                  |
| `bun run start`     | Start production server                                           |
| `bun run lint`      | Run ESLint                                                        |
| `bun run typecheck` | TypeScript compiler check                                         |
| `bun run test`      | Run Vitest unit tests                                             |
| `bun run test:e2e`  | Run Playwright E2E tests (5 browsers)                             |
| `bun run format`    | Format code with Prettier                                         |
| `bun run ci`        | Full CI pipeline (format + lint + typecheck + test + e2e + build) |

---

## 🔗 Links

| Resource                  | URL                                                                      |
| ------------------------- | ------------------------------------------------------------------------ |
| 🌐 **Live Demo**          | https://skill-workshop-management-system-frontend.vercel.app             |
| 🖥️ **Backend Repo**       | https://github.com/tarekul42/skill-workshop-management-system-backend    |
| 📚 **API Docs (Swagger)** | https://skill-workshop-management-system-backend.up.railway.app/api-docs |
| 📧 **Contact**            | tarekulrifat142@gmail.com                                                |

---

## 📄 License

MIT © Tarekul Islam Rifat

---

<div align="center">

**⭐ If this project helped you, give it a star!**

Built by [Tarekul Islam Rifat](https://github.com/tarekul42)

</div>
