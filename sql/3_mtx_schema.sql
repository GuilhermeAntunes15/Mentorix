-- ============================================
-- Mentorix: Schema completo (23 tabelas)
-- Execute no Supabase SQL Editor APOS 2_mtx_alter_profiles.sql
-- Usa a funcao update_updated_at() ja existente do chamada-consa
-- ============================================

-- ============================================
-- 1. mtx_turmas
-- ============================================
CREATE TABLE mtx_turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  nome TEXT NOT NULL,
  codigo TEXT,
  periodo TEXT,
  cor TEXT,
  descricao TEXT,
  managed_by_admin BOOLEAN DEFAULT false,
  sync_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_turmas_professor ON mtx_turmas(professor_id);

CREATE TRIGGER trg_mtx_turmas_updated_at
  BEFORE UPDATE ON mtx_turmas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. mtx_alunos
-- ============================================
CREATE TABLE mtx_alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  avatar_url TEXT,
  responsavel TEXT,
  observacoes TEXT,
  managed_by_admin BOOLEAN DEFAULT false,
  sync_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_alunos_professor ON mtx_alunos(professor_id);

CREATE TRIGGER trg_mtx_alunos_updated_at
  BEFORE UPDATE ON mtx_alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. mtx_aluno_turma
-- ============================================
CREATE TABLE mtx_aluno_turma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  entrou_em TIMESTAMPTZ,
  managed_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, turma_id, professor_id)
);

CREATE INDEX idx_mtx_aluno_turma_professor ON mtx_aluno_turma(professor_id);
CREATE INDEX idx_mtx_aluno_turma_aluno ON mtx_aluno_turma(aluno_id);
CREATE INDEX idx_mtx_aluno_turma_turma ON mtx_aluno_turma(turma_id);

CREATE TRIGGER trg_mtx_aluno_turma_updated_at
  BEFORE UPDATE ON mtx_aluno_turma FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 4. mtx_materias
-- ============================================
CREATE TABLE mtx_materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  codigo TEXT,
  cor TEXT,
  descricao TEXT,
  managed_by_admin BOOLEAN DEFAULT false,
  template_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_materias_professor ON mtx_materias(professor_id);
CREATE INDEX idx_mtx_materias_turma ON mtx_materias(turma_id);

CREATE TRIGGER trg_mtx_materias_updated_at
  BEFORE UPDATE ON mtx_materias FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. mtx_materias_pessoais (usa user_id, SEM professor_id)
-- ============================================
CREATE TABLE mtx_materias_pessoais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  nome TEXT NOT NULL,
  cor TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_materias_pessoais_user ON mtx_materias_pessoais(user_id);

CREATE TRIGGER trg_mtx_materias_pessoais_updated_at
  BEFORE UPDATE ON mtx_materias_pessoais FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. mtx_aulas
-- ============================================
CREATE TABLE mtx_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  turma_id UUID REFERENCES mtx_turmas(id) ON DELETE SET NULL,
  materia_id UUID REFERENCES mtx_materias(id) ON DELETE SET NULL,
  titulo TEXT,
  descricao TEXT,
  escola TEXT,
  data DATE,
  datas_ignoradas TEXT[] DEFAULT '{}',
  dia_semana INT,
  recorrente BOOLEAN DEFAULT false,
  hora_inicio TEXT,
  hora_fim TEXT,
  sala TEXT,
  categoria mtx_lesson_category DEFAULT 'aula',
  gestao_tipo mtx_management_task_type,
  tipo mtx_lesson_type DEFAULT 'regular',
  grade_personalizada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_aulas_professor ON mtx_aulas(professor_id);
CREATE INDEX idx_mtx_aulas_turma ON mtx_aulas(turma_id);
CREATE INDEX idx_mtx_aulas_materia ON mtx_aulas(materia_id);
CREATE INDEX idx_mtx_aulas_data ON mtx_aulas(data);

CREATE TRIGGER trg_mtx_aulas_updated_at
  BEFORE UPDATE ON mtx_aulas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. mtx_agenda_pessoal (usa user_id, SEM professor_id)
-- ============================================
CREATE TABLE mtx_agenda_pessoal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  materia_pessoal_id UUID REFERENCES mtx_materias_pessoais(id) ON DELETE SET NULL,
  titulo TEXT,
  descricao TEXT,
  data DATE,
  hora_inicio TEXT,
  hora_fim TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_agenda_pessoal_user ON mtx_agenda_pessoal(user_id);
CREATE INDEX idx_mtx_agenda_pessoal_materia ON mtx_agenda_pessoal(materia_pessoal_id);

CREATE TRIGGER trg_mtx_agenda_pessoal_updated_at
  BEFORE UPDATE ON mtx_agenda_pessoal FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. mtx_anotacoes_aula
-- ============================================
CREATE TABLE mtx_anotacoes_aula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  aula_id UUID NOT NULL REFERENCES mtx_aulas(id) ON DELETE CASCADE,
  data_referencia DATE NOT NULL,
  conteudo_html TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aula_id, data_referencia, professor_id)
);

CREATE INDEX idx_mtx_anotacoes_aula_professor ON mtx_anotacoes_aula(professor_id);
CREATE INDEX idx_mtx_anotacoes_aula_aula ON mtx_anotacoes_aula(aula_id);

CREATE TRIGGER trg_mtx_anotacoes_aula_updated_at
  BEFORE UPDATE ON mtx_anotacoes_aula FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 9. mtx_atas
-- ============================================
CREATE TABLE mtx_atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  titulo TEXT NOT NULL,
  conteudo_html TEXT,
  criado_por_user_id UUID REFERENCES profiles(id),
  criado_por_nome TEXT,
  destinatario_user_ids UUID[] DEFAULT '{}',
  participant_user_ids UUID[] DEFAULT '{}',
  content_hash TEXT,
  locked_at TIMESTAMPTZ,
  status mtx_ata_status DEFAULT 'rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_atas_professor ON mtx_atas(professor_id);
CREATE INDEX idx_mtx_atas_participant_user_ids ON mtx_atas USING GIN (participant_user_ids);

CREATE TRIGGER trg_mtx_atas_updated_at
  BEFORE UPDATE ON mtx_atas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. mtx_assinaturas_ata
-- ============================================
CREATE TABLE mtx_assinaturas_ata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  ata_id UUID NOT NULL REFERENCES mtx_atas(id) ON DELETE CASCADE,
  owner_professor_id UUID REFERENCES profiles(id),
  signed_by_user_id UUID NOT NULL REFERENCES profiles(id),
  signed_by_name TEXT,
  signed_by_email TEXT,
  signed_at TIMESTAMPTZ DEFAULT now(),
  content_hash_at_signature TEXT,
  proof_hash TEXT,
  signature_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_assinaturas_ata_professor ON mtx_assinaturas_ata(professor_id);
CREATE INDEX idx_mtx_assinaturas_ata_ata ON mtx_assinaturas_ata(ata_id);
CREATE INDEX idx_mtx_assinaturas_ata_signed_by ON mtx_assinaturas_ata(signed_by_user_id);

CREATE TRIGGER trg_mtx_assinaturas_ata_updated_at
  BEFORE UPDATE ON mtx_assinaturas_ata FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 11. mtx_chamadas
-- ============================================
CREATE TABLE mtx_chamadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  aula_id UUID NOT NULL REFERENCES mtx_aulas(id) ON DELETE CASCADE,
  data_referencia DATE NOT NULL,
  retroativa BOOLEAN DEFAULT false,
  status mtx_attendance_status DEFAULT 'nao_iniciada',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_chamadas_professor ON mtx_chamadas(professor_id);
CREATE INDEX idx_mtx_chamadas_aula ON mtx_chamadas(aula_id);

CREATE TRIGGER trg_mtx_chamadas_updated_at
  BEFORE UPDATE ON mtx_chamadas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 12. mtx_frequencias
-- ============================================
CREATE TABLE mtx_frequencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  chamada_id UUID NOT NULL REFERENCES mtx_chamadas(id) ON DELETE CASCADE,
  aula_id UUID NOT NULL REFERENCES mtx_aulas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  status mtx_presence_status DEFAULT 'ausente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(chamada_id, aluno_id)
);

CREATE INDEX idx_mtx_frequencias_professor ON mtx_frequencias(professor_id);
CREATE INDEX idx_mtx_frequencias_chamada ON mtx_frequencias(chamada_id);
CREATE INDEX idx_mtx_frequencias_aluno ON mtx_frequencias(aluno_id);
CREATE INDEX idx_mtx_frequencias_aula ON mtx_frequencias(aula_id);

CREATE TRIGGER trg_mtx_frequencias_updated_at
  BEFORE UPDATE ON mtx_frequencias FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 13. mtx_quizzes
-- ============================================
CREATE TABLE mtx_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  materia_id UUID REFERENCES mtx_materias(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  data DATE,
  total_questoes INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_quizzes_professor ON mtx_quizzes(professor_id);
CREATE INDEX idx_mtx_quizzes_turma ON mtx_quizzes(turma_id);
CREATE INDEX idx_mtx_quizzes_materia ON mtx_quizzes(materia_id);

CREATE TRIGGER trg_mtx_quizzes_updated_at
  BEFORE UPDATE ON mtx_quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 14. mtx_tentativas_quiz
-- ============================================
CREATE TABLE mtx_tentativas_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  quiz_id UUID NOT NULL REFERENCES mtx_quizzes(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES mtx_turmas(id) ON DELETE SET NULL,
  realizado BOOLEAN DEFAULT false,
  acertou_de_primeira BOOLEAN DEFAULT false,
  acertos INT DEFAULT 0,
  tentativas INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, aluno_id)
);

CREATE INDEX idx_mtx_tentativas_quiz_professor ON mtx_tentativas_quiz(professor_id);
CREATE INDEX idx_mtx_tentativas_quiz_quiz ON mtx_tentativas_quiz(quiz_id);
CREATE INDEX idx_mtx_tentativas_quiz_aluno ON mtx_tentativas_quiz(aluno_id);

CREATE TRIGGER trg_mtx_tentativas_quiz_updated_at
  BEFORE UPDATE ON mtx_tentativas_quiz FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 15. mtx_atividades
-- ============================================
CREATE TABLE mtx_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  materia_id UUID REFERENCES mtx_materias(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  data_entrega DATE,
  nota_maxima NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_atividades_professor ON mtx_atividades(professor_id);
CREATE INDEX idx_mtx_atividades_turma ON mtx_atividades(turma_id);
CREATE INDEX idx_mtx_atividades_materia ON mtx_atividades(materia_id);

CREATE TRIGGER trg_mtx_atividades_updated_at
  BEFORE UPDATE ON mtx_atividades FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 16. mtx_entregas_atividade
-- ============================================
CREATE TABLE mtx_entregas_atividade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  atividade_id UUID NOT NULL REFERENCES mtx_atividades(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  status mtx_delivery_status DEFAULT 'pendente',
  nota NUMERIC,
  entregue_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(atividade_id, aluno_id)
);

CREATE INDEX idx_mtx_entregas_atividade_professor ON mtx_entregas_atividade(professor_id);
CREATE INDEX idx_mtx_entregas_atividade_atividade ON mtx_entregas_atividade(atividade_id);
CREATE INDEX idx_mtx_entregas_atividade_aluno ON mtx_entregas_atividade(aluno_id);

CREATE TRIGGER trg_mtx_entregas_atividade_updated_at
  BEFORE UPDATE ON mtx_entregas_atividade FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 17. mtx_reposicoes
-- ============================================
CREATE TABLE mtx_reposicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  materia_id UUID REFERENCES mtx_materias(id) ON DELETE SET NULL,
  aula_original_id UUID REFERENCES mtx_aulas(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  data DATE,
  status mtx_makeup_status DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_reposicoes_professor ON mtx_reposicoes(professor_id);
CREATE INDEX idx_mtx_reposicoes_turma ON mtx_reposicoes(turma_id);
CREATE INDEX idx_mtx_reposicoes_materia ON mtx_reposicoes(materia_id);

CREATE TRIGGER trg_mtx_reposicoes_updated_at
  BEFORE UPDATE ON mtx_reposicoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 18. mtx_entregas_reposicao
-- ============================================
CREATE TABLE mtx_entregas_reposicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  reposicao_id UUID NOT NULL REFERENCES mtx_reposicoes(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  status mtx_delivery_status DEFAULT 'pendente',
  entregue_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reposicao_id, aluno_id)
);

CREATE INDEX idx_mtx_entregas_reposicao_professor ON mtx_entregas_reposicao(professor_id);
CREATE INDEX idx_mtx_entregas_reposicao_reposicao ON mtx_entregas_reposicao(reposicao_id);
CREATE INDEX idx_mtx_entregas_reposicao_aluno ON mtx_entregas_reposicao(aluno_id);

CREATE TRIGGER trg_mtx_entregas_reposicao_updated_at
  BEFORE UPDATE ON mtx_entregas_reposicao FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 19. mtx_empresas_competicao
-- ============================================
CREATE TABLE mtx_empresas_competicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT,
  lider_aluno_id UUID REFERENCES mtx_alunos(id) ON DELETE SET NULL,
  pontos_comportamento INT DEFAULT 0,
  pontos_extras INT DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_empresas_competicao_professor ON mtx_empresas_competicao(professor_id);
CREATE INDEX idx_mtx_empresas_competicao_turma ON mtx_empresas_competicao(turma_id);

CREATE TRIGGER trg_mtx_empresas_competicao_updated_at
  BEFORE UPDATE ON mtx_empresas_competicao FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 20. mtx_membros_empresa_competicao
-- ============================================
CREATE TABLE mtx_membros_empresa_competicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  empresa_id UUID NOT NULL REFERENCES mtx_empresas_competicao(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, aluno_id)
);

CREATE INDEX idx_mtx_membros_empresa_professor ON mtx_membros_empresa_competicao(professor_id);
CREATE INDEX idx_mtx_membros_empresa_empresa ON mtx_membros_empresa_competicao(empresa_id);
CREATE INDEX idx_mtx_membros_empresa_aluno ON mtx_membros_empresa_competicao(aluno_id);

CREATE TRIGGER trg_mtx_membros_empresa_updated_at
  BEFORE UPDATE ON mtx_membros_empresa_competicao FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 21. mtx_perfis_aluno
-- ============================================
CREATE TABLE mtx_perfis_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  perfil_texto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_perfis_aluno_professor ON mtx_perfis_aluno(professor_id);
CREATE INDEX idx_mtx_perfis_aluno_aluno ON mtx_perfis_aluno(aluno_id);

CREATE TRIGGER trg_mtx_perfis_aluno_updated_at
  BEFORE UPDATE ON mtx_perfis_aluno FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 22. mtx_avisos_mural
-- ============================================
CREATE TABLE mtx_avisos_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  criado_por_user_id UUID REFERENCES profiles(id),
  criado_por_nome TEXT,
  criado_por_role TEXT,
  tipo mtx_notice_type DEFAULT 'aviso',
  audiencia mtx_notice_audience DEFAULT 'todas_turmas',
  target_professor_id UUID REFERENCES profiles(id),
  turma_id UUID REFERENCES mtx_turmas(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_avisos_mural_professor ON mtx_avisos_mural(professor_id);
CREATE INDEX idx_mtx_avisos_mural_criado_por ON mtx_avisos_mural(criado_por_user_id);
CREATE INDEX idx_mtx_avisos_mural_turma ON mtx_avisos_mural(turma_id);

CREATE TRIGGER trg_mtx_avisos_mural_updated_at
  BEFORE UPDATE ON mtx_avisos_mural FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 23. mtx_curtidas_aviso_mural
-- ============================================
CREATE TABLE mtx_curtidas_aviso_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  aviso_id UUID NOT NULL REFERENCES mtx_avisos_mural(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aviso_id, user_id)
);

CREATE INDEX idx_mtx_curtidas_aviso_professor ON mtx_curtidas_aviso_mural(professor_id);
CREATE INDEX idx_mtx_curtidas_aviso_aviso ON mtx_curtidas_aviso_mural(aviso_id);
CREATE INDEX idx_mtx_curtidas_aviso_user ON mtx_curtidas_aviso_mural(user_id);

CREATE TRIGGER trg_mtx_curtidas_aviso_updated_at
  BEFORE UPDATE ON mtx_curtidas_aviso_mural FOR EACH ROW EXECUTE FUNCTION update_updated_at();
