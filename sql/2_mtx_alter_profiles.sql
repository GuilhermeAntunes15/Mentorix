-- ============================================
-- Mentorix: Alteracoes na tabela profiles compartilhada
-- Execute no Supabase SQL Editor APOS 1_mtx_enums.sql
-- ============================================

-- Adicionar 'aluno' ao role_enum existente (usado por chamada-consa e consa-tec)
ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'aluno';

-- Colunas extras para o Mentorix na tabela profiles
-- Todas nullable para nao afetar registros existentes dos outros projetos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linked_student_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_sync_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_professor_id UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assigned_subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES profiles(id);

-- Funcao helper: verificar se usuario e professor ou admin ativo (contexto Mentorix)
CREATE OR REPLACE FUNCTION is_mtx_professor_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'professor')
      AND ativo = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
