# Database Schema

## Status and design rules

This is the proposed logical schema for the self-service, online-only app; no Supabase project or migrations currently exist in the repository. Implement the model through reviewed SQL migrations under `supabase/migrations/`, then generate TypeScript database types from the resulting schema. Treat names and fields as a starting contract to refine only when a feature's requirements demand it.

Use PostgreSQL UUID primary keys (except `profiles.id`, which matches the Supabase Auth user ID), `timestamptz` for instants, foreign keys for relationships, and constraints for required values and valid ranges. Store each user's private records with an owner association. Do not add sharing, offline-sync metadata, or a separate stored progress table in v1.

## Entities and relationships

| Entity | Purpose and key relationships |
|---|---|
| `profiles` | App profile for one Auth user. `id` references `auth.users.id` and is the profile owner key. Store only app profile fields such as display name and timestamps; Auth remains the identity source. |
| `exercises` | Exercise definitions used by plans and sessions. Each user owns their definitions in the initial model. `id` is referenced by planned and performed exercise rows. A future shared exercise catalog would need a separate, explicit access model. |
| `workout_plans` | A user's named, editable plan. Has an owner and timestamps. One plan has many planned exercises. |
| `plan_exercises` | An ordered exercise prescription within one plan. References its plan and exercise definition; holds plan-specific ordering, targets, and optional instructions. |
| `workout_sessions` | A completed or in-progress workout log owned by a user. May reference the plan used, or be an ad hoc session. Stores session timing and optional notes. |
| `session_exercises` | Ordered performed exercises within a session. References the session and may reference an exercise definition. Keep an exercise-name/prescription snapshot so later plan edits do not rewrite historical logs. |
| `workout_sets` | Actual performed set rows belonging to one session exercise. Store the set order and the performance values required by the first workout flow. |
| `body_measurements` | A user's dated measurements. Store measurement kind, numeric value, unit, timestamp, and optional note. These are private user records protected by RLS. |

Relationship summary: one Auth user has one profile and many exercises, plans, sessions, and measurements. A plan has many `plan_exercises`; each plan exercise references an exercise. A session has many `session_exercises`; each session exercise has many `workout_sets`. A session can optionally reference the source plan. Progress screens should initially derive summaries from sessions, sets, and measurements rather than duplicating them in a separate table.

## Ownership, integrity, and history

- Enable RLS for each exposed table. Owner policies must cover `SELECT`, `INSERT`, `UPDATE`, and `DELETE`; child-row policies must verify ownership through their parent or a consistent owner key.
- Prevent references that cross user ownership. Enforce the rule in database constraints/policies rather than trusting UI filters.
- Keep completed session/set history distinct from editable plan prescriptions. Preserve snapshots for information whose meaning could change when a plan or exercise definition is edited.
- Define `NOT NULL`, check constraints, foreign-key delete behavior, and indexes in migrations based on concrete product needs. Index owner/time queries and frequently used foreign keys; avoid speculative indexes.
- Store units with measurements and loads so values are interpretable. Decide supported measurement types, unit conversion/display behavior, and input ranges with the feature UX before locking constraints.
- Do not create Storage buckets until a feature requires file uploads. If added, configure private access and RLS policies.

## Migration and type workflow

1. Create or update a versioned SQL migration; do not make untracked dashboard-only schema edits.
2. Review constraints, ownership paths, grants, and RLS alongside each schema change.
3. Add/update database tests that prove owner access and cross-user denial.
4. Regenerate the TypeScript database type file and update feature data-access types.
5. Apply and validate migrations in a local Supabase environment before production deployment.

See [Application Architecture](architecture.md) for client boundaries and [Development Roadmap](development-roadmap.md) for phase dependencies.
