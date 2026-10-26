# Subscription Tracker

Personal tracker for recurring charges in KES (Kenya: M-Pesa, card, carrier billing).
**Source of truth: `docs/spec.md`.** Read the relevant milestone section before starting work.

## Links
- Supabase: https://wdcedxshfbhuouoiamac.supabase.co (project ref `wdcedxshfbhuouoiamac`)
- GitHub: https://github.com/EthanBwibo/Subscription-Tracker

## Stack
- Expo (React Native) + Expo Router, TypeScript (strict). One codebase for Android, iOS, web
- NativeWind for styling
- TanStack Query + supabase-js for data
- Supabase: Auth (magic link + Google), Postgres + RLS, Edge Functions, pg_cron
- Expo Push Notifications, Resend for email
- Vercel (Expo web export), EAS Build (Android APK)

## Conventions
- One milestone per session. Stay inside its scope and don't start the next one.
- Schema changes go in as SQL migrations in `supabase/migrations/` (apply with the Supabase MCP `apply_migration`).
  Every user-owned table gets RLS `user_id = auth.uid()`. `services` is read-only to users.
- Regenerate DB types into `src/types/database.ts` after schema changes.
- Money: `amount numeric` + ISO currency code. Convert to KES only for display/totals, via `fx_rates`.
- Dates: `date` / `timestamptz`; default timezone `Africa/Nairobi`.
- Secrets live in `.env` (gitignored); keep `.env.example` current. Only `EXPO_PUBLIC_*` vars in the client. Never put the service-role key in the app.
- Keep files small and focused. Supabase client in `src/lib/supabase.ts`, data access in hooks under `src/hooks/`.
- Dev machine is Windows (PowerShell / Git Bash).

## Workflow
`main` is protected: no direct pushes, changes land via PR with CI passing.
1. Branch `feat/mN-<topic>` off `main`. Work is tracked as GitHub issues under milestone "MN: ...".
2. Implement, then run `npm run typecheck` and `npm run lint`.
3. Commit (Conventional Commits, e.g. `feat(m1): auth with magic link`), push the branch, open a PR that `Closes #<issue>` with milestone set.
4. The user reviews the PR and merges. Never merge or bypass protection yourself.

## Layout & commands
- Routes in `src/app/` (Expo Router); non-route code in `src/lib`, `src/hooks`, `src/providers`, `src/types`. Import via `@/`.
- Expo SDK 58: check versioned docs before using Expo APIs (see `AGENTS.md`). Add packages with `npx expo install`.
- `npm start` (Expo Go) · `npm run web` · `npm run typecheck` · `npm run lint` · `npx expo-doctor`
- Auth redirect URLs to allow in Supabase: `subtracker://**`, `exp://**`, `http://localhost:8081/**` (+ the Vercel URL in M5).

## Decisions
- FX rates: free API. Reminders: no quiet hours. Name and monetisation: TBD.
