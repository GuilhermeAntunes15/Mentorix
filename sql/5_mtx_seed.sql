-- ============================================
-- Mentorix: Seed de dados iniciais (turmas 2A e 2B)
-- Execute no Supabase SQL Editor APOS 4_mtx_rls.sql
--
-- IMPORTANTE: Substitua o UUID abaixo pelo UUID real do professor no Supabase
-- Voce pode encontrar o UUID em: Authentication > Users no dashboard do Supabase
-- ============================================

DO $$
DECLARE
  -- ===========================================
  -- SUBSTITUA pelo UUID do professor no Supabase
  -- ===========================================
  v_professor_id UUID := 'aed115f2-ccfd-40a9-a5ea-87bab8fa2155';

  -- Turmas
  v_turma_2a UUID;
  v_turma_2b UUID;

  -- Alunos 2A (43 alunos)
  v_2a_amanda UUID;
  v_2a_ana_julia UUID;
  v_2a_danielly UUID;
  v_2a_gustavo_melo UUID;
  v_2a_matheus_figueredo UUID;
  v_2a_joao_vitor_freiris UUID;
  v_2a_andre_klemar UUID;
  v_2a_rafaella UUID;
  v_2a_larissa_lee UUID;
  v_2a_ingrid UUID;
  v_2a_vitoria_pietra UUID;
  v_2a_alice_rayssa UUID;
  v_2a_alice_bueno UUID;
  v_2a_victor_bezo UUID;
  v_2a_arthur_santos UUID;
  v_2a_pedro_h_santos UUID;
  v_2a_murilo_viana UUID;
  v_2a_julia_lima UUID;
  v_2a_enzo_gabriel UUID;
  v_2a_sophia_diniz UUID;
  v_2a_murillo_moura UUID;
  v_2a_eduardo_oliveira UUID;
  v_2a_isabella_joana UUID;
  v_2a_samuel_tomas UUID;
  v_2a_fernanda UUID;
  v_2a_katlyn UUID;
  v_2a_helena UUID;
  v_2a_victor_hugo UUID;
  v_2a_pedro_h_silva UUID;
  v_2a_joao_victor_silva UUID;
  v_2a_murillo_fernandes UUID;
  v_2a_matheus_henrique UUID;
  v_2a_guilherme_costa UUID;
  v_2a_gabriel_goncalves UUID;
  v_2a_luiza_mambre UUID;
  v_2a_felipe_alcides UUID;
  v_2a_pietro_giovane UUID;
  v_2a_julia_silva UUID;
  v_2a_isabelly_cristina UUID;
  v_2a_arthur_caldeira UUID;
  v_2a_gilson_junior UUID;

  -- Alunos 2B (38 alunos)
  v_2b_yasmin_cristiny UUID;
  v_2b_leticia_gomes UUID;
  v_2b_isabela_haunholter UUID;
  v_2b_maria_eduarda_santana UUID;
  v_2b_rayssa_augusto UUID;
  v_2b_nadine_gabriele UUID;
  v_2b_edson UUID;
  v_2b_nicolas_dias UUID;
  v_2b_kayqui UUID;
  v_2b_kaique_costa UUID;
  v_2b_kaio UUID;
  v_2b_pedro_h_menezes UUID;
  v_2b_paulo_h_almeida UUID;
  v_2b_pedro_laurindo UUID;
  v_2b_maria_eduarda_luna UUID;
  v_2b_miguel_sergio UUID;
  v_2b_jorge UUID;
  v_2b_lucas_soares UUID;
  v_2b_jhonathan_garcia UUID;
  v_2b_lycia UUID;
  v_2b_davi_cardoso UUID;
  v_2b_ryan_emanuel UUID;
  v_2b_julianna_delgado UUID;
  v_2b_anna_karolina UUID;
  v_2b_ana_sofia UUID;
  v_2b_mayumi UUID;
  v_2b_davi_felix UUID;
  v_2b_rhyan_fellype UUID;
  v_2b_isaac_portioli UUID;
  v_2b_alicia_lopes UUID;
  v_2b_guilherme_tadeu UUID;
  v_2b_pedro_henrique_oliveira UUID;
  v_2b_yasmin_de_melo UUID;
  v_2b_geovanna_pereira UUID;
  v_2b_eduarda_silva UUID;
  v_2b_eduarda_pinheiro UUID;
  v_2b_laura_martins UUID;
  v_2b_ayron_wolverine UUID;

  -- Empresas 2A (7 grupos)
  v_2a_grupo1 UUID;
  v_2a_grupo2 UUID;
  v_2a_grupo3 UUID;
  v_2a_grupo4 UUID;
  v_2a_grupo5 UUID;
  v_2a_grupo6 UUID;
  v_2a_grupo7 UUID;

  -- Empresas 2B (6 grupos)
  v_2b_grupo1 UUID;
  v_2b_grupo2 UUID;
  v_2b_grupo3 UUID;
  v_2b_grupo4 UUID;
  v_2b_grupo5 UUID;
  v_2b_grupo6 UUID;

BEGIN
  -- ===========================================
  -- LIMPEZA: Remover dados antigos do professor
  -- ===========================================
  DELETE FROM mtx_membros_empresa_competicao WHERE professor_id = v_professor_id;
  DELETE FROM mtx_empresas_competicao WHERE professor_id = v_professor_id;
  DELETE FROM mtx_aluno_turma WHERE professor_id = v_professor_id;
  DELETE FROM mtx_alunos WHERE professor_id = v_professor_id;
  DELETE FROM mtx_turmas WHERE professor_id = v_professor_id;

  -- ===========================================
  -- TURMAS
  -- ===========================================
  INSERT INTO mtx_turmas (professor_id, nome, codigo, periodo)
    VALUES (v_professor_id, '2a Serie A', '2A', '2026')
    RETURNING id INTO v_turma_2a;

  INSERT INTO mtx_turmas (professor_id, nome, codigo, periodo)
    VALUES (v_professor_id, '2a Serie B', '2B', '2026')
    RETURNING id INTO v_turma_2b;

  -- ===========================================
  -- ALUNOS 2A (43 alunos)
  -- ===========================================
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Amanda') RETURNING id INTO v_2a_amanda;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Ana Julia de Souza Borges') RETURNING id INTO v_2a_ana_julia;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Danielly') RETURNING id INTO v_2a_danielly;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Gustavo Melo') RETURNING id INTO v_2a_gustavo_melo;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Matheus Figueredo') RETURNING id INTO v_2a_matheus_figueredo;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Joao Vitor Freiris') RETURNING id INTO v_2a_joao_vitor_freiris;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Andre Klemar') RETURNING id INTO v_2a_andre_klemar;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Rafaella G.') RETURNING id INTO v_2a_rafaella;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Larissa Lee') RETURNING id INTO v_2a_larissa_lee;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Ingrid') RETURNING id INTO v_2a_ingrid;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Vitoria Pietra') RETURNING id INTO v_2a_vitoria_pietra;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Alice Rayssa Oliveira Silva') RETURNING id INTO v_2a_alice_rayssa;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Alice Bueno') RETURNING id INTO v_2a_alice_bueno;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Victor Bezo Lira') RETURNING id INTO v_2a_victor_bezo;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Arthur dos Santos') RETURNING id INTO v_2a_arthur_santos;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Pedro H. Santos') RETURNING id INTO v_2a_pedro_h_santos;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Murilo Viana') RETURNING id INTO v_2a_murilo_viana;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Julia Lima') RETURNING id INTO v_2a_julia_lima;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Enzo Gabriel') RETURNING id INTO v_2a_enzo_gabriel;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Sophia Diniz') RETURNING id INTO v_2a_sophia_diniz;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Murillo Moura') RETURNING id INTO v_2a_murillo_moura;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Eduardo Oliveira') RETURNING id INTO v_2a_eduardo_oliveira;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Isabella Joana') RETURNING id INTO v_2a_isabella_joana;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Samuel Tomas') RETURNING id INTO v_2a_samuel_tomas;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Fernanda') RETURNING id INTO v_2a_fernanda;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Katlyn') RETURNING id INTO v_2a_katlyn;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Helena') RETURNING id INTO v_2a_helena;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Victor Hugo') RETURNING id INTO v_2a_victor_hugo;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Pedro H. Silva') RETURNING id INTO v_2a_pedro_h_silva;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Joao Victor Silva') RETURNING id INTO v_2a_joao_victor_silva;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Murillo Fernandes Santos') RETURNING id INTO v_2a_murillo_fernandes;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Matheus Henrique') RETURNING id INTO v_2a_matheus_henrique;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Guilherme Costa') RETURNING id INTO v_2a_guilherme_costa;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Gabriel Goncalves') RETURNING id INTO v_2a_gabriel_goncalves;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Luiza Mambre Mocci') RETURNING id INTO v_2a_luiza_mambre;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Felipe Alcides dos Santos') RETURNING id INTO v_2a_felipe_alcides;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Pietro Giovane Lima de Oliveira') RETURNING id INTO v_2a_pietro_giovane;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Julia Silva') RETURNING id INTO v_2a_julia_silva;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Isabelly Cristina Chialastre Ianicelli') RETURNING id INTO v_2a_isabelly_cristina;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Arthur Caldeira Martins') RETURNING id INTO v_2a_arthur_caldeira;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Gilson Junior de Freitas Castro') RETURNING id INTO v_2a_gilson_junior;

  -- ===========================================
  -- ALUNOS 2B (38 alunos)
  -- ===========================================
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Yasmin Cristiny') RETURNING id INTO v_2b_yasmin_cristiny;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Leticia Gomes da Silva') RETURNING id INTO v_2b_leticia_gomes;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Isabela Haunholter Junqueira') RETURNING id INTO v_2b_isabela_haunholter;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Maria Eduarda Santana') RETURNING id INTO v_2b_maria_eduarda_santana;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Rayssa Augusto Heleno') RETURNING id INTO v_2b_rayssa_augusto;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Nadine Gabriele') RETURNING id INTO v_2b_nadine_gabriele;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Edson') RETURNING id INTO v_2b_edson;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Nicolas Dias') RETURNING id INTO v_2b_nicolas_dias;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Kayqui de Oliveira Barbosa') RETURNING id INTO v_2b_kayqui;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Kaique Costa') RETURNING id INTO v_2b_kaique_costa;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Kaio') RETURNING id INTO v_2b_kaio;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Pedro H. Menezes') RETURNING id INTO v_2b_pedro_h_menezes;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Paulo H. Almeida') RETURNING id INTO v_2b_paulo_h_almeida;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Pedro Laurindo') RETURNING id INTO v_2b_pedro_laurindo;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Maria Eduarda de Luna Queiroga') RETURNING id INTO v_2b_maria_eduarda_luna;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Miguel Sergio') RETURNING id INTO v_2b_miguel_sergio;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Jorge') RETURNING id INTO v_2b_jorge;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Lucas Soares') RETURNING id INTO v_2b_lucas_soares;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Jhonathan Garcia Freitas') RETURNING id INTO v_2b_jhonathan_garcia;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Lycia') RETURNING id INTO v_2b_lycia;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Davi Cardoso') RETURNING id INTO v_2b_davi_cardoso;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Ryan Emanuel') RETURNING id INTO v_2b_ryan_emanuel;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Julianna Delgado Domingues') RETURNING id INTO v_2b_julianna_delgado;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Anna Karolina') RETURNING id INTO v_2b_anna_karolina;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Ana Sofia') RETURNING id INTO v_2b_ana_sofia;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Mayumi') RETURNING id INTO v_2b_mayumi;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Davi Felix') RETURNING id INTO v_2b_davi_felix;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Rhyan Fellype') RETURNING id INTO v_2b_rhyan_fellype;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Isaac Portioli de Souza Oliveira') RETURNING id INTO v_2b_isaac_portioli;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Alicia Lopes') RETURNING id INTO v_2b_alicia_lopes;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Guilherme Tadeu Cardoso dos Santos') RETURNING id INTO v_2b_guilherme_tadeu;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Pedro Henrique Oliveira Santos') RETURNING id INTO v_2b_pedro_henrique_oliveira;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Yasmin de Melo') RETURNING id INTO v_2b_yasmin_de_melo;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Geovanna Pereira') RETURNING id INTO v_2b_geovanna_pereira;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Eduarda Silva') RETURNING id INTO v_2b_eduarda_silva;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Eduarda Pinheiro') RETURNING id INTO v_2b_eduarda_pinheiro;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Laura Martins') RETURNING id INTO v_2b_laura_martins;
  INSERT INTO mtx_alunos (professor_id, nome) VALUES (v_professor_id, 'Ayron Wolverine') RETURNING id INTO v_2b_ayron_wolverine;

  -- ===========================================
  -- VINCULAR ALUNOS AS TURMAS (mtx_aluno_turma)
  -- ===========================================

  -- Alunos 2A
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_amanda, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_ana_julia, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_danielly, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_gustavo_melo, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_matheus_figueredo, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_joao_vitor_freiris, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_andre_klemar, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_rafaella, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_larissa_lee, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_ingrid, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_vitoria_pietra, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_alice_rayssa, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_alice_bueno, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_victor_bezo, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_arthur_santos, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_pedro_h_santos, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_murilo_viana, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_julia_lima, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_enzo_gabriel, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_sophia_diniz, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_murillo_moura, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_eduardo_oliveira, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_isabella_joana, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_samuel_tomas, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_fernanda, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_katlyn, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_helena, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_victor_hugo, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_pedro_h_silva, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_joao_victor_silva, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_murillo_fernandes, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_matheus_henrique, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_guilherme_costa, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_gabriel_goncalves, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_luiza_mambre, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_felipe_alcides, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_pietro_giovane, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_julia_silva, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_isabelly_cristina, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_arthur_caldeira, v_turma_2a);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2a_gilson_junior, v_turma_2a);

  -- Alunos 2B
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_yasmin_cristiny, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_leticia_gomes, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_isabela_haunholter, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_maria_eduarda_santana, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_rayssa_augusto, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_nadine_gabriele, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_edson, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_nicolas_dias, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_kayqui, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_kaique_costa, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_kaio, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_pedro_h_menezes, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_paulo_h_almeida, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_pedro_laurindo, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_maria_eduarda_luna, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_miguel_sergio, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_jorge, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_lucas_soares, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_jhonathan_garcia, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_lycia, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_davi_cardoso, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_ryan_emanuel, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_julianna_delgado, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_anna_karolina, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_ana_sofia, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_mayumi, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_davi_felix, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_rhyan_fellype, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_isaac_portioli, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_alicia_lopes, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_guilherme_tadeu, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_pedro_henrique_oliveira, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_yasmin_de_melo, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_geovanna_pereira, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_eduarda_silva, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_eduarda_pinheiro, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_laura_martins, v_turma_2b);
  INSERT INTO mtx_aluno_turma (professor_id, aluno_id, turma_id) VALUES (v_professor_id, v_2b_ayron_wolverine, v_turma_2b);

  -- ===========================================
  -- EMPRESAS DE COMPETICAO - 2A (7 grupos)
  -- ===========================================
  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2a, 'Level Up', v_2a_amanda)
    RETURNING id INTO v_2a_grupo1;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2a, 'Niox', v_2a_gustavo_melo)
    RETURNING id INTO v_2a_grupo2;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2a, 'EcoDrop', v_2a_rafaella)
    RETURNING id INTO v_2a_grupo3;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2a, 'VPAM', v_2a_victor_bezo)
    RETURNING id INTO v_2a_grupo4;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2a, 'Discounter', v_2a_julia_lima)
    RETURNING id INTO v_2a_grupo5;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2a, 'Arch Sustenta', v_2a_samuel_tomas)
    RETURNING id INTO v_2a_grupo6;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2a, 'Secry', v_2a_pedro_h_silva)
    RETURNING id INTO v_2a_grupo7;

  -- ===========================================
  -- MEMBROS DAS EMPRESAS - 2A
  -- ===========================================

  -- Level Up: Amanda (lider), Ana Julia, Danielly
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo1, v_turma_2a, v_2a_amanda);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo1, v_turma_2a, v_2a_ana_julia);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo1, v_turma_2a, v_2a_danielly);

  -- Niox: Gustavo Melo (lider), Matheus Figueredo, Joao Vitor Freiris, Andre Klemar
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo2, v_turma_2a, v_2a_gustavo_melo);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo2, v_turma_2a, v_2a_matheus_figueredo);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo2, v_turma_2a, v_2a_joao_vitor_freiris);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo2, v_turma_2a, v_2a_andre_klemar);

  -- EcoDrop: Rafaella (lider), Larissa Lee, Ingrid, Vitoria Pietra, Alice Rayssa, Alice Bueno
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo3, v_turma_2a, v_2a_rafaella);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo3, v_turma_2a, v_2a_larissa_lee);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo3, v_turma_2a, v_2a_ingrid);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo3, v_turma_2a, v_2a_vitoria_pietra);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo3, v_turma_2a, v_2a_alice_rayssa);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo3, v_turma_2a, v_2a_alice_bueno);

  -- VPAM: Victor Bezo (lider), Arthur dos Santos, Pedro H. Santos, Murilo Viana, Arthur Caldeira
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo4, v_turma_2a, v_2a_victor_bezo);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo4, v_turma_2a, v_2a_arthur_santos);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo4, v_turma_2a, v_2a_pedro_h_santos);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo4, v_turma_2a, v_2a_murilo_viana);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo4, v_turma_2a, v_2a_arthur_caldeira);

  -- Discounter: Julia Lima (lider), Enzo Gabriel, Sophia Diniz, Murillo Moura, Eduardo Oliveira, Isabella Joana
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo5, v_turma_2a, v_2a_julia_lima);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo5, v_turma_2a, v_2a_enzo_gabriel);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo5, v_turma_2a, v_2a_sophia_diniz);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo5, v_turma_2a, v_2a_murillo_moura);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo5, v_turma_2a, v_2a_eduardo_oliveira);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo5, v_turma_2a, v_2a_isabella_joana);

  -- Arch Sustenta: Samuel Tomas (lider), Fernanda, Katlyn, Helena, Victor Hugo
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo6, v_turma_2a, v_2a_samuel_tomas);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo6, v_turma_2a, v_2a_fernanda);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo6, v_turma_2a, v_2a_katlyn);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo6, v_turma_2a, v_2a_helena);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo6, v_turma_2a, v_2a_victor_hugo);

  -- Secry: Pedro H. Silva (co-lider), Joao Victor Silva (co-lider), Murillo Fernandes, Matheus Henrique, Guilherme Costa, Gabriel Goncalves, Luiza Mambre, Gilson Junior
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_pedro_h_silva);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_joao_victor_silva);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_murillo_fernandes);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_matheus_henrique);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_guilherme_costa);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_gabriel_goncalves);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_luiza_mambre);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2a_grupo7, v_turma_2a, v_2a_gilson_junior);

  -- ===========================================
  -- EMPRESAS DE COMPETICAO - 2B (6 grupos)
  -- ===========================================
  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2b, 'Mente Brilante', v_2b_yasmin_cristiny)
    RETURNING id INTO v_2b_grupo1;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2b, 'Trajetix', v_2b_edson)
    RETURNING id INTO v_2b_grupo2;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2b, 'Security', v_2b_paulo_h_almeida)
    RETURNING id INTO v_2b_grupo3;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2b, 'Dressy', v_2b_lycia)
    RETURNING id INTO v_2b_grupo4;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2b, 'Heal+', v_2b_mayumi)
    RETURNING id INTO v_2b_grupo5;

  INSERT INTO mtx_empresas_competicao (professor_id, turma_id, nome, lider_aluno_id)
    VALUES (v_professor_id, v_turma_2b, 'HERA', v_2b_yasmin_de_melo)
    RETURNING id INTO v_2b_grupo6;

  -- ===========================================
  -- MEMBROS DAS EMPRESAS - 2B
  -- ===========================================

  -- Mente Brilante: Yasmin Cristiny (lider), Leticia Gomes, Isabela Haunholter, Maria Eduarda Santana, Rayssa Augusto, Nadine Gabriele
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo1, v_turma_2b, v_2b_yasmin_cristiny);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo1, v_turma_2b, v_2b_leticia_gomes);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo1, v_turma_2b, v_2b_isabela_haunholter);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo1, v_turma_2b, v_2b_maria_eduarda_santana);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo1, v_turma_2b, v_2b_rayssa_augusto);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo1, v_turma_2b, v_2b_nadine_gabriele);

  -- Trajetix: Edson (lider), Nicolas Dias, Kayqui, Kaique Costa, Kaio, Pedro H. Menezes
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo2, v_turma_2b, v_2b_edson);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo2, v_turma_2b, v_2b_nicolas_dias);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo2, v_turma_2b, v_2b_kayqui);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo2, v_turma_2b, v_2b_kaique_costa);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo2, v_turma_2b, v_2b_kaio);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo2, v_turma_2b, v_2b_pedro_h_menezes);

  -- Security: Paulo H. Almeida (lider), Pedro Laurindo, Maria Eduarda de Luna, Miguel Sergio, Jorge, Lucas Soares, Jhonathan Garcia
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo3, v_turma_2b, v_2b_paulo_h_almeida);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo3, v_turma_2b, v_2b_pedro_laurindo);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo3, v_turma_2b, v_2b_maria_eduarda_luna);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo3, v_turma_2b, v_2b_miguel_sergio);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo3, v_turma_2b, v_2b_jorge);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo3, v_turma_2b, v_2b_lucas_soares);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo3, v_turma_2b, v_2b_jhonathan_garcia);

  -- Dressy: Lycia (lider), Davi Cardoso, Ryan Emanuel, Julianna Delgado, Anna Karolina, Ana Sofia
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo4, v_turma_2b, v_2b_lycia);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo4, v_turma_2b, v_2b_davi_cardoso);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo4, v_turma_2b, v_2b_ryan_emanuel);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo4, v_turma_2b, v_2b_julianna_delgado);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo4, v_turma_2b, v_2b_anna_karolina);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo4, v_turma_2b, v_2b_ana_sofia);

  -- Heal+: Mayumi (lider), Davi Felix, Rhyan Fellype, Isaac Portioli, Alicia Lopes, Guilherme Tadeu, Pedro Henrique Oliveira
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo5, v_turma_2b, v_2b_mayumi);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo5, v_turma_2b, v_2b_davi_felix);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo5, v_turma_2b, v_2b_rhyan_fellype);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo5, v_turma_2b, v_2b_isaac_portioli);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo5, v_turma_2b, v_2b_alicia_lopes);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo5, v_turma_2b, v_2b_guilherme_tadeu);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo5, v_turma_2b, v_2b_pedro_henrique_oliveira);

  -- HERA: Yasmin de Melo (lider), Geovanna Pereira, Eduarda Silva, Eduarda Pinheiro, Laura Martins
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo6, v_turma_2b, v_2b_yasmin_de_melo);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo6, v_turma_2b, v_2b_geovanna_pereira);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo6, v_turma_2b, v_2b_eduarda_silva);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo6, v_turma_2b, v_2b_eduarda_pinheiro);
  INSERT INTO mtx_membros_empresa_competicao (professor_id, empresa_id, turma_id, aluno_id) VALUES (v_professor_id, v_2b_grupo6, v_turma_2b, v_2b_laura_martins);

  RAISE NOTICE 'Seed concluido com sucesso!';
  RAISE NOTICE 'Turma 2A: % (43 alunos, 7 grupos)', v_turma_2a;
  RAISE NOTICE 'Turma 2B: % (38 alunos, 6 grupos)', v_turma_2b;

END $$;
