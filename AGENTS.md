# Fitness Trainer App — Agent Instructions

## Project overview

- This is a personal fitness-tracking app for Android and iOS. It is online-only: do not add offline workout logging or plan sharing.
- Users sign in to their own account and manage workouts, plans, progress, and body measurements.
- Mobile is the supported product target. `app.json` currently contains Expo web configuration, but do not build web-specific features or treat web as a supported platform.

## Technology stack

- Expo SDK 58, React Native 0.88, React 19, TypeScript 6, and Expo Router. Check `package.json` for exact installed versions before using version-sensitive APIs.
- Supabase Auth and Supabase-hosted PostgreSQL are the selected backend, but Supabase client configuration and schema are not yet present.
- TanStack Query is the recommended server-state/cache layer, but is not currently installed. Do not import it until it has been added to `package.json` for an authorized task.
- Do not assume any dependency exists unless it is in `package.json`. Do not add libraries or replace tooling without checking Expo SDK 58 compatibility and the task scope.

## Architecture and folders

- Use feature-oriented modules; keep route definitions in `src/app/` and all feature implementation outside it.
- As features are added, use `src/features/auth/`, `workouts/`, `plans/`, `progress/`, and `profile/` for feature screens' supporting UI, hooks, data access, and types.
- Put genuinely shared components and utilities in `src/shared/`; put infrastructure such as Supabase and query setup in `src/lib/`. Avoid speculative abstractions and cross-feature imports into another feature's internals.
- Keep Supabase queries behind feature data-access functions. Keep route components focused on screen composition and navigation.
- Supabase schema changes belong in versioned SQL migrations under `supabase/migrations/`; keep generated database types in one shared types location and regenerate them when schema changes.

## TypeScript and code conventions

- Preserve strict TypeScript and the configured `@/*` and `@/assets/*` aliases. Prefer explicit types at feature and data boundaries; do not use `any` to bypass type errors.
- Use kebab-case filenames. Use named exports for reusable components, hooks, and utilities; route files may use the default export required by Expo Router.
- Follow the existing React Native style: function components and `StyleSheet.create` for component styles. Keep platform-specific code isolated and add it only for real platform differences.
- Do not put non-route components, hooks, or utilities in `src/app/`.

## Expo, React Native, and navigation

- Before writing code that uses Expo, EAS, or React Native APIs, check the Expo major version in `package.json` and use its versioned docs (`https://docs.expo.dev/versions/v58.0.0/`). Check `https://docs.expo.dev/llms.txt` and follow the relevant page for other Expo guidance. Never rely on remembered APIs when docs can verify them.
- Use Expo Router for all navigation. Routes and layouts live in `src/app/`; `_layout.tsx` files define navigators. Use typed routes and imports from `expo-router`.
- Use an unauthenticated auth route group and an authenticated app group. The signed-in shell should support Today, Workouts, Progress, and Profile; workout logging and detail flows belong in nested routes/stacks as needed.
- Gate authenticated navigation until the Supabase session has hydrated. Router guards are a UI/navigation aid only; database authorization must be enforced with RLS.
- `ios/` and `android/` are generated native projects and currently do not exist. Do not create or edit them by hand; configure native behavior through app config and supported config plugins.

## State management and data fetching

- Use React context for app-wide Supabase session state, local React state for screen-only UI and drafts, and TanStack Query for remote server state once that dependency is installed.
- Keep query keys and fetch/mutation functions feature-scoped. Represent loading, error, empty, and content states; preserve user-entered drafts after failed saves.
- The app requires connectivity for workout logging. Do not add offline mutation queues, optimistic persistence, or offline logging flows unless product scope changes.

## Supabase, authentication, and security

- Use Supabase Auth with email/password only. Require email confirmation at sign-up; do not treat an unconfirmed account as signed in or bypass confirmation. Do not add social or third-party identity providers.
- Link the app's profile row to `auth.users.id`. Keep session bootstrap and auth actions in the auth feature/infrastructure layer, not scattered across screens.
- Keep only the Supabase project URL and publishable/anon client key in Expo public environment variables. They are visible in the app bundle. Never expose a secret/service-role key, database password, or other server secret in client code or `EXPO_PUBLIC_*` variables.
- Keep local environment files out of version control; provide only a placeholder example when needed. Check `.gitignore` because its current pattern ignores `.env*.local` but not plain `.env`.
- Follow the current Supabase React Native guidance for URL polyfills, session persistence, and token refresh. Choose and document a storage adapter appropriate for native platforms; do not store passwords or hand-roll token handling.
- Never assume client-side route guards secure data. Enforce access in PostgreSQL RLS and Supabase Storage policies.

## Database and RLS

- Use PostgreSQL relational tables for profiles, workout plans, planned exercises, completed workout sessions/sets, progress, and body measurements as those features are implemented. Keep completed workout history distinct from editable plans.
- Associate each user's private records with their auth user ID. Enable RLS on every exposed user-data table and write owner-scoped policies for read, insert, update, and delete. Test that a second user cannot access or change another user's records.
- Apply least privilege to grants and storage buckets. Do not rely on obscured IDs or app-side filtering as authorization.
- Make schema changes through reviewed migrations, not one-off dashboard edits. Keep constraints, foreign keys, and indexes aligned with actual query patterns; regenerate TypeScript database types after schema changes.

## Testing and code quality

- For code changes, run `npm run lint` and `npx tsc --noEmit` before declaring completion. Run relevant tests when a test suite exists or the task asks for tests; do not claim tests passed if none were run.
- Add tests for domain rules and user-visible flows. When Supabase schema/RLS is introduced, add database tests covering owner access and cross-user denial; test sign-up confirmation and session hydration behavior.
- Use `npx expo install <package>` for Expo-compatible dependencies; this repo uses npm (`package-lock.json`, no `bun.lock`). Do not install packages unless the task authorizes it.
- Prefer focused changes, meaningful names, and accessible mobile UI. Do not modify generated files or unrelated app behavior.

## Codex working instructions

- Inspect relevant files and current package versions before changing code. Do not assume planned architecture or dependencies are already implemented; verify the repository.
- Follow these instructions together with the user's request. If they conflict, follow the user's explicit request.
- Do not modify application source when asked only to update documentation. Do not install packages, restructure the project, or change backend state unless explicitly requested.
- Report what changed and what checks were run, including any checks that could not be completed.
