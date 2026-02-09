'use client';

import Link from 'next/link';
import Image from 'next/image';
import { RefObject } from 'react';
import { TASKBAR_HEIGHT } from './Taskbar';

const GITHUB_URL = 'https://github.com/yujimin-dev';
const MENU_ITEM_CLASS =
  'p-3 flex items-center border border-black hover:bg-[var(--color-window-title-active-end)] hover:text-white';
const MENU_ICON_CLASS = 'mr-4 w-6 h-6';

interface StartMenuProps {
  menuRef: RefObject<HTMLDivElement | null>;
  closeMenu: () => void;
  onCloseAllWindows: () => void;
  onAppActivate: (appId: string) => void;
}

export function StartMenu({
  menuRef,
  closeMenu,
  onCloseAllWindows,
  onAppActivate,
}: StartMenuProps) {
  const handleHomeClick = () => {
    onCloseAllWindows();
    closeMenu();
  };

  const handleBlogClick = () => {
    onAppActivate('blog');
    closeMenu();
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <div
      ref={menuRef}
      className='fixed left-0 z-[10000] flex bg-[var(--color-window-bg)] shadow-start-menu'
      style={{
        bottom: `calc(${TASKBAR_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
        marginLeft: 'env(safe-area-inset-left, 0px)',
      }}
    >
      <div className='bg-[var(--color-window-title-active-end)] text-white p-2.5 [writing-mode:vertical-rl] transform rotate-180 flex items-center'>
        <span className='font-bold text-2xl'>Yuji Min</span>
      </div>

      <div>
        <Link href='/' onClick={handleHomeClick}>
          <div className={MENU_ITEM_CLASS}>
            <Image
              src='/images/icons/home_img.png'
              alt='Home'
              width={24}
              height={24}
              className={MENU_ICON_CLASS}
            />
            <span>Home</span>
          </div>
        </Link>
        <div
          onClick={handleBlogClick}
          className={`${MENU_ITEM_CLASS} cursor-pointer`}
        >
          <Image
            src='/images/icons/blog_img.png'
            alt='Blog'
            width={24}
            height={24}
            className={MENU_ICON_CLASS}
          />
          <span>Blog</span>
        </div>
        <a href={GITHUB_URL} target='_blank' rel='noopener noreferrer'>
          <div className={MENU_ITEM_CLASS}>
            <Image
              src='/images/icons/source_code_img.png'
              alt='Source Code'
              width={24}
              height={24}
              className={MENU_ICON_CLASS}
            />
            <span>Source Code</span>
          </div>
        </a>
        <div
          onClick={() => window.close()}
          className={`${MENU_ITEM_CLASS} cursor-pointer`}
        >
          <Image
            src='/images/icons/power_img.png'
            alt='Shut Down'
            width={24}
            height={24}
            className={MENU_ICON_CLASS}
          />
          <span>Shut Down</span>
        </div>
      </div>
    </div>
  );
}
