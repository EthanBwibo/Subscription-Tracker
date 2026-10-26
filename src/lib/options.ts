import type { CycleUnit } from '@/lib/billing';
import type { Enums } from '@/types/database';

export type Option<T> = { value: T; label: string };

// Matches services.category in the seed migration.
export const CATEGORIES: Option<string>[] = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'music', label: 'Music' },
  { value: 'tv', label: 'TV' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'internet', label: 'Internet' },
  { value: 'ai', label: 'AI' },
  { value: 'software', label: 'Software' },
  { value: 'storage', label: 'Cloud storage' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_METHODS: Option<Enums<'payment_method'>>[] = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card', label: 'Card' },
  { value: 'carrier_billing', label: 'Carrier billing' },
  { value: 'bank', label: 'Bank' },
];

export const CURRENCIES: Option<string>[] = ['KES', 'USD', 'EUR', 'GBP'].map((c) => ({ value: c, label: c }));

export const STATUSES: Option<Enums<'subscription_status'>>[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];

// null = use the profile default.
export const REMINDERS: Option<number | null>[] = [
  { value: null, label: 'Default' },
  { value: 0, label: 'Same day' },
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '7 days before' },
];

// Billing cycles from the spec. Quarterly = 3 months, custom = every N days.
export type CyclePreset = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export const CYCLE_PRESETS: Option<CyclePreset>[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

const PRESET_CYCLES: Record<Exclude<CyclePreset, 'custom'>, { cycle_unit: CycleUnit; cycle_count: number }> = {
  weekly: { cycle_unit: 'week', cycle_count: 1 },
  monthly: { cycle_unit: 'month', cycle_count: 1 },
  quarterly: { cycle_unit: 'month', cycle_count: 3 },
  yearly: { cycle_unit: 'year', cycle_count: 1 },
};

export function cycleFromPreset(preset: CyclePreset, customDays: number) {
  return preset === 'custom' ? { cycle_unit: 'day' as const, cycle_count: customDays } : PRESET_CYCLES[preset];
}

export function presetFromCycle(cycle_unit: CycleUnit, cycle_count: number): CyclePreset {
  const match = (Object.keys(PRESET_CYCLES) as (keyof typeof PRESET_CYCLES)[]).find(
    (p) => PRESET_CYCLES[p].cycle_unit === cycle_unit && PRESET_CYCLES[p].cycle_count === cycle_count,
  );
  return match ?? 'custom';
}

// Custom cycles are stored in days, but older or hand-made rows may use other units.
export function customDaysFromCycle(cycle_unit: CycleUnit, cycle_count: number): number {
  return cycle_count * { day: 1, week: 7, month: 30, year: 365 }[cycle_unit];
}

const UNIT_NAMES: Record<CycleUnit, string> = { day: 'day', week: 'week', month: 'month', year: 'year' };

export function cycleLabel(cycle_unit: CycleUnit, cycle_count: number): string {
  const preset = presetFromCycle(cycle_unit, cycle_count);
  if (preset !== 'custom') return CYCLE_PRESETS.find((p) => p.value === preset)!.label;
  return `Every ${cycle_count} ${UNIT_NAMES[cycle_unit]}${cycle_count === 1 ? '' : 's'}`;
}

export function labelFor<T>(options: Option<T>[], value: T): string | undefined {
  return options.find((o) => o.value === value)?.label;
}
