import { where } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import type { EmpresaCompeticaoEntity, MembroEmpresaCompeticaoEntity } from '@/types';

class CompetitionCompaniesRepository extends BaseRepository<EmpresaCompeticaoEntity> {
  constructor() {
    super(COLLECTIONS.empresasCompeticao);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [where('turmaId', '==', turmaId)]);
  }
}

class CompetitionMembersRepository extends BaseRepository<MembroEmpresaCompeticaoEntity> {
  constructor() {
    super(COLLECTIONS.membrosEmpresaCompeticao);
  }

  listByCompany(professorId: string, empresaId: string) {
    return this.listByProfessor(professorId, [where('empresaId', '==', empresaId)]);
  }
}

export const competitionCompaniesRepository = new CompetitionCompaniesRepository();
export const competitionMembersRepository = new CompetitionMembersRepository();
