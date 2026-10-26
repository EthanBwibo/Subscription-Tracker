import { addDays, addMonths } from '@/lib/dates';
import type { Enums, Tables } from '@/types/database';

export type Subscription = Tables<'subscriptions'>;
export type CycleUnit = Enums<'cycle_unit'>;

type Cycle = Pick<Subscription, 'cycle_unit' | 'cycle_count'>;

// The billing date `steps` cycles after (or before, if negative) `date`.
export function shiftByCycles(date: string, { cycle_unit, cycle_count }: Cycle, steps: number): string {
  const n = cycle_count * steps;
  switch (cycle_unit) {
    case 'day':
      return addDays(date, n);
    case 'week':
      return addDays(date, n * 7);
    case 'month':
      return addMonths(date, n);
    case 'year':
      return addMonths(date, n * 12);
  }
}

const CYCLES_PER_YEAR: Record<CycleUnit, number> = { day: 365, week: 52, month: 12, year: 1 };

export function yearlyCost(sub: Pick<Subscription, 'amount' | 'cycle_unit' | 'cycle_count'>): number {
  return (sub.amount * CYCLES_PER_YEAR[sub.cycle_unit]) / sub.cycle_count;
}

// Spread cost per month: a yearly plan counts as amount / 12.
export function monthlyCost(sub: Pick<Subscription, 'amount' | 'cycle_unit' | 'cycle_count'>): number {
  return yearlyCost(sub) / 12;
}

// Stored next_billing_date can go stale until the M4 job rolls it forward, so step it to today or later.
// Each step is taken from the stored date so month-end clamping doesn't drift.
export function nextChargeDate(sub: Subscription, today: string): string {
  if (sub.next_billing_date >= today) return sub.next_billing_date;
  for (let k = 1; ; k++) {
    const date = shiftByCycles(sub.next_billing_date, sub, k);
    if (date >= today) return date;
  }
}

// Past charges derived from start_date and the cycle (not stored in v1), newest first.
// Steps are taken from the stored next_billing_date, like nextChargeDate, so month-end dates line up.
export function pastCharges(sub: Subscription, today: string, limit = 12): string[] {
  const dates: string[] = [];
  // Charges between a stale stored date and today...
  for (let k = 0; ; k++) {
    const date = shiftByCycles(sub.next_billing_date, sub, k);
    if (date >= today) break;
    dates.unshift(date);
  }
  // ...then earlier ones back to start_date.
  for (let k = -1; dates.length < limit; k--) {
    const date = shiftByCycles(sub.next_billing_date, sub, k);
    if (date < sub.start_date) break;
    dates.push(date);
  }
  return dates.slice(0, limit);
}
