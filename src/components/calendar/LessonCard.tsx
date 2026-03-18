import { BookText, Clock3, MapPin } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { hexToRgba } from '@/utils/color';
import type { DayLessonView } from '@/types';

function getAttendanceTone(status: 'nao_iniciada' | 'em_andamento' | 'concluida') {
  switch (status) {
    case 'concluida':
      return 'success';
    case 'em_andamento':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function LessonCard({
  item,
  onOpenNotes
}: {
  item: DayLessonView;
  onOpenNotes: () => void;
}) {
  const attendanceStatus = item.chamada?.status ?? 'nao_iniciada';
  const isManagement = item.aula.categoria === 'gestao';
  const subjectColor = item.materia?.cor;
  const lessonCardStyle = !isManagement && subjectColor
    ? {
        background: `linear-gradient(135deg, ${hexToRgba(subjectColor, 0.24)} 0%, rgba(11, 16, 32, 0.86) 46%, rgba(11, 16, 32, 0.7) 100%)`,
        border: `1px solid ${hexToRgba(subjectColor, 0.34)}`
      }
    : undefined;

  return (
    <Card
      style={lessonCardStyle}
      title={item.aula.titulo}
      subtitle={
        isManagement
          ? `${item.aula.gestaoTipo ?? 'Gestao'} - ${item.aula.escola ?? 'Escola'}`
          : `${item.materia?.nome ?? 'Materia'} - ${item.turma?.nome ?? 'Turma'}`
      }
      actions={
        <Badge tone={isManagement ? 'info' : getAttendanceTone(attendanceStatus)}>
          {isManagement ? 'gestao' : attendanceStatus.replaceAll('_', ' ')}
        </Badge>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock3 size={16} /> {item.aula.horaInicio} - {item.aula.horaFim}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={16} /> {item.aula.escola ?? item.aula.sala ?? 'Escola a definir'}
        </span>
      </div>

      {item.aula.descricao && <p style={{ margin: 0, color: '#cbd5e1' }}>{item.aula.descricao}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button
          variant="secondary"
          onClick={(event) => {
            event.stopPropagation();
            onOpenNotes();
          }}
        >
          <BookText size={18} /> Anotacoes
        </Button>
      </div>
    </Card>
  );
}
