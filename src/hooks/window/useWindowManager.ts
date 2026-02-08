'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { App, WindowState } from '@/models';
import { useWindowState } from './useWindowState';
import { useWindowDrag } from './useWindowDrag';
import { useWindowResize } from './useWindowResize';
import { useUrlNavigation } from '../useUrlNavigation';

const filterByRenderType = (
  windows: WindowState[],
  renderType: 'ssg' | 'csr',
) => windows.filter((window) => window.renderType === renderType);

const findFrontmostWindow = (windows: WindowState[]): WindowState | null => {
  const openWindows = windows.filter((w) => !w.isMinimized);

  if (openWindows.length === 0) {
    return null;
  }

  return openWindows.sort((a, b) => b.zIndex - a.zIndex)[0];
};

export const useWindowManager = () => {
  const router = useRouter();
  const {
    windowList,
    setWindowList,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    bringToFront,
  } = useWindowState();

  const { isPreviousPathHome } = useUrlNavigation(
    windowList,
    openWindow,
    bringToFront,
  );

  const { handleWindowDragMouseDown } = useWindowDrag({
    setWindowList,
    bringToFront,
  });

  const { handleResizeMouseDown } = useWindowResize(
    setWindowList,
    bringToFront,
  );

  const ssgWindowList = useMemo(
    () => filterByRenderType(windowList, 'ssg'),
    [windowList],
  );

  const csrWindowList = useMemo(
    () => filterByRenderType(windowList, 'csr'),
    [windowList],
  );

  const frontmostOpenWindow = useMemo(
    () => findFrontmostWindow(windowList),
    [windowList],
  );

  const toggleWindowFromTaskbar = useCallback(
    (app: App) => {
      const isFrontmost = frontmostOpenWindow?.id === app.id;

      if (isFrontmost) {
        minimizeWindow(app);
      } else {
        bringToFront(app);
      }
    },
    [frontmostOpenWindow, minimizeWindow, bringToFront],
  );

  const handleOpenWindow = useCallback(
    (app: App) => {
      if (app.renderType === 'ssg') {
        router.push(`/${app.id}`);
      }

      openWindow(app, app.size, app.position);
    },
    [router, openWindow],
  );

  const handleCloseWindow = useCallback(
    (window: WindowState) => {
      if (window.renderType === 'ssg') {
        router.push('/');
      }

      closeWindow(window);
    },
    [router, closeWindow],
  );

  return {
    windowList,
    ssgWindowList,
    csrWindowList,
    frontmostOpenWindow,
    isPreviousPathHome,
    handleOpenWindow,
    handleCloseWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    bringToFront,
    toggleWindowFromTaskbar,
    handleWindowDragMouseDown,
    handleResizeMouseDown,
  };
};
