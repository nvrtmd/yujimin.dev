'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { App, WindowState } from '@/models';
import { APP_LIST } from '@/libs/contentProvider';

export const useUrlNavigation = (
  windowList: WindowState[],
  openWindow: (
    app: App,
    size?: App['size'],
    position?: App['position'],
  ) => void,
  bringToFront: (app: App) => void,
) => {
  const pathname = usePathname();
  const [history, setHistory] = useState<string[]>(['/']);
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    if (pathname === prevPathRef.current) {
      return;
    }

    prevPathRef.current = pathname;
    const currentPathnameWindowId = pathname.split('/')[1] || '';
    const currentPathnameApp = APP_LIST.find(
      (app) => app.id === currentPathnameWindowId,
    );
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
  }, [pathname, windowList, bringToFront, openWindow]);

  useEffect(() => {
    setHistory((prevHistory) => {
      if (pathname === prevHistory.at(-2)) {
        return prevHistory.slice(0, -1);
      }
      if (pathname === prevHistory.at(-1)) {
        return prevHistory;
      }
      return [...prevHistory, pathname];
    });
  }, [pathname]);

  const currentPath = history.at(-1) ?? null;
  const previousPath = history.at(-2) ?? null;
  const isPreviousPathHome = previousPath === '/';

  return {
    currentPath,
    previousPath,
    isPreviousPathHome,
  };
};
