import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export const VN_TZ_OFFSET = 7 * 60; // UTC+7 in minutes

/** Get current ISO string in UTC */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Format date string to Vietnamese display format */
export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'dd/MM/yyyy', { locale: vi });
  } catch {
    return iso;
  }
}

/** Format date to short display */
export function formatDateShort(iso: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'dd/MM', { locale: vi });
  } catch {
    return iso;
  }
}

/** Format datetime string to Vietnamese display */
export function formatDateTime(iso: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'HH:mm dd/MM/yyyy', { locale: vi });
  } catch {
    return iso;
  }
}

/** Get YYYY-MM string for a date */
export function getYearMonth(iso: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'yyyy-MM');
  } catch {
    return '';
  }
}

/** Check if a date is overdue */
export function isOverdue(dueDateISO: string): boolean {
  if (!dueDateISO) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateISO);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/** Check if due date is today */
export function isDueToday(dueDateISO: string): boolean {
  if (!dueDateISO) return false;
  const today = new Date();
  const due = new Date(dueDateISO);
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

/** Get an array of the last N months as { label, value } (only from July 2026 onwards) */
export function getRecentMonths(n: number = 12): { label: string; value: string }[] {
  const months = [];
  const now = new Date();
  const limitDate = new Date(2026, 6, 1); // July 2026 (month is 0-indexed)
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    if (d < limitDate) break;
    months.push({
      label: format(d, 'MM/yyyy'),
      value: format(d, 'yyyy-MM'),
    });
  }
  return months;
}
