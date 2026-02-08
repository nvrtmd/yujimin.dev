import { parseResumeUrl } from './parseResumeUrl';

describe('parseResumeUrl', () => {
  // ========================================================================
  // Valid URLs
  // ========================================================================

  it('should extract hostname and pathname from a valid URL', () => {
    const result = parseResumeUrl('https://github.com/test/repo');
    expect(result.hostname).toBe('github.com');
    expect(result.pathname).toBe('/test/repo');
  });

  it('should remove www. prefix from hostname', () => {
    const result = parseResumeUrl('https://www.example.com/repo');
    expect(result.hostname).toBe('example.com');
    expect(result.pathname).toBe('/repo');
  });

  it('should return empty pathname when path is just "/"', () => {
    const result = parseResumeUrl('https://example.com/');
    expect(result.hostname).toBe('example.com');
    expect(result.pathname).toBe('');
  });

  it('should return empty pathname when there is no path', () => {
    const result = parseResumeUrl('https://example.com');
    expect(result.hostname).toBe('example.com');
    expect(result.pathname).toBe('');
  });

  it('should handle deep paths', () => {
    const result = parseResumeUrl('https://npmjs.com/package/@scope/name');
    expect(result.hostname).toBe('npmjs.com');
    expect(result.pathname).toBe('/package/@scope/name');
  });

  it('should trim whitespace from the URL', () => {
    const result = parseResumeUrl('  https://github.com/test  ');
    expect(result.hostname).toBe('github.com');
    expect(result.pathname).toBe('/test');
  });

  // ========================================================================
  // Invalid URLs (fallback behavior)
  // ========================================================================

  it('should fallback to original text for invalid URL', () => {
    const result = parseResumeUrl('not-a-valid-url');
    expect(result.hostname).toBe('not-a-valid-url');
    expect(result.pathname).toBe('');
  });

  it('should fallback for empty string', () => {
    const result = parseResumeUrl('');
    expect(result.hostname).toBe('');
    expect(result.pathname).toBe('');
  });

  it('should fallback for partial URL', () => {
    const result = parseResumeUrl('github.com/test');
    expect(result.hostname).toBe('github.com/test');
    expect(result.pathname).toBe('');
  });
});
