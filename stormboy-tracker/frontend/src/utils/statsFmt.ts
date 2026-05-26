// Stats formatters — mirror v2-stats.js fmt helpers.

export function fmtPct(x: number | null | undefined, digits = 1): string {
  if (x === null || x === undefined) return '—';
  return x.toFixed(digits) + '%';
}

export function fmtPctFrac(x: number | null | undefined, digits = 1): string {
  // Server emits already-multiplied percentages (e.g. 47.3 = 47.3%). Some
  // endpoints emit fractions (0.473). Use fmtPctFrac for the fraction form.
  if (x === null || x === undefined) return '—';
  return (x * 100).toFixed(digits) + '%';
}

export function fmtPp(x: number | null | undefined): string {
  if (x === null || x === undefined) return '—';
  const sign = x > 0 ? '+' : '';
  return `${sign}${x.toFixed(1)}pp`;
}

export function fmtDays(x: number | null | undefined): string {
  if (x === null || x === undefined) return '—';
  return Math.round(x) + 'd';
}

export function fmtNum(x: number | null | undefined): string {
  if (x === null || x === undefined) return '—';
  return x.toLocaleString();
}

export function fmtHa(x: number | null | undefined): string {
  if (x === null || x === undefined) return '—';
  return Math.round(x).toLocaleString() + 'ha';
}

export function fmtIsoDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, opts);
  } catch {
    return '—';
  }
}

export function trendTone(trend?: 'good' | 'bad' | 'flat' | null): 'green' | 'red' | 'gray' {
  if (trend === 'good') return 'green';
  if (trend === 'bad') return 'red';
  return 'gray';
}

export function trendArrow(trend?: 'good' | 'bad' | 'flat' | null): string {
  if (trend === 'good') return '↑';
  if (trend === 'bad') return '↓';
  return '→';
}
