import { Metadata } from 'next';
import { ResumeApp } from '@/components/resume';

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'Resume of Yuji Min - Software Engineer with experience in React, Next.js, and TypeScript',
  openGraph: {
    title: 'Resume | yujimin.dev',
    description:
      'Resume of Yuji Min - Software Engineer with experience in React, Next.js, and TypeScript',
    images: ['/images/ogImages/resume_og_img.jpg'],
  },
};

export default function ResumePage() {
  return <ResumeApp />;
}
