'use client';

import { useSyncExternalStore, memo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/common/Button';
import type { BlogNavigation } from '@/hooks/useBlogNavigation';

const EMPTY_ORIGIN = '';

function subscribeToNothing() {
  return () => {};
}

function getOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return EMPTY_ORIGIN;
}

interface AddressBarProps {
  windowAppId: string;
  showNavigationButtons: boolean;
  blogNavigation: BlogNavigation;
}

export const AddressBar = memo(
  ({ windowAppId, showNavigationButtons, blogNavigation }: AddressBarProps) => {
    const pathname = usePathname();

    const displayPath = pathname.startsWith(`/${windowAppId}`)
      ? pathname
      : `/${windowAppId}`;

    const origin = useSyncExternalStore(
      subscribeToNothing,
      getOrigin,
      getServerOrigin,
    );

    const currentUrl = `${origin}${displayPath}`;

    return (
      <div className='border border-[var(--color-border-medium)] font-sans text-base p-1 flex items-center mb-1 shrink-0 bg-[var(--color-window-bg)]'>
        {showNavigationButtons && (
          <div className='flex shrink-0'>
            <Button
              onClick={blogNavigation.goBack}
              type='button'
              className='p-1'
              disabled={!blogNavigation.canGoBack}
            >
              <Image
                src='/images/icons/left_pointer.png'
                alt='back'
                width={28}
                height={28}
              />
            </Button>
            <Button
              onClick={blogNavigation.goForward}
              type='button'
              className='p-1'
              disabled={!blogNavigation.canGoForward}
            >
              <Image
                src='/images/icons/right_pointer.png'
                alt='forward'
                width={28}
                height={28}
              />
            </Button>
          </div>
        )}
        <div className='bg-white shadow-inset-deep border-none p-1 flex items-center w-full min-w-0 ml-1'>
          <div className='w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm'>
            {currentUrl}
          </div>
        </div>
      </div>
    );
  },
);
AddressBar.displayName = 'AddressBar';
