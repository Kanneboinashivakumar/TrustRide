export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatRelativeTime(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatPercentage(n: number): string {
  return `${n > 0 ? '+' : ''}${n}%`;
}

export function formatVin(vin: string): string {
  if (vin.length !== 17) return vin;
  return `${vin.slice(0, 3)}-${vin.slice(3, 8)}-${vin.slice(8)}`;
}

export function truncateHash(hash: string, chars: number = 6): string {
  if (!hash || hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function formatBattery(level: number): string {
  return `${level}%`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
