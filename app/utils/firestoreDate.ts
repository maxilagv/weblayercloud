export type FirestoreDateLike =
  | Date
  | string
  | number
  | null
  | undefined
  | {
      toDate?: () => Date;
      seconds?: number;
    };

export function toDate(value: FirestoreDateLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function toMillis(value: FirestoreDateLike): number {
  return toDate(value)?.getTime() ?? 0;
}
