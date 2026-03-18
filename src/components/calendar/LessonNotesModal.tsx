import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { lessonNotesRepository } from '@/services/repositories';
import type { DayLessonView } from '@/types';

export function LessonNotesModal({
  open,
  professorId,
  lesson,
  onClose
}: {
  open: boolean;
  professorId: string;
  lesson: DayLessonView | null;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    if (!lesson) {
      return '';
    }

    return `${lesson.dataReferencia} • ${lesson.aula.horaInicio} - ${lesson.aula.horaFim} • ${lesson.materia?.nome ?? lesson.aula.titulo}`;
  }, [lesson]);

  useEffect(() => {
    async function load() {
      if (!open || !lesson) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const note = await lessonNotesRepository.getByLessonAndDate(
          professorId,
          lesson.aula.id,
          lesson.dataReferencia
        );
        setValue(note?.conteudoHtml ?? '');
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar as anotacoes.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [lesson, open, professorId]);

  async function handleSave() {
    if (!lesson) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await lessonNotesRepository.saveForLesson(
        professorId,
        lesson.aula.id,
        lesson.dataReferencia,
        value
      );
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel salvar as anotacoes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      fullScreen
      title={lesson ? `Anotacoes de ${lesson.aula.titulo}` : 'Anotacoes'}
      subtitle={subtitle}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button onClick={() => void handleSave()} disabled={!lesson || saving}>
            {saving ? 'Salvando...' : 'Salvar anotacoes'}
          </Button>
        </>
      }
    >
      <div className="lesson-notes-modal-body">
        {loading && <LoadingState label="Abrindo anotacoes da aula..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (
          <RichTextEditor
            value={value}
            onChange={setValue}
            placeholder="Planeje a aula do dia, registre objetivos, materiais, combinados e observacoes importantes."
          />
        )}
      </div>
    </Modal>
  );
}
