import { addDays, format, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
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

export function shiftDate(date: string, amount: number) {
  return toISODate(addDays(parseISO(date), amount));
}

export function isPastDate(date: string) {
  return isBefore(startOfDay(parseISO(date)), startOfDay(new Date()));
}

export function sameDate(left: string, right: string) {
  return isSameDay(parseISO(left), parseISO(right));
}
