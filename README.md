# Subscription Tracker

Track every recurring charge, what it costs per month in KES, and what renews next. Expo (Android, iOS, web) + Supabase.

Spec and milestones: [docs/spec.md](docs/spec.md).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the Supabase anon/publishable key.
3. Apply `supabase/migrations/*.sql` to the Supabase project.
4. `npm start` (scan with Expo Go) or `npm run web`.

## Checks

`npm run typecheck` and `npm run lint` (also run in CI on every PR).
