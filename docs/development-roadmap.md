# Development Roadmap

This roadmap sequences the approved mobile, self-service architecture. It assumes online workout logging, Supabase email/password auth with email confirmation, private body measurements, no plan sharing, and Android/iOS as supported platforms. Dependencies listed below are implementation dependencies, not claims that the corresponding packages or backend services already exist.

## Phase 1 - Foundation and navigation

**Deliver:** Establish the source structure incrementally; keep Expo Router route files in `src/app/` and feature code in `src/features/`. Set up the root provider/layout boundary, auth/app route groups, shared theme and UI primitives, Supabase client initialization, TanStack Query provider, and Zustand store foundation. Preserve strict TypeScript, path aliases, and mobile-only product scope; do not add auth flows or domain behavior.

**Depends on:** Current Expo SDK 58 starter.

**Acceptance criteria:**
- Android and iOS launch into the correct route group without web-only behavior being required.
- Route modules remain thin; non-route UI and logic live outside `src/app/`.
- `npm run lint` and `npx tsc --noEmit` pass.

## Phase 2 - Supabase foundation and authentication

**Deliver:** Configure project environment values; add the profile migration and generated database types; implement email/password sign-up, confirmation-required behavior, sign-in, sign-out, recovery, and auth hydration using the Phase 1 Supabase client. Gate authenticated routes only after initial session state is known.

**Depends on:** Phase 1; Supabase project/environment configuration and selected native session-storage adapter.

**Acceptance criteria:**
- A new user must confirm their email before using authenticated app routes.
- Returning sessions hydrate without briefly showing the wrong route group; sign-out removes access to authenticated navigation.
- Missing configuration and auth failures produce clear, recoverable errors.
- No secret/service-role key or database credential is present in the mobile bundle.
- Profile ownership follows `auth.users.id`; database tests prove a user cannot read or modify another user's profile.

## Phase 3 - Workout plans and online workout logging

**Deliver:** Add exercise definitions, plans, ordered plan exercises, sessions, performed exercise snapshots, and set records. Implement plan CRUD and online session logging/history with TanStack Query, using feature-scoped query keys and mutations.

**Depends on:** Phase 2 authentication, migrations, and owner-scoped RLS. TanStack Query is available from Phase 1.

**Acceptance criteria:**
- Users can create, view, edit, and delete their own plans and log a session from a plan or as an ad hoc session.
- A failed save preserves the user's draft and offers a retry; the app does not queue workout writes offline.
- Editing a plan does not alter completed session history.
- Database tests cover owner CRUD and cross-user denial for every exposed workout table.

## Phase 4 - Progress and body measurements

**Deliver:** Add dated body measurements with explicit units and private owner policies. Build progress summaries from workout history and measurement records; defer separately stored aggregate/progress data until a concrete need appears.

**Depends on:** Phase 3 workout history and Phase 2 RLS patterns.

**Acceptance criteria:**
- Users can record, view, and correct their own measurements with units and dates.
- Progress views handle loading, error, empty, and populated states and use consistent values/units.
- Cross-user measurement access is denied by RLS tests; workout history remains unchanged by measurement edits.

## Phase 5 - Release readiness

**Deliver:** Complete Android/iOS integration review, auth deep-link validation, database migration/RLS review, and automated checks for important domain, route, and database behavior. Use EAS only after build configuration and credentials are intentionally established; none are assumed to exist now.

**Depends on:** Phases 1-4 and any release environment/configuration supplied for the project.

**Acceptance criteria:**
- Lint and TypeScript checks pass, and automated tests cover critical auth, workout, measurement, and RLS behavior.
- Sign-up confirmation, sign-in, sign-out, recovery links, cold-start session hydration, and expired/invalid session behavior are reviewed on Android and iOS.
- Production configuration contains only client-safe Supabase values in the app; RLS and migrations are reviewed before deployment.
- No web support, offline workout queue, plan sharing, or unrequested health-data features are added.

