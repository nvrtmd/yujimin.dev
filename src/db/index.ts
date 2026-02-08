import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(d1Binding: D1Database) {
  if (!d1Binding) {
    throw new Error('D1 binding not found');
  }
  return drizzle(d1Binding, { schema });
}

export * from './schema';
