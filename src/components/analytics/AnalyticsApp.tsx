'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useAnalytics } from '@/hooks/analytics/useAnalytics';
import { getCountryName } from '@/libs/getCountryName';
import { getTimeAgoParts } from '@/libs/getTimeAgo';
import type { Analytics } from '@/models';

type MetricKey = keyof Analytics;
type Translations = ReturnType<typeof useTranslations<'analytics'>>;

function formatLastVisitor(value: string, t: Translations): string {
  const parts = getTimeAgoParts(value);
  if (parts === '') return '';
  if (parts.kind === 'invalid') return parts.value;
  if (parts.unit === 'justNow') return t('relative.justNow');
  return t(`relative.${parts.unit}`, { count: parts.count ?? 0 });
}

export function AnalyticsApp() {
  const t = useTranslations('analytics');
  const locale = useLocale();
  const { metrics, isLoading, error } = useAnalytics();

  const metricLabels: Record<MetricKey, string> = {
    todaysViews: t('metrics.todaysViews'),
    totalViews: t('metrics.totalViews'),
    totalCountries: t('metrics.totalCountries'),
    topCountry: t('metrics.topCountry'),
    lastVisitor: t('metrics.lastVisitor'),
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        {t('loading')}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className='p-4 text-sm text-red-500'>
        {error || t('error')}
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-[var(--color-window-bg)] p-4 gap-2'>
      <h2 className='text-xl font-bold underline text-center'>{t('title')}</h2>
      <div className='p-2 flex-grow text-center'>
        {(Object.keys(metricLabels) as MetricKey[]).map((key) => {
          const value = metrics[key];
          let displayValue: string | number;
          if (key === 'topCountry') {
            displayValue = getCountryName(String(value), locale);
          } else if (key === 'lastVisitor') {
            displayValue = formatLastVisitor(String(value), t);
          } else {
            displayValue = value;
          }

          return (
            <p key={key}>
              <strong>{metricLabels[key]}</strong> {displayValue}
            </p>
          );
        })}
      </div>
    </div>
  );
}
