import { sha256Text } from '@/utils/crypto';
import { printHtmlDocument } from '@/utils/print';
import type { AtaAssinaturaEntity, AtaEntity } from '@/types';

function normalizeHtml(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .trim();
}

export async function buildAtaContentHash({
  titulo,
  conteudoHtml,
  destinatarioUserIds
}: {
  titulo: string;
  conteudoHtml: string;
  destinatarioUserIds: string[];
}) {
  return sha256Text(
    JSON.stringify({
      titulo: titulo.trim(),
      conteudoHtml: normalizeHtml(conteudoHtml),
      destinatarioUserIds: [...destinatarioUserIds].sort()
    })
  );
}

export async function buildAtaSignatureHash({
  ataId,
  signedByUserId,
  signedAt,
  contentHash,
  proofHash
}: {
  ataId: string;
  signedByUserId: string;
  signedAt: string;
  contentHash: string;
  proofHash: string;
}) {
  return sha256Text(
    JSON.stringify({
      ataId,
      signedByUserId,
      signedAt,
      contentHash,
      proofHash
    })
  );
}

export async function validateAtaSignature(
  ata: AtaEntity,
  assinatura: AtaAssinaturaEntity
) {
  const expectedSignatureHash = await buildAtaSignatureHash({
    ataId: assinatura.ataId,
    signedByUserId: assinatura.signedByUserId,
    signedAt: assinatura.signedAt,
    contentHash: assinatura.contentHashAtSignature,
    proofHash: assinatura.proofHash
  });

  return (
    assinatura.signatureHash === expectedSignatureHash &&
    assinatura.contentHashAtSignature === ata.contentHash
  );
}

export function deriveAtaStatus(ata: AtaEntity, signedUserIds: string[]) {
  const recipientSignedCount = ata.destinatarioUserIds.filter((userId) => signedUserIds.includes(userId)).length;

  if (!signedUserIds.length) {
    return 'aguardando_assinaturas';
  }

  const expectedSignatures = Math.max(1, ata.destinatarioUserIds.length);
  return recipientSignedCount >= expectedSignatures ? 'concluida' : 'assinada_parcialmente';
}

export function openAtaPrintWindow({
  ata,
  signatures
}: {
  ata: AtaEntity;
  signatures: Array<AtaAssinaturaEntity & { isValid: boolean }>;
}) {
  const signaturesHtml = signatures.length
    ? signatures
        .map(
          (signature) => `
            <div class="signature-card">
              <strong>${signature.signedByName}</strong>
              <span>${signature.signedByEmail ?? ''}</span>
              <span>Assinado em: ${new Date(signature.signedAt).toLocaleString('pt-BR')}</span>
              <span>Status: ${signature.isValid ? 'Assinatura validada' : 'Assinatura com alerta de integridade'}</span>
              <code>${signature.signatureHash}</code>
            </div>
          `
        )
        .join('')
    : '<p>Nenhuma assinatura registrada ate o momento.</p>';

  printHtmlDocument(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${ata.titulo}</title>
        <style>
          body {
            font-family: "Segoe UI", Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #0f172a;
            background: #f8fafc;
          }
          .shell {
            max-width: 860px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 28px;
            padding: 32px;
            border: 1px solid #e2e8f0;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 30px;
          }
          .meta {
            display: grid;
            gap: 6px;
            margin-bottom: 24px;
            color: #475569;
          }
          .content {
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            padding: 24px 0;
            line-height: 1.7;
          }
          .signatures {
            margin-top: 24px;
            display: grid;
            gap: 16px;
          }
          .signature-card {
            display: grid;
            gap: 4px;
            padding: 16px;
            border-radius: 18px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
          }
          code {
            word-break: break-all;
            font-size: 12px;
            color: #334155;
          }
        </style>
      </head>
      <body>
        <main class="shell">
          <h1>${ata.titulo}</h1>
          <div class="meta">
            <span>Criada por ${ata.criadoPorNome}</span>
            <span>Criada em ${new Date(ata.createdAt).toLocaleString('pt-BR')}</span>
            <span>Ultima atualizacao ${new Date(ata.updatedAt).toLocaleString('pt-BR')}</span>
          </div>
          <section class="content">${ata.conteudoHtml}</section>
          <section class="signatures">
            <h2>Assinaturas</h2>
            ${signaturesHtml}
          </section>
        </main>
      </body>
    </html>
  `);
}
