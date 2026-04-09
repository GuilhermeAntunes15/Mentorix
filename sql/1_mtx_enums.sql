-- ============================================
-- Mentorix: Enums
-- Execute no Supabase SQL Editor
-- Prefixo mtx_ para evitar conflito com outros projetos
-- ============================================

CREATE TYPE mtx_attendance_status AS ENUM ('nao_iniciada', 'em_andamento', 'concluida');
CREATE TYPE mtx_presence_status AS ENUM ('presente', 'ausente', 'justificado');
CREATE TYPE mtx_lesson_type AS ENUM ('regular', 'reposicao', 'quiz', 'atividade');
CREATE TYPE mtx_lesson_category AS ENUM ('aula', 'gestao');
CREATE TYPE mtx_management_task_type AS ENUM ('PAEET', 'ATPC', 'GESTAO');
CREATE TYPE mtx_delivery_status AS ENUM ('pendente', 'entregue', 'corrigido');
CREATE TYPE mtx_makeup_status AS ENUM ('pendente', 'feito', 'cancelado');
CREATE TYPE mtx_notice_type AS ENUM ('importante', 'aviso', 'evento');
CREATE TYPE mtx_notice_audience AS ENUM ('todas_turmas', 'turma', 'professor');
CREATE TYPE mtx_ata_status AS ENUM ('rascunho', 'aguardando_assinaturas', 'assinada_parcialmente', 'concluida');
