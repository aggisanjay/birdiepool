export function formatCurrency(cents: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const d = new Date(date);
  if (format === 'relative') {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMatchType(type: string): string {
  const map: Record<string, string> = {
    match_5: '5-Number Match',
    match_4: '4-Number Match',
    match_3: '3-Number Match',
  };
  return map[type] ?? type;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-GB').format(n);
}
