-- Pontuacoes individuais por aluno
CREATE TABLE mtx_pontuacoes_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  pontos INT NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtx_pontuacoes_aluno_professor ON mtx_pontuacoes_aluno(professor_id);
CREATE INDEX idx_mtx_pontuacoes_aluno_aluno ON mtx_pontuacoes_aluno(aluno_id);
CREATE INDEX idx_mtx_pontuacoes_aluno_turma ON mtx_pontuacoes_aluno(turma_id);
CREATE TRIGGER trg_mtx_pontuacoes_aluno_updated_at
  BEFORE UPDATE ON mtx_pontuacoes_aluno FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Avaliacoes (notas de prova) por aluno
CREATE TABLE mtx_avaliacoes_aluno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES profiles(id),
  aluno_id UUID NOT NULL REFERENCES mtx_alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES mtx_turmas(id) ON DELETE CASCADE,
  nota_prova_paulista NUMERIC,
  nota_prova NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, turma_id, professor_id)
);

CREATE INDEX idx_mtx_avaliacoes_aluno_professor ON mtx_avaliacoes_aluno(professor_id);
CREATE INDEX idx_mtx_avaliacoes_aluno_aluno ON mtx_avaliacoes_aluno(aluno_id);
CREATE INDEX idx_mtx_avaliacoes_aluno_turma ON mtx_avaliacoes_aluno(turma_id);
CREATE TRIGGER trg_mtx_avaliacoes_aluno_updated_at
  BEFORE UPDATE ON mtx_avaliacoes_aluno FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE mtx_pontuacoes_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtx_avaliacoes_aluno ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mtx_pontuacoes_aluno_select" ON mtx_pontuacoes_aluno FOR SELECT USING (
  professor_id = auth.uid() OR is_admin()
  OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
      AND professor_id = (SELECT target_professor_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "mtx_pontuacoes_aluno_insert" ON mtx_pontuacoes_aluno FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);
CREATE POLICY "mtx_pontuacoes_aluno_update" ON mtx_pontuacoes_aluno FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);
CREATE POLICY "mtx_pontuacoes_aluno_delete" ON mtx_pontuacoes_aluno FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);

CREATE POLICY "mtx_avaliacoes_aluno_select" ON mtx_avaliacoes_aluno FOR SELECT USING (
  professor_id = auth.uid() OR is_admin()
  OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'aluno')
      AND professor_id = (SELECT target_professor_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "mtx_avaliacoes_aluno_insert" ON mtx_avaliacoes_aluno FOR INSERT WITH CHECK (
  professor_id = auth.uid() OR is_admin()
);
CREATE POLICY "mtx_avaliacoes_aluno_update" ON mtx_avaliacoes_aluno FOR UPDATE USING (
  professor_id = auth.uid() OR is_admin()
);
CREATE POLICY "mtx_avaliacoes_aluno_delete" ON mtx_avaliacoes_aluno FOR DELETE USING (
  professor_id = auth.uid() OR is_admin()
);
