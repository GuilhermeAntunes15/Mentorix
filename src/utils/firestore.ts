import type { BaseEntity } from '@/types';

export function stripUndefined<TValue extends Record<string, unknown>>(value: TValue) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as TValue;
}

export function createEntityPayload<TValue extends Omit<BaseEntity, 'id'> & Record<string, unknown>>(
  payload: TValue
) {
  return stripUndefined(payload);
}
