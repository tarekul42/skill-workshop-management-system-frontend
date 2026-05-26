# Skill Workshop Management System — Frontend

A modern, high-performance frontend for the Skill Workshop Management System. Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**, this application provides a seamless experience for students to discover and enroll in workshops, for instructors to manage their courses, and for administrators to oversee the entire ecosystem.

---

## 🌟 Features

### 🎓 For Students

- **Workshop Discovery**: Browse workshops with advanced filtering by category, level, and price.
- **Secure Registration**: Smooth sign-up flow with OTP verification.
- **Integrated Payments**: Secure checkout using SSLCommerz.
- **Learning Dashboard**: Track enrolled workshops and download completion certificates.
- **Theme Support**: Seamless switching between Light and Dark modes.

### 👨‍🏫 For Instructors

- **Workshop Management**: Create and manage workshop content, schedules, and prerequisites.
- **Student Insights**: Monitor enrollments and student progress for individual workshops.
- **Earnings Overview**: View revenue statistics from course enrollments.

### 🛡️ For Administrators & Super Admins

- **Comprehensive Analytics**: Real-time dashboard with stats on users, workshops, and revenue.
- **User Management**: Oversee all users, manage roles, and handle account statuses.
- **Audit Trails**: Detailed logs of system actions for security and accountability.
- **Category & Level Management**: Dynamically manage the platform's organization.

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://radix-ui.com/) |
| **State Management** | [TanStack Query v5](https://tanstack.com/query/latest) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Animations** | [Motion](https://motion.dev/) (v12) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |
| **Package Manager** | [Bun](https://bun.sh/) |

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth routes (Login, Register, OTP, Forgot Password)
│   ├── (dashboard)/          # Role-based dashboards (Admin, Instructor, Student)
│   ├── (marketing)/          # Public pages (Home, Workshops, Categories)
│   ├── actions/              # Server actions (auth, etc.)
│   ├── payment/              # Payment callback routes (SSLCommerz)
│   ├── workshops/            # Workshop catalog & detail pages
│   ├── unauthorized/         # Unauthorized access page
│   ├── error.tsx             # Global error boundary
│   ├── not-found.tsx         # 404 page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles & Tailwind theme
├── components/
│   ├── features/             # Feature-specific components
│   ├── layout/               # Layout components (Header, Footer, Breadcrumbs)
│   └── ui/                   # Reusable UI primitives (Shadcn)
├── lib/
│   ├── api/                  # API service layer
│   ├── api-client.ts         # Unified API client with CSRF & token refresh
│   ├── auth-helpers.ts       # Token/session management utilities
│   ├── constants.ts          # App-wide constants & env config
│   ├── formatters.ts         # Date, currency, and text formatters
│   ├── motion-variants.ts    # Reusable Framer Motion animation variants
│   ├── utils.ts              # Global utility functions (cn, etc.)
│   ├── validation/           # Zod validation schemas
│   └── __tests__/            # Unit tests for library modules
├── providers/                # React context providers (Theme, QueryClient)
└── types/                    # Shared TypeScript type definitions

e2e/                          # Playwright E2E tests
.github/workflows/            # CI/CD pipelines (GitHub Actions)
```

---

## 🛠️ Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** (recommended) or Node.js 18+
- Backend API running — see the [Backend Repository](https://github.com/tarekul42/skill-workshop-management-system-backend)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/tarekul42/skill-workshop-management-system-frontend.git
   cd skill-workshop-management-system-frontend
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Environment Setup**:

   Copy the example env file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   Required variables:

   | Variable | Description | Example |
   |---|---|---|
   | `NEXT_PUBLIC_BACKEND_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
   | `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
   | `JWT_SECRET` | JWT signing secret | Generate with `openssl rand -base64 32` |

4. **Run the development server**:

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:

   ```bash
   bun run build
   bun run start
   ```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Create optimized production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Auto-fix ESLint issues |
| `bun run format` | Format code with Prettier |
| `bun run format:check` | Check formatting without modifying |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run test` | Run unit & integration tests (Vitest) |
| `bun run test:e2e` | Run E2E tests (Playwright) |
| `bun run ci` | Run full CI pipeline (format → lint → typecheck → test → e2e → build) |

---

## 🧪 Testing

### Unit Tests (Vitest)

278 tests across 20 test files covering:

- API client (CSRF, token refresh, error handling)
- Auth helpers (localStorage/sessionStorage management)
- Formatters, masking, validation utilities
- UI components (Button, Card, Input, EmptyState, etc.)
- Motion animation variants

```bash
bun run test
```

### E2E Tests (Playwright)

80 tests across 5 browsers (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari) covering:

- Authentication flow (login, registration, validation errors)
- Dashboard access control (role-based redirects)
- Workshop catalog (listing, filtering, detail pages)
- Workshop management

```bash
bun run test:e2e
```

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment:

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci-frontend.yml` | Push/PR to `main`, `develop` | Lint → Typecheck → Unit Tests → Build |
| `ci-e2e.yml` | Push/PR to `main`, `develop` | E2E tests across 5 browsers |
| `bundle-analysis.yml` | PR to `main` | Bundle size analysis |
| `deploy-preview.yml` | PR to `main` | Deploy preview to Vercel |
| `deploy-production.yml` | Push to `main` | Deploy to Vercel Production |
| `secret-scan.yml` | All pushes + PRs | Secret scanning with TruffleHog |
| `security-audit.yml` | Weekly + PR | Dependency audit + CodeQL analysis |

All secrets are managed via **GitHub Secrets** — see [`.github/SECRETS.md`](.github/SECRETS.md) for the full list.

---

## 🛡️ Security

- **CSRF Protection**: Integrated with the backend's Double CSRF pattern.
- **Token Management**: Secure JWT handling with automatic refresh logic.
- **Role-Based Access**: Middleware-enforced route protection for Admin, Instructor, and Student roles.
- **Secret Scanning**: Automated TruffleHog scans on every push.
- **Dependency Auditing**: Weekly `npm audit` + CodeQL analysis.

---

## 🎨 Theme Customization

The application supports system-level theme detection and manual toggling. Theme customization is done in `src/app/globals.css` using Tailwind CSS v4's `@theme` blocks.

- **Dark Mode**: High-contrast, accessibility-focused design.
- **Light Mode**: Clean, professional layout with soft colors.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the script pipeline guide and development workflow.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contact

**Project Lead**: Tarekul Islam Rifat
**Email**: [tarekulrifat142@gmail.com](mailto:tarekulrifat142@gmail.com)
