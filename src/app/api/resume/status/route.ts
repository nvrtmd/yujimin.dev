import { getDbInstance, successResponse, handleApiError } from '../../helpers';
import { resumeCache } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const MS_PER_MINUTE = 60_000;

export async function GET() {
  try {
    const { db } = getDbInstance();
    const result = await db
      .select({
        updatedAt: resumeCache.updatedAt,
        status: resumeCache.status,
        errorMessage: resumeCache.errorMessage,
      })
      .from(resumeCache)
      .where(eq(resumeCache.cacheKey, 'latest'))
      .limit(1);

    if (result.length === 0) {
      return successResponse({
        cached: false,
        message: 'No cache found',
      });
    }

    const cache = result[0];
    const lastUpdated = new Date(cache.updatedAt);
    const now = new Date();
    const minutesAgo = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / MS_PER_MINUTE,
    );

    return successResponse({
      cached: true,
      status: cache.status,
      lastUpdated: cache.updatedAt,
      minutesAgo,
      errorMessage: cache.errorMessage,
    });
  } catch (e) {
    return handleApiError(e, 'Resume Status GET');
  }
}
