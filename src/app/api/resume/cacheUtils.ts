import { resumeCache } from '@/db/schema';
import type { ResumeData } from './schema';
import { getDbInstance } from '../helpers';
import { eq } from 'drizzle-orm';

export async function getResumeFromCache() {
  try {
    const { db } = getDbInstance();
    const result = await db
      .select()
      .from(resumeCache)
      .where(eq(resumeCache.cacheKey, 'latest'))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    throw new Error(
      `Failed to get resume from cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function upsertResumeCache(data: ResumeData, docId: string) {
  const { db } = getDbInstance();

  await db
    .insert(resumeCache)
    .values({
      cacheKey: 'latest',
      content: data,
      docId,
      status: 'success',
      errorMessage: null,
    })
    .onConflictDoUpdate({
      target: resumeCache.cacheKey,
      set: {
        content: data,
        updatedAt: new Date().toISOString(),
        status: 'success',
        errorMessage: null,
      },
    });
}

export async function saveCacheError(docId: string, errorMessage: string) {
  const { db } = getDbInstance();

  await db
    .insert(resumeCache)
    .values({
      cacheKey: 'latest',
      content: {},
      docId,
      status: 'error',
      errorMessage,
    })
    .onConflictDoUpdate({
      target: resumeCache.cacheKey,
      set: {
        status: 'error',
        errorMessage,
        updatedAt: new Date().toISOString(),
      },
    });
}
