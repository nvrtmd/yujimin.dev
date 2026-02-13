import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Roboto } from 'next/font/google';
import './globals.css';

import { RetroOS } from '@/components/layout';

const THEME_COLOR_DESKTOP_BG = 'var(--color-desktop)';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const dunggeunmo = localFont({
  src: './styles/fonts/DungGeunMo.woff2',
  display: 'swap',
  variable: '--font-dunggeunmo',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yujimin.dev'),
  title: {
    default: 'yujimin.dev',
    template: '%s | yujimin.dev',
  },
  description: 'Dev Blog by Yuji Min',
  keywords: [
    'Yuji Min',
    'Software Engineer',
    'Frontend Developer',
    'React',
    'TypeScript',
    'JavaScript',
    'Web Development',
    'Dev Blog',
    'Software Engineering',
  ],
  authors: [{ name: 'Yuji Min', url: 'https://yujimin.dev' }],
  creator: 'Yuji Min',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yujimin.dev',
    title: 'yujimin.dev',
    description: 'Dev Blog by Yuji Min',
    siteName: 'yujimin.dev',
    images: [
      {
        url: '/images/ogImages/default_og_img.jpg',
        width: 1200,
        height: 630,
        alt: 'yujimin.dev - Dev Blog by Yuji Min',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'yujimin.dev',
    description: 'Dev Blog by Yuji Min',
    images: ['/images/ogImages/default_og_img.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// viewportFit 'cover' extends layout into safe-area on mobile notch devices
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: THEME_COLOR_DESKTOP_BG,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={`${dunggeunmo.variable} ${roboto.variable} h-full`}
    >
      <body className={`${dunggeunmo.className} h-full overflow-hidden`}>
        <RetroOS>{children}</RetroOS>
      </body>
    </html>
  );
}
