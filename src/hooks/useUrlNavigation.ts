'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import { App, WindowState } from '@/models';

export const useUrlNavigation = (
  windowList: WindowState[],
  apps: App[],
  openWindow: (
    app: App,
    size?: App['size'],
    position?: App['position'],
  ) => void,
  bringToFront: (app: App) => void,
) => {
  const pathname = usePathname();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    if (pathname === prevPathRef.current) {
      return;
    }

    prevPathRef.current = pathname;
    const currentPathnameWindowId = pathname.split('/')[1] || '';
    const currentPathnameApp = apps.find((app) => app.id === currentPathnameWindowId);
    const currentPathnameWindow = windowList.find(
      (window) => window.id === currentPathnameWindowId,
    );

    if (currentPathnameApp) {
      if (currentPathnameWindow) {
        bringToFront(currentPathnameWindow);
      } else {
        openWindow(
          currentPathnameApp,
          currentPathnameApp.size,
          currentPathnameApp.position,
        );
      }
    }
  }, [pathname, windowList, apps, bringToFront, openWindow]);
};
