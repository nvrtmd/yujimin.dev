import type { ReactNode } from 'react';
import type { App, AppId } from '@/models/app';
import dynamic from 'next/dynamic';
import { GuestbookApp } from '@/components/guestbook/GuestbookApp';
import { AboutApp } from '@/components/about';
import { ColophonApp } from '@/components/colophon/ColophonApp';
import { AnalyticsApp } from '@/components/analytics/AnalyticsApp';
import { ResumeApp } from '@/components/resume';

import {
  WINDOW_MIN_WIDTH,
  WINDOW_MIN_HEIGHT,
  WINDOW_MEDIUM_WIDTH,
  WINDOW_MEDIUM_HEIGHT,
  WINDOW_DEFAULT_WIDTH,
} from '@/hooks/window/useWindowResize';

const DynamicBlogContent = dynamic(() =>
  Promise.all([
    import('@/components/blog/BlogApp'),
    import('@/libs/posts'),
  ]).then(([{ BlogApp }, { getPostList, getAllCategories }]) => ({
    default: function BlogWindowContent() {
      return (
        <BlogApp posts={getPostList()} initialCategories={getAllCategories()} />
      );
    },
  })),
);

export const BLOG_APP: App = {
  id: 'blog',
  title: 'Blog',
  iconSrc: '/images/icons/blog_img.webp',
  showAddressBar: true,
  showNavigationButtons: true,
  syncWithUrl: true,
};

export const ABOUT_APP: App = {
  id: 'about-me',
  title: 'About Me',
  iconSrc: '/images/icons/about_me_img.webp',
  showAddressBar: true,
  size: { width: WINDOW_MEDIUM_WIDTH, height: WINDOW_MEDIUM_HEIGHT },
  canMaximize: false,
  canMinimize: true,
};

export const COLOPHON_APP: App = {
  id: 'colophon',
  title: 'Colophon',
  iconSrc: '/images/icons/colophon_img.webp',
  showAddressBar: true,
  size: { width: WINDOW_MEDIUM_WIDTH, height: WINDOW_MEDIUM_HEIGHT },
  canMinimize: true,
};

export const GUESTBOOK_APP: App = {
  id: 'guestbook',
  title: 'Guestbook',
  iconSrc: '/images/icons/guestbook_img.webp',
  showAddressBar: true,
  size: { width: WINDOW_DEFAULT_WIDTH, height: 650 },
};

export const ANALYTICS_APP: App = {
  id: 'analytics',
  title: 'Analytics',
  iconSrc: '/images/icons/analytics_img.webp',
  showAddressBar: false,
  size: { width: WINDOW_MIN_WIDTH, height: WINDOW_MIN_HEIGHT },
  canMaximize: false,
  canMinimize: true,
};

export const RESUME_APP: App = {
  id: 'resume',
  title: 'Resume',
  iconSrc: '/images/icons/resume_img.webp',
  showAddressBar: true,
};

export const APP_LIST: App[] = [
  BLOG_APP,
  ABOUT_APP,
  RESUME_APP,
  GUESTBOOK_APP,
  COLOPHON_APP,
  ANALYTICS_APP,
];

export function getContent(id: AppId): ReactNode {
  switch (id) {
    case 'blog':
      return <DynamicBlogContent />;
    case 'about-me':
      return <AboutApp />;
    case 'colophon':
      return <ColophonApp />;
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
