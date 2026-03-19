import { Download, Eye, PenLine, Save, Send, ShieldCheck, Signature } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useSession } from '@/hooks';
import { ataSignaturesRepository, atasRepository } from '@/services/repositories';
import { buildAtaContentHash, buildAtaSignatureHash, deriveAtaStatus, openAtaPrintWindow, validateAtaSignature } from '@/utils/atas';
import type { AtaAssinaturaEntity, AtaEntity, UserEntity } from '@/types';

interface SignatureWithValidation extends AtaAssinaturaEntity {
  isValid: boolean;
}

export function AtaEditorModal({
  open,
  ata,
  professorUsers,
  onClose,
  onSaved
}: {
  open: boolean;
  ata: AtaEntity | null;
  professorUsers: UserEntity[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { session, createSignatureProof } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatures, setSignatures] = useState<SignatureWithValidation[]>([]);

  useEffect(() => {
    async function load() {
      if (!open) {
        return;
      }

      setError(null);

      if (!ata) {
        setTitle('');
        setContent('');
        setRecipientIds([]);
        setSignatures([]);
        return;
      }

      try {
        setLoading(true);
        setTitle(ata.titulo);
        setContent(ata.conteudoHtml);
        setRecipientIds(ata.destinatarioUserIds);

        const ataSignatures = await ataSignaturesRepository.listByAta(ata.id);
        const validatedSignatures = await Promise.all(
          ataSignatures.map(async (signature) => ({
            ...signature,
            isValid: await validateAtaSignature(ata, signature)
          }))
        );
        setSignatures(validatedSignatures);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel abrir a ATA.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [ata, open]);

  const recipientUsers = useMemo(
    () => professorUsers.filter((user) => recipientIds.includes(user.authUid)),
    [professorUsers, recipientIds]
  );
  const status = ata ? deriveAtaStatus(ata, signatures.map((signature) => signature.signedByUserId)) : 'rascunho';
  const canEdit = !!session && (!ata || (ata.criadoPorUserId === session.authUid && signatures.length === 0));
  const canSign = !!session && !!ata && ata.participantUserIds.includes(session.authUid) && !signatures.some((signature) => signature.signedByUserId === session.authUid);

  function toggleRecipient(userId: string) {
    setRecipientIds((current) =>
      current.includes(userId)
        ? current.filter((item) => item !== userId)
        : [...current, userId]
    );
  }

  async function handleSave() {
    if (!session) {
      return;
    }

    if (!title.trim()) {
      setError('Defina um titulo para a ATA.');
      return;
    }

    if (!content.trim()) {
      setError('Escreva o conteudo da ATA antes de salvar.');
      return;
    }

    if (recipientIds.length === 0) {
      setError('Selecione pelo menos um professor destinatario.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const contentHash = await buildAtaContentHash({
        titulo: title,
        conteudoHtml: content,
        destinatarioUserIds: recipientIds
      });

      if (ata) {
        await atasRepository.update(ata.id, {
          titulo: title,
          conteudoHtml: content,
          destinatarioUserIds: recipientIds,
          participantUserIds: [session.authUid, ...recipientIds],
          contentHash
        });
      } else {
        await atasRepository.create(session.professorId, {
          titulo: title,
          conteudoHtml: content,
          criadoPorUserId: session.authUid,
          criadoPorNome: session.displayName,
          destinatarioUserIds: recipientIds,
          participantUserIds: [session.authUid, ...recipientIds],
          contentHash
        });
      }

      await onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel salvar a ATA.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSign() {
    if (!session || !ata) {
      return;
    }

    if (!signaturePassword) {
      setError('Digite sua senha para validar a assinatura.');
      return;
    }

    try {
      setSignatureLoading(true);
      setError(null);

      const existingSignature = await ataSignaturesRepository.getByAtaAndSigner(ata.id, session.authUid);
      if (existingSignature) {
        setSignatureModalOpen(false);
        return;
      }

      const proof = await createSignatureProof(signaturePassword);
      const signedAt = new Date().toISOString();
      const signatureHash = await buildAtaSignatureHash({
        ataId: ata.id,
        signedByUserId: proof.authUid,
        signedAt,
        contentHash: ata.contentHash,
        proofHash: proof.proofHash
      });

      await ataSignaturesRepository.createSignature(ata.professorId, {
        ataId: ata.id,
        ownerProfessorId: ata.professorId,
        signedByUserId: proof.authUid,
        signedByName: session.displayName,
        signedByEmail: proof.email ?? session.profile.email,
        signedAt,
        contentHashAtSignature: ata.contentHash,
        proofHash: proof.proofHash,
        signatureHash
      });

      setSignaturePassword('');
      setSignatureModalOpen(false);
      await onSaved();

      const reloaded = await ataSignaturesRepository.listByAta(ata.id);
      const validatedSignatures = await Promise.all(
        reloaded.map(async (signature) => ({
          ...signature,
          isValid: await validateAtaSignature(ata, signature)
        }))
      );
      setSignatures(validatedSignatures);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel concluir a assinatura.');
    } finally {
      setSignatureLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!ata) {
      return;
    }

    openAtaPrintWindow({
      ata,
      signatures
    });
  }

  const availableProfessors = professorUsers.filter((user) => user.authUid !== session?.authUid);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        fullScreen
        title={ata ? title || 'ATA sem titulo' : 'Nova ATA'}
        subtitle={ata ? `Status: ${status.replace(/_/g, ' ')}` : 'Escreva a ATA e defina os professores que devem receber e assinar.'}
        actions={
          <>
            <Button variant="ghost" onClick={onClose}>Fechar</Button>
            {!!ata && signatures.length > 0 && (
              <Button variant="secondary" onClick={() => void handleDownloadPdf()}>
                <Download size={16} /> Baixar PDF
              </Button>
            )}
            {!!ata && canSign && (
              <Button variant="secondary" onClick={() => setSignatureModalOpen(true)}>
                <Signature size={16} /> Assinar ATA
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => void handleSave()} disabled={saving}>
                {ata ? <Save size={16} /> : <Send size={16} />}
                {saving ? 'Salvando...' : ata ? 'Salvar ATA' : 'Criar ATA'}
              </Button>
            )}
          </>
        }
      >
        <div className="lesson-notes-modal-body">
          {loading && <LoadingState label="Abrindo ATA..." />}
          {error && <ErrorState message={error} />}
          {!loading && (
            <div className="minutes-modal-layout">
              <aside className="minutes-side-panel">
                <Input
                  label="Titulo da ATA"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={!canEdit}
                  placeholder="Ex.: ATA de alinhamento pedagógico"
                />

                <div className="minutes-recipient-panel">
                  <span className="minutes-section-label">Professores destinatarios</span>
                  {availableProfessors.length ? (
                    <div className="minutes-recipient-grid">
                      {availableProfessors.map((user) => {
                        const selected = recipientIds.includes(user.authUid);
                        return (
                          <button
                            key={user.authUid}
                            type="button"
                            className={`minutes-recipient-chip${selected ? ' active' : ''}`}
                            onClick={() => canEdit && toggleRecipient(user.authUid)}
                            disabled={!canEdit}
                          >
                            <span>{user.displayName}</span>
                            <small>{user.email}</small>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState title="Nenhum professor disponivel" description="Nao ha outros professores cadastrados para receber esta ATA." />
                  )}
                </div>

                <div className="minutes-signature-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="minutes-section-label">Assinaturas</span>
                    <Badge tone={signatures.some((item) => !item.isValid) ? 'danger' : signatures.length ? 'success' : 'neutral'}>
                      {signatures.length} assinatura(s)
                    </Badge>
                  </div>

                  {signatures.length ? (
                    <div className="minutes-signature-list">
                      {signatures.map((signature) => (
                        <div key={signature.id} className="minutes-signature-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <strong>{signature.signedByName}</strong>
                            <Badge tone={signature.isValid ? 'success' : 'danger'}>
                              {signature.isValid ? <ShieldCheck size={14} /> : <Eye size={14} />}
                              {signature.isValid ? 'Validada' : 'Com alerta'}
                            </Badge>
                          </div>
                          <span>{signature.signedByEmail ?? 'Email nao informado'}</span>
                          <small>{new Date(signature.signedAt).toLocaleString('pt-BR')}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: '#94a3b8' }}>
                      Ainda nao existem assinaturas. Enquanto isso, apenas o criador pode editar.
                    </p>
                  )}

                  <div className="minutes-recipient-summary">
                    {recipientUsers.map((user) => (
                      <span key={user.authUid} className="dashboard-inline-tag success">{user.displayName}</span>
                    ))}
                  </div>
                </div>
              </aside>

              <div>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Registre os participantes, os pontos discutidos, encaminhamentos, prazos e observacoes formais da ATA."
                  readOnly={!canEdit}
                />
                {!canEdit && (
                  <p style={{ margin: '0.85rem 0 0', color: '#94a3b8' }}>
                    Esta ATA esta em modo de visualizacao porque ja possui assinatura registrada ou foi recebida por voce.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        title="Assinar ATA"
        subtitle="Para validar sua identidade, confirme sua senha atual antes de assinar."
      >
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Input
            label="Senha atual"
            type="password"
            value={signaturePassword}
            onChange={(event) => setSignaturePassword(event.target.value)}
          />
          <Button onClick={() => void handleSign()} disabled={signatureLoading}>
            <Signature size={16} /> {signatureLoading ? 'Validando assinatura...' : 'Confirmar assinatura'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
