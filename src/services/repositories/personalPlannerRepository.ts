import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { AgendaPessoalEntity, MateriaPessoalEntity } from '@/types';

class PersonalSubjectsRepository extends BaseRepository<MateriaPessoalEntity> {
  constructor() {
    super(TABLES.MATERIAS_PESSOAIS);
  }

  async listByProfessor(userId: string) {
    const { data, error } = await supabase.from(this.tableName).select('*').eq('user_id', userId);

    if (error) throw new Error(error.message);
    return this.mapRows((data ?? []) as Record<string, unknown>[]);
  }

  async create(userId: string, data: Omit<MateriaPessoalEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>) {
    const payload = this.toDbPayload(data as unknown as Record<string, unknown>);

    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert({
        ...payload,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(created as Record<string, unknown>);
  }
}

class PersonalAgendaRepository extends BaseRepository<AgendaPessoalEntity> {
  constructor() {
    super(TABLES.AGENDA_PESSOAL);
  }

  async listByProfessor(userId: string) {
    const { data, error } = await supabase.from(this.tableName).select('*').eq('user_id', userId);

    if (error) throw new Error(error.message);
    return this.mapRows((data ?? []) as Record<string, unknown>[]);
  }

  async create(userId: string, data: Omit<AgendaPessoalEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>) {
    const payload = this.toDbPayload(data as unknown as Record<string, unknown>);

    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert({
        ...payload,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(created as Record<string, unknown>);
  }
}

export const personalSubjectsRepository = new PersonalSubjectsRepository();
export const personalAgendaRepository = new PersonalAgendaRepository();
