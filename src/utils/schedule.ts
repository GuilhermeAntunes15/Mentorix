import { addDays, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toISODate } from '@/utils/date';

export type SchoolKey = 'antonio_pratici' | 'mauricio_goulart';

export interface SchoolTimeSlot {
  id: string;
  start: string;
  end: string;
  label: string;
  schoolKey: SchoolKey;
  schoolName: string;
}

export interface WeekDayOption {
  isoDate: string;
  label: string;
  shortLabel: string;
  weekday: number;
}

const antonioPraticiSlots: SchoolTimeSlot[] = [
  { id: 'ap-1', start: '07:00', end: '07:50', label: '07:00 - 07:50', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' },
  { id: 'ap-2', start: '07:50', end: '08:40', label: '07:50 - 08:40', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' },
  { id: 'ap-3', start: '08:40', end: '09:30', label: '08:40 - 09:30', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' },
  { id: 'ap-4', start: '09:30', end: '10:20', label: '09:30 - 10:20', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' },
  { id: 'ap-5', start: '10:40', end: '11:30', label: '10:40 - 11:30', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' },
  { id: 'ap-6', start: '11:30', end: '12:20', label: '11:30 - 12:20', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' },
  { id: 'ap-7', start: '12:20', end: '13:10', label: '12:20 - 13:10', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' },
  { id: 'ap-8', start: '13:10', end: '14:00', label: '13:10 - 14:00', schoolKey: 'antonio_pratici', schoolName: 'Antonio Pratici' }
];

const mauricioGoulartSlots: SchoolTimeSlot[] = [
  { id: 'mg-1', start: '14:30', end: '15:20', label: '14:30 - 15:20', schoolKey: 'mauricio_goulart', schoolName: 'Mauricio Goulart' },
  { id: 'mg-2', start: '15:20', end: '16:10', label: '15:20 - 16:10', schoolKey: 'mauricio_goulart', schoolName: 'Mauricio Goulart' },
  { id: 'mg-3', start: '16:25', end: '17:15', label: '16:25 - 17:15', schoolKey: 'mauricio_goulart', schoolName: 'Mauricio Goulart' },
  { id: 'mg-4', start: '17:15', end: '18:05', label: '17:15 - 18:05', schoolKey: 'mauricio_goulart', schoolName: 'Mauricio Goulart' }
];

export const schoolOptions = [
  { value: 'antonio_pratici', label: 'Antonio Pratici' },
  { value: 'mauricio_goulart', label: 'Mauricio Goulart' }
] as const;

export const schoolSlotMap: Record<SchoolKey, SchoolTimeSlot[]> = {
  antonio_pratici: antonioPraticiSlots,
  mauricio_goulart: mauricioGoulartSlots
};

export function getWeekDays(anchorDate: string) {
  const monday = startOfWeek(new Date(`${anchorDate}T12:00:00`), { weekStartsOn: 1 });
  return Array.from({ length: 5 }, (_, index) => {
    const date = addDays(monday, index);
    return {
      isoDate: toISODate(date),
      label: format(date, "EEEE, dd 'de' MMM", { locale: ptBR }),
      shortLabel: format(date, 'EEE dd/MM', { locale: ptBR }),
      weekday: date.getDay()
    } satisfies WeekDayOption;
  });
}

export function getSlotById(schoolKey: SchoolKey, slotId: string) {
  return schoolSlotMap[schoolKey].find((slot) => slot.id === slotId);
}
