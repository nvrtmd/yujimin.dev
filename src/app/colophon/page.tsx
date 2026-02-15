import { Metadata } from 'next';
import { ColophonApp } from '@/components/colophon/ColophonApp';

export const metadata: Metadata = {
  title: 'Colophon',
  description:
    'How yujimin.dev was built — tech stack, tools, and design decisions',
  openGraph: {
    title: 'Colophon | yujimin.dev',
    description:
      'How yujimin.dev was built — tech stack, tools, and design decisions',
  },
};

export default function ColophonPage() {
  return <ColophonApp />;
}
