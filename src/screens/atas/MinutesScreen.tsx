import { FileText, Plus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { AtaEditorModal } from '@/components/atas/AtaEditorModal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useSession } from '@/hooks';
import { atasRepository, usersRepository } from '@/services/repositories';
import type { AtaEntity, UserEntity } from '@/types';

export function MinutesScreen() {
  const { session } = useSession();
  const [atas, setAtas] = useState<AtaEntity[]>([]);
  const [professorUsers, setProfessorUsers] = useState<UserEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedAta, setSelectedAta] = useState<AtaEntity | null>(null);

  async function load() {
    if (!session) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [atasList, professors] = await Promise.all([
        atasRepository.listForUser(session.authUid),
        usersRepository.listByRole('professor')
      ]);

      setAtas(atasList);
      setProfessorUsers(
        professors
          .filter((user) => user.role === 'professor')
          .sort((left, right) => left.displayName.localeCompare(right.displayName))
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar as ATAs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [session?.authUid]);

  const sortedAtas = useMemo(
    () => [...atas].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [atas]
  );

  return (
    <>
      <PageHeader
        eyebrow="Documentos formais"
        title="ATAs para registro e assinatura"
        description="Crie ATAs formais, envie para outros professores, colete assinaturas e gere a versao final para PDF."
        actions={
          <Button
            onClick={() => {
              setSelectedAta(null);
              setEditorOpen(true);
            }}
          >
            <Plus size={18} /> Nova ATA
          </Button>
        }
      />

      <div className="responsive-grid" style={{ alignItems: 'stretch' }}>
        <Card title="Nova ATA" subtitle="Abra o editor completo para redigir uma nova ATA.">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              Ao criar a ATA, voce escolhe os professores destinatarios e ja prepara o documento no editor completo.
            </p>
            <Button
              onClick={() => {
                setSelectedAta(null);
                setEditorOpen(true);
              }}
            >
              <Plus size={18} /> Criar nova ATA
            </Button>
          </div>
        </Card>

        <Card title="ATAs existentes" subtitle="Visualize o historico completo das ATAs em que voce participa.">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge tone="info"><FileText size={14} /> {atas.length} documento(s)</Badge>
            <Badge tone="neutral"><Users size={14} /> {professorUsers.length} professor(es)</Badge>
          </div>
        </Card>
      </div>

      {loading && <LoadingState label="Carregando central de ATAs..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !sortedAtas.length && (
        <EmptyState title="Nenhuma ATA encontrada" description="Crie a primeira ATA ou aguarde uma ATA ser enviada para voce." />
      )}

      {!loading && !error && !!sortedAtas.length && (
        <section className="responsive-grid">
          {sortedAtas.map((ata) => {
            const isCreator = ata.criadoPorUserId === session?.authUid;
            const recipientCount = ata.destinatarioUserIds.length;
            return (
              <Card
                key={ata.id}
                title={ata.titulo}
                subtitle={`Criada por ${ata.criadoPorNome}`}
                actions={<Badge tone={isCreator ? 'info' : 'neutral'}>{isCreator ? 'Criada por voce' : 'Recebida'}</Badge>}
              >
                <div style={{ display: 'grid', gap: '0.45rem', color: '#cbd5e1' }}>
                  <span>Criada em {new Date(ata.createdAt).toLocaleString('pt-BR')}</span>
                  <span>Ultima atualizacao {new Date(ata.updatedAt).toLocaleString('pt-BR')}</span>
                  <span>{recipientCount} professor(es) destinatario(s)</span>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedAta(ata);
                    setEditorOpen(true);
                  }}
                >
                  <FileText size={16} /> Abrir ATA
                </Button>
              </Card>
            );
          })}
        </section>
      )}

      <AtaEditorModal
        open={editorOpen}
        ata={selectedAta}
        professorUsers={professorUsers}
        onClose={() => {
          setEditorOpen(false);
          setSelectedAta(null);
        }}
        onSaved={load}
      />
    </>
  );
}
