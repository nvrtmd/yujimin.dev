'use client';

import React, { useEffect, useRef, memo } from 'react';

// e.detail counts clicks; > 1 means double-click or more
const SINGLE_CLICK_DETAIL = 1;
import Image from 'next/image';
import { useDoubleClick } from '@/hooks';
import { ControlButtons } from './ControlButtons';

interface TitleBarProps {
  windowId: string;
  title: string;
  iconSrc: string;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  isActive: boolean;
  canMinimize: boolean;
  canMaximize: boolean;
}

export const TitleBar = memo(
  ({
    windowId,
    title,
    iconSrc,
    onClose,
    onMouseDown,
    onMinimize,
    onToggleMaximize,
    isActive,
    canMinimize,
    canMaximize,
  }: TitleBarProps) => {
    const { handleDoubleClick } = useDoubleClick<string>();
    const titleBarRef = useRef<HTMLDivElement>(null);

    const titleBarBgClass = isActive
      ? 'bg-[linear-gradient(90deg,var(--color-window-title-active)_0%,var(--color-window-title-active-end)_100%)]'
      : 'bg-[var(--color-window-title-inactive-dark)]';

    useEffect(() => {
      const element = titleBarRef.current;
      if (!element) return;

      const handleSelectStart = (e: Event) => {
        e.preventDefault();
      };

      element.addEventListener('selectstart', handleSelectStart);
      return () => {
        element.removeEventListener('selectstart', handleSelectStart);
      };
    }, []);

    return (
      <div
        ref={titleBarRef}
        data-testid={`window-titlebar-${windowId}`}
        className={`${titleBarBgClass} p-1 flex justify-between items-center select-none shrink-0`}
        onMouseDown={(e) => {
          if (e.detail > SINGLE_CLICK_DETAIL) {
            e.preventDefault();
          }
          onMouseDown(e);
        }}
        onClick={(e) => {
          if (e.detail > SINGLE_CLICK_DETAIL) {
            e.preventDefault();
          }
          if (canMaximize) {
            handleDoubleClick(e, title, () => onToggleMaximize());
          }
        }}
      >
        <div className='text-white whitespace-nowrap overflow-hidden text-ellipsis font-bold flex items-center select-none'>
          <Image
            src={iconSrc}
            alt='window page icon'
            width={16}
            height={16}
            className='inline-block mr-1 select-none'
            draggable={false}
          />
          <div className='text-white font-bold select-none'>{title}</div>
        </div>
        <ControlButtons
          windowId={windowId}
          onClose={onClose}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
          canMinimize={canMinimize}
          canMaximize={canMaximize}
        />
      </div>
    );
  },
);
TitleBar.displayName = 'TitleBar';
