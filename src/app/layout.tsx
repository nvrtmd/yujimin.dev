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
  src: './styles/fonts/DungGeunMo.ttf',
  display: 'swap',
  variable: '--font-dunggeunmo',
});

export const metadata: Metadata = {
  title: 'yujimin.dev',
  description: 'Dev Blog by Yuji Min',
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
