import type { DateFieldProps } from './DateField';

// Web date field: the browser's own <input type="date">, whose value is already 'YYYY-MM-DD'.
export function DateField({ value, onChange }: DateFieldProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-white dark:[color-scheme:dark]"
    />
  );
}
