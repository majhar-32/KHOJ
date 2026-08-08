# Khoj — Project Log

## Phase F1 — Frontend Project Setup + Design System + Mock Data Foundation
**Status:** ✅ Complete (built outside Antigravity, ready to continue from a fresh session)

### What was built
- Next.js app scaffolded in `frontend/` (App Router, TypeScript, Tailwind CSS v4).
- Design system tokens configured in `frontend/app/globals.css` via Tailwind's `@theme` (colors, Inter font, focus states, reduced-motion support). Matches the previously approved Figma design spec exactly:
  - Primary: `#2F5EFF` / `#1F45D6` (hover) / `#EEF2FF` (tint)
  - Accent (deadlines): `#F5A524`
  - Semantic: success `#22C55E`, warning `#F59E0B`, error `#EF4444`
  - Neutrals: `#111827`, `#4B5563`, `#D1D5DB`, `#F3F4F6`
- `lucide-react` installed for icons.
- Core reusable components built in `frontend/components/ui/`:
  - `Button.tsx` — primary/secondary/ghost/destructive variants, sm/md/lg sizes, loading + disabled states, 44px minimum touch target.
  - `Input.tsx` — also exports `Textarea` and `Select`, all sharing a consistent field style with label/error/hint support.
  - `Card.tsx` — generic content wrapper.
  - `Badge.tsx` — exports `CategoryTag`, `DeadlineBadge` (urgency-aware, amber under 7 days), and `StatusChip` (pending/approved/rejected, icon + color, never color-only for accessibility).
  - `Modal.tsx` — accessible dialog (Escape to close, focus-friendly, `role="dialog"`).
- `frontend/components/layout/Navbar.tsx` — logo, nav placeholder, search/save icons, and a clearly-labeled **dev-only role switcher** (amber dashed border, flask icon) to preview User/Organizer/Admin views without real auth.
- `frontend/context/RoleContext.tsx` — React context backing the role switcher. Explicitly commented as dev-only, to be replaced by real auth state later.
- Mock data foundation:
  - `frontend/lib/types.ts` — `KhojEvent`, `Role`, `EventStatus`, `EventMode` types, covering every field from the requirement doc (including Available Seats and Certificate Information, added per stakeholder feedback).
  - `frontend/lib/mockData.ts` — 20 realistic mock events across all 18 categories, with varied deadlines (including some urgent, <7 days), cities, online/offline modes, and a couple of `pending`/`rejected` examples for later Organizer/Admin screens.
  - `frontend/lib/mockApi.ts` — async functions (`getEvents`, `getEventById`, `toggleSaveEvent`, `approveEvent`, `rejectEvent`, etc.) that mimic what real API calls will look like, so swapping in a real backend later is a small change, not a rewrite.
- `frontend/app/dev/components/page.tsx` — a component showcase route for visually verifying the whole design system at once.
- `frontend/app/page.tsx` — minimal placeholder home page (real Landing page comes in the next phase).
- Root `README.md` and `backend/README.md` (placeholder, backend not started).

### Verified before hand-off
- `npm run build` — compiles successfully, zero TypeScript errors.
- `npm run lint` — zero errors.
- `npm run dev` — both `/` and `/dev/components` return HTTP 200 and render correctly.

### Decisions made
- Used Tailwind v4's CSS-based `@theme` config (current Tailwind default) instead of a `tailwind.config.js` file — functionally equivalent, just the modern Tailwind v4 convention.
- Dark mode explicitly not implemented (was flagged as an open question in the design spec) — the app is light-mode only for now.
- No git repository has been initialized yet in this folder — that's the first task for the next session.

### Open questions / next steps
- None blocking. Next session should: initialize git, connect the existing GitHub remote, push, then continue to the next frontend phase (public/onboarding screens: Landing, Sign Up, Login) using mock data and the role switcher already in place.
