# Subscription Tracker — v1 Spec

Oct 26, 2026 · @Bwibo

## Overview

v1 is a personal tracker that shows every recurring charge, what it costs per month in KES, and what renews next. It is built for Ethan's own use first, then opened to the public once it holds up.

The problem: Kenyan recurring spend is scattered across M-Pesa, cards and carrier billing (Netflix, Showmax, DStv, Spotify, Safaricom bundles, gyms, cloud tools), often in mixed currencies. Nobody sees the total, and free trials quietly convert to paid.

Success for v1: every active subscription entered in under 2 minutes, a reminder before every charge, and a monthly total that matches reality.

## v1 scope

| In v1 | Out of v1 |
| --- | --- |
| Manual entry with service presets | M-Pesa SMS parsing |
| Renewal reminders (push + email) | Gmail receipt import |
| Monthly spend summary in KES | Cancelling from inside the app |
| Free-trial tracking | Shared/family subscriptions |
| Multi-currency with KES conversion | Bank or card linking |
| Email + Google sign-in, synced across phone and web | Budgets and spend limits |

## Features

**1. Manual entry + presets.** Pick a service from a preset list or add a custom one. Fields: name, amount, currency, billing cycle (weekly, monthly, quarterly, yearly, custom days), next billing date, payment method (M-Pesa, card, carrier billing, bank), category, notes.

- Presets ship with name, logo, category, default currency and a cancel link: Netflix, Showmax, DStv, GOtv, Spotify, YouTube Premium, Apple One, Safaricom bundles, Zuku, Faiba, ChatGPT, Claude, GitHub, Canva, iCloud, Google One, gym.
- Preset prices are not stored, because they change; the user confirms the amount.

**2. Renewal reminders.** Default reminder 3 days before each charge, adjustable per subscription (same day, 1, 3, 7 days). A daily job computes upcoming charges and queues notifications.

**3. Monthly spend summary.** Home screen shows this month's total in KES, the next 7 days of charges, and a breakdown by category. Yearly subscriptions count as amount ÷ 12 in the monthly view, with a toggle to show actual cash out this month.

**4. Free-trial tracking.** A subscription can be marked as a trial with an end date and the price it converts to. Reminders fire 3 days and 1 day before conversion, with a "keep" or "I cancelled" action.

**5. Multi-currency.** Each subscription keeps its own currency. Totals convert to KES using a daily rate fetched by a scheduled job; the rate date is shown under the total.

## Screens

| Screen | What it holds |
| --- | --- |
| Sign in | Email magic link, Google sign-in |
| Home | Monthly KES total, next 7 days of charges, trials ending soon, category breakdown |
| Subscriptions | List sorted by next charge; filter by category, payment method, trial |
| Add / edit | Preset picker, then the entry form; trial toggle |
| Subscription detail | Cost per month and per year, payment history of past cycles, reminder setting, cancel link |
| Settings | Default reminder, base currency, notification channels, export to CSV, delete account |

## Data model

Four tables in Supabase Postgres, all user-owned rows protected by row-level security (`user_id = auth.uid()`).

| Table | Key columns |
| --- | --- |
| `profiles` | id (= auth user), base\_currency (default KES), default\_reminder\_days, timezone (default Africa/Nairobi), expo\_push\_token |
| `services` | id, name, slug, category, logo\_url, default\_currency, cancel\_url — shared presets, read-only to users |
| `subscriptions` | id, user\_id, service\_id (nullable for custom), name, amount, currency, cycle\_unit, cycle\_count, start\_date, next\_billing\_date, payment\_method, category, is\_trial, trial\_ends\_at, trial\_price, reminder\_days, status (active, paused, cancelled), notes |
| `fx_rates` | date, base (KES), currency, rate |

Past charges are derived from start\_date and the cycle, not stored, in v1. A `charges` table comes later if manual "I paid" logging is wanted.

## Tech stack

One Expo codebase serves Android, iOS and web; Supabase is the whole backend.

| Layer | Choice | Why |
| --- | --- | --- |
| App | Expo (React Native) + Expo Router, TypeScript | One codebase for phone and web |
| UI | NativeWind (Tailwind) | Same styling on native and web |
| Data fetching | TanStack Query + supabase-js | Caching, offline-friendly reads |
| Auth | Supabase Auth: magic link + Google | No passwords to manage |
| Database | Supabase Postgres with RLS | Already connected here |
| Scheduled jobs | pg\_cron calling Edge Functions | Daily reminders and FX rate fetch |
| Push | Expo Push Notifications | Works for Android and iOS |
| Email | Resend (free tier) | Reminder fallback and web users |
| Web hosting | Vercel (Expo web export) | Already connected here |
| Builds | EAS Build | Android APK for dogfooding |

## Milestones

Six weekend-sized milestones, each ending in something usable.

1. **Foundation:** Expo app scaffolded, Supabase project, schema and RLS, auth working on phone and web.
2. **Core CRUD:** add, edit, list and delete subscriptions; preset services seeded.
3. **Home summary:** monthly KES total, upcoming charges, category breakdown; FX rate job.
4. **Reminders + trials:** daily reminder job, push and email delivery, trial conversion alerts.
5. **Dogfood:** Ethan's real subscriptions entered, APK on his phone, web on Vercel; fix what annoys.
6. **Public-ready:** onboarding, CSV export, account deletion, privacy policy, Play Store internal testing.

## Later and decisions

**v2 candidates:** paste-an-M-Pesa-message parsing, Gmail receipt import, "I paid" logging with a charges table, shared/family subscriptions, home-screen widget, Swahili localisation.

**Decisions**

- [x] App name (working title: Subscription Tracker) We can work with whatever for now
- [x] Which FX rate source: a free API, or Central Bank of Kenya published rates? Free API
- [x] Should reminders respect quiet hours? Not necessarily
- [x] Monetisation once public: free, one-time unlock, or a small M-Pesa subscription? We will cross this bridge when we get there
