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
1. Implement the milestone.
2. Run `npx tsc --noEmit` (and lint once it's set up).
3. Summarize the diff for review. **Don't commit until the user approves.**
4. Commit with Conventional Commits (e.g. `feat(m1): auth with magic link`), then push to `main`.

## Commands
- `npx expo start` (dev server), `npx expo start --web` (web)
- `npx tsc --noEmit` (typecheck)
- Update this list once milestone 1 scaffolds the app.

## Decisions
- FX rates: free API. Reminders: no quiet hours. Name and monetisation: TBD.
