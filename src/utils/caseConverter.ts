// Converte uma string de camelCase para snake_case
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Converte uma string de snake_case para camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Converte as keys de um objeto de camelCase para snake_case
// Não converte recursivamente - apenas o primeiro nível de keys
// Campos JSONB (como assignedSubjects) mantêm seu conteúdo intacto
export function toSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnake(key);
      const value = obj[key];
      // Não converte undefined - omite do resultado
      if (value !== undefined) {
        result[snakeKey] = value;
      }
    }
  }
  return result;
}

// Converte as keys de um objeto de snake_case para camelCase
// Não converte recursivamente - apenas o primeiro nível de keys
export function toCamelCase<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = obj[key];
    }
  }
  return result as T;
}

// Converte um array de objetos de snake_case para camelCase
export function toCamelCaseArray<T = Record<string, unknown>>(arr: Record<string, unknown>[]): T[] {
  return arr.map((item) => toCamelCase<T>(item));
}

// Converte um array de objetos de camelCase para snake_case
export function toSnakeCaseArray(arr: Record<string, unknown>[]): Record<string, unknown>[] {
  return arr.map((item) => toSnakeCase(item));
}
