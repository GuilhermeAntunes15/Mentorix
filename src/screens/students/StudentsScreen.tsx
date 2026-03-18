import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor } from '@/hooks';
import { classesRepository, studentClassRepository, studentsRepository } from '@/services/repositories';

export function StudentsScreen() {
  const { professorId } = useProfessor();
  const students = useCollectionResource(professorId, studentsRepository);
  const relations = useCollectionResource(professorId, studentClassRepository);
  const classes = useCollectionResource(professorId, classesRepository);
  const [classFilterId, setClassFilterId] = useState('');

  const orderedStudents = useMemo(
    () => [...students.items].sort((left, right) => left.nome.localeCompare(right.nome)),
    [students.items]
  );
  const orderedClasses = useMemo(
    () => [...classes.items].sort((left, right) => left.nome.localeCompare(right.nome)),
    [classes.items]
  );
  const filteredStudents = useMemo(() => {
    if (!classFilterId) {
      return orderedStudents;
    }

    const activeStudentIds = new Set(
      relations.items
        .filter((relation) => relation.turmaId === classFilterId && relation.ativo)
        .map((relation) => relation.alunoId)
    );

    return orderedStudents.filter((student) => activeStudentIds.has(student.id));
  }, [classFilterId, orderedStudents, relations.items]);
  const selectedFilterClass = orderedClasses.find((item) => item.id === classFilterId);

  return (
    <>
      <PageHeader
        eyebrow="Alunos sincronizados"
        title="Alunos da sua rotina"
        description="O admin define aluno e turma. Aqui voce acompanha a lista, filtra por turma e abre os detalhes individuais."
      />

      {students.loading && <LoadingState label="Carregando alunos..." />}
      {students.error && <ErrorState message={students.error} />}
      {!students.loading && !orderedStudents.length && (
        <EmptyState
          title="Nenhum aluno sincronizado"
          description="Assim que o admin cadastrar alunos com turma, eles aparecerao automaticamente nesta tela."
        />
      )}
      {!students.loading && !!orderedStudents.length && (
        <Card title="Filtro por turma" subtitle="Mostre apenas os alunos vinculados a uma turma especifica.">
          <Select
            label="Turma"
            value={classFilterId}
            onChange={(event) => setClassFilterId(event.target.value)}
            options={[
              { value: '', label: 'Todas as turmas' },
              ...orderedClasses.map((item) => ({ value: item.id, label: item.nome }))
            ]}
          />
        </Card>
      )}
      {!students.loading && !!orderedStudents.length && !filteredStudents.length && (
        <EmptyState
          title="Nenhum aluno nesta turma"
          description={`Nao encontramos alunos ativos vinculados a ${selectedFilterClass?.nome ?? 'esta turma'}.`}
        />
      )}

      <div className="responsive-grid">
        {filteredStudents.map((student) => {
          const relationsForStudent = relations.items.filter((relation) => relation.alunoId === student.id && relation.ativo);
          return (
            <Card key={student.id} title={student.nome} subtitle={student.email || 'Sem email cadastrado'}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {relationsForStudent.length ? (
                  relationsForStudent.map((relation) => {
                    const turma = classes.items.find((item) => item.id === relation.turmaId);
                    return <Badge key={relation.id}>{turma?.nome ?? 'Turma vinculada'}</Badge>;
                  })
                ) : (
                  <Badge tone="warning">Sem turmas</Badge>
                )}
              </div>
              <p style={{ margin: 0, color: '#94a3b8' }}>{student.observacoes || 'Sem observacoes.'}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to={`/alunos/${student.id}`}>
                  <Button>Detalhes do aluno</Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
