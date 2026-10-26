// Calendar dates are 'YYYY-MM-DD' strings, matching Postgres `date`. Arithmetic runs in UTC so it never shifts a day.

export const DEFAULT_TIMEZONE = 'Africa/Nairobi';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  return toIsoDate(fromIsoDate(value)) === value;
}

function fromIsoDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Today in the given timezone, e.g. '2026-10-26'.
export function todayIn(timeZone = DEFAULT_TIMEZONE): string {
  try {
    // en-CA formats as YYYY-MM-DD.
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch {
    const now = new Date();
    return toIsoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
  }
}

export function addDays(value: string, days: number): string {
  const date = fromIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

// Adds months, clamping to the end of the month (Jan 31 + 1 month = Feb 28/29).
export function addMonths(value: string, months: number): string {
  const [y, m, d] = value.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return toIsoDate(target);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((fromIsoDate(to).getTime() - fromIsoDate(from).getTime()) / 86_400_000);
}

// '26 Oct 2026'
export function formatDate(value: string): string {
  return fromIsoDate(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// Native pickers work in local Dates; these keep the calendar day intact both ways.
export function isoToLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function localDateToIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
