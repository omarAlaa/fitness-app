# Application Architecture

## Status and scope

This document describes the target architecture for the fitness-tracking app. Phase 1 has established the root provider boundary, Expo Router auth/app group layouts, shared theme and UI foundations, and infrastructure clients. The root index remains the original placeholder. Authentication, domain features, Supabase schema, and generated database types are not implemented yet. Build the remaining architecture incrementally; do not treat the target tree below as existing code.

The app supports Android and iOS, requires connectivity for workout logging, stores each user's own workouts, plans, progress, and body measurements, and does not support plan sharing. Web configuration remains in the starter `app.json`, but web is not a product target.

## Technology and responsibilities

- **Expo SDK 58, React Native 0.88, React 19, TypeScript 6:** mobile runtime and application UI. Confirm exact versions in `package.json` before version-sensitive changes.
- **Expo Router:** file-based routes, stacks, tabs, deep links, and auth-aware navigation.
- **Supabase Auth and hosted PostgreSQL:** user identity, session-backed API access, persistent domain data, and database authorization. The client is initialized in `src/lib/supabase/client.ts` from public environment variables and uses Expo SQLite local storage; auth flows and the database schema remain future work.
- **React context:** app-wide auth/session state and hydration status.
- **TanStack Query:** configured as the remote server-state cache through the root provider. Keep query keys and operations feature-scoped; keep screen-local state in React.

Keep responsibilities separated: route files compose screens and navigation; features own workflows and domain operations; `src/lib/` owns infrastructure clients and Zustand stores for shared transient UI preferences; PostgreSQL constraints and RLS are the data-integrity and authorization boundary.

## Target folder structure

Create folders only as features are implemented. Do not move non-route code into `src/app/`.

```text
src/
  app/
    _layout.tsx
    (auth)/                 # sign-in, sign-up, confirmation/recovery routes
    (app)/
      _layout.tsx           # authenticated shell
      (tabs)/               # Today, Workouts, Progress, Profile
  features/
    auth/                   # auth UI support, session hooks, auth operations
    workouts/               # session logging and history
    plans/                  # editable workout plans and planned exercises
    progress/               # summaries and body measurements
    profile/                # profile data and settings
  shared/
    ui/                     # components shared across multiple features
    utils/                  # genuinely shared helpers
  lib/
    supabase/               # client and generated database types
    store/                  # cross-screen transient state
    query/                  # query-client setup
supabase/
  migrations/               # ordered, reviewed SQL migrations
  tests/                    # database and RLS tests
```

Use kebab-case filenames, `@/*` for `src/*`, and `@/assets/*` for assets. Use named exports for reusable code and default exports for route modules. Keep feature internals private; share code only when there is a real cross-feature need.

## Navigation and user flows

The root layout initializes providers and waits for auth hydration before deciding which route group is available. Unauthenticated users see email sign-in/sign-up and confirmation or recovery flows. Authenticated users enter the app shell with Today, Workouts, Progress, and Profile tabs. Workout creation, logging, and detail/history screens should use nested routes/stacks as needed.

Use Expo Router for navigation and its typed route support. Client-side guards prevent inappropriate navigation and handle session changes; they do not grant or deny database access. Require online access for workout writes and show retryable errors while preserving user-entered drafts.

## Supabase integration and security

Initialize one Supabase client in `src/lib/supabase/`; keep auth/session operations in the auth feature and table operations behind feature data-access functions. Read the project URL and publishable client key from environment configuration. Client-bundled variables are public; never put a secret/service-role key, database password, or other server credential in the app. Keep real environment files untracked and update `.gitignore` before adding a plain `.env` file (the current pattern only ignores `.env*.local`).

Use Supabase Auth with email/password only and require email confirmation after sign-up. Handle initial session loading, confirmation, sign-out, and recovery links without treating an unconfirmed user as authenticated. Select and document a native-compatible session storage adapter using current Supabase guidance; do not store passwords or implement token refresh by hand.

Enable RLS on every exposed user-data table. Policies must scope reads and writes to the authenticated user's own records. Test both allowed owner operations and denied cross-user access. Apply least-privilege grants; do not rely on route guards, hidden identifiers, or app-side filtering for security.

## Engineering conventions

Preserve strict TypeScript and current path aliases. Prefer explicit types at feature and database boundaries; do not use `any` to silence errors. Use function components and `StyleSheet.create` consistent with the starter, and isolate platform-specific behavior only when necessary.

Before using Expo, EAS, or React Native APIs, read the matching versioned docs at `https://docs.expo.dev/versions/v58.0.0/` and consult `https://docs.expo.dev/llms.txt` for the relevant guidance. Do not create or edit `ios/` or `android/` by hand; they are generated projects and are currently absent. Use `npx expo install` for Expo-compatible packages; this repository uses npm and has no `bun.lock`.

For code changes, run `npm run lint` and `npx tsc --noEmit`. Add tests for feature rules and flows; test RLS in the local Supabase database when its schema exists. Do not report checks as passed unless they were run. See [Database Schema](database-schema.md) and [Development Roadmap](development-roadmap.md) for the logical data model and sequencing.


