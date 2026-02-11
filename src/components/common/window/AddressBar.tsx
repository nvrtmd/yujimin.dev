'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/common/Button';

interface AddressBarProps {
  isPreviousPathHome: boolean;
  windowAppId: string;
}

export const AddressBar = memo(
  ({ isPreviousPathHome, windowAppId }: AddressBarProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const displayPath = pathname.startsWith(`/${windowAppId}`)
      ? pathname
      : `/${windowAppId}`;

    const [currentUrl, setCurrentUrl] = useState(displayPath);

    useEffect(() => {
      const origin = window.location.origin;
      setCurrentUrl(`${origin}${displayPath}`);
    }, [displayPath]);

    return (
      <div className='border border-[var(--color-border-medium)] font-sans text-base p-1 flex items-center mb-1 shrink-0 bg-[var(--color-window-bg)]'>
        <div className='flex shrink-0'>
          <Button
            onClick={() => router.back()}
            type='button'
            className='p-1'
            disabled={isPreviousPathHome}
          >
            <Image
              src='/images/icons/left_pointer.png'
              alt='back'
              width={28}
              height={28}
            />
          </Button>
          <Button
            onClick={() => router.forward()}
            type='button'
            className='p-1'
          >
            <Image
              src='/images/icons/right_pointer.png'
              alt='forward'
              width={28}
              height={28}
            />
          </Button>
        </div>
        <div className='bg-white shadow-inset-deep border-none p-1 flex items-center w-full min-w-0 ml-1'>
          <Image
            src='/images/icons/window_page_img.png'
            alt='window page icon'
            width={16}
            height={16}
            className='inline-block mr-1 shrink-0'
          />
          <div className='w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm'>
            {currentUrl}
          </div>
        </div>
      </div>
    );
  },
);
AddressBar.displayName = 'AddressBar';
