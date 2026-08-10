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
- None blocking. Next session should: continue to the next frontend phase (Browse/Search screens) using mock data and the role switcher already in place.

---

## Phase F2 — Public / Onboarding Screens
**Status:** ✅ Complete

### What was built
- **Landing Page (`frontend/app/page.tsx`)**: Hero section with headline and visual search bar. Horizontally-scrollable category chip row pulling from `getCategories()`. Grid of "Closing Soon" event cards pulling from `getEvents()` and sorted by nearest deadline (top 6).
- **EventCard Component (`frontend/components/EventCard.tsx`)**: Reusable card component to display event details (banner, tags, deadline, organizer, fee, mode/location) consistently.
- **Sign Up Page (`frontend/app/signup/page.tsx`)**: Card with segmented control for Role selection (Find events vs Publish events). Form fields using existing `Input` component. Temporary auth flow sets the dev role switcher context and redirects to Home.
- **Login Page (`frontend/app/login/page.tsx`)**: Card with email/password fields. Temporary auth flow sets the dev role switcher context to 'user' and redirects to Home.

### Decisions made
- Kept search bar on Landing Page as visual-only for now, to be integrated with real search later.
- Added a `showStatus` prop to `EventCard` (default false) to optionally hide the status chip on public screens.
- Authentication screens simply set the dev RoleContext to simulate logging in, as real auth doesn't exist yet.

### Review fixes applied
- Fixed `EventCard` banner colors by mapping mock data tone strings ("primary", "success", etc.) to real Tailwind background classes (`bg-primary-50`, etc.) using a lookup object. Removed inline styles.
- Removed unused `Building2` import in `EventCard.tsx`.
- Escaped apostrophe in `login/page.tsx` to fix ESLint error.
- Added `.hide-scrollbar` utility classes to `globals.css` to properly hide horizontal scrollbars on the category chips.
- Pushed Phase F2 and fixes to GitHub.

---

## Phase F3 — Browse / Search Screens
**Status:** ✅ Complete

### What was built
- **Browse Events Page (`frontend/app/events/page.tsx`)**: The main discovery page with search and filtering.
- **BrowseEventsClient Component (`frontend/components/BrowseEventsClient.tsx`)**: Client-side component that handles state for the search query and filters (Category, City, Mode) and displays the filtered list of events using the `EventCard`. Includes an empty state.
- **Event Details Page (`frontend/app/events/[id]/page.tsx`)**: A dynamic route for individual events, featuring a hero banner, key details grid, tabbed-like content sections (Description, Rules, Eligibility), and an action bar that becomes sticky on mobile.

### Decisions made
- Implemented client-side filtering for the browse page since the dataset is currently mocked and small.
- Placed the filters in a horizontal bar above the results for a mobile-first, cleaner layout (as opposed to a heavy sidebar).
- Handled the `bannerColor` lookup inside the Event Details page the same way as `EventCard`.

### Open questions / next steps
- Run lint, build, and git commit/push manually (due to sandbox restrictions).
- Await confirmation to proceed to Phase F4 (Organizer/Admin screens).

---

## Phase F4 — Organizer & Admin Dashboards
**Status:** ✅ Complete

### What was built
- **Mock API Expansion (`frontend/lib/mockApi.ts`)**: Added a `createEvent` function to mock the addition of newly submitted events.
- **Organizer Dashboard (`/dashboard/organizer`)**: A page displaying the logged-in organizer's events (mocked as "BUET Computer Club") showing their approval status, deadlines, and actions to view/edit. Included a summary statistics section (Total, Approved, Pending).
- **Event Submission Form (`/dashboard/organizer/submit`)**: A comprehensive multi-step form gathering all necessary details about a new event, including categories, dates, modes (online/offline conditional logic), fees, and links.
- **Admin Dashboard (`/dashboard/admin`)**: A central hub for admins to review all events on the platform. Focuses heavily on the "Pending Review" queue with quick inline actions to Approve or Reject.
- **Reject Modal**: Added a modal to capture a rejection reason when an Admin rejects an event.

### Decisions made
- Kept the dashboards mobile-responsive using Tailwind utility classes (e.g., overflow-x-auto for tables on small screens).
- Submitting the form actually pushes a new event into the `mockApi.ts` in-memory array, meaning it will instantly show up on the Admin dashboard (until the dev server restarts).

### Critical Review Fixes Applied (Phase F3/F4)
- Fixed `AdminDashboardClient.tsx` where `Modal` was using `isOpen` instead of the correct `open` prop, preventing the modal from opening and breaking the build.
- Fixed `events/[id]/page.tsx` dynamic route where `params` wasn't being awaited, fixing a 404 error in Next.js 16 (`const { id } = await params;`).
- Escaped the apostrophe in `OrganizerDashboardClient.tsx` to fix ESLint error.
- Removed unused imports across `events/[id]/page.tsx`, `BrowseEventsClient.tsx`, and `SubmitEventForm.tsx`.

### Open questions / next steps
- The core frontend user flow is now complete (Public discovery -> Organizer submission -> Admin approval). Next step is to integrate a real backend database (Node.js/PostgreSQL).

---

## Phase F5 — AI Integration UI (Simulated)
**Status:** ✅ Complete

### What was built
- **Mock AI Logic (`frontend/lib/mockApi.ts`)**: Added `simulateAIExtraction(rawText)` and `simulateAISearch(query)` using `Math.random()` to simulate network delays (1-2.5s) and basic substring/regex matching to extract categories, fees, team sizes, deadlines, cities, and modes. Added a 15% random failure rate to the extraction function.
- **AI-Assisted Event Submission (`frontend/components/SubmitEventForm.tsx`)**: Added a visually distinct "AI-Assisted Autofill" section at the top of the form with a `Sparkles` icon. It tracks successfully filled fields using a `Set` and displays an "AI-filled" badge on the respective input labels. The badge is removed if the user manually edits the field. Fallback error states are handled gracefully.
- **AI-Powered Natural Language Search (`frontend/components/AISearchBar.tsx` & `BrowseEventsClient.tsx`)**: Replaced the visual-only search bar on the Landing Page with an `AISearchBar` component that redirects to `/events?q=...`. `BrowseEventsClient` parses the query on mount, simulates the AI search, and displays the interpreted filters as removable chips above the results, fully syncing with the manual filter dropdowns.

### Decisions made
- Changed the `label` prop in `components/ui/Input.tsx` to accept a `ReactNode` instead of a `string` to easily inject the "AI-filled" badge.
- Used `router.replace` in `BrowseEventsClient` to update the URL with the query without causing a full page reload or breaking browser history.
- The AI simulation functions do not use any real LLM or API keys, ensuring this phase purely focuses on the UX/UI interactions.

### Open questions / next steps
- Run `npm run lint` and `npm run build` manually to verify the build, and test the AI features in the browser.
- Await confirmation to proceed to Phase F6.

### Post-review fix applied
- **Bug:** `simulateAISearch` used a hardcoded city list (`["Dhaka", "Chittagong", ...]`) while the mock data uses `"Chattogram"`. This caused city matching to silently produce zero results.
- **Fix:** Replaced the hardcoded array with a dynamic derivation: `Array.from(new Set(events.map(e => e.city).filter(Boolean)))` — the same pattern already used by `getCategories()`. City names will now always match the mock data exactly, and the class of mismatch can't recur as data evolves.

---

## Phase F6 — Responsive & Accessibility Polish Pass
**Status:** ✅ Complete

### What was audited and changed

#### Mobile (375px)
- All existing screens were reviewed. Tables in Organizer/Admin dashboards already use `overflow-x-auto`. Browse filters were already a horizontal wrapping bar (no sidebar ever existed, so no drawer was needed).
- No new horizontal overflow issues were found.

#### Keyboard Navigation
- Added `aria-label` to every icon-only action button across `AdminDashboardClient.tsx` (View, Approve, Reject) and `OrganizerDashboardClient.tsx` (View, Edit) — previously these were tab-reachable but silent to screen readers.
- Added `aria-label` to the AI chip remove buttons (×) in `BrowseEventsClient.tsx`.
- Added `role="search"` to the search `<form>` and `aria-label="Search events"` + `type="search"` to the `<input>` in `AISearchBar.tsx`.
- Added `aria-hidden="true"` to all decorative icons across the above files.
- Global `:focus-visible` ring in `globals.css` was confirmed intact and not overridden anywhere.

#### Color-only status indicators
- `StatusChip` (icon + text), `DeadlineBadge` (icon + text), and the new F5 "AI-filled" badge (icon + text) all confirmed non-color-only.
- AI error message is supplementary text — no issue.

#### Empty states
- **Organizer Dashboard (0 events):** upgraded from a single text line to a two-line heading + descriptive prompt pointing to the "Submit New Event" button.
- **Admin — Pending queue (0 events):** upgraded from a single line to a friendly "All caught up! / No events are awaiting review" state.
- **Admin — Approved table (0 approved):** was previously a blank white card. Added "No approved events yet." message.
- **Admin — Rejected table (0 rejected):** was previously a blank white card. Added "No rejected events." message.
- Browse empty state was already correct (heading + descriptive text + Clear button).

### `npm run lint` output
```
> frontend@0.1.0 lint
> eslint

(no output — clean)
```
`npm run build` is blocked by sandbox network restrictions (same as previous phases — cannot write to `.next` directory).

### Open questions / next steps
- Please run `npm run build` locally to confirm no TypeScript errors from these changes.
- Await confirmation to proceed to Phase F7.
