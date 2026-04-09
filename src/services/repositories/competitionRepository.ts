import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { EmpresaCompeticaoEntity, MembroEmpresaCompeticaoEntity } from '@/types';

class CompetitionCompaniesRepository extends BaseRepository<EmpresaCompeticaoEntity> {
  constructor() {
    super(TABLES.EMPRESAS_COMPETICAO);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }
}

class CompetitionMembersRepository extends BaseRepository<MembroEmpresaCompeticaoEntity> {
  constructor() {
    super(TABLES.MEMBROS_EMPRESA_COMPETICAO);
  }

  listByCompany(professorId: string, empresaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'empresa_id', operator: 'eq', value: empresaId }
    ]);
  }
}

export const competitionCompaniesRepository = new CompetitionCompaniesRepository();
export const competitionMembersRepository = new CompetitionMembersRepository();
