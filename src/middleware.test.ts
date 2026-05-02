import { NextRequest, NextResponse } from 'next/server';
import { config, middleware } from './middleware';

describe('middleware', () => {
  const createRequest = (
    pathname: string,
    headers?: HeadersInit,
  ): NextRequest =>
    new NextRequest(new URL(pathname, 'http://localhost:3000'), { headers });

  it.each([
    ['/', 'en-US,en;q=0.9', 'http://localhost:3000/en', 'root'],
    ['/blog', 'ko-KR,ko;q=0.9,en;q=0.8', 'http://localhost:3000/ko/blog', 'blog'],
    [
      '/blog/valid-post',
      'ko-KR,ko;q=0.9,en;q=0.8',
      'http://localhost:3000/ko/blog/valid-post',
      'blog post',
    ],
  ])(
    '[redirect] should redirect %s to the preferred locale (%s)',
    (pathname, language, expectedLocation) => {
      const request = createRequest(pathname, {
        'accept-language': language,
      });
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(expectedLocation);
    },
  );

  it.each([
    ['/en', 'english home'],
    ['/ko/blog', 'korean blog'],
    ['/en/blog/valid-post', 'english blog post'],
  ])('[valid] should allow %s (%s)', (pathname) => {
    // Arrange
    const request = createRequest(pathname);

    // Act
    const response = middleware(request);

    // Assert
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
  });

  it('[config] should exclude api, next internals, and static files via matcher', () => {
    expect(config.matcher).toEqual(['/((?!api|_next|.*\\..*).*)']);
  });

  it('[fallback] should redirect unknown paths to the default locale home', () => {
    // Arrange
    const request = createRequest('/invalid-path', {
      'accept-language': 'ko-KR,ko;q=0.9',
    });

    // Act
    const response = middleware(request);

    // Assert
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/ko/invalid-path',
    );
  });
});
