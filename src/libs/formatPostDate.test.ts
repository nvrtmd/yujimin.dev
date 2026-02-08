import { formatPostDate } from './formatPostDate';

describe('formatPostDate', () => {
  beforeEach(() => {
    // Fix timezone to Asia/Seoul for deterministic tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:30:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('[format] should format date in Korean locale without time', () => {
    // Arrange
    const dateString = '2024-01-15';

    // Act
    const result = formatPostDate(dateString);

    // Assert
    expect(result).toMatch(/24\. 01\. 15\./);
  });

  it('[format] should format date with time when includeTime is true', () => {
    // Arrange - Use explicit timezone offset for deterministic result
    const dateString = '2024-01-15T10:30:00+09:00';

    // Act
    const result = formatPostDate(dateString, { includeTime: true });

    // Assert
    expect(result).toMatch(/24\. 01\. 15\./);
    expect(result).toMatch(/10:30/);
  });

  it('[format] should handle different dates correctly', () => {
    // Arrange
    const dateString = '2023-12-25';

    // Act
    const result = formatPostDate(dateString);

    // Assert
    expect(result).toMatch(/23\. 12\. 25\./);
  });

  it('[format] should display time in user local timezone', () => {
    // Arrange - UTC time
    const utcDateString = '2024-01-15T01:30:00Z';

    // Act
    const result = formatPostDate(utcDateString, { includeTime: true });

    // Assert - In Seoul (UTC+9), 01:30 UTC = 10:30 KST
    expect(result).toMatch(/24\. 01\. 15\./);
    expect(result).toMatch(/10:30/);
  });
});
