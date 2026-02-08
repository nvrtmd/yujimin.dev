const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;

const pluralize = (count: number) => (count > 1 ? 's' : '');

export function getTimeAgo(dateString: string): string {
  if (!dateString) return '';

  const now = Date.now();
  const date = new Date(dateString.replace(' ', 'T') + 'Z').getTime();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < SECONDS_PER_MINUTE) return 'just now';

  const minutes = Math.floor(diffInSeconds / SECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR)
    return `${minutes} minute${pluralize(minutes)} ago`;

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `${hours} hour${pluralize(hours)} ago`;

  const days = Math.floor(hours / HOURS_PER_DAY);
  if (days < DAYS_PER_MONTH) return `${days} day${pluralize(days)} ago`;

  const months = Math.floor(days / DAYS_PER_MONTH);
  if (months < MONTHS_PER_YEAR)
    return `${months} month${pluralize(months)} ago`;

  const years = Math.floor(months / MONTHS_PER_YEAR);
  return `${years} year${pluralize(years)} ago`;
}
