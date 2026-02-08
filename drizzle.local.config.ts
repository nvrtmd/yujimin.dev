import type { Config } from 'drizzle-kit';
import path from 'path';
import * as fs from 'node:fs';

function getLocalD1DB() {
  try {
    const basePath = path.resolve('.wrangler/state/v3/d1');
    const files = fs.readdirSync(basePath, {
      encoding: 'utf-8',
      recursive: true,
    });

    const dbFile = files.find((f) => f.endsWith('.sqlite'));

    if (!dbFile) {
      console.warn('Using default fallback DB path.');
      return 'file:./.wrangler/state/v3/d1/db.sqlite';
    }
    return path.resolve(basePath, dbFile);
  } catch (error) {
    console.warn('Could not find local D1 DB path, using default.', error);
    return 'file:./.wrangler/state/v3/d1/db.sqlite';
  }
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: getLocalD1DB(),
  },
} satisfies Config;
