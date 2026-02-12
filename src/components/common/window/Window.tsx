'use client';

import React, { ReactNode } from 'react';
import { WindowState } from '@/models';
import type { BlogNavigation } from '@/hooks/useBlogNavigation';
import { TASKBAR_HEIGHT } from '@/components/layout/Taskbar';
import { TitleBar } from './TitleBar';
import { MenuBar } from './MenuBar';
import { AddressBar } from './AddressBar';
import { ResizeHandles } from './ResizeHandles';
import { MOBILE_Z_INDEX_OFFSET } from './constants';

interface WindowProps {
  window: WindowState;
  onBringToFront: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onDragMouseDown: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent, direction: string) => void;
  children?: ReactNode;
  blogNavigation: BlogNavigation;
  isActive: boolean;
  isMobile?: boolean;
}

export const Window: React.FC<WindowProps> = ({
  window: windowState,
  onBringToFront,
  onClose,
  onMinimize,
  onToggleMaximize,
  onDragMouseDown,
  onResizeMouseDown,
  children,
  blogNavigation,
  isActive,
  isMobile = false,
}) => {
  const {
    content,
    iconSrc,
    title,
    isMaximized,
    position,
    size,
    zIndex,
    isMinimized,
    canMinimize = true,
    canMaximize = true,
    showAddressBar = false,
    showNavigationButtons = false,
  } = windowState as WindowState;

  if (isMinimized) {
    return null;
  }

  const isMobileFullscreen = isMobile && isMaximized;

  const mobileFullscreenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: `${TASKBAR_HEIGHT}px`,
    width: 'auto',
    height: 'auto',
    zIndex: zIndex + MOBILE_Z_INDEX_OFFSET,
    display: 'flex',
    margin: 0,
    border: 'none',
  };

  const desktopStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    zIndex: isMobile ? zIndex + MOBILE_Z_INDEX_OFFSET : zIndex,
    display: 'flex',
  };

  return (
    <div
      onMouseDown={onBringToFront}
      data-testid={`window-${windowState.id}`}
      className={`
        flex flex-col btn-outset bg-[var(--color-window-bg)] p-1
        ${isMobileFullscreen ? '' : 'absolute'}
      `}
      style={isMobileFullscreen ? mobileFullscreenStyle : desktopStyle}
    >
      <TitleBar
        windowId={windowState.id}
        isActive={isActive}
        title={title}
        iconSrc={iconSrc}
        onClose={onClose}
        onMouseDown={(e) => {
          if (!isMaximized) {
            e.stopPropagation();
            onDragMouseDown(e);
          }
        }}
        onMinimize={onMinimize}
        onToggleMaximize={onToggleMaximize}
        canMinimize={canMinimize}
        canMaximize={canMaximize}
      />

      <MenuBar />

      {showAddressBar && (
        <AddressBar
          windowAppId={windowState.id}
          showNavigationButtons={showNavigationButtons}
          blogNavigation={blogNavigation}
        />
      )}

      <div className='relative flex-grow min-h-0'>
        <div className='w-full h-full bg-white flex flex-col overflow-hidden'>
          {children ?? content}
        </div>

        <div className='pointer-events-none absolute inset-0 shadow-inset-window' />
      </div>

      {!isMaximized && (
        <ResizeHandles
          windowId={windowState.id}
          onResizeMouseDown={onResizeMouseDown}
        />
      )}
    </div>
  );
};
