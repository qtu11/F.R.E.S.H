function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object' || obj instanceof Date) return obj;
  return Object.keys(obj).reduce((acc: any, key: string) => {
    acc[snakeToCamel(key)] = toCamelCase(obj[key]);
    return acc;
  }, {});
}

export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object' || obj instanceof Date) return obj;
  return Object.keys(obj).reduce((acc: any, key: string) => {
    acc[camelToSnake(key)] = toSnakeCase(obj[key]);
    return acc;
  }, {});
}
