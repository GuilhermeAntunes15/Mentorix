import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { formatLongDate } from '@/utils/date';

export function DayNavigator({
  date,
  onPrevious,
  onNext,
  onToday
}: {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 24,
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      <div style={{ minWidth: 0 }}>
        <span style={{ color: '#7dd3fc', fontWeight: 700 }}>Dia em foco</span>
        <h2 style={{ margin: '0.25rem 0 0', wordBreak: 'break-word' }}>{formatLongDate(date)}</h2>
      </div>

      <div className="day-navigator-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="ghost" onClick={onPrevious}>
          <ChevronLeft size={18} /> Anterior
        </Button>
        <Button variant="secondary" onClick={onToday}>
          Hoje
        </Button>
        <Button variant="ghost" onClick={onNext}>
          Proximo <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
