import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ResumeApp } from '@/components/resume';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'resume.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: ['/images/ogImages/resume_og_img.jpg'],
    },
  };
}

export default async function ResumePage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <ResumeApp />;
}
