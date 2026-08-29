# Khoj — Implementation Plan (Backend + Integration + Ship)

**Author's note:** Written after a full read of `PROJECT_LOG.md`, the proposal report, `types.ts`, `mockApi.ts`, and `mockData.ts`. This continues the project in the same phase-log style (`F1`–`F8` were frontend; this document defines `B1`–`B9`).

---

## 1. Where the project actually stands

Give yourself credit here — this is further along than most sessional projects at this stage:

- **Frontend is functionally complete.** All 8 phases in `PROJECT_LOG.md` are done: landing, browse/search, event details, organizer dashboard + submission + edit, admin dashboard + category manager + user manager, save/share, deadlines, profile, AI-assist UI (simulated), and a full responsive/accessibility pass (F6).
- **Zero backend exists.** `backend/README.md` is a placeholder. Everything currently runs on `frontend/lib/mockApi.ts`, which is in-memory, resets on every reload, and has no real auth, no persistence, no real AI.
- **The mock API was deliberately designed as a contract.** Every function in `mockApi.ts` (`getEvents`, `createEvent`, `approveEvent`, `toggleSaveEvent`, `getCategoriesWithCounts`, `suspendUser`, `simulateAIExtraction`, `simulateAISearch`, etc.) already describes the exact shape of the real API you need to build. This is the single biggest thing in your favor — the backend spec is basically already written in TypeScript.
- **`RoleContext.tsx` is a labeled stand-in for real auth** — it's explicitly commented as dev-only and designed to be swapped out.
- **One real gap vs. the mock model:** `saved` is currently a boolean field directly on the event object (global, single-user). With real multi-user auth this must become a proper `User ↔ Event` join table (many users can each save the same event independently). Flagged now so it doesn't surprise you later.

**Bottom line:** the remaining work is backend build + wiring the frontend to it + AI + deploy. No frontend screens need to be rebuilt — only their data source changes.

---

## 2. Architecture decisions

| Layer | Choice | Why |
|---|---|---|
| Backend runtime | Node.js + Express + TypeScript | Matches your proposal's stated stack exactly; TypeScript keeps request/response types aligned with the frontend's existing `types.ts`. |
| ORM | Prisma | Type-safe queries, auto-generated types, painless migrations — the fastest path to a correct PostgreSQL schema for a small team on a deadline. |
| Database | PostgreSQL | Already specified in your proposal. Use Render's managed Postgres (free tier) for both dev and prod so there's no environment drift. |
| Auth | JWT (access token) + bcrypt password hashing | Simple, stateless, standard for a sessional project; no need for session stores. |
| Image uploads (event banners) | Cloudinary (free tier) via `multer` + `multer-storage-cloudinary` | Render's filesystem is ephemeral (files vanish on redeploy), so you cannot store uploaded banners on disk in production. Cloudinary gives you a persistent URL with almost no setup. |
| AI | OpenAI API (`gpt-4o-mini`) or Gemini (`gemini-1.5-flash`) — either works, proposal lists both | Both support structured/JSON output, which is exactly what `simulateAIExtraction` and `simulateAISearch` need to be replaced with. Pick whichever you can get a free/cheap API key for fastest. |
| Backend hosting | Render (Web Service + PostgreSQL) | Matches your proposal. |
| Frontend hosting | Vercel | Matches your proposal; Next.js App Router deploys natively. |
| Validation | `zod` | Shared-shape validation on the backend that mirrors your `types.ts` interfaces almost 1:1. |

---

## 3. Database schema (Prisma)

This maps directly onto `frontend/lib/types.ts`, with two real-world corrections: `organizerId`/`userId` foreign keys replace name-string matching, and `saved` becomes a join table.

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ORGANIZER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum EventStatus {
  PENDING
  APPROVED
  REJECTED
}

enum EventMode {
  ONLINE
  OFFLINE
}

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  passwordHash String
  role         Role       @default(USER)
  verified     Boolean    @default(false)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime   @default(now())

  eventsOrganized Event[]      @relation("OrganizerEvents")
  savedEvents     SavedEvent[]

  @@map("users")
}

model Category {
  id     String  @id @default(cuid())
  name   String  @unique
  events Event[]

  @@map("categories")
}

model Event {
  id                    String      @id @default(cuid())
  name                  String
  category              Category    @relation(fields: [categoryId], references: [id])
  categoryId             String
  organizer             User        @relation("OrganizerEvents", fields: [organizerId], references: [id])
  organizerId            String
  eventDate             DateTime
  eventTime             String
  venue                 String
  city                  String
  mode                  EventMode
  registrationDeadline  DateTime
  registrationFee       String
  prizePool             String
  eligibility           String
  teamSize              String
  availableSeats        Int?
  certificateInfo       String
  description           String      @db.Text
  rules                 String      @db.Text
  contactInfo           String
  registrationLink      String
  officialWebsite       String
  bannerImageUrl        String?
  status                EventStatus @default(PENDING)
  rejectionReason       String?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  savedBy SavedEvent[]

  @@map("events")
}

// Join table: which users have saved which events (replaces the mock's boolean `saved` field)
model SavedEvent {
  id      String @id @default(cuid())
  user    User   @relation(fields: [userId], references: [id])
  userId  String
  event   Event  @relation(fields: [eventId], references: [id])
  eventId String
  savedAt DateTime @default(now())

  @@unique([userId, eventId])
  @@map("saved_events")
}
```

Notes:
- `organizerName` / `organizerVerified` on the frontend become derived fields: fetch from `event.organizer.name` / `event.organizer.verified` in the API response, not stored redundantly.
- `bannerColor` (mock placeholder) is replaced by `bannerImageUrl`. Keep a fallback color/gradient client-side for events with no uploaded banner yet (nice touch, not required).

---

## 4. API contract (mirrors `mockApi.ts` 1:1)

This table is your source of truth for wiring the frontend later — each frontend mock call maps to exactly one endpoint.

| Mock function | Real endpoint | Auth |
|---|---|---|
| — (new) | `POST /api/auth/signup` | Public |
| — (new) | `POST /api/auth/login` | Public |
| — (new) | `GET /api/auth/me` | Any logged-in user |
| `getEvents()` | `GET /api/events?category=&city=&mode=&q=` | Public (approved only) |
| `getAllEventsForAdmin()` | `GET /api/events/admin` | Admin |
| `getEventsByOrganizer()` | `GET /api/events/mine` | Organizer |
| `getEventById(id)` | `GET /api/events/:id` | Public |
| `createEvent(data)` | `POST /api/events` (multipart, banner optional) | Organizer |
| `updateEvent(id, data)` | `PUT /api/events/:id` | Organizer (owner) or Admin |
| `approveEvent(id)` | `POST /api/events/:id/approve` | Admin |
| `rejectEvent(id, reason)` | `POST /api/events/:id/reject` | Admin |
| `getSavedEvents()` | `GET /api/events/saved` | User |
| `toggleSaveEvent(id)` | `POST /api/events/:id/save` | User |
| `getCategories()` | `GET /api/categories` | Public |
| `getCategoriesWithCounts()` | `GET /api/categories/counts` | Admin |
| `addCategory(name)` | `POST /api/categories` | Admin |
| `renameCategory(id, name)` | `PUT /api/categories/:id` | Admin |
| `deleteCategory(id)` | `DELETE /api/categories/:id` | Admin |
| `getUsers()` | `GET /api/users` | Admin |
| `suspendUser(id)` | `POST /api/users/:id/suspend` | Admin |
| `reactivateUser(id)` | `POST /api/users/:id/reactivate` | Admin |
| `simulateAIExtraction(text)` | `POST /api/ai/extract-event` | Organizer |
| `simulateAISearch(query)` | `POST /api/ai/search` | Public |

---

## 5. Phased build plan

Each phase below is scoped to be one focused Antigravity session — same granularity as your `F1`–`F8` phases. Work through them in order; each one leaves the app in a runnable state.

### B1 — Backend project setup
- Scaffold `backend/`: Express + TypeScript, `tsconfig.json`, `nodemon`/`ts-node-dev` for dev reload.
- Install & init Prisma; connect to a local Postgres (or Render Postgres from day one — recommended, avoids "works locally, breaks on Render" surprises).
- Folder structure: `src/routes`, `src/controllers`, `src/middleware`, `src/lib` (prisma client singleton), `src/utils`.
- Global error-handling middleware, CORS config (allow the Vercel frontend origin + `localhost:3000`), `.env` + `.env.example`, health check route (`GET /api/health`).
- **Exit check:** `GET /api/health` returns 200 from a fresh clone with one `.env` filled in.

### B2 — Database schema, migrations, seed data
- Add the Prisma schema from Section 3.
- Run first migration.
- Write `backend/prisma/seed.ts` that ports `frontend/lib/mockData.ts`'s 20 events (and the 12 mock users) into real rows — this gives you a populated database on day one instead of testing against an empty one.
- **Exit check:** `npx prisma studio` shows 20 events, 12 users, correct categories.

### B3 — Authentication
- `POST /api/auth/signup` (role: user or organizer — matches the signup page's segmented control), `POST /api/auth/login`, bcrypt hashing, JWT issuance.
- `authenticate` middleware (verifies JWT, attaches `req.user`) and `authorize(...roles)` middleware.
- Frontend: replace `RoleContext.tsx`'s fake role switcher with a real `AuthContext` — stores JWT (httpOnly cookie or `localStorage`, your call — cookie is more secure, `localStorage` is faster to implement for a sessional deadline), exposes `user`, `login()`, `logout()`, `signup()`. Wire `login/page.tsx` and `signup/page.tsx` to real calls. Add route guards so `/dashboard/organizer/*` and `/dashboard/admin/*` check real role, not the dev switcher.
- **Exit check:** Signup → login → refresh page → still logged in as correct role → dashboard routes reject wrong roles.

### B4 — Events API
- All event endpoints from Section 4 except AI and banner upload.
- Ownership check on `PUT /api/events/:id` (organizer can only edit their own).
- Re-approval-on-edit logic (`status → PENDING` if it was `APPROVED`) — already a decision your frontend made in F7, just port it server-side.
- Frontend: swap every `mockApi.ts` import for a real `lib/api.ts` fetch wrapper across Browse, Event Details, Organizer Dashboard, Submit/Edit forms, Admin Dashboard. Add loading and error states (mock API never failed; real network calls will).
- **Exit check:** Full loop works against the real DB — organizer submits → admin sees it pending → admin approves → it appears on public Browse.

### B5 — Categories & Users admin API
- Category and user endpoints from Section 4, including the "can't delete a category in use" guard (already designed in your mock — port the logic).
- Frontend: wire `CategoryManagerClient.tsx` and `UserManagerClient.tsx`.
- **Exit check:** Add/rename/delete category and suspend/reactivate user all persist after refresh.

### B6 — Save/Bookmark with real per-user data
- `SavedEvent` join table endpoints (`GET /api/events/saved`, `POST /api/events/:id/save`).
- Frontend: `EventCard.tsx` bookmark button and `/saved` page now reflect the logged-in user's own saves, not a global flag. `/deadlines` page's grouping logic (24h / this week / this month / later) is unchanged — it just now reads from the real saved-events endpoint.
- **Exit check:** Two different logged-in users can save different events independently.

### B7 — Banner image upload
- Multer + Cloudinary integration on `POST /api/events` and `PUT /api/events/:id` (multipart form).
- Frontend: `SubmitEventForm.tsx` gets a real file input for the banner (replacing the mock's `bannerColor` string), with a preview before submit.
- `EventCard.tsx` and event details page render `bannerImageUrl` if present, falling back to the existing color-tint placeholder if not (keeps old seed events looking fine).
- **Exit check:** Upload a JPG/PNG on submit, see it rendered on the card and details page after approval.

### B8 — Real AI integration
- `POST /api/ai/extract-event`: send the organizer's pasted raw text to OpenAI/Gemini with a system prompt that requests strict JSON matching a subset of the `Event` fields (name, category, fee, deadline, eligibility, team size, city, mode). Validate the response with `zod` before sending it back — never trust raw model output blindly.
- `POST /api/ai/search`: send the natural-language query with a system prompt that requests JSON filters (`category`, `city`, `mode`, `deadlineBefore`), validated against your real category list.
- Frontend: swap `simulateAIExtraction`/`simulateAISearch` calls in `SubmitEventForm.tsx` and `AISearchBar.tsx`/`BrowseEventsClient.tsx` for real fetches to these two endpoints. UI (badges, chips, loading states) barely changes — it was already built for async AI calls.
- **Exit check:** Paste a real Facebook-post-style event description → correct fields autofill. Type "hackathons in Chattogram before September" → correct filters apply.

### B9 — Testing, deployment, docs
- Backend: a handful of Jest + Supertest tests covering auth, event approval flow, and the category-in-use delete guard — enough to demonstrate testing rigor for the course, not full coverage.
- Deploy Postgres + Express API to Render; deploy Next.js to Vercel; set production env vars (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `OPENAI_API_KEY`/`GEMINI_API_KEY`, CORS origin) on both.
- Update root `README.md` with real setup instructions (backend `.env`, `npx prisma migrate deploy`, `npx prisma db seed`) and live URLs.
- If your course requires an SRS/UML deliverable per the proposal's Section 6, this phase is also the natural point to finalize the ER diagram (straight from Section 3's schema) and a sequence diagram for the AI-assisted submission flow.
- **Exit check:** Fresh visitor on the deployed Vercel URL can sign up, browse, and (as organizer) submit an event with an AI-assisted form and a real banner image, and (as admin) approve it, all against the live Render database.

---

## 6. Suggested order of operations from here

1. Confirm you're happy with this plan (swap Cloudinary for local disk storage only if you truly don't want a third-party dependency — but then banner uploads won't survive a Render redeploy).
2. Start with **B1**, and ask me for the Antigravity prompt for that phase specifically. I'll write it so it references your actual file paths and the conventions already established in `PROJECT_LOG.md`/`mockApi.ts`, so the AI coding agent doesn't invent a different structure.
3. After each phase, drop me the diff or a quick summary (the way `PROJECT_LOG.md` already documents each phase) and I'll review before you move to the next one.
