const numberFormat = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// 'KES 1,100' / 'USD 20.5'. Conversion to KES happens in M3 via fx_rates.
export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${numberFormat.format(amount)}`;
}

// Parses user input like '1,100.50'. Returns null for anything that isn't a non-negative number.
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}
