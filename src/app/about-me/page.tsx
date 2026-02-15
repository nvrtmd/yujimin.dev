import { Metadata } from 'next';
import { AboutApp } from '@/components/about';

export const metadata: Metadata = {
  title: 'About Me',
  description:
    'About Yuji Min - Frontend Developer specializing in React, Next.js, and TypeScript',
  openGraph: {
    type: 'profile',
    title: 'About Me | yujimin.dev',
    description:
      'About Yuji Min - Frontend Developer specializing in React, Next.js, and TypeScript',
    images: ['/images/ogImages/about_og_img.jpg'],
  },
};

export default function AboutMePage() {
  return <AboutApp />;
}
