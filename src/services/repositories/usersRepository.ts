import { supabase } from '@/services/supabase/client';
import { TABLES } from '@/database/collections';
import { toCamelCase, toCamelCaseArray, toSnakeCase } from '@/utils/caseConverter';
import type { UserEntity, UserRole } from '@/types';

/**
 * Converte uma row da tabela `profiles` para UserEntity.
 * Mapeamento especial: profiles.nome -> displayName, profiles.id -> authUid
 */
function mapProfileRow(row: Record<string, unknown>): UserEntity {
  const camel = toCamelCase<Record<string, unknown>>(row);
  return {
    ...camel,
    authUid: row.id as string,
    displayName: row.nome as string,
    // Para professors, professorId é o próprio id
    professorId: (row.professor_id as string) ?? (row.id as string),
  } as UserEntity;
}

function mapProfileRows(rows: Record<string, unknown>[]): UserEntity[] {
  return rows.map(mapProfileRow);
}

class UsersRepository {
  async getByAuthUid(authUid: string): Promise<UserEntity | null> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', authUid)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapProfileRow(data as Record<string, unknown>) : null;
  }

  async listAll(): Promise<UserEntity[]> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*');

    if (error) throw new Error(error.message);
    return mapProfileRows((data ?? []) as Record<string, unknown>[]);
  }

  async listByRole(role: UserRole): Promise<UserEntity[]> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('role', role);

    if (error) throw new Error(error.message);
    return mapProfileRows((data ?? []) as Record<string, unknown>[]);
  }

  async listByProfessorOwner(professorId: string): Promise<UserEntity[]> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('professor_id', professorId);

    if (error) throw new Error(error.message);
    return mapProfileRows((data ?? []) as Record<string, unknown>[]);
  }

  async createManagedUser(profile: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const timestamp = new Date().toISOString();

    // Converter camelCase para snake_case, mas tratar campos especiais
    const payload = toSnakeCase({
      ...profile,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as unknown as Record<string, unknown>);

    // Mapear displayName -> nome e authUid -> id
    payload.nome = profile.displayName;
    payload.id = profile.authUid;
    delete payload.display_name;
    delete payload.auth_uid;

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .upsert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapProfileRow(data as Record<string, unknown>);
  }

  async updateByAuthUid(authUid: string, patch: Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const snakePatch = toSnakeCase(patch as unknown as Record<string, unknown>);

    // Mapear campos especiais
    if ('display_name' in snakePatch) {
      snakePatch.nome = snakePatch.display_name;
      delete snakePatch.display_name;
    }
    if ('auth_uid' in snakePatch) {
      delete snakePatch.auth_uid;
    }

    snakePatch.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(TABLES.USERS)
      .update(snakePatch)
      .eq('id', authUid);

    if (error) throw new Error(error.message);
  }
}

export const usersRepository = new UsersRepository();
