import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { AtaAssinaturaEntity, AtaEntity } from '@/types';

class AtasRepository extends BaseRepository<AtaEntity> {
  constructor() {
    super(TABLES.ATAS);
  }

  async listForUser(userId: string): Promise<AtaEntity[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .contains('participant_user_ids', [userId]);

    if (error) throw new Error(error.message);

    return this.mapRows((data ?? []) as Record<string, unknown>[])
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async touchLock(id: string) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from(this.tableName)
      .update({
        locked_at: now,
        updated_at: now
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}

class AtaSignaturesRepository extends BaseRepository<AtaAssinaturaEntity> {
  constructor() {
    super(TABLES.ASSINATURAS_ATA);
  }

  async listByAta(ataId: string): Promise<AtaAssinaturaEntity[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('ata_id', ataId);

    if (error) throw new Error(error.message);

    return this.mapRows((data ?? []) as Record<string, unknown>[])
      .sort((left, right) => left.signedAt.localeCompare(right.signedAt));
  }

  async getByAtaAndSigner(ataId: string, signedByUserId: string): Promise<AtaAssinaturaEntity | null> {
    const signatures = await this.listByAta(ataId);
    return signatures.find((signature) => signature.signedByUserId === signedByUserId) ?? null;
  }

  async createSignature(
    professorId: string,
    payload: Omit<AtaAssinaturaEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>
  ): Promise<AtaAssinaturaEntity | null> {
    const created = await this.create(professorId, payload);
    return this.getById(created.id);
  }
}

export const atasRepository = new AtasRepository();
export const ataSignaturesRepository = new AtaSignaturesRepository();
