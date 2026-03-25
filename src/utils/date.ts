import { addDays, endOfMonth, format, isBefore, isSameDay, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatLongDate(date: Date | string) {
  const value = typeof date === 'string' ? parseISO(date) : date;
  return format(value, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

export function formatShortDate(date: Date | string) {
  const value = typeof date === 'string' ? parseISO(date) : date;
  return format(value, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatMonthTitle(date: Date | string) {
  const value = typeof date === 'string' ? parseISO(date) : date;
  return format(value, 'MMMM yyyy', { locale: ptBR });
}

export function toISODate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function toISOMonth(date: Date) {
  return format(date, 'yyyy-MM');
}

export function shiftDate(date: string, amount: number) {
  return toISODate(addDays(parseISO(date), amount));
}

export function isPastDate(date: string) {
  return isBefore(startOfDay(parseISO(date)), startOfDay(new Date()));
}

export function sameDate(left: string, right: string) {
  return isSameDay(parseISO(left), parseISO(right));
}

export function getMonthDateRange(month: string) {
  const [year, monthIndex] = month.split('-').map(Number);
  const start = startOfMonth(new Date(year, (monthIndex || 1) - 1, 1));
  const end = endOfMonth(start);
  return { start, end };
}

export function listDatesForWeekdayInMonth(month: string, weekday: number) {
  const { start, end } = getMonthDateRange(month);
  const dates: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    if (cursor.getDay() === weekday) {
      dates.push(toISODate(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}
