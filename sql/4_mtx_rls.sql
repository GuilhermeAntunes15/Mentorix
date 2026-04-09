-- ============================================
-- Mentorix: Row Level Security (RLS)
-- Execute no Supabase SQL Editor APOS 3_mtx_schema.sql
-- ============================================

-- ============================================
-- Habilitar RLS em todas as tabelas
-- ============================================
ALTER TABLE mtx_turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_aluno_turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_materias_pessoais ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_agenda_pessoal ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_anotacoes_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_assinaturas_ata ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_chamadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_frequencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_tentativas_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_entregas_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_reposicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_entregas_reposicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_empresas_competicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_membros_empresa_competicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_perfis_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_avisos_mural ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_curtidas_aviso_mural ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Macro: padrao geral para tabelas com professor_id
-- Professor ve seus dados, admin ve tudo, aluno ve dados do professor vinculado
-- ============================================

-- Helper para pegar o target_professor_id do aluno logado
CREATE OR REPLACE FUNCTION mtx_get_student_professor_id()
RETURNS UUID AS $$
  SELECT target_professor_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 1. mtx_turmas
-- ============================================
CREATE POLICY "mtx_turmas_select" ON mtx_turmas FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_turmas_insert" ON mtx_turmas FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_turmas_update" ON mtx_turmas FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_turmas_delete" ON mtx_turmas FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 2. mtx_alunos
-- ============================================
CREATE POLICY "mtx_alunos_select" ON mtx_alunos FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_alunos_insert" ON mtx_alunos FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_alunos_update" ON mtx_alunos FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_alunos_delete" ON mtx_alunos FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 3. mtx_aluno_turma
-- ============================================
CREATE POLICY "mtx_aluno_turma_select" ON mtx_aluno_turma FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_aluno_turma_insert" ON mtx_aluno_turma FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_aluno_turma_update" ON mtx_aluno_turma FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_aluno_turma_delete" ON mtx_aluno_turma FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 4. mtx_materias
-- ============================================
CREATE POLICY "mtx_materias_select" ON mtx_materias FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_materias_insert" ON mtx_materias FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_materias_update" ON mtx_materias FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_materias_delete" ON mtx_materias FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 5. mtx_materias_pessoais (user_id, nao professor_id)
-- ============================================
CREATE POLICY "mtx_materias_pessoais_select" ON mtx_materias_pessoais FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "mtx_materias_pessoais_insert" ON mtx_materias_pessoais FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "mtx_materias_pessoais_update" ON mtx_materias_pessoais FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "mtx_materias_pessoais_delete" ON mtx_materias_pessoais FOR DELETE USING (
  user_id = auth.uid()
);

-- ============================================
-- 6. mtx_aulas
-- ============================================
CREATE POLICY "mtx_aulas_select" ON mtx_aulas FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_aulas_insert" ON mtx_aulas FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_aulas_update" ON mtx_aulas FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_aulas_delete" ON mtx_aulas FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 7. mtx_agenda_pessoal (user_id, nao professor_id)
-- ============================================
CREATE POLICY "mtx_agenda_pessoal_select" ON mtx_agenda_pessoal FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "mtx_agenda_pessoal_insert" ON mtx_agenda_pessoal FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "mtx_agenda_pessoal_update" ON mtx_agenda_pessoal FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "mtx_agenda_pessoal_delete" ON mtx_agenda_pessoal FOR DELETE USING (
  user_id = auth.uid()
);

-- ============================================
-- 8. mtx_anotacoes_aula
-- ============================================
CREATE POLICY "mtx_anotacoes_aula_select" ON mtx_anotacoes_aula FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_anotacoes_aula_insert" ON mtx_anotacoes_aula FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_anotacoes_aula_update" ON mtx_anotacoes_aula FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_anotacoes_aula_delete" ON mtx_anotacoes_aula FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 9. mtx_atas (excecao: participantes tambem podem ver)
-- ============================================
CREATE POLICY "mtx_atas_select" ON mtx_atas FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR auth.uid() = ANY(participant_user_ids)
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_atas_insert" ON mtx_atas FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_atas_update" ON mtx_atas FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_atas_delete" ON mtx_atas FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 10. mtx_assinaturas_ata (excecao: participantes da ata podem ver)
-- ============================================
CREATE POLICY "mtx_assinaturas_ata_select" ON mtx_assinaturas_ata FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR EXISTS (
    SELECT 1 FROM mtx_atas
    WHERE mtx_atas.id = mtx_assinaturas_ata.ata_id
      AND auth.uid() = ANY(mtx_atas.participant_user_ids)
  )
);

CREATE POLICY "mtx_assinaturas_ata_insert" ON mtx_assinaturas_ata FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_assinaturas_ata_update" ON mtx_assinaturas_ata FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_assinaturas_ata_delete" ON mtx_assinaturas_ata FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 11. mtx_chamadas
-- ============================================
CREATE POLICY "mtx_chamadas_select" ON mtx_chamadas FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_chamadas_insert" ON mtx_chamadas FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_chamadas_update" ON mtx_chamadas FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_chamadas_delete" ON mtx_chamadas FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 12. mtx_frequencias
-- ============================================
CREATE POLICY "mtx_frequencias_select" ON mtx_frequencias FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_frequencias_insert" ON mtx_frequencias FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_frequencias_update" ON mtx_frequencias FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_frequencias_delete" ON mtx_frequencias FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 13. mtx_quizzes
-- ============================================
CREATE POLICY "mtx_quizzes_select" ON mtx_quizzes FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_quizzes_insert" ON mtx_quizzes FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_quizzes_update" ON mtx_quizzes FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_quizzes_delete" ON mtx_quizzes FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 14. mtx_tentativas_quiz
-- ============================================
CREATE POLICY "mtx_tentativas_quiz_select" ON mtx_tentativas_quiz FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_tentativas_quiz_insert" ON mtx_tentativas_quiz FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_tentativas_quiz_update" ON mtx_tentativas_quiz FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_tentativas_quiz_delete" ON mtx_tentativas_quiz FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 15. mtx_atividades
-- ============================================
CREATE POLICY "mtx_atividades_select" ON mtx_atividades FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_atividades_insert" ON mtx_atividades FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_atividades_update" ON mtx_atividades FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_atividades_delete" ON mtx_atividades FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 16. mtx_entregas_atividade
-- ============================================
CREATE POLICY "mtx_entregas_atividade_select" ON mtx_entregas_atividade FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_entregas_atividade_insert" ON mtx_entregas_atividade FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_entregas_atividade_update" ON mtx_entregas_atividade FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_entregas_atividade_delete" ON mtx_entregas_atividade FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 17. mtx_reposicoes
-- ============================================
CREATE POLICY "mtx_reposicoes_select" ON mtx_reposicoes FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_reposicoes_insert" ON mtx_reposicoes FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_reposicoes_update" ON mtx_reposicoes FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_reposicoes_delete" ON mtx_reposicoes FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 18. mtx_entregas_reposicao
-- ============================================
CREATE POLICY "mtx_entregas_reposicao_select" ON mtx_entregas_reposicao FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_entregas_reposicao_insert" ON mtx_entregas_reposicao FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_entregas_reposicao_update" ON mtx_entregas_reposicao FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_entregas_reposicao_delete" ON mtx_entregas_reposicao FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 19. mtx_empresas_competicao
-- ============================================
CREATE POLICY "mtx_empresas_competicao_select" ON mtx_empresas_competicao FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_empresas_competicao_insert" ON mtx_empresas_competicao FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_empresas_competicao_update" ON mtx_empresas_competicao FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_empresas_competicao_delete" ON mtx_empresas_competicao FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 20. mtx_membros_empresa_competicao
-- ============================================
CREATE POLICY "mtx_membros_empresa_select" ON mtx_membros_empresa_competicao FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_membros_empresa_insert" ON mtx_membros_empresa_competicao FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_membros_empresa_update" ON mtx_membros_empresa_competicao FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_membros_empresa_delete" ON mtx_membros_empresa_competicao FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 21. mtx_perfis_aluno
-- ============================================
CREATE POLICY "mtx_perfis_aluno_select" ON mtx_perfis_aluno FOR SELECT USING (
  professor_id = auth.uid()
  OR is_admin()
  OR (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
    AND professor_id = mtx_get_student_professor_id()
  )
);

CREATE POLICY "mtx_perfis_aluno_insert" ON mtx_perfis_aluno FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_perfis_aluno_update" ON mtx_perfis_aluno FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_perfis_aluno_delete" ON mtx_perfis_aluno FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 22. mtx_avisos_mural (excecao: todos autenticados podem ver)
-- ============================================
CREATE POLICY "mtx_avisos_mural_select" ON mtx_avisos_mural FOR SELECT USING (
  auth.uid() IS NOT NULL
);

CREATE POLICY "mtx_avisos_mural_insert" ON mtx_avisos_mural FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_avisos_mural_update" ON mtx_avisos_mural FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_avisos_mural_delete" ON mtx_avisos_mural FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

-- ============================================
-- 23. mtx_curtidas_aviso_mural (excecao: todos veem, user controla as suas)
-- ============================================
CREATE POLICY "mtx_curtidas_aviso_select" ON mtx_curtidas_aviso_mural FOR SELECT USING (
  auth.uid() IS NOT NULL
);

CREATE POLICY "mtx_curtidas_aviso_insert" ON mtx_curtidas_aviso_mural FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "mtx_curtidas_aviso_update" ON mtx_curtidas_aviso_mural FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "mtx_curtidas_aviso_delete" ON mtx_curtidas_aviso_mural FOR DELETE USING (
  user_id = auth.uid()
);
