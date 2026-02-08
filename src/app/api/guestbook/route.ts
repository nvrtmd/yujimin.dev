import { NextRequest } from 'next/server';
import { parseWithZod } from '@/libs/parseWithZod';
import { guestbookTable } from '@/db/schema';
import { desc, count, and, eq, sql } from 'drizzle-orm';
import { guestbookFormSchema } from '@/models';
import { ENTRIES_PER_PAGE } from '@/models/constants';
import {
  getDbInstance,
  successResponse,
  errorResponse,
  handleApiError,
  parseJsonBody,
} from '../helpers';

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_PAGE = 1;
const RATE_LIMIT_MINUTES = 1;

const HTTP_CREATED = 201;
const HTTP_TOO_MANY_REQUESTS = 429;

const ERROR_RATE_LIMIT = `Please wait ${RATE_LIMIT_MINUTES} minute before posting again.`;
const ERROR_CONTEXT_GET = 'Guestbook GET';
const ERROR_CONTEXT_POST = 'Guestbook POST';

function getClientIp(request: NextRequest): string {
  return request.headers.get('cf-connecting-ip') ?? DEFAULT_IP;
}

async function isRateLimitExceeded(
  db: ReturnType<typeof getDbInstance>['db'],
  ip: string,
): Promise<boolean> {
  const recentLogs = await db
    .select({ count: count() })
    .from(guestbookTable)
    .where(
      and(
        eq(guestbookTable.ipAddress, ip),
        sql`${guestbookTable.createdAt} > datetime('now', '-${sql.raw(RATE_LIMIT_MINUTES.toString())} minute')`,
      ),
    );

  return (recentLogs[0]?.count ?? 0) > 0;
}

export async function GET(request: NextRequest) {
  try {
    const { db } = getDbInstance();

    const { searchParams } = new URL(request.url);
    const page = parseInt(
      searchParams.get('page') ?? DEFAULT_PAGE.toString(),
      10,
    );
    const limit = parseInt(
      searchParams.get('limit') ?? ENTRIES_PER_PAGE.toString(),
      10,
    );
    const offset = (page - 1) * limit;

    const [totalResult, entries] = await db.batch([
      db.select({ count: count() }).from(guestbookTable),
      db
        .select()
        .from(guestbookTable)
        .orderBy(desc(guestbookTable.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return successResponse({
      entries,
      pagination: { page, limit, total, totalPages },
    });
  } catch (e) {
    return handleApiError(e, ERROR_CONTEXT_GET);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = getDbInstance();
    const ip = getClientIp(request);

    if (await isRateLimitExceeded(db, ip)) {
      return errorResponse(ERROR_RATE_LIMIT, HTTP_TOO_MANY_REQUESTS);
    }

    const inputData = await parseJsonBody(request);
    const validatedData = parseWithZod(inputData, guestbookFormSchema);
    const { nickname, location, website, message } = validatedData;

    const result = await db
      .insert(guestbookTable)
      .values({
        nickname,
        location: location ?? null,
        website: website ?? null,
        message,
        ipAddress: ip,
      })
      .returning();

    return successResponse(result[0], HTTP_CREATED);
  } catch (e) {
    return handleApiError(e, ERROR_CONTEXT_POST);
  }
}
