'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { WindowState } from '@/models';
import { App } from '@/models/app';
import { StartMenu, Clock } from '@/components/layout';
import { PushLockButton } from '@/components/common';

export { TASKBAR_HEIGHT } from '@/libs/iconLayout';
const TASKBAR_BUTTON_MAX_WIDTH = 160;

interface TaskbarProps {
  windowList: WindowState[];
  frontmostOpenWindow: WindowState | null;
  onTaskbarButtonClick: (app: App) => void;
  onCloseAllWindows: () => void;
  onAppActivate: (appId: string) => void;
}

export function Taskbar({
  windowList,
  frontmostOpenWindow,
  onTaskbarButtonClick,
  onCloseAllWindows,
  onAppActivate,
}: TaskbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        isMenuOpen &&
        !startButtonRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    },
    [isMenuOpen],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <>
      {isMenuOpen && (
        <StartMenu
          menuRef={menuRef}
          closeMenu={() => setIsMenuOpen(false)}
          onCloseAllWindows={onCloseAllWindows}
          onAppActivate={onAppActivate}
        />
      )}
      <footer
        className='bg-retro-taskbar flex w-full justify-between items-center fixed bottom-0 z-50 py-0.5 border-t-2 border-t-[var(--color-border-light)] min-h-[38px] pb-[env(safe-area-inset-bottom)] px-[env(safe-area-inset-left,0px)]'
        style={{
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className='flex items-center flex-grow min-w-0 mr-2'>
          <PushLockButton
            ref={startButtonRef}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            isPushed={isMenuOpen}
            className='shrink-0'
          >
            <Image
              src='/images/icons/start_img.webp'
              alt='start icon'
              width={24}
              height={24}
              className='mr-1'
              style={{ height: 'auto' }}
            />
            <span className='font-bold'>Start</span>
          </PushLockButton>

          <div className='flex items-center ml-2 space-x-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full'>
            {windowList.map((window) => {
              const isActive = window.id === frontmostOpenWindow?.id;

              return (
                <div
                  key={window.id}
                  className='shrink-0'
                  style={{ maxWidth: `${TASKBAR_BUTTON_MAX_WIDTH}px` }}
                >
                  <PushLockButton
                    isPushed={isActive}
                    onClick={() => onTaskbarButtonClick(window)}
                    className='w-full flex items-center justify-center sm:justify-start px-2'
                    data-testid={`taskbar-button-${window.id}`}
                  >
                    <Image
                      src={window.iconSrc}
                      alt={window.title}
                      width={20}
                      height={20}
                      className='flex-shrink-0 w-5 h-5 sm:mr-2'
                    />
                    <span className='truncate hidden sm:block'>
                      {window.title}
                    </span>
                  </PushLockButton>
                </div>
              );
            })}
          </div>
        </div>

        <div className='shrink-0'>
          <Clock />
        </div>
      </footer>
    </>
  );
}
