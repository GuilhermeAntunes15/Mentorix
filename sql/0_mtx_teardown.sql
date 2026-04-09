-- ============================================
-- ATENCAO: SCRIPT DESTRUTIVO!
-- Mentorix: Teardown completo
-- Remove TODOS os objetos criados pelo Mentorix
-- Faca BACKUP do banco antes de executar!
-- Este script e idempotente (pode ser executado multiplas vezes)
-- ============================================

-- ============================================
-- Secao 1: DROP TABLES (ordem de dependencia, folhas primeiro)
-- CASCADE remove policies, triggers e indexes automaticamente
-- ============================================

-- Grupo 1: tabelas folha (sem dependentes)
DROP TABLE IF EXISTS mtx_curtidas_aviso_mural CASCADE;
DROP TABLE IF EXISTS mtx_frequencias CASCADE;
DROP TABLE IF EXISTS mtx_tentativas_quiz CASCADE;
DROP TABLE IF EXISTS mtx_entregas_atividade CASCADE;
DROP TABLE IF EXISTS mtx_entregas_reposicao CASCADE;
DROP TABLE IF EXISTS mtx_membros_empresa_competicao CASCADE;
DROP TABLE IF EXISTS mtx_assinaturas_ata CASCADE;
DROP TABLE IF EXISTS mtx_anotacoes_aula CASCADE;
DROP TABLE IF EXISTS mtx_perfis_aluno CASCADE;
DROP TABLE IF EXISTS mtx_pontuacoes_aluno CASCADE;
DROP TABLE IF EXISTS mtx_avaliacoes_aluno CASCADE;
DROP TABLE IF EXISTS mtx_agenda_pessoal CASCADE;

-- Grupo 2: tabelas intermediarias
DROP TABLE IF EXISTS mtx_chamadas CASCADE;
DROP TABLE IF EXISTS mtx_quizzes CASCADE;
DROP TABLE IF EXISTS mtx_atividades CASCADE;
DROP TABLE IF EXISTS mtx_reposicoes CASCADE;
DROP TABLE IF EXISTS mtx_empresas_competicao CASCADE;
DROP TABLE IF EXISTS mtx_avisos_mural CASCADE;
DROP TABLE IF EXISTS mtx_atas CASCADE;

-- Grupo 3: dependentes de tabelas base
DROP TABLE IF EXISTS mtx_aulas CASCADE;
DROP TABLE IF EXISTS mtx_aluno_turma CASCADE;
DROP TABLE IF EXISTS mtx_materias CASCADE;
DROP TABLE IF EXISTS mtx_materias_pessoais CASCADE;

-- Grupo 4: tabelas base
DROP TABLE IF EXISTS mtx_alunos CASCADE;
DROP TABLE IF EXISTS mtx_turmas CASCADE;

-- ============================================
-- Secao 2: DROP FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS mtx_get_student_professor_id();
DROP FUNCTION IF EXISTS is_mtx_professor_or_admin();

-- ============================================
-- Secao 3: DROP ENUMS
-- ============================================

DROP TYPE IF EXISTS mtx_attendance_status;
DROP TYPE IF EXISTS mtx_presence_status;
DROP TYPE IF EXISTS mtx_lesson_type;
DROP TYPE IF EXISTS mtx_lesson_category;
DROP TYPE IF EXISTS mtx_management_task_type;
DROP TYPE IF EXISTS mtx_delivery_status;
DROP TYPE IF EXISTS mtx_makeup_status;
DROP TYPE IF EXISTS mtx_notice_type;
DROP TYPE IF EXISTS mtx_notice_audience;
DROP TYPE IF EXISTS mtx_ata_status;

-- ============================================
-- Secao 4: REVERTER colunas adicionadas na tabela profiles
-- ============================================

ALTER TABLE profiles DROP COLUMN IF EXISTS username;
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_key;
ALTER TABLE profiles DROP COLUMN IF EXISTS linked_student_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS student_sync_key;
ALTER TABLE profiles DROP COLUMN IF EXISTS target_professor_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS profile_completed;
ALTER TABLE profiles DROP COLUMN IF EXISTS assigned_subjects;
ALTER TABLE profiles DROP COLUMN IF EXISTS professor_id;

-- ============================================
-- Secao 5: Nota sobre role_enum
-- ============================================
-- O valor 'aluno' adicionado ao role_enum NAO pode ser removido.
-- PostgreSQL nao suporta ALTER TYPE ... REMOVE VALUE.
-- Caso necessario, seria preciso recriar o enum inteiro e migrar
-- todas as colunas que o utilizam, o que e arriscado e desnecessario.
-- O valor 'aluno' permanecera no role_enum sem causar efeitos colaterais.
-- ============================================
