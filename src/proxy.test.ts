import { NextRequest, NextResponse } from 'next/server';
import { proxy } from './proxy';

vi.mock('#site/content', () => ({
  blogPosts: [
    { slug: 'valid-post', title: 'Valid Post' },
    { slug: 'another-post', title: 'Another Post' },
  ],
}));

describe('proxy', () => {
  const createRequest = (pathname: string): NextRequest =>
    new NextRequest(new URL(pathname, 'http://localhost:3000'));

  it.each([
    ['/', 'root'],
    ['/blog', 'blog index'],
    ['/blog/valid-post', 'valid post'],
  ])('[valid] should allow %s (%s)', (pathname) => {
    // Arrange
    const request = createRequest(pathname);

    // Act
    const response = proxy(request);

    // Assert
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
  });

  it.each([
    ['/blog/nonexistent-post', 'nonexistent post'],
    ['/blog/valid-post/extra', 'extra segments'],
    ['/blog/', 'trailing slash'],
    ['/invalid-path', 'invalid path'],
  ])('[redirect] should redirect %s to root (%s)', (pathname) => {
    // Arrange
    const request = createRequest(pathname);

    // Act
    const response = proxy(request);

    // Assert
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it.each([
    ['/_next/static/file.js', '_next'],
    ['/api/some-endpoint', 'api'],
    ['/static/image.png', 'static'],
    ['/favicon.ico', 'file extension'],
  ])('[skip] should pass through %s (%s)', (pathname) => {
    // Arrange
    const request = createRequest(pathname);

    // Act
    const response = proxy(request);

    // Assert
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
  });
});
