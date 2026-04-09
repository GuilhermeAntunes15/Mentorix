import { supabase } from '@/services/supabase/client';
import { toSnakeCase, toCamelCase, toCamelCaseArray } from '@/utils/caseConverter';
import type { BaseEntity } from '@/types';

type EntityInput<TEntity extends BaseEntity> = Omit<TEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>;
type EntityPatch<TEntity extends BaseEntity> = Partial<EntityInput<TEntity>>;

export interface SupabaseFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export abstract class BaseRepository<TEntity extends BaseEntity> {
  protected constructor(protected readonly tableName: string) {}

  protected mapRow(row: Record<string, unknown>): TEntity {
    return toCamelCase<TEntity>(row);
  }

  protected mapRows(rows: Record<string, unknown>[]): TEntity[] {
    return toCamelCaseArray<TEntity>(rows);
  }

  protected toDbPayload(data: Record<string, unknown>): Record<string, unknown> {
    return toSnakeCase(data as Record<string, unknown>);
  }

  protected applyFilters(
    queryBuilder: ReturnType<typeof supabase.from>,
    filters: SupabaseFilter[]
  ) {
    let q = queryBuilder as unknown as ReturnType<ReturnType<typeof supabase.from>['select']>;
    for (const f of filters) {
      switch (f.operator) {
        case 'eq':
          q = q.eq(f.column, f.value) as typeof q;
          break;
        case 'neq':
          q = q.neq(f.column, f.value) as typeof q;
          break;
        case 'gt':
          q = q.gt(f.column, f.value) as typeof q;
          break;
        case 'gte':
          q = q.gte(f.column, f.value) as typeof q;
          break;
        case 'lt':
          q = q.lt(f.column, f.value) as typeof q;
          break;
        case 'lte':
          q = q.lte(f.column, f.value) as typeof q;
          break;
        case 'in':
          q = q.in(f.column, f.value as unknown[]) as typeof q;
          break;
        case 'contains':
          q = q.contains(f.column, f.value as unknown[]) as typeof q;
          break;
      }
    }
    return q;
  }

  async listByProfessor(professorId: string, filters: SupabaseFilter[] = []): Promise<TEntity[]> {
    let q = supabase.from(this.tableName).select('*').eq('professor_id', professorId);

    for (const f of filters) {
      switch (f.operator) {
        case 'eq':
          q = q.eq(f.column, f.value);
          break;
        case 'neq':
          q = q.neq(f.column, f.value);
          break;
        case 'gt':
          q = q.gt(f.column, f.value);
          break;
        case 'gte':
          q = q.gte(f.column, f.value);
          break;
        case 'lt':
          q = q.lt(f.column, f.value);
          break;
        case 'lte':
          q = q.lte(f.column, f.value);
          break;
        case 'in':
          q = q.in(f.column, f.value as unknown[]);
          break;
        case 'contains':
          q = q.contains(f.column, f.value as unknown[]);
          break;
      }
    }

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return this.mapRows((data ?? []) as Record<string, unknown>[]);
  }

  async getById(id: string): Promise<TEntity | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapRow(data as Record<string, unknown>) : null;
  }

  async create(professorId: string, data: EntityInput<TEntity>): Promise<TEntity> {
    const payload = this.toDbPayload(data as unknown as Record<string, unknown>);

    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert({
        ...payload,
        professor_id: professorId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(created as Record<string, unknown>);
  }

  async update(id: string, data: EntityPatch<TEntity>): Promise<void> {
    const payload = this.toDbPayload(data as unknown as Record<string, unknown>);

    const { error } = await supabase
      .from(this.tableName)
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
