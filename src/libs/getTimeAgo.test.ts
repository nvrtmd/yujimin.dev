import { getTimeAgo } from './getTimeAgo';

const FIXED_TIME = new Date('2024-01-15T12:00:00Z').getTime();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const toDateString = (ms: number) =>
  new Date(FIXED_TIME - ms).toISOString().replace('Z', '');

describe('getTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('[empty-input] should return empty string for empty input', () => {
    // Arrange
    const input = '';

    // Act
    const result = getTimeAgo(input);

    // Assert
    expect(result).toBe('');
  });

  it.each([
    ['--', '--'],
    ['invalid-date', 'invalid-date'],
  ])('[invalid-input] should return "%s" unchanged for invalid input', (input, expected) => {
    const result = getTimeAgo(input, 'ko');

    expect(result).toBe(expected);
  });

  it.each([
    // Seconds boundary
    [0, 'just now', 'seconds: start'],
    [59 * SECOND, 'just now', 'seconds: end boundary'],

    // Minutes boundary
    [60 * SECOND, '1 minute ago', 'minutes: singular start'],
    [119 * SECOND, '1 minute ago', 'minutes: singular end'],
    [120 * SECOND, '2 minutes ago', 'minutes: plural start'],
    [59 * MINUTE + 59 * SECOND, '59 minutes ago', 'minutes: max'],

    // Hours boundary
    [60 * MINUTE, '1 hour ago', 'hours: singular start'],
    [119 * MINUTE, '1 hour ago', 'hours: singular end'],
    [120 * MINUTE, '2 hours ago', 'hours: plural start'],
    [23 * HOUR + 59 * MINUTE, '23 hours ago', 'hours: max'],

    // Days boundary (1–6 days)
    [24 * HOUR, '1 day ago', 'days: singular start'],
    [47 * HOUR, '1 day ago', 'days: singular end'],
    [48 * HOUR, '2 days ago', 'days: plural start'],
    [6 * DAY + 23 * HOUR, '6 days ago', 'days: max'],

    // Weeks boundary (1–3 weeks)
    [7 * DAY, '1 week ago', 'weeks: singular start'],
    [13 * DAY, '1 week ago', 'weeks: singular end'],
    [14 * DAY, '2 weeks ago', 'weeks: plural start'],
    [27 * DAY, '3 weeks ago', 'weeks: max'],

    // Months & Years
    [30 * DAY, '1 month ago', 'months: singular'],
    [60 * DAY, '2 months ago', 'months: plural'],
    [360 * DAY, '1 year ago', 'years: singular'],
    [720 * DAY, '2 years ago', 'years: plural'],
  ])('[time-calculation] %dms ago → "%s" (%s)', (ms, expected) => {
    // Arrange
    const dateString = toDateString(ms);

    // Act
    const result = getTimeAgo(dateString);

    // Assert
    expect(result).toBe(expected);
  });

  it('[date-format] should handle date strings with space instead of T separator', () => {
    // Arrange
    const dateString = '2024-01-15 11:00:00';

    // Act
    const result = getTimeAgo(dateString);

    // Assert
    expect(result).toBe('1 hour ago');
  });

  it.each([
    [0, '방금 전'],
    [60 * SECOND, '1분 전'],
    [120 * SECOND, '2분 전'],
    [60 * MINUTE, '1시간 전'],
    [24 * HOUR, '1일 전'],
    [7 * DAY, '1주 전'],
    [30 * DAY, '1개월 전'],
    [360 * DAY, '1년 전'],
  ])('[ko-locale] %dms ago → "%s"', (ms, expected) => {
    const dateString = toDateString(ms);

    const result = getTimeAgo(dateString, 'ko');

    expect(result).toBe(expected);
  });
});
