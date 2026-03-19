import type { StudentDashboardMetrics, StudentDetailBundle } from '@/types';
import { printHtmlDocument } from '@/utils/print';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTextBlock(value?: string) {
  if (!value?.trim()) {
    return '<p>Nenhuma observacao pedagógica registrada ate o momento.</p>';
  }

  return value
    .trim()
    .split(/\n+/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

function renderList(items: string[], emptyLabel: string) {
  if (!items.length) {
    return `<p>${escapeHtml(emptyLabel)}</p>`;
  }

  return `
    <ul>
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `;
}

function renderAttendanceRows(
  rows: Array<{ nome: string; percentual: number }>
) {
  if (!rows.length) {
    return '<p>Sem frequencias registradas por materia.</p>';
  }

  return rows
    .map(
      (row) => `
        <div class="metric-line">
          <div class="metric-line-head">
            <strong>${escapeHtml(row.nome)}</strong>
            <span>${row.percentual}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, row.percentual))}%"></div>
          </div>
        </div>
      `
    )
    .join('');
}

export function openStudentReportPrintWindow({
  alunoNome,
  profileText,
  data,
  metrics,
  attendanceBySubject,
  makeupSummary
}: {
  alunoNome: string;
  profileText: string;
  data: StudentDetailBundle;
  metrics: StudentDashboardMetrics;
  attendanceBySubject: Array<{ nome: string; percentual: number }>;
  makeupSummary: { passadas: number; pendentes: number; entregues: number };
}) {
  const generatedAt = new Date();
  const pendingActivities = data.atividadesPendentes
    .map((item) => item.atividade?.titulo ?? 'Atividade pendente')
    .sort((left, right) => left.localeCompare(right, 'pt-BR'));

  const classes = data.turmas.map((turma) => turma.nome).sort((left, right) => left.localeCompare(right, 'pt-BR'));
  const subjects = data.materias.map((materia) => materia.nome).sort((left, right) => left.localeCompare(right, 'pt-BR'));

  printHtmlDocument(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Relatorio - ${escapeHtml(alunoNome)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            color: #0f172a;
            background: #eefaf1;
          }
          .page {
            min-height: 100vh;
            background:
              linear-gradient(180deg, #e8f9ec 0%, #f8fffa 28%, #ffffff 100%);
          }
          .hero-shell {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) 260px;
            gap: 18px;
            padding: 24px 24px 0;
          }
          .hero-card {
            min-height: 182px;
            padding: 28px;
            border-radius: 0 0 22px 22px;
            background: #073b28;
            color: #eaffef;
          }
          .hero-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            letter-spacing: 0.03em;
            opacity: 0.92;
          }
          .hero-title {
            margin: 20px 0 0;
            font-size: 56px;
            line-height: 0.94;
            font-weight: 800;
            max-width: 10ch;
          }
          .hero-art {
            min-height: 182px;
            border-radius: 0 0 22px 22px;
            background:
              radial-gradient(circle at top right, #073b28 0 38%, transparent 39%),
              radial-gradient(circle at bottom left, #073b28 0 38%, transparent 39%),
              linear-gradient(180deg, #0e4b35 0%, #073b28 100%);
            position: relative;
            overflow: hidden;
          }
          .hero-art::before,
          .hero-art::after {
            content: "";
            position: absolute;
            width: 58%;
            height: 58%;
            background: #c9f2d0;
            border-radius: 0 0 100% 0;
          }
          .hero-art::before {
            top: 0;
            left: 0;
          }
          .hero-art::after {
            right: 0;
            bottom: 0;
            transform: rotate(180deg);
          }
          .content {
            padding: 24px;
          }
          .meta-grid {
            display: grid;
            gap: 10px;
            margin-bottom: 24px;
            padding: 20px 22px;
            border-radius: 22px;
            background: rgba(255,255,255,0.92);
            border: 1px solid #dcefe2;
          }
          .meta-grid strong {
            display: inline-block;
            min-width: 168px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 24px;
          }
          .summary-card {
            padding: 18px;
            border-radius: 22px;
            background: #ffffff;
            border: 1px solid #dcefe2;
          }
          .summary-card span {
            display: block;
            color: #557064;
            font-size: 13px;
            margin-bottom: 8px;
          }
          .summary-card strong {
            font-size: 28px;
          }
          .section {
            margin-bottom: 22px;
            padding: 22px;
            border-radius: 24px;
            background: #ffffff;
            border: 1px solid #dcefe2;
          }
          .section-title {
            display: inline-flex;
            align-items: center;
            min-width: 280px;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 18px;
            font-weight: 800;
            color: #073b28;
            background: linear-gradient(90deg, #bdf1c9 0%, #ecfff0 100%);
            margin-bottom: 16px;
          }
          .columns {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
          .pill-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .pill {
            padding: 8px 12px;
            border-radius: 999px;
            background: #edf8f0;
            border: 1px solid #dcefe2;
            font-size: 13px;
            font-weight: 700;
            color: #0f5132;
          }
          .metric-line {
            display: grid;
            gap: 8px;
            margin-bottom: 16px;
          }
          .metric-line-head {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 14px;
          }
          .progress-track {
            width: 100%;
            height: 10px;
            border-radius: 999px;
            background: #e7f2ea;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #0e7a54 0%, #36c78b 100%);
          }
          p, li {
            color: #243b31;
            line-height: 1.65;
          }
          ul {
            margin: 0;
            padding-left: 22px;
          }
          .footer-note {
            margin-top: 30px;
            color: #648073;
            font-size: 12px;
            text-align: right;
          }
          @media print {
            body { background: #fff; }
            .page { background: #fff; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero-shell">
            <div class="hero-card">
              <div class="hero-eyebrow">Mentorix • Relatorio pedagogico individual</div>
              <h1 class="hero-title">${escapeHtml(alunoNome)}</h1>
            </div>
            <div class="hero-art"></div>
          </section>

          <section class="content">
            <div class="meta-grid">
              <div><strong>Data:</strong> ${generatedAt.toLocaleDateString('pt-BR')}</div>
              <div><strong>Aluno:</strong> ${escapeHtml(data.aluno.nome)}</div>
              <div><strong>Email:</strong> ${escapeHtml(data.aluno.email ?? 'Nao informado')}</div>
              <div><strong>Responsavel:</strong> ${escapeHtml(data.aluno.responsavel ?? 'Nao informado')}</div>
            </div>

            <div class="summary-grid">
              <div class="summary-card">
                <span>Quizzes feitos</span>
                <strong>${metrics.totalQuizzesFeitos}</strong>
              </div>
              <div class="summary-card">
                <span>Acertos de primeira</span>
                <strong>${metrics.acertouDePrimeira}</strong>
              </div>
              <div class="summary-card">
                <span>Media de quizzes</span>
                <strong>${metrics.mediaQuizzesTurma}</strong>
              </div>
              <div class="summary-card">
                <span>Media de atividades</span>
                <strong>${metrics.mediaAtividades}</strong>
              </div>
            </div>

            <section class="section">
              <div class="section-title">Contexto pedagogico</div>
              ${formatTextBlock(profileText)}
            </section>

            <section class="section">
              <div class="section-title">Vinculos academicos</div>
              <div class="columns">
                <div>
                  <strong>Turmas</strong>
                  <div class="pill-list" style="margin-top: 12px;">
                    ${classes.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join('') || '<p>Nenhuma turma vinculada.</p>'}
                  </div>
                </div>
                <div>
                  <strong>Materias</strong>
                  <div class="pill-list" style="margin-top: 12px;">
                    ${subjects.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join('') || '<p>Nenhuma materia vinculada.</p>'}
                  </div>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-title">Frequencia por materia</div>
              ${renderAttendanceRows(attendanceBySubject)}
            </section>

            <section class="section">
              <div class="section-title">Atividades e pendencias</div>
              <div class="columns">
                <div>
                  <p><strong>Total esperado:</strong> ${metrics.totalAtividadesEsperadas}</p>
                  <p><strong>Total entregue:</strong> ${metrics.totalAtividadesEntregues}</p>
                  <p><strong>Total pendente:</strong> ${metrics.totalAtividadesPendentes}</p>
                </div>
                <div>
                  <strong>Atividades nao entregues</strong>
                  ${renderList(pendingActivities, 'Nenhuma atividade pendente no momento.')}
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-title">Quizzes e desempenho</div>
              <div class="columns">
                <div>
                  <p><strong>Total de quizzes feitos:</strong> ${metrics.totalQuizzesFeitos}</p>
                  <p><strong>Acertos de primeira:</strong> ${metrics.acertouDePrimeira}</p>
                  <p><strong>Percentual de primeira tentativa:</strong> ${metrics.percentualAcertoPrimeira}%</p>
                </div>
                <div>
                  <p><strong>Media de quizzes na turma:</strong> ${metrics.mediaQuizzesTurma}</p>
                  <p><strong>Media das atividades:</strong> ${metrics.mediaAtividades}</p>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-title">Reposicoes</div>
              <div class="columns">
                <div>
                  <p><strong>Reposicoes passadas:</strong> ${makeupSummary.passadas}</p>
                  <p><strong>Reposicoes pendentes:</strong> ${makeupSummary.pendentes}</p>
                  <p><strong>Reposicoes entregues:</strong> ${makeupSummary.entregues}</p>
                </div>
                <div>
                  <p>Este relatorio foi gerado a partir dos registros pedagógicos disponíveis no Mentorix, incluindo o perfil livre do aluno preenchido pelo professor.</p>
                </div>
              </div>
            </section>

            <div class="footer-note">
              Documento gerado em ${generatedAt.toLocaleString('pt-BR')} pelo Mentorix.
            </div>
          </section>
        </main>
      </body>
    </html>
  `);
}
