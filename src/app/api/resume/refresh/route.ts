import { getParsedDocument } from '@yuji-min/google-docs-parser/edge';
import { successResponse, errorResponse, handleApiError } from '../../helpers';
import { PARSE_SCHEMA } from '../schema';
import { upsertResumeCache, saveCacheError } from '../cacheUtils';

export const runtime = 'nodejs';

const ERROR_UNAUTHORIZED = 'Unauthorized';
const ERROR_CONFIG = 'Server configuration error';
const ERROR_CONTEXT_REFRESH = 'Resume REFRESH';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return errorResponse(ERROR_UNAUTHORIZED, 401);
  }

  const DOC_ID = process.env.GOOGLE_DOC_ID;
  if (!DOC_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return errorResponse(ERROR_CONFIG, 500);
  }

  try {
    const startTime = Date.now();
    const parsedData = await getParsedDocument(DOC_ID, PARSE_SCHEMA);
    const pdfUrl = `https://docs.google.com/document/d/${DOC_ID}/export?format=pdf`;
    const result = { ...parsedData, pdfUrl };
    const duration = Date.now() - startTime;

    await upsertResumeCache(result, DOC_ID);

    return successResponse({
      message: 'Resume cache updated',
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';

    try {
      await saveCacheError(DOC_ID, errorMessage);
    } catch (dbError) {
      console.error('Failed to save cache error:', dbError);
    }

    return handleApiError(e, ERROR_CONTEXT_REFRESH);
  }
}
