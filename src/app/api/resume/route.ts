import { getParsedDocument } from '@yuji-min/google-docs-parser/edge';
import { successResponse, errorResponse, handleApiError } from '../helpers';
import { PARSE_SCHEMA } from './schema';
import { getResumeFromCache, upsertResumeCache } from './cacheUtils';

export const runtime = 'nodejs';

const ERROR_CONFIG = 'Server configuration error';
const ERROR_CONTEXT_GET = 'Resume GET';

export async function GET() {
  const DOC_ID = process.env.GOOGLE_DOC_ID;

  if (!DOC_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return errorResponse(ERROR_CONFIG, 500);
  }

  try {
    const cached = await getResumeFromCache();

    if (cached && cached.status === 'success') {
      return successResponse(cached.content);
    }

    const parsedData = await getParsedDocument(DOC_ID, PARSE_SCHEMA);
    const pdfUrl = `https://docs.google.com/document/d/${DOC_ID}/export?format=pdf`;
    const result = { ...parsedData, pdfUrl };

    await upsertResumeCache(result, DOC_ID);

    return successResponse(result);
  } catch (e) {
    return handleApiError(e, ERROR_CONTEXT_GET);
  }
}
