'use client';

import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Window } from '@/components/common';
import { useWindowManager } from '@/hooks';
import { Taskbar, TASKBAR_HEIGHT } from '@/components/layout';
import { DesktopIcon } from '@/components/layout';
import { APP_LIST } from '@/libs/contentProvider';
import { useDoubleClick } from '@/hooks';
import { AppId } from '@/models';
import { useIconDrag } from '@/hooks/useIconDrag';
import { useMobile } from '@/hooks/useMobile';
import { useTrackVisit } from '@/hooks/analytics/useTrackVisit';

export function RetroOS({ children }: { children: ReactNode }) {
  const tApps = useTranslations('apps');
  const isMobile = useMobile();
  const pathname = usePathname();
  const activeAppId = pathname.split('/')[1] || '';
  useTrackVisit();

  const appList = useMemo(
    () =>
      APP_LIST.map((app) => ({
        ...app,
        title: tApps(app.id),
      })),
    [tApps],
  );

  const {
    windowList,
    minimizeWindow,
    toggleMaximizeWindow,
    blogNavigation,
    handleOpenWindow,
    handleCloseWindow,
    toggleWindowFromTaskbar,
    frontmostOpenWindow,
    handleWindowDragMouseDown,
    handleResizeMouseDown,
    bringToFront,
  } = useWindowManager(appList);

  const { clickedIdentifier, handleDoubleClick, clearSelection } =
    useDoubleClick<AppId>();

  const { iconPositions, handleIconMouseDown, isDragged, isRenderReady } =
    useIconDrag(isMobile);

  const closeAllWindows = useCallback(() => {
    windowList.forEach((window) => {
      handleCloseWindow(window);
    });
  }, [windowList, handleCloseWindow]);

  const handleAppActivate = useCallback(
    (appId: string) => {
      const appFromList = appList.find((a) => a.id === appId);
      if (!appFromList) return;

      const window = windowList.find((w) => w.id === appId);

      if (!window) {
        handleOpenWindow(appFromList);
        return;
      }

      if (frontmostOpenWindow?.id === appId) return;

      // bringToFront also unminimizes the window
      bringToFront(window);
    },
    [appList, windowList, frontmostOpenWindow, bringToFront, handleOpenWindow],
  );

  return (
    <div
      className='relative w-full h-svh flex flex-col overflow-hidden bg-retro-desktop'
      style={{
        paddingBottom: `calc(${TASKBAR_HEIGHT}px + env(safe-area-inset-bottom))`,
      }}
    >
      <div
        className='flex-grow w-full h-full pt-safe-top overflow-hidden relative'
        onClick={clearSelection}
      >
        {isMobile ? (
          <div className='flex flex-col flex-wrap items-start content-start gap-2 p-2 h-full'>
            {appList.map((app) => (
              <DesktopIcon
                key={app.id}
                id={app.id}
                iconSrc={app.iconSrc}
                title={app.title}
                isSelected={clickedIdentifier === app.id}
                position={undefined}
                className='opacity-100'
                onMouseDown={(e) => handleIconMouseDown(e, app.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenWindow(app);
                }}
              />
            ))}
          </div>
        ) : (
          appList.map((app) => (
            <DesktopIcon
              key={app.id}
              id={app.id}
              iconSrc={app.iconSrc}
              title={app.title}
              isSelected={clickedIdentifier === app.id}
              position={iconPositions[app.id]}
              className={`absolute transition-opacity duration-150 ${
                isRenderReady ? 'opacity-100' : 'opacity-0'
              }`}
              onMouseDown={(e) => handleIconMouseDown(e, app.id)}
              onClick={(e) => {
                if (!isDragged) {
                  handleDoubleClick(e, app.id, () => handleOpenWindow(app));
                }
              }}
            />
          ))
        )}

        {windowList?.map((window) => (
          <Window
            isMobile={isMobile}
            isActive={frontmostOpenWindow?.id === window.id}
            blogNavigation={blogNavigation}
            key={window.id}
            window={window}
            onBringToFront={() => bringToFront(window)}
            onClose={() => handleCloseWindow(window)}
            onMinimize={() => minimizeWindow(window)}
            onToggleMaximize={() => toggleMaximizeWindow(window)}
            onDragMouseDown={(e) => handleWindowDragMouseDown(e, window)}
            onResizeMouseDown={(e, direction) =>
              handleResizeMouseDown(e, window, direction)
            }
          >
            {window.id === activeAppId ? children : undefined}
          </Window>
        ))}
      </div>

      <Taskbar
        windowList={windowList}
        frontmostOpenWindow={frontmostOpenWindow}
        onTaskbarButtonClick={(app) => toggleWindowFromTaskbar(app)}
        onCloseAllWindows={closeAllWindows}
        onAppActivate={handleAppActivate}
      />
    </div>
  );
}
