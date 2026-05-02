import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { AnalyticsApp } from '@/components/analytics/AnalyticsApp';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'analytics.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: ['/images/ogImages/default_og_img.jpg'],
    },
  };
}

export default async function AnalyticsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <AnalyticsApp />;
}
