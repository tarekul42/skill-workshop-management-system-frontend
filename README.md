# Skill Workshop Management System - Frontend

A modern, high-performance, and feature-rich frontend for the Skill Workshop Management System. Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**, this application provides a seamless experience for students to discover and enroll in workshops, for instructors to manage their courses, and for administrators to oversee the entire ecosystem.

---

## 🌟 Features

### 🎓 For Students

- **Course Discovery**: Browse workshops with advanced filtering by category, level, and price.
- **Secure Enrollment**: Smooth registration process with real-time capacity checks.
- **Integrated Payments**: Secure checkout using SSLCommerz.
- **Learning Dashboard**: Track enrolled workshops and download completion certificates.
- **Theme Support**: Seamless switching between Light and Dark modes.

### 👨‍🏫 For Instructors

- **Workshop Management**: Create and manage workshop content, schedules, and prerequisites.
- **Student Insights**: Monitor enrollments and student progress for individual workshops.
- **Earnings Overview**: View revenue statistics from course enrollments.

### 🛡️ For Administrators

- **Comprehensive Analytics**: Real-time dashboard with stats on users, workshops, and revenue.
- **User Management**: Oversee all users, manage roles, and handle account statuses.
- **Audit Trails**: Detailed logs of system actions for security and accountability.
- **Category & Level Management**: Dynamically manage the platform's organization.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://react-hot-toast.com/sonner)

---

## 📁 Project Structure

```text
src/
├── app/                 # Next.js App Router (Pages, Layouts, API proxy)
│   ├── (auth)/          # Authentication routes (Login, Register, etc.)
│   ├── (dashboard)/     # Role-based dashboards (Admin, Instructor, Student)
│   ├── (public)/        # Publicly accessible pages (About, Contact, FAQ)
│   └── workshops/       # Workshop catalog and details
├── components/          # React components
│   ├── shared/          # Reusable components (Navbar, Footer, Skeletons)
│   └── ui/              # Shadcn primitive components
├── lib/                 # Utilities and shared logic
│   ├── api/             # API service layer and specialized clients
│   ├── auth-helpers.ts  # Token and session management
│   └── utils.ts         # Global utility functions
├── providers/           # Context providers (Theme, QueryClient)
└── styles/              # Global CSS and Tailwind configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- **Bun** (Recommended) or Node.js 18+
- Backend API running (see [Backend Repository](https://github.com/tarekul42/skill-workshop-management-system-backend))

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
   Create a `.env` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

4. **Run the development server**:

   ```bash
   bun run dev
   ```

5. **Build for production**:
   ```bash
   bun run build
   bun run start
   ```

---

## 🛡️ Security & Performance

- **CSRF Protection**: Integrated with the backend's Double CSRF pattern.
- **Token Management**: Secure handling of JWTs with automatic refresh logic.
- **Optimistic UI**: Enhanced user experience using TanStack Query for data mutations.
- **Pagination**: Server-side pagination for large datasets (Workshops, Users, Audit Logs).
- **SEO**: Dynamic metadata generation for workshop and category pages.

---

## 🎨 Theme Customization

The application supports system-level theme detection and manual toggling.

- **Dark Mode**: High-contrast, accessibility-focused design.
- **Light Mode**: Clean, professional layout with soft colors.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contact

**Project Lead**: [Tarekul Islam Rifat]  
**Email**: [tarekulrifat142@gmail.com](mailto:tarekulrifat142@gmail.com)
