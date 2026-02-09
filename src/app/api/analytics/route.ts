import { NextRequest } from 'next/server';
import { analytics as analyticsTable } from '@/db/schema';
import { sql, desc, count, countDistinct } from 'drizzle-orm';
import { z } from 'zod';
import { parseWithZod } from '@/libs/parseWithZod';
import { getTimeAgo } from '@/libs/getTimeAgo';
import type { Analytics } from '@/models/analytics';
import {
  getDbInstance,
  successResponse,
  messageResponse,
  handleApiError,
  parseJsonBody,
} from '../helpers';

export const runtime = 'nodejs';

const DEFAULTS = {
  REFERER: 'Direct',
  COUNTRY: 'etc',
  EMPTY_VALUE: '--',
} as const;

const SUCCESS_MESSAGE = 'Visit tracked';
const ERROR_CONTEXT_POST = 'Analytics POST';
const ERROR_CONTEXT_GET = 'Analytics GET';

const postRequestSchema = z.object({
  referrer: z.string().optional(),
  path: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const inputData = await parseJsonBody(request);
    const validatedData = parseWithZod(inputData, postRequestSchema);
    const { db, ctx } = getDbInstance();

    // Get country from Cloudflare headers
    // CF-IPCountry header is set by Cloudflare automatically
    const country =
      request.headers.get('cf-ipcountry') ||
      (request.cf?.country as string | undefined) ||
      DEFAULTS.COUNTRY;

    const analyticsData = {
      path: validatedData.path,
      userAgent: request.headers.get('user-agent'),
      referer: validatedData.referrer || DEFAULTS.REFERER,
      country,
    };

    ctx.waitUntil(
      db.insert(analyticsTable).values(analyticsData).catch(console.error),
    );

    return messageResponse(SUCCESS_MESSAGE);
  } catch (e) {
    return handleApiError(e, ERROR_CONTEXT_POST);
  }
}

export async function GET() {
  try {
    const { db } = getDbInstance();

    const [
      totalViewsRes,
      totalCountriesRes,
      topCountryRes,
      lastVisitorRes,
      todaysViewsRes,
    ] = await db.batch([
      db.select({ value: count() }).from(analyticsTable),
      db
        .select({ value: countDistinct(analyticsTable.country) })
        .from(analyticsTable),
      db
        .select({ country: analyticsTable.country, count: count() })
        .from(analyticsTable)
        .where(sql`${analyticsTable.country} IS NOT NULL`)
        .groupBy(analyticsTable.country)
        .orderBy(desc(count()))
        .limit(1),
      db
        .select({
          country: analyticsTable.country,
          timestamp: analyticsTable.timestamp,
        })
        .from(analyticsTable)
        .orderBy(desc(analyticsTable.timestamp))
        .limit(1),
      db
        .select({ value: count() })
        .from(analyticsTable)
        .where(sql`DATE(${analyticsTable.timestamp}) = DATE('now')`),
    ]);

    const lastVisitorTimestamp = lastVisitorRes[0]?.timestamp;
    const metrics: Analytics = {
      totalViews: totalViewsRes[0]?.value ?? 0,
      totalCountries: totalCountriesRes[0]?.value ?? 0,
      topCountry: topCountryRes[0]?.country ?? DEFAULTS.EMPTY_VALUE,
      lastVisitor: lastVisitorTimestamp
        ? getTimeAgo(lastVisitorTimestamp)
        : DEFAULTS.EMPTY_VALUE,
      todaysViews: todaysViewsRes[0]?.value ?? 0,
    };

    return successResponse(metrics);
  } catch (e) {
    return handleApiError(e, ERROR_CONTEXT_GET);
  }
}
