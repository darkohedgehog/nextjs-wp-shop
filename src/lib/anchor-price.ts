export type AnchorPrice = { status: 'recorded'; amount: string; referenceDate: string; currency: 'EUR' };
export function parseAnchorPrice(value: unknown): AnchorPrice | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const p = value as Record<string, unknown>;
  if (p.status !== 'recorded' || p.currency !== 'EUR' || typeof p.amount !== 'string' || !/^\d{1,9}\.\d{2}$/.test(p.amount) || typeof p.referenceDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.referenceDate)) return undefined;
  const date = new Date(`${p.referenceDate}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== p.referenceDate) return undefined;
  return { status: 'recorded', amount: p.amount, referenceDate: p.referenceDate, currency: 'EUR' };
}
