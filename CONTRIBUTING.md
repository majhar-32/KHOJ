# Contributing to Khoj

Thank you for contributing to **Khoj — Centralized Event & Contest Discovery Platform**! This guide explains the branching conventions, commit conventions, and development workflow for all contributors.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Branching Conventions](#branching-conventions)
- [Commit Conventions](#commit-conventions)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Environment Setup](#environment-setup)
- [Key Directories](#key-directories)

---

## Project Overview

Khoj is a centralized, mobile-responsive web application that helps students, professionals, and university clubs in Bangladesh discover events and contests (hackathons, workshops, olympiads, job fairs, cultural events, and more) in one place.

**Khoj is a discovery platform only** — it links out to each organizer's own registration channel and does not process registrations itself.

---

## Tech Stack

| Layer        | Technology                                             |
|--------------|--------------------------------------------------------|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS, lucide-react |
| **Backend**  | Node.js, Express, TypeScript                           |
| **Database** | PostgreSQL via Prisma ORM                              |
| **Auth**     | JWT (access tokens) + bcrypt                           |
| **AI**       | Google Gemini API (`@google/genai`)                    |
| **Images**   | Cloudinary (via multer + multer-storage-cloudinary)    |
| **Testing**  | Jest + Supertest (backend)                             |

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (bundled with Node.js)
- PostgreSQL database (local or Render managed)
- Git

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd KHOJ
   ```

2. **Install all dependencies:**
   ```bash
   # Root (concurrently runner)
   npm install

   # Backend
   cd backend && npm install && cd ..

   # Frontend
   cd frontend && npm install && cd ..
   ```

3. **Configure the backend environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Fill in backend/.env with your values:
   #   DATABASE_URL, DIRECT_URL, JWT_SECRET,
   #   CLOUDINARY_*, GEMINI_API_KEY, PEXELS_API_KEY
   ```

4. **Run database migrations and seed data:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   cd ..
   ```

5. **Start both frontend and backend concurrently:**
   ```bash
   npm run dev
   ```
   - **Backend API:** `http://localhost:5001/api`
   - **Frontend:** `http://localhost:3000`

6. **If a port is busy:**
   ```bash
   npm run clean:ports
   ```

---

## Branching Conventions

All contributors must work on a dedicated branch — **never commit directly to `main`**.

### Branch Naming

```
<type>/<contributor-or-scope>-<short-description>
```

| Prefix      | Use for                                                        |
|-------------|----------------------------------------------------------------|
| `feat/`     | New feature or capability                                      |
| `fix/`      | Bug fix                                                        |
| `docs/`     | Documentation changes only (no code changes)                   |
| `chore/`    | Maintenance, dependency updates, build tooling, CI config      |
| `refactor/` | Code restructuring with no behavior change                     |
| `test/`     | Adding or updating tests only                                  |
| `style/`    | Formatting, whitespace, or CSS-only changes                    |

**Examples:**
```
docs/alif-contribution
feat/auth-jwt-login
fix/event-approval-loop
refactor/api-error-handling
test/backend-event-routes
```

### Branch Lifecycle

1. Create your branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b <type>/<your-branch>
   ```
2. Work on your branch locally.
3. Open a Pull Request targeting `main`.
4. The PR is reviewed, approved, and merged — do **not** merge your own PRs.
5. Delete the branch after the PR is merged.

---

## Commit Conventions

Khoj follows the **Conventional Commits** specification.

### Format

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type       | When to use                                             |
|------------|---------------------------------------------------------|
| `feat`     | A new feature visible to users or developers            |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only (README, CONTRIBUTING, comments)     |
| `chore`    | Build process, tooling, dependency bump, CI             |
| `refactor` | Code change with no feature or bug effect               |
| `test`     | Adding or correcting tests                              |
| `style`    | Formatting/whitespace, no logic change                  |
| `perf`     | Performance improvement                                 |
| `revert`   | Reverts a previous commit                               |

### Scopes (optional but helpful)

Use the directory or feature area as the scope:

```
feat(auth): add JWT refresh-token support
fix(events): correct registration deadline timezone handling
docs(contributing): add branching conventions section
chore(deps): update @google/genai to v2.20.0
test(backend): add supertest coverage for event approval route
```

### Rules

- Use the **imperative mood** in the description: "add", "fix", "remove" — not "added", "fixes", "removing".
- Keep the subject line under **72 characters**.
- Separate subject from body with a blank line.
- Reference relevant GitHub issues in the footer: `Closes #42`, `Refs #17`.

**Good examples:**
```
feat(ai): integrate Gemini API for event-text extraction
fix(auth): prevent JWT expiry errors from leaking stack traces
docs: add CONTRIBUTING.md with branch and commit conventions
```

**Bad examples:**
```
update stuff
Fixed the bug
WIP
```

---

## Development Workflow

### Standard Feature / Fix Flow

```
main
  └─ feat/<your-branch>
        ├── commits (following conventions above)
        └── Pull Request → review → merge to main
```

1. **Keep your branch up to date** with `main` before opening a PR:
   ```bash
   git fetch origin
   git rebase origin/main
   # or
   git merge origin/main
   ```

2. **Run tests before pushing:**
   ```bash
   cd backend && npm test
   ```

3. **Lint the frontend before pushing:**
   ```bash
   cd frontend && npm run lint
   ```

4. **Build check (optional but recommended before PR):**
   ```bash
   npm run build
   ```

### Keeping the Mock / Real API Boundary Clean

- The frontend currently imports from `frontend/lib/api.ts` which wraps the real backend.
- Do **not** import directly from `frontend/lib/mockApi.ts` or `frontend/lib/mockData.ts` in new code — these are legacy scaffolding.
- When adding a new API call, add it to the appropriate `frontend/lib/*Api.ts` file (e.g., `eventsApi.ts`, `authApi.ts`, `commentsApi.ts`).

---

## Pull Request Process

1. Open a PR from your branch targeting `main`.
2. Fill in the **pull request template** (`.github/pull_request_template.md`) completely.
3. Self-review your diff before requesting a review — look for debug logs, commented-out code, and TODO stubs that weren't intentional.
4. At least **one approval** from another contributor is required before merging.
5. All automated checks (lint, tests) must pass.
6. **Squash-merge** is preferred to keep `main`'s history clean.

---

## Code Style

### TypeScript (Frontend & Backend)

- Prefer explicit types over `any`. Use `unknown` when the shape is truly unknown.
- Use `interface` for object shapes; `type` for unions and aliases.
- Do not suppress TypeScript errors with `// @ts-ignore` without a comment explaining why.
- Async functions must handle errors — either via `try/catch` or by propagating to Express error middleware.

### React / Next.js (Frontend)

- Prefer **Server Components** for data fetching when possible (Next.js App Router).
- Client components must have `"use client"` at the top.
- Do not add `console.error` or `console.log` in Server Components — it surfaces in the browser dev overlay and clutters production logs.
- Use Tailwind CSS utility classes; avoid inline `style` props unless strictly necessary.

### Express / Backend

- All route handlers delegate business logic to their corresponding controller file in `src/controllers/`.
- Use the `authenticate` middleware for protected routes; use `authorize(...roles)` for role-restricted routes.
- Validate all incoming request bodies with `zod` before passing data to Prisma.
- Never return raw Prisma errors to the client — map them to appropriate HTTP status codes.

---

## Testing

### Backend Tests

Backend tests use **Jest** and **Supertest**.

```bash
cd backend
npm test
```

Test files live in `backend/src/__tests__/`. When adding a new route or significant controller logic, add a corresponding test file.

### Frontend

Currently no automated frontend tests are configured. Manual testing against the running backend is expected. When frontend testing is added, follow the same `__tests__/` convention.

---

## Environment Setup

| Variable               | Description                                     | Required |
|------------------------|-------------------------------------------------|----------|
| `PORT`                 | Backend server port (default: `5001`)           | No       |
| `FRONTEND_URL`         | Allowed CORS origin (default: `http://localhost:3000`) | Yes |
| `DATABASE_URL`         | Prisma pooled PostgreSQL connection string      | Yes      |
| `DIRECT_URL`           | Prisma direct PostgreSQL connection (migrations) | Yes     |
| `JWT_SECRET`           | Secret key for signing JWT tokens               | Yes      |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name for banner uploads        | Yes (B7+) |
| `CLOUDINARY_API_KEY`   | Cloudinary API key                              | Yes (B7+) |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret                           | Yes (B7+) |
| `GEMINI_API_KEY`       | Google Gemini API key for AI features           | Yes (B8+) |
| `PEXELS_API_KEY`       | Pexels API key for stock banner images          | No       |

See `backend/.env.example` for the full template.

---

## Key Directories

```
KHOJ/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (Users, Events, Categories, Comments, SavedEvents)
│   │   ├── seed.ts             # Seed script for dev database
│   │   └── migrations/         # Prisma migration history
│   └── src/
│       ├── controllers/        # Business logic (auth, events, categories, users, AI, comments)
│       ├── routes/             # Express route definitions
│       ├── middleware/         # authenticate, authorize, error handling
│       ├── lib/                # Prisma client singleton, shared utilities
│       ├── types/              # Shared TypeScript types
│       └── utils/              # Helper functions
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components (EventCard, Dashboard clients, etc.)
│   ├── context/                # AuthContext, ThemeContext
│   ├── hooks/                  # Custom React hooks
│   └── lib/                   # API client wrappers (*Api.ts files), shared types
├── CONTRIBUTING.md             # This file
├── IMPLEMENTATION_PLAN.md      # Backend build plan (B1–B9 phases)
├── PROJECT_LOG.md              # Frontend build history (F1–F8 phases)
└── README.md                   # Project overview and quick-start
```

---

## Questions?

If you have any questions about the contribution process, open a GitHub Issue using the **Feature Request** or **Bug Report** template, or reach out to the project maintainers directly.
