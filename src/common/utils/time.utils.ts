const MULTIPLIERS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

export function parseTtlToSeconds(
  ttl: string,
  fallbackSeconds: number,
): number {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return fallbackSeconds;
  return parseInt(match[1], 10) * (MULTIPLIERS[match[2]] ?? 1);
}
