# Khoj — Centralized Event & Contest Discovery Platform

Khoj is a centralized, mobile-responsive web application that helps students, professionals, and university clubs in Bangladesh discover events and contests (hackathons, workshops, olympiads, job fairs, cultural events, and more) in one place — instead of scattered across Facebook, LinkedIn, Discord, and notice boards.

Khoj is a **discovery platform only** — it links out to each organizer's own registration channel rather than processing registrations itself.

## Current Status: Frontend-First Build (No Backend Yet)

This project is being built frontend-first. All screens currently run on realistic **mock data** (see `frontend/lib/mockData.ts` and `frontend/lib/mockApi.ts`) so every feature is visible and demonstrable in the browser before the real backend exists.

## Structure

- `frontend/` — Next.js (App Router) + Tailwind CSS + TypeScript. Active development is happening here.
- `backend/` — Node.js + Express + PostgreSQL (via Prisma). Running on port 5001.

## Getting Started

You can run both Frontend and Backend concurrently with a single command from the project root:

```bash
npm run dev
```

This starts:
- **Backend API:** `http://localhost:5001/api`
- **Frontend Web:** `http://localhost:3000`

### Running Individually:
- **Backend:** `cd backend && npm run dev`
- **Frontend:** `cd frontend && npm run dev`

### If a Port is Busy / Occupied:
```bash
npm run clean:ports
```

## Roles (Dev Preview)

Since there's no real authentication yet, use the small **"View as"** role switcher in the top-right of the navbar to preview the app as a User, Organizer, or Admin.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, lucide-react
- **Backend (planned):** Node.js, Express, PostgreSQL, Prisma, JWT auth
- **AI (planned):** OpenAI/Gemini API for AI-assisted event submission and natural-language search

See `PROJECT_LOG.md` for detailed build progress.
