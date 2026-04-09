-- ============================================
-- Mentorix: Seed de aulas recorrentes
-- Escola: Conselheiro Crispiniano
-- Professor: aed115f2-ccfd-40a9-a5ea-87bab8fa2155
-- Baseado no horario enviado em imagem
-- ============================================

DO $$
DECLARE
  v_professor_id UUID := 'aed115f2-ccfd-40a9-a5ea-87bab8fa2155';
  v_escola TEXT := 'Conselheiro Crispiniano';

  v_turma_2a_ds UUID;
  v_turma_2b_ds UUID;

  v_materia_logicalp_2a UUID;
  v_materia_logicalp_2b UUID;
  v_materia_carreira_ds_2a UUID;
  v_materia_carreira_ds_2b UUID;
BEGIN
  -- ===========================================
  -- GARANTIR TURMAS
  -- ===========================================
  SELECT id
    INTO v_turma_2a_ds
    FROM mtx_turmas
   WHERE professor_id = v_professor_id
     AND (nome = '2A DS' OR codigo = '2A-DS')
   LIMIT 1;

  IF v_turma_2a_ds IS NULL THEN
    INSERT INTO mtx_turmas (professor_id, nome, codigo, periodo)
    VALUES (v_professor_id, '2A DS', '2A-DS', '2026')
    RETURNING id INTO v_turma_2a_ds;
  END IF;

  SELECT id
    INTO v_turma_2b_ds
    FROM mtx_turmas
   WHERE professor_id = v_professor_id
     AND (nome = '2B DS' OR codigo = '2B-DS')
   LIMIT 1;

  IF v_turma_2b_ds IS NULL THEN
    INSERT INTO mtx_turmas (professor_id, nome, codigo, periodo)
    VALUES (v_professor_id, '2B DS', '2B-DS', '2026')
    RETURNING id INTO v_turma_2b_ds;
  END IF;

  -- ===========================================
  -- GARANTIR MATERIAS
  -- ===========================================
  SELECT id
    INTO v_materia_logicalp_2a
    FROM mtx_materias
   WHERE professor_id = v_professor_id
     AND turma_id = v_turma_2a_ds
     AND nome = 'LogicaLP'
   LIMIT 1;

  IF v_materia_logicalp_2a IS NULL THEN
    INSERT INTO mtx_materias (professor_id, turma_id, nome, codigo, cor, descricao)
    VALUES (v_professor_id, v_turma_2a_ds, 'LogicaLP', 'LOG-2A', '#2563eb', 'Aulas de LogicaLP da turma 2A DS')
    RETURNING id INTO v_materia_logicalp_2a;
  END IF;

  SELECT id
    INTO v_materia_logicalp_2b
    FROM mtx_materias
   WHERE professor_id = v_professor_id
     AND turma_id = v_turma_2b_ds
     AND nome = 'LogicaLP'
   LIMIT 1;

  IF v_materia_logicalp_2b IS NULL THEN
    INSERT INTO mtx_materias (professor_id, turma_id, nome, codigo, cor, descricao)
    VALUES (v_professor_id, v_turma_2b_ds, 'LogicaLP', 'LOG-2B', '#1d4ed8', 'Aulas de LogicaLP da turma 2B DS')
    RETURNING id INTO v_materia_logicalp_2b;
  END IF;

  SELECT id
    INTO v_materia_carreira_ds_2a
    FROM mtx_materias
   WHERE professor_id = v_professor_id
     AND turma_id = v_turma_2a_ds
     AND nome = 'Carreira DS'
   LIMIT 1;

  IF v_materia_carreira_ds_2a IS NULL THEN
    INSERT INTO mtx_materias (professor_id, turma_id, nome, codigo, cor, descricao)
    VALUES (v_professor_id, v_turma_2a_ds, 'Carreira DS', 'CAR-2A', '#0f766e', 'Aulas de Carreira DS da turma 2A DS')
    RETURNING id INTO v_materia_carreira_ds_2a;
  END IF;

  SELECT id
    INTO v_materia_carreira_ds_2b
    FROM mtx_materias
   WHERE professor_id = v_professor_id
     AND turma_id = v_turma_2b_ds
     AND nome = 'Carreira DS'
   LIMIT 1;

  IF v_materia_carreira_ds_2b IS NULL THEN
    INSERT INTO mtx_materias (professor_id, turma_id, nome, codigo, cor, descricao)
    VALUES (v_professor_id, v_turma_2b_ds, 'Carreira DS', 'CAR-2B', '#115e59', 'Aulas de Carreira DS da turma 2B DS')
    RETURNING id INTO v_materia_carreira_ds_2b;
  END IF;

  -- ===========================================
  -- LIMPEZA DOS SLOTS DO HORARIO
  -- Apenas os slots recorrentes da grade enviada
  -- ===========================================
  DELETE FROM mtx_aulas
   WHERE professor_id = v_professor_id
     AND escola = v_escola
     AND recorrente = true
     AND (
       (dia_semana = 1 AND hora_inicio IN ('07:00', '07:50', '08:40', '10:00', '10:50', '11:40', '13:30')) OR
       (dia_semana = 2 AND hora_inicio IN ('07:00', '07:50', '08:40', '10:00', '10:50', '11:40', '13:30', '14:20', '15:10')) OR
       (dia_semana = 3 AND hora_inicio IN ('10:50', '11:40', '13:30', '15:10')) OR
       (dia_semana = 4 AND hora_inicio IN ('07:50', '08:40', '10:00', '10:50', '11:40', '14:20', '15:10')) OR
       (dia_semana = 5 AND hora_inicio IN ('07:00', '07:50', '08:40', '10:00', '10:50', '11:40'))
     );

  -- ===========================================
  -- SEGUNDA-FEIRA
  -- ===========================================
  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2b_ds, v_materia_logicalp_2b, 'LogicaLP - 2B DS', v_escola, DATE '2026-01-05', 1, true, '07:00', '07:50', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2b_ds, v_materia_logicalp_2b, 'LogicaLP - 2B DS', v_escola, DATE '2026-01-05', 1, true, '07:50', '08:40', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-05', 1, true, '08:40', '09:30', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-05', 1, true, '10:00', '10:50', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-05', 1, true, '10:50', '11:40', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-05', 1, true, '11:40', '12:30', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2a_ds, v_materia_carreira_ds_2a, 'Carreira DS - 2A DS', v_escola, DATE '2026-01-05', 1, true, '13:30', '14:20', 'aula', 'regular');

  -- ===========================================
  -- TERCA-FEIRA
  -- ===========================================
  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'ATPCG', v_escola, DATE '2026-01-06', 2, true, '07:00', '07:50', 'gestao', 'ATPC', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'ATPCG', v_escola, DATE '2026-01-06', 2, true, '07:50', '08:40', 'gestao', 'ATPC', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-06', 2, true, '08:40', '09:30', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-06', 2, true, '10:00', '10:50', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-06', 2, true, '10:50', '11:40', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-06', 2, true, '11:40', '12:30', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2b_ds, v_materia_carreira_ds_2b, 'Carreira DS - 2B DS', v_escola, DATE '2026-01-06', 2, true, '13:30', '14:20', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2a_ds, v_materia_logicalp_2a, 'LogicaLP - 2A DS', v_escola, DATE '2026-01-06', 2, true, '14:20', '15:10', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2a_ds, v_materia_logicalp_2a, 'LogicaLP - 2A DS', v_escola, DATE '2026-01-06', 2, true, '15:10', '16:00', 'aula', 'regular');

  -- ===========================================
  -- QUARTA-FEIRA
  -- ===========================================
  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-07', 3, true, '10:50', '11:40', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-07', 3, true, '11:40', '12:30', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2a_ds, v_materia_carreira_ds_2a, 'Carreira DS - 2A DS', v_escola, DATE '2026-01-07', 3, true, '13:30', '14:20', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2b_ds, v_materia_carreira_ds_2b, 'Carreira DS - 2B DS', v_escola, DATE '2026-01-07', 3, true, '15:10', '16:00', 'aula', 'regular');

  -- ===========================================
  -- QUINTA-FEIRA
  -- ===========================================
  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-08', 4, true, '07:50', '08:40', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-08', 4, true, '08:40', '09:30', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2a_ds, v_materia_carreira_ds_2a, 'Carreira DS - 2A DS', v_escola, DATE '2026-01-08', 4, true, '10:00', '10:50', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-08', 4, true, '10:50', '11:40', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-08', 4, true, '11:40', '12:30', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2b_ds, v_materia_logicalp_2b, 'LogicaLP - 2B DS', v_escola, DATE '2026-01-08', 4, true, '14:20', '15:10', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2b_ds, v_materia_logicalp_2b, 'LogicaLP - 2B DS', v_escola, DATE '2026-01-08', 4, true, '15:10', '16:00', 'aula', 'regular');

  -- ===========================================
  -- SEXTA-FEIRA
  -- ===========================================
  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'ATPCA', v_escola, DATE '2026-01-09', 5, true, '07:00', '07:50', 'gestao', 'ATPC', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2a_ds, v_materia_logicalp_2a, 'LogicaLP - 2A DS', v_escola, DATE '2026-01-09', 5, true, '07:50', '08:40', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2a_ds, v_materia_logicalp_2a, 'LogicaLP - 2A DS', v_escola, DATE '2026-01-09', 5, true, '08:40', '09:30', 'aula', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-09', 5, true, '10:00', '10:50', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, gestao_tipo, tipo)
  VALUES (v_professor_id, 'PAAET', v_escola, DATE '2026-01-09', 5, true, '10:50', '11:40', 'gestao', 'PAEET', 'regular');

  INSERT INTO mtx_aulas (professor_id, turma_id, materia_id, titulo, escola, data, dia_semana, recorrente, hora_inicio, hora_fim, categoria, tipo)
  VALUES (v_professor_id, v_turma_2b_ds, v_materia_carreira_ds_2b, 'Carreira DS - 2B DS', v_escola, DATE '2026-01-09', 5, true, '11:40', '12:30', 'aula', 'regular');

  RAISE NOTICE 'Seed de aulas da escola % aplicado com sucesso.', v_escola;
  RAISE NOTICE 'Turmas usadas: 2A DS (%) e 2B DS (%)', v_turma_2a_ds, v_turma_2b_ds;
END $$;
