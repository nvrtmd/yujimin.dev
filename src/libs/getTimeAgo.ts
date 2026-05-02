const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const WEEKS_PER_MONTH = 4;
const MONTHS_PER_YEAR = 12;

const pluralize = (count: number) => (count > 1 ? 's' : '');

export type TimeAgoParts =
  | ''
  | { kind: 'invalid'; value: string }
  | {
      kind: 'relative';
      unit: 'justNow' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
      count?: number;
    };

export function getTimeAgoParts(dateString: string): TimeAgoParts {
  if (!dateString) return '';

  const now = Date.now();
  const date = new Date(dateString.replace(' ', 'T') + 'Z').getTime();

  if (Number.isNaN(date)) {
    return { kind: 'invalid', value: dateString };
  }

  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < SECONDS_PER_MINUTE) {
    return { kind: 'relative', unit: 'justNow' };
  }

  const minutes = Math.floor(diffInSeconds / SECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) {
    return { kind: 'relative', unit: 'minute', count: minutes };
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) {
    return { kind: 'relative', unit: 'hour', count: hours };
  }

  const days = Math.floor(hours / HOURS_PER_DAY);
  if (days < DAYS_PER_WEEK) {
    return { kind: 'relative', unit: 'day', count: days };
  }

  const weeks = Math.floor(days / DAYS_PER_WEEK);
  if (weeks < WEEKS_PER_MONTH) {
    return { kind: 'relative', unit: 'week', count: weeks };
  }

  const months = Math.floor(weeks / WEEKS_PER_MONTH);
  if (months < MONTHS_PER_YEAR) {
    return { kind: 'relative', unit: 'month', count: months };
  }

  const years = Math.floor(months / MONTHS_PER_YEAR);
  return { kind: 'relative', unit: 'year', count: years };
}

export function getTimeAgo(dateString: string, locale: string = 'en'): string {
  const parts = getTimeAgoParts(dateString);

  if (parts === '') return '';
  if (parts.kind === 'invalid') return parts.value;

  if (locale.startsWith('ko')) {
    if (parts.unit === 'justNow') return '방금 전';
    if (parts.unit === 'minute') return `${parts.count}분 전`;
    if (parts.unit === 'hour') return `${parts.count}시간 전`;
    if (parts.unit === 'day') return `${parts.count}일 전`;
    if (parts.unit === 'week') return `${parts.count}주 전`;
    if (parts.unit === 'month') return `${parts.count}개월 전`;
    return `${parts.count}년 전`;
  }

  if (parts.unit === 'justNow') return 'just now';
  if (parts.unit === 'minute')
    return `${parts.count} minute${pluralize(parts.count ?? 0)} ago`;
  if (parts.unit === 'hour')
    return `${parts.count} hour${pluralize(parts.count ?? 0)} ago`;
  if (parts.unit === 'day')
    return `${parts.count} day${pluralize(parts.count ?? 0)} ago`;
  if (parts.unit === 'week')
    return `${parts.count} week${pluralize(parts.count ?? 0)} ago`;
  if (parts.unit === 'month')
    return `${parts.count} month${pluralize(parts.count ?? 0)} ago`;
  return `${parts.count} year${pluralize(parts.count ?? 0)} ago`;
}
