import { parseWithZod, SchemaParseError } from '@/libs/parseWithZod';
import { analyticsSubmitResponseSchema } from '@/models/analytics';

const ANALYTICS_COOL_DOWN = 3 * 60 * 1000;
const STORAGE_KEY = 'analytics_last_tracked';
export const ANALYTICS_CACHE_KEY = 'analytics_cache';
export const API_ENDPOINT = '/api/analytics';
const DEFAULT_REFERRER = 'Direct';
const SUCCESS_MESSAGE = 'Visit tracked';

const ERROR_PREFIX = '[Analytics]';

export async function trackVisit(pathname: string): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const now = Date.now();
  const lastTracked = localStorage.getItem(STORAGE_KEY);

  if (lastTracked && now - parseInt(lastTracked, 10) < ANALYTICS_COOL_DOWN) {
    return;
  }

  const referrer = document.referrer || DEFAULT_REFERRER;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer, path: pathname }),
    });

    const data = await response.json();
    const parsedData = parseWithZod(data, analyticsSubmitResponseSchema);

    if (parsedData.success && parsedData.message === SUCCESS_MESSAGE) {
      localStorage.setItem(STORAGE_KEY, now.toString());
      localStorage.removeItem(ANALYTICS_CACHE_KEY);
    } else if (!parsedData.success) {
      console.error(`${ERROR_PREFIX} API Error:`, parsedData.error);
    }
  } catch (error) {
    if (error instanceof SchemaParseError) {
      console.error(
        `${ERROR_PREFIX} Validation Error:`,
        error.originalError.message,
      );
    } else {
      console.error(`${ERROR_PREFIX} Fetch Error:`, error);
    }
  }
}
