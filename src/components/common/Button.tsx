'use client';

import { useState, memo, ButtonHTMLAttributes } from 'react';
import {
  SHADOW_OUTSET_LARGE,
  SHADOW_INSET_LARGE,
  SHADOW_INSET_LARGE_DISABLED,
} from './retroStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  restoreHandler?: () => void;
  name?: string;
  children?: React.ReactNode;
}

export const Button = memo(
  ({ restoreHandler, name, children, className, ...props }: ButtonProps) => {
    const [isPushed, setIsPushed] = useState(false);

    const handleButtonPush = () => {
      if (!props.disabled) {
        setIsPushed(true);
      }
    };

    const handleButtonRestore = () => {
      if (!props.disabled) {
        if (restoreHandler) {
          restoreHandler();
        }
        setIsPushed(false);
      }
    };

    const handleButtonMouseOut = () => {
      if (isPushed) {
        setIsPushed(false);
      }
    };

    const getShadowStyle = () => {
      if (props.disabled) {
        return SHADOW_INSET_LARGE_DISABLED;
      }
      if (isPushed) {
        return SHADOW_INSET_LARGE;
      }
      return SHADOW_OUTSET_LARGE;
    };

    return (
      <button
        onMouseDown={handleButtonPush}
        onMouseUp={handleButtonRestore}
        onMouseLeave={handleButtonMouseOut}
        style={{
          boxShadow: getShadowStyle(),
        }}
        className={`
        bg-[var(--color-window-bg)] flex items-center p-1 text-md focus:outline-none
        ${props.disabled ? 'text-gray-500 cursor-not-allowed' : ''}
        ${className}
      `}
        {...props}
      >
        {children}
        {name}
      </button>
    );
  },
);

Button.displayName = 'Button';
