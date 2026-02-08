'use client';

import { memo } from 'react';
import { MENU_ITEMS } from './constants';

// e.detail counts clicks; > 1 means double-click or more
const SINGLE_CLICK_DETAIL = 1;

export const MenuBar = memo(() => {
  return (
    <div className='border border-[var(--color-border-medium)] font-sans text-sm flex select-none overflow-x-auto shrink-0 bg-[var(--color-window-bg)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
      {MENU_ITEMS.map((menu) => (
        <div
          key={menu}
          className='font-sans text-sm p-1 shadow-menu-hover select-none'
          onMouseDown={(e) => {
            if (e.detail > SINGLE_CLICK_DETAIL) {
              e.preventDefault();
            }
          }}
        >
          {menu}
        </div>
      ))}
    </div>
  );
});
MenuBar.displayName = 'MenuBar';
