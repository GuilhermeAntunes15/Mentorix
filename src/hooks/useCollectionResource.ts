import { useCallback, useEffect, useState } from 'react';
import type { BaseEntity } from '@/types';

interface CollectionRepository<TEntity extends BaseEntity> {
  listByProfessor: (professorId: string) => Promise<TEntity[]>;
  create: (
    professorId: string,
    data: Omit<TEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>
  ) => Promise<TEntity>;
  update: (
    id: string,
    data: Partial<Omit<TEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useCollectionResource<TEntity extends BaseEntity>(
  professorId: string,
  repository: CollectionRepository<TEntity>
) {
  const [items, setItems] = useState<TEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await repository.listByProfessor(professorId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [professorId, repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createItem = useCallback(
    async (payload: Omit<TEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>) => {
      const created = await repository.create(professorId, payload);
      await reload();
      return created;
    },
    [professorId, reload, repository]
  );

  const updateItem = useCallback(
    async (id: string, payload: Partial<Omit<TEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>>) => {
      await repository.update(id, payload);
      await reload();
    },
    [reload, repository]
  );

  const removeItem = useCallback(
    async (id: string) => {
      await repository.remove(id);
      await reload();
    },
    [reload, repository]
  );

  return {
    items,
    loading,
    error,
    reload,
    createItem,
    updateItem,
    removeItem
  };
}
