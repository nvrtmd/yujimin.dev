import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { AboutApp } from '@/components/about';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      type: 'profile',
      title: t('title'),
      description: t('description'),
      images: ['/images/ogImages/about_og_img.jpg'],
    },
  };
}

export default async function AboutMePage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <AboutApp />;
}
