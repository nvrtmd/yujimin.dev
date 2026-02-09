import { describe, it, expect, vi } from 'vitest';
import { getCountryName } from './getCountryName';

describe('getCountryName', () => {
  it('[conversion] should convert country code to full name', () => {
    // Arrange & Act & Assert
    expect(getCountryName('KR')).toBe('South Korea');
    expect(getCountryName('US')).toBe('United States');
    expect(getCountryName('JP')).toBe('Japan');
    expect(getCountryName('GB')).toBe('United Kingdom');
    expect(getCountryName('CN')).toBe('China');
  });

  it('[case-insensitive] should handle lowercase country codes', () => {
    // Arrange & Act & Assert
    expect(getCountryName('kr')).toBe('South Korea');
    expect(getCountryName('us')).toBe('United States');
  });

  it('[special-values] should return unchanged for special values', () => {
    // Arrange & Act & Assert
    expect(getCountryName('--')).toBe('--');
    expect(getCountryName('etc')).toBe('etc');
  });

  it('[invalid] should handle invalid country codes', () => {
    // Arrange & Act & Assert
    // Invalid ISO codes return 'Unknown Region' from Intl API
    expect(getCountryName('ZZ')).toBe('Unknown Region');

    // Non-2-letter codes are returned unchanged
    expect(getCountryName('ABC')).toBe('ABC');
    expect(getCountryName('')).toBe('');
  });

  it('[locale] should support different locales', () => {
    // Arrange & Act & Assert
    expect(getCountryName('KR', 'ko')).toBe('대한민국');
    expect(getCountryName('US', 'ko')).toBe('미국');
    expect(getCountryName('JP', 'ja')).toBe('日本');
  });

  it('[error-handling] should handle Intl API errors gracefully', () => {
    // Arrange
    const originalDisplayNames = Intl.DisplayNames;

    // Mock DisplayNames constructor to throw error
    Object.defineProperty(Intl, 'DisplayNames', {
      value: class {
        constructor() {
          throw new Error('Intl API error');
        }
        of() {
          return null;
        }
      },
      writable: true,
      configurable: true,
    });

    // Act
    const result = getCountryName('KR');

    // Assert
    expect(result).toBe('KR'); // Fallback to original code

    // Cleanup
    Object.defineProperty(Intl, 'DisplayNames', {
      value: originalDisplayNames,
      writable: true,
      configurable: true,
    });
  });
});
