'use client';

import { forwardRef, memo, ReactNode, ButtonHTMLAttributes } from 'react';

interface PushLockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isPushed: boolean;
  name?: string;
  children?: ReactNode;
}

export const PushLockButton = memo(
  forwardRef<HTMLButtonElement, PushLockButtonProps>(
    ({ isPushed, name, children, className, ...props }, ref) => {
      return (
        <button
          ref={ref}
          className={`
            bg-[var(--color-window-bg)] flex items-center p-1 select-none
            ${isPushed ? 'shadow-inset-deep' : 'shadow-outset'}
            ${className ?? ''}
          `}
          {...props}
        >
          {children}
          {name}
        </button>
      );
    },
  ),
);

PushLockButton.displayName = 'PushLockButton';
