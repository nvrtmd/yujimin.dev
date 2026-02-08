'use client';

import { useAnalytics } from '@/hooks/analytics/useAnalytics';
import type { Analytics } from '@/models';

const ERROR_MESSAGE_DEFAULT = 'Failed to load analytics.';
const LOADING_MESSAGE = 'Loading analytics...';
const TITLE = '📊 Site Analytics';

type MetricKey = keyof Analytics;

interface MetricDisplay {
  label: string;
  key: MetricKey;
}

const METRICS_DISPLAY: MetricDisplay[] = [
  { label: "Today's Views:", key: 'todaysViews' },
  { label: 'Total Views:', key: 'totalViews' },
  { label: 'Total Countries:', key: 'totalCountries' },
  { label: 'Top Country:', key: 'topCountry' },
  { label: 'Last Visitor:', key: 'lastVisitor' },
];

export function AnalyticsApp() {
  const { metrics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        {LOADING_MESSAGE}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className='p-4 text-sm text-red-500'>
        {error || ERROR_MESSAGE_DEFAULT}
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-[var(--color-window-bg)] p-4 gap-2'>
      <h2 className='text-xl font-bold underline text-center'>{TITLE}</h2>
      <div className='p-2 flex-grow text-center'>
        {METRICS_DISPLAY.map(({ label, key }) => (
          <p key={key}>
            <strong>{label}</strong> {metrics[key]}
          </p>
        ))}
      </div>
    </div>
  );
}
