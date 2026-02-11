import { Metadata } from 'next';
import { AnalyticsApp } from '@/components/analytics/AnalyticsApp';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Site analytics for yujimin.dev',
  openGraph: {
    title: 'Analytics | yujimin.dev',
    description: 'Site analytics for yujimin.dev',
    images: ['/images/ogImages/default_og_img.png'],
  },
};

export default function AnalyticsPage() {
  return <AnalyticsApp />;
}
