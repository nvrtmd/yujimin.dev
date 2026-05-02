import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { blogPosts } from '#site/content';
import { APP_IDS } from '@/models/app';

const PATH_ROOT = '/';
const PATH_BLOG = '/blog';
const PATH_BLOG_PREFIX = '/blog/';
const PATH_NEXT_PREFIX = '/_next';
const PATH_API_PREFIX = '/api';
const PATH_STATIC_PREFIX = '/static';

// Derive valid paths from the single source of truth, excluding blog which
// is handled separately due to its sub-path structure (/blog/[slug]).
const SSG_APP_PATHS = APP_IDS.filter((id) => id !== 'blog').map(
  (id) => `/${id}`,
);

// Next.js metadata files (automatically generated routes)
const NEXTJS_METADATA_ROUTES = [
  '/opengraph-image',
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.ico',
];

/**
 * Proxy: Redirects invalid paths to home
 * Valid paths: /, /blog, /blog/[existing-slug]
 * All other paths redirect to home (/)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internal and API routes
  if (
    pathname.startsWith(PATH_NEXT_PREFIX) ||
    pathname.startsWith(PATH_API_PREFIX)
  ) {
    return NextResponse.next();
  }

  // Skip Next.js metadata files (opengraph-image, sitemap, robots, etc.)
  if (NEXTJS_METADATA_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip static files (paths with file extensions)
  if (pathname.startsWith(PATH_STATIC_PREFIX) || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if path is valid
  const isValidPath =
    pathname === PATH_ROOT ||
    pathname === PATH_BLOG ||
    SSG_APP_PATHS.includes(pathname) ||
    (pathname.startsWith(PATH_BLOG_PREFIX) &&
      blogPosts.some((post) => pathname === `${PATH_BLOG_PREFIX}${post.slug}`));

  if (!isValidPath) {
    return NextResponse.redirect(new URL(PATH_ROOT, request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher configuration for proxy execution
 * Excludes API routes, static files, and Next.js internal paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
