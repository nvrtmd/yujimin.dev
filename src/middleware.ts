import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export const middleware = createMiddleware(routing);

/**
 * Matcher configuration for middleware execution
 * Excludes API routes, static files, and Next.js internal paths
 */
export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)',
  ],
};
