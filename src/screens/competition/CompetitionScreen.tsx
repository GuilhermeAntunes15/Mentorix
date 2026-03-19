import { Crown, Medal, Pencil, Plus, Shield, Sparkles, Target, Trash2, Trophy, Users, Zap } from 'lucide-react';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { TextArea } from '@/components/common/TextArea';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor, useSession } from '@/hooks';
import {
  activitiesRepository,
  activityDeliveriesRepository,
  classesRepository,
  competitionCompaniesRepository,
  competitionMembersRepository,
  quizAttemptsRepository,
  quizzesRepository,
  studentClassRepository,
  studentsRepository
} from '@/services/repositories';
import { buildCompetitionStandings } from '@/utils/competition';
import type {
  CompetitionViewMode,
  EmpresaCompeticaoEntity,
  EmpresaCompeticaoFormValues,
  MembroEmpresaCompeticaoEntity
} from '@/types';

const initialCompanyForm: EmpresaCompeticaoFormValues = {
  turmaId: '',
  nome: '',
  cor: '#f59e0b',
  liderAlunoId: '',
  pontosComportamento: 100,
  pontosExtras: 0,
  observacoes: ''
};

function scoreDescription(score: number, max: number, emptyLabel: string) {
  if (!max) {
    return emptyLabel;
  }

  return `${score}/${max} pts`;
}

export function CompetitionScreen() {
  const { professorId } = useProfessor();
  const { session } = useSession();
  const [mode, setMode] = useState<CompetitionViewMode>(session?.role === 'aluno' ? 'aluno' : 'professor');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<EmpresaCompeticaoEntity | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [memberStudentId, setMemberStudentId] = useState('');
  const [companyForm, setCompanyForm] = useState<EmpresaCompeticaoFormValues>(initialCompanyForm);

  const classes = useCollectionResource(professorId, classesRepository);
  const students = useCollectionResource(professorId, studentsRepository);
  const relations = useCollectionResource(professorId, studentClassRepository);
  const companies = useCollectionResource(professorId, competitionCompaniesRepository);
  const companyMembers = useCollectionResource(professorId, competitionMembersRepository);
  const activities = useCollectionResource(professorId, activitiesRepository);
  const activityDeliveries = useCollectionResource(professorId, activityDeliveriesRepository);
  const quizzes = useCollectionResource(professorId, quizzesRepository);
  const quizAttempts = useCollectionResource(professorId, quizAttemptsRepository);

  const orderedClasses = useMemo(
    () => {
      const classIdsForStudent = relations.items
        .filter((relation) => relation.alunoId === session?.alunoId && relation.ativo)
        .map((relation) => relation.turmaId);

      const base = session?.role === 'aluno'
        ? classes.items.filter((item) => classIdsForStudent.includes(item.id))
        : classes.items;

      return [...base].sort((left, right) => left.nome.localeCompare(right.nome));
    },
    [classes.items, relations.items, session?.alunoId, session?.role]
  );

  useEffect(() => {
    if (!selectedClassId && orderedClasses.length) {
      setSelectedClassId(orderedClasses[0].id);
    }
  }, [orderedClasses, selectedClassId]);

  const selectedClass = orderedClasses.find((item) => item.id === selectedClassId);
  const studentIdsInClass = useMemo(
    () =>
      relations.items
        .filter((relation) => relation.turmaId === selectedClassId && relation.ativo)
        .map((relation) => relation.alunoId),
    [relations.items, selectedClassId]
  );
  const studentsInClass = useMemo(
    () =>
      students.items
        .filter((student) => studentIdsInClass.includes(student.id))
        .sort((left, right) => left.nome.localeCompare(right.nome)),
    [studentIdsInClass, students.items]
  );
  const companiesInClass = useMemo(
    () => companies.items.filter((company) => company.turmaId === selectedClassId),
    [companies.items, selectedClassId]
  );
  const membersInClass = useMemo(
    () =>
      companyMembers.items.filter((member) =>
        companiesInClass.some((company) => company.id === member.empresaId)
      ),
    [companiesInClass, companyMembers.items]
  );
  const activitiesInClass = useMemo(
    () => activities.items.filter((activity) => activity.turmaId === selectedClassId),
    [activities.items, selectedClassId]
  );
  const quizzesInClass = useMemo(
    () => quizzes.items.filter((quiz) => quiz.turmaId === selectedClassId),
    [quizzes.items, selectedClassId]
  );
  const standings = useMemo(
    () =>
      buildCompetitionStandings({
        empresas: companiesInClass,
        membros: membersInClass,
        alunos: studentsInClass,
        atividades: activitiesInClass,
        entregas: activityDeliveries.items,
        quizzes: quizzesInClass,
        tentativas: quizAttempts.items
      }),
    [
      activitiesInClass,
      activityDeliveries.items,
      companiesInClass,
      membersInClass,
      quizAttempts.items,
      quizzesInClass,
      studentsInClass
    ]
  );
  const viewerStanding = useMemo(() => {
    if (session?.alunoId) {
      return standings.find((standing) => standing.alunos.some((student) => student.id === session.alunoId)) ?? null;
    }

    return standings[0] ?? null;
  }, [session?.alunoId, standings]);
  const podiumStandings = standings.slice(0, 3);
  const leagueStandings = standings.slice(3);

  const selectedStanding = standings.find((standing) => standing.empresa.id === selectedCompanyId) ?? null;
  const assignedStudentIds = useMemo(
    () =>
      membersInClass
        .filter((member) => member.empresaId !== selectedCompanyId)
        .map((member) => member.alunoId),
    [membersInClass, selectedCompanyId]
  );
  const availableStudentsForCompany = useMemo(
    () =>
      studentsInClass.filter(
        (student) =>
          !assignedStudentIds.includes(student.id) &&
          !selectedStanding?.membros.some((member) => member.alunoId === student.id)
      ),
    [assignedStudentIds, selectedStanding?.membros, studentsInClass]
  );

  const loading =
    classes.loading ||
    students.loading ||
    relations.loading ||
    companies.loading ||
    companyMembers.loading ||
    activities.loading ||
    activityDeliveries.loading ||
    quizzes.loading ||
    quizAttempts.loading;
  const error =
    classes.error ||
    students.error ||
    relations.error ||
    companies.error ||
    companyMembers.error ||
    activities.error ||
    activityDeliveries.error ||
    quizzes.error ||
    quizAttempts.error;

  function openCreateCompany() {
    setEditingCompany(null);
    setCompanyForm({
      ...initialCompanyForm,
      turmaId: selectedClassId,
      cor: selectedClass?.cor ?? '#f59e0b'
    });
    setCompanyFormOpen(true);
  }

  function openEditCompany(company: EmpresaCompeticaoEntity) {
    setEditingCompany(company);
    setCompanyForm({
      turmaId: company.turmaId,
      nome: company.nome,
      cor: company.cor,
      liderAlunoId: company.liderAlunoId ?? '',
      pontosComportamento: company.pontosComportamento,
      pontosExtras: company.pontosExtras,
      observacoes: company.observacoes ?? ''
    });
    setCompanyFormOpen(true);
  }

  async function handleSubmitCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...companyForm,
      turmaId: selectedClassId
    };

    if (editingCompany) {
      await companies.updateItem(editingCompany.id, payload);
    } else {
      await companies.createItem(payload);
    }

    setCompanyFormOpen(false);
    setEditingCompany(null);
    setCompanyForm(initialCompanyForm);
  }

  async function handleDeleteCompany(company: EmpresaCompeticaoEntity) {
    const relatedMembers = companyMembers.items.filter((member) => member.empresaId === company.id);
    await Promise.all(relatedMembers.map((member) => companyMembers.removeItem(member.id)));
    await companies.removeItem(company.id);

    if (selectedCompanyId === company.id) {
      setSelectedCompanyId(null);
    }
  }

  async function handleAdjustCompany(company: EmpresaCompeticaoEntity, patch: Partial<EmpresaCompeticaoEntity>) {
    await companies.updateItem(company.id, patch);
  }

  async function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStanding || !memberStudentId) {
      return;
    }

    await companyMembers.createItem({
      empresaId: selectedStanding.empresa.id,
      turmaId: selectedStanding.empresa.turmaId,
      alunoId: memberStudentId
    });
    setMemberStudentId('');
    setMemberModalOpen(false);
  }

  async function handleRemoveMember(member: MembroEmpresaCompeticaoEntity) {
    await companyMembers.removeItem(member.id);

    if (selectedStanding?.empresa.liderAlunoId === member.alunoId) {
      await companies.updateItem(selectedStanding.empresa.id, { liderAlunoId: '' });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Competicao por turma"
        title="Empresas, ranking e pontuacao"
        description="Organize equipes por turma, acompanhe desempenho automatico e ajuste comportamento e pontos extras ao longo das aulas."
        actions={
          mode === 'professor' && session?.role === 'professor' && selectedClassId ? (
            <Button onClick={openCreateCompany}>
              <Plus size={18} /> Nova empresa
            </Button>
          ) : undefined
        }
      />

      {session?.role === 'professor' && (
        <Card title="Modo de visualizacao" subtitle="Alterne entre gestao do professor e painel do aluno.">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant={mode === 'professor' ? 'primary' : 'secondary'} onClick={() => setMode('professor')}>
              Professor
            </Button>
            <Button variant={mode === 'aluno' ? 'primary' : 'secondary'} onClick={() => setMode('aluno')}>
              Aluno
            </Button>
          </div>
        </Card>
      )}

      <Card title="Turma da competicao" subtitle="Cada turma possui suas proprias empresas e ranking.">
        <Select
          label="Turma"
          value={selectedClassId}
          onChange={(event) => setSelectedClassId(event.target.value)}
          options={[
            { value: '', label: 'Selecione uma turma' },
            ...orderedClasses.map((item) => ({ value: item.id, label: item.nome }))
          ]}
        />
      </Card>

      {loading && <LoadingState label="Carregando dados da competicao..." />}
      {error && <ErrorState message={error} />}
      {!loading && !selectedClassId && (
        <EmptyState title="Selecione uma turma" description="Escolha uma turma para montar empresas e ver o ranking." />
      )}

      {!loading && !error && selectedClassId && mode === 'professor' && !companiesInClass.length && (
        <EmptyState
          title="Nenhuma empresa criada"
          description="Crie a primeira empresa da turma para iniciar a competicao."
        />
      )}

      {!loading && !error && selectedClassId && mode === 'professor' && !!companiesInClass.length && (
        <section className="responsive-grid">
          {standings.map((standing, index) => (
            <Card
              key={standing.empresa.id}
              style={{
                background: `linear-gradient(135deg, ${standing.empresa.cor}33 0%, rgba(11, 16, 32, 0.88) 56%, rgba(11, 16, 32, 0.72) 100%)`,
                border: `1px solid ${standing.empresa.cor}44`
              }}
              title={standing.empresa.nome}
              subtitle={`${index + 1}o lugar • ${selectedClass?.nome ?? 'Turma'}`}
              actions={<Badge tone="success">{standing.pontuacao.total} pts</Badge>}
            >
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Badge tone="info">{standing.alunos.length} integrante(s)</Badge>
                {standing.lider && <Badge tone="warning"><Crown size={14} /> Lider: {standing.lider.nome}</Badge>}
              </div>

              <div style={{ display: 'grid', gap: '0.5rem', color: '#cbd5e1' }}>
                <span>{scoreDescription(standing.pontuacao.atividadesEquipe, 10, 'Sem atividades')}</span>
                <span>{scoreDescription(standing.pontuacao.quizzesFeitos, 10, 'Sem quizzes')}</span>
                <span>Comportamento: {standing.pontuacao.comportamento} pts</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => setSelectedCompanyId(standing.empresa.id)}>
                  Ver analise
                </Button>
                <Button variant="ghost" onClick={() => openEditCompany(standing.empresa)}>
                  <Pencil size={16} /> Editar
                </Button>
                <Button variant="danger" onClick={() => void handleDeleteCompany(standing.empresa)}>
                  <Trash2 size={16} /> Excluir
                </Button>
              </div>
            </Card>
          ))}
        </section>
      )}

      {!loading && !error && selectedClassId && mode === 'aluno' && !standings.length && (
        <EmptyState
          title="Ranking indisponivel"
          description="Ainda nao existem empresas cadastradas para esta turma."
        />
      )}

      {!loading && !error && selectedClassId && mode === 'aluno' && !!standings.length && (
        <section className="competition-student-shell">
          <Card
            className="competition-hero-card"
            style={{
              background: `linear-gradient(140deg, ${viewerStanding?.empresa.cor ?? '#7dd3fc'}35 0%, rgba(11, 16, 32, 0.96) 52%, rgba(8, 15, 31, 0.92) 100%)`,
              border: `1px solid ${viewerStanding?.empresa.cor ?? '#7dd3fc'}55`
            }}
            title={viewerStanding ? `Sua torcida: ${viewerStanding.empresa.nome}` : 'Arena da competicao'}
            subtitle={
              viewerStanding
                ? `Acompanhe a disputa da ${selectedClass?.nome ?? 'turma'} e veja em quais frentes sua equipe pode crescer.`
                : 'Veja quem lidera a temporada e quais equipes estao dominando a turma.'
            }
            actions={<Badge tone="warning"><Trophy size={14} /> {viewerStanding?.pontuacao.total ?? 0} pts</Badge>}
          >
            <div className="competition-hero-grid">
              <div className="competition-hero-highlight">
                <span className="competition-kicker">Posicao atual</span>
                <strong>
                  {viewerStanding ? `${standings.findIndex((item) => item.empresa.id === viewerStanding.empresa.id) + 1}o lugar` : 'Ranking em aberto'}
                </strong>
                <p>
                  {viewerStanding?.lider
                    ? `Lideranca de ${viewerStanding.lider.nome}.`
                    : 'A equipe ainda nao definiu um lider em destaque.'}
                </p>
              </div>

              <div className="competition-hero-metrics">
                <div className="competition-hero-stat">
                  <Target size={18} />
                  <div>
                    <strong>{viewerStanding?.pontuacao.quizzesCorretos ?? 0}/15</strong>
                    <span>Quizzes corretos</span>
                  </div>
                </div>
                <div className="competition-hero-stat">
                  <Shield size={18} />
                  <div>
                    <strong>{viewerStanding?.pontuacao.comportamento ?? 0} pts</strong>
                    <span>Comportamento</span>
                  </div>
                </div>
                <div className="competition-hero-stat">
                  <Zap size={18} />
                  <div>
                    <strong>{viewerStanding?.pontuacao.extras ?? 0} pts</strong>
                    <span>Pontos extras</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Podium da turma" subtitle="Quem esta brilhando mais forte nesta rodada da competicao.">
            <div className="competition-podium">
              {podiumStandings.map((standing, index) => {
                const rank = index + 1;
                const positionClass = rank === 1 ? 'first' : rank === 2 ? 'second' : 'third';

                return (
                  <article
                    key={standing.empresa.id}
                    className={`competition-podium-card ${positionClass}`}
                    style={{ '--company-color': standing.empresa.cor } as CSSProperties}
                  >
                    <div className="competition-podium-badge">
                      {rank === 1 ? <Trophy size={18} /> : <Medal size={18} />}
                      <span>{rank}o lugar</span>
                    </div>
                    <strong>{standing.empresa.nome}</strong>
                    <span>{standing.pontuacao.total} pts</span>
                    <small>{standing.lider ? `Lider: ${standing.lider.nome}` : 'Sem lider definido'}</small>
                  </article>
                );
              })}
            </div>
          </Card>

          <div className="competition-student-grid">
            {standings.map((standing, index) => (
              <article
                key={standing.empresa.id}
                className={`competition-student-card${viewerStanding?.empresa.id === standing.empresa.id ? ' own-team' : ''}`}
                style={{ '--company-color': standing.empresa.cor } as CSSProperties}
              >
                <header className="competition-student-card-header">
                  <div>
                    <span className="competition-kicker">#{index + 1} no ranking</span>
                    <h3>{standing.empresa.nome}</h3>
                    <p>{standing.lider ? `Lider: ${standing.lider.nome}` : 'Equipe sem lider definido'}</p>
                  </div>
                  <Badge tone={index === 0 ? 'warning' : viewerStanding?.empresa.id === standing.empresa.id ? 'success' : 'info'}>
                    {standing.pontuacao.total} pts
                  </Badge>
                </header>

                <div className="competition-points-grid">
                  <div className="competition-point-chip">
                    <span>Atividades</span>
                    <strong>{standing.pontuacao.atividadesEquipe}/10</strong>
                  </div>
                  <div className="competition-point-chip">
                    <span>Media</span>
                    <strong>{standing.pontuacao.mediaAtividades}/10</strong>
                  </div>
                  <div className="competition-point-chip">
                    <span>Quizzes feitos</span>
                    <strong>{standing.pontuacao.quizzesFeitos}/10</strong>
                  </div>
                  <div className="competition-point-chip">
                    <span>Quizzes corretos</span>
                    <strong>{standing.pontuacao.quizzesCorretos}/15</strong>
                  </div>
                  <div className="competition-point-chip">
                    <span>Comportamento</span>
                    <strong>{standing.pontuacao.comportamento}</strong>
                  </div>
                  <div className="competition-point-chip">
                    <span>Extras</span>
                    <strong>{standing.pontuacao.extras}</strong>
                  </div>
                </div>

                <div className="competition-progress-stack">
                  <div>
                    <span>Entrega das atividades</span>
                    <div className="competition-progress-bar">
                      <div style={{ width: `${standing.pontuacao.taxaAtividadesEquipe * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <span>Participacao nos quizzes</span>
                    <div className="competition-progress-bar">
                      <div style={{ width: `${standing.pontuacao.taxaQuizzesFeitos * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <span>Quizzes corretos</span>
                    <div className="competition-progress-bar">
                      <div style={{ width: `${standing.pontuacao.taxaQuizzesCorretos * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="competition-member-list">
                  {standing.alunos.map((student) => (
                    <span key={student.id} className={`competition-member-tag${standing.empresa.liderAlunoId === student.id ? ' leader' : ''}`}>
                      {standing.empresa.liderAlunoId === student.id ? <Crown size={13} /> : <Users size={13} />}
                      {student.nome}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {!!leagueStandings.length && (
            <Card title="Pelotao da competicao" subtitle="As equipes seguintes tambem estao na corrida e podem virar o jogo.">
              <div className="competition-league-list">
                {leagueStandings.map((standing, index) => (
                  <div key={standing.empresa.id} className="competition-league-row">
                    <div>
                      <strong>{index + 4}o. {standing.empresa.nome}</strong>
                      <p>{standing.alunos.length} integrante(s)</p>
                    </div>
                    <Badge tone="neutral">{standing.pontuacao.total} pts</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>
      )}

      <Modal
        open={companyFormOpen}
        onClose={() => {
          setCompanyFormOpen(false);
          setEditingCompany(null);
        }}
        title={editingCompany ? 'Editar empresa' : 'Nova empresa'}
        subtitle="Defina a empresa da turma, seu lider e os ajustes manuais de comportamento."
      >
        <form onSubmit={handleSubmitCompany} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Input
            label="Nome da empresa"
            value={companyForm.nome}
            onChange={(event) => setCompanyForm({ ...companyForm, nome: event.target.value })}
            required
          />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Input
              label="Cor"
              type="color"
              value={companyForm.cor}
              onChange={(event) => setCompanyForm({ ...companyForm, cor: event.target.value })}
            />
            <Input
              label="Pontos de comportamento"
              type="number"
              value={companyForm.pontosComportamento}
              onChange={(event) => setCompanyForm({ ...companyForm, pontosComportamento: Number(event.target.value) })}
            />
            <Input
              label="Pontos extras"
              type="number"
              value={companyForm.pontosExtras}
              onChange={(event) => setCompanyForm({ ...companyForm, pontosExtras: Number(event.target.value) })}
            />
          </div>
          <Select
            label="Lider"
            value={companyForm.liderAlunoId ?? ''}
            onChange={(event) => setCompanyForm({ ...companyForm, liderAlunoId: event.target.value })}
            options={[
              { value: '', label: 'Definir depois' },
              ...studentsInClass.map((student) => ({ value: student.id, label: student.nome }))
            ]}
          />
          <TextArea
            label="Observacoes"
            value={companyForm.observacoes ?? ''}
            onChange={(event) => setCompanyForm({ ...companyForm, observacoes: event.target.value })}
          />
          <Button type="submit">{editingCompany ? 'Salvar empresa' : 'Criar empresa'}</Button>
        </form>
      </Modal>

      <Modal
        open={!!selectedStanding}
        onClose={() => setSelectedCompanyId(null)}
        title={selectedStanding ? `Analise da empresa ${selectedStanding.empresa.nome}` : 'Analise da empresa'}
        subtitle={selectedStanding ? `${selectedClass?.nome ?? 'Turma'} • ${selectedStanding.pontuacao.total} pontos` : undefined}
      >
        {selectedStanding && (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div className="responsive-grid">
              <Card title="Atividades da equipe" actions={<Badge>{selectedStanding.pontuacao.atividadesEquipe}/10</Badge>}>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Taxa de entregas do time: {(selectedStanding.pontuacao.taxaAtividadesEquipe * 100).toFixed(0)}%
                </p>
              </Card>
              <Card title="Media das atividades" actions={<Badge>{selectedStanding.pontuacao.mediaAtividades}/10</Badge>}>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Media geral: {selectedStanding.pontuacao.mediaNotasAtividades.toFixed(1)}
                </p>
              </Card>
              <Card title="Quizzes feitos" actions={<Badge>{selectedStanding.pontuacao.quizzesFeitos}/10</Badge>}>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Participacao: {(selectedStanding.pontuacao.taxaQuizzesFeitos * 100).toFixed(0)}%
                </p>
              </Card>
              <Card title="Quizzes corretos" actions={<Badge>{selectedStanding.pontuacao.quizzesCorretos}/15</Badge>}>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Acertos: {(selectedStanding.pontuacao.taxaQuizzesCorretos * 100).toFixed(0)}%
                </p>
              </Card>
            </div>

            <Card title="Ajustes manuais" subtitle="Comportamento varia em passos de 5. Pontos extras variam de 1 em 1.">
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <strong>Comportamento: {selectedStanding.empresa.pontosComportamento} pts</strong>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button
                      variant="danger"
                      onClick={() =>
                        void handleAdjustCompany(selectedStanding.empresa, {
                          pontosComportamento: selectedStanding.empresa.pontosComportamento - 5
                        })
                      }
                    >
                      -5
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void handleAdjustCompany(selectedStanding.empresa, {
                          pontosComportamento: selectedStanding.empresa.pontosComportamento + 5
                        })
                      }
                    >
                      +5
                    </Button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <strong>Pontos extras: {selectedStanding.empresa.pontosExtras} pts</strong>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        void handleAdjustCompany(selectedStanding.empresa, {
                          pontosExtras: Math.max(0, selectedStanding.empresa.pontosExtras - 1)
                        })
                      }
                    >
                      -1
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void handleAdjustCompany(selectedStanding.empresa, {
                          pontosExtras: selectedStanding.empresa.pontosExtras + 1
                        })
                      }
                    >
                      +1
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Integrantes da empresa" subtitle="Gerencie membros da equipe e destaque o lider.">
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <Select
                  label="Lider da empresa"
                  value={selectedStanding.empresa.liderAlunoId ?? ''}
                  onChange={(event) =>
                    void handleAdjustCompany(selectedStanding.empresa, { liderAlunoId: event.target.value })
                  }
                  options={[
                    { value: '', label: 'Sem lider definido' },
                    ...selectedStanding.alunos.map((student) => ({ value: student.id, label: student.nome }))
                  ]}
                />

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={() => setMemberModalOpen(true)}>
                    <Users size={18} /> Adicionar integrante
                  </Button>
                  <Button variant="ghost" onClick={() => openEditCompany(selectedStanding.empresa)}>
                    <Pencil size={18} /> Editar empresa
                  </Button>
                </div>

                {selectedStanding.alunos.length ? (
                  selectedStanding.alunos.map((student) => {
                    const member = selectedStanding.membros.find((item) => item.alunoId === student.id);
                    const isLeader = selectedStanding.empresa.liderAlunoId === student.id;
                    return (
                      <div
                        key={student.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          padding: '0.9rem 1rem',
                          borderRadius: 20,
                          background: 'rgba(15, 23, 42, 0.56)',
                          border: '1px solid rgba(148, 163, 184, 0.1)'
                        }}
                      >
                        <div style={{ display: 'grid', gap: '0.2rem' }}>
                          <strong>{student.nome}</strong>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {isLeader && <Badge tone="warning"><Crown size={14} /> Lider</Badge>}
                            {student.email && <Badge tone="info">{student.email}</Badge>}
                          </div>
                        </div>
                        {member && (
                          <Button variant="danger" onClick={() => void handleRemoveMember(member)}>
                            Remover
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    title="Empresa sem integrantes"
                    description="Adicione alunos da turma para iniciar a competicao."
                  />
                )}
              </div>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title="Adicionar integrante"
        subtitle="Cada aluno da turma pode participar de uma unica empresa."
      >
        <form onSubmit={handleAddMember} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Select
            label="Aluno"
            value={memberStudentId}
            onChange={(event) => setMemberStudentId(event.target.value)}
            options={[
              { value: '', label: 'Selecione um aluno' },
              ...availableStudentsForCompany.map((student) => ({ value: student.id, label: student.nome }))
            ]}
          />
          <Button type="submit" disabled={!memberStudentId}>
            <Sparkles size={18} /> Adicionar a empresa
          </Button>
        </form>
      </Modal>
    </>
  );
}
