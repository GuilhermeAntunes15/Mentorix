# Mentorix - Coder Agent Memory

## Stack
- React + TypeScript + Vite
- Supabase (migrating from Firebase)
- Path alias: `@/` -> `src/`

## Key Paths
- Repositories: `src/services/repositories/`
- Types/Entities: `src/types/entities.ts`
- DB Tables map: `src/database/collections.ts` (TABLES object)
- Supabase client: `src/services/supabase/client.ts`
- Case converter: `src/utils/caseConverter.ts`

## Architecture Patterns
- BaseRepository<T> with `listByProfessor`, `getById`, `create`, `update`, `remove`
- SupabaseFilter[] replaces Firebase QueryConstraint[]
- Filter columns must be snake_case (DB column names)
- All data returned as camelCase via `mapRow`/`mapRows`
- Singleton pattern: `export const xxxRepository = new XxxRepository()`
- UsersRepository is standalone (no BaseRepository) - uses `profiles` table with special field mapping (nome->displayName, id->authUid)

## Conventions
- snake_case in DB queries, camelCase in TypeScript
- `toSnakeCase`/`toCamelCase` for conversion (first-level keys only)
- Upsert with `onConflict` for batch operations
- Error handling: `if (error) throw new Error(error.message)`
