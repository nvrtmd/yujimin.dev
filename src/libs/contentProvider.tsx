import type { ReactNode } from 'react';
import type { App, AppId } from '@/models/app';
import { GuestbookApp } from '@/components/guestbook/GuestbookApp';
import { AboutApp } from '@/components/about';
import { AnalyticsApp } from '@/components/analytics/AnalyticsApp';
import { ResumeApp } from '@/components/resume';
import {
  WINDOW_MIN_WIDTH,
  WINDOW_MIN_HEIGHT,
  WINDOW_MEDIUM_WIDTH,
  WINDOW_MEDIUM_HEIGHT,
} from '@/hooks/window/useWindowResize';

export const BLOG_APP: App = {
  id: 'blog',
  title: 'Blog',
  iconSrc: '/images/icons/blog_img.png',
  renderType: 'ssg',
};

export const ABOUT_APP: App = {
  id: 'about',
  title: 'About Me',
  iconSrc: '/images/icons/about_me_img.png',
  renderType: 'csr',
  size: { width: WINDOW_MEDIUM_WIDTH, height: WINDOW_MEDIUM_HEIGHT },
  canMaximize: false,
  canMinimize: true,
};

export const GUESTBOOK_APP: App = {
  id: 'guestbook',
  title: 'Guestbook',
  iconSrc: '/images/icons/guestbook_img.png',
  renderType: 'csr',
};

export const ANALYTICS_APP: App = {
  id: 'analytics',
  title: 'Analytics',
  iconSrc: '/images/icons/analytics_img.png',
  renderType: 'csr',
  size: { width: WINDOW_MIN_WIDTH, height: WINDOW_MIN_HEIGHT },
  canMaximize: false,
  canMinimize: true,
};

export const RESUME_APP: App = {
  id: 'resume',
  title: 'Resume',
  iconSrc: '/images/icons/resume_img.png',
  renderType: 'csr',
};

export const APP_LIST: App[] = [
  BLOG_APP,
  ABOUT_APP,
  GUESTBOOK_APP,
  ANALYTICS_APP,
  RESUME_APP,
];

export const SSG_APP_LIST = APP_LIST.filter((app) => app.renderType === 'ssg');
export const CSR_APP_LIST = APP_LIST.filter((app) => app.renderType === 'csr');

export function getContent(id: Omit<AppId, 'blog'>): ReactNode {
  switch (id) {
    case 'about':
      return <AboutApp />;
    case 'guestbook':
      return <GuestbookApp />;
    case 'analytics':
      return <AnalyticsApp />;
    case 'resume':
      return <ResumeApp />;
    default:
      return null;
  }
}
