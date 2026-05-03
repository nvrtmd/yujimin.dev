'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';

// e.detail counts clicks; > 1 means double-click or more
const SINGLE_CLICK_DETAIL = 1;

const MENU_KEYS = ['file', 'edit', 'view', 'go', 'favorite', 'tools', 'help'] as const;

export const MenuBar = memo(() => {
  const t = useTranslations('menuBar');

  return (
    <div className='border border-[var(--color-border-medium)] font-sans text-xs flex select-none overflow-x-auto shrink-0 bg-[var(--color-window-bg)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
      {MENU_KEYS.map((key) => (
        <div
          key={key}
          className='font-sans text-sm py-0.5 px-1 shadow-menu-hover select-none'
          onMouseDown={(e) => {
            if (e.detail > SINGLE_CLICK_DETAIL) {
              e.preventDefault();
            }
          }}
        >
          {t(key)}
        </div>
      ))}
    </div>
  );
});
MenuBar.displayName = 'MenuBar';
