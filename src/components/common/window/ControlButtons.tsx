'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/common/Button';

const CONTROL_ICON_SIZE = 15;
// e.detail counts clicks; > 1 means double-click or more
const SINGLE_CLICK_DETAIL = 1;

interface ControlButtonsProps {
  windowId: string;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  canMinimize: boolean;
  canMaximize: boolean;
}

export const ControlButtons = memo(
  ({
    windowId,
    onClose,
    onMinimize,
    onToggleMaximize,
    canMinimize,
    canMaximize,
  }: ControlButtonsProps) => {
    return (
      <div
        className='flex select-none'
        onMouseDown={(e) => {
          e.stopPropagation();
          if (e.detail > SINGLE_CLICK_DETAIL) {
            e.preventDefault();
          }
        }}
      >
        {canMinimize && (
          <Button
            type='button'
            onClick={onMinimize}
            className='p-0.5 select-none'
            data-testid={`window-minimize-${windowId}`}
          >
            <Image
              src='/images/icons/minimize_img.jpg'
              alt='minimize'
              width={CONTROL_ICON_SIZE}
              height={CONTROL_ICON_SIZE}
              className='select-none w-4 h-1 self-end'
              draggable={false}
            />
          </Button>
        )}

        {canMaximize && (
          <Button
            type='button'
            onClick={onToggleMaximize}
            className='p-0.5 select-none'
            data-testid={`window-maximize-${windowId}`}
          >
            <Image
              src='/images/icons/maximize_img.jpg'
              alt='maximize'
              width={CONTROL_ICON_SIZE}
              height={CONTROL_ICON_SIZE}
              className='select-none'
              draggable={false}
            />
          </Button>
        )}

        <Button
          type='button'
          onClick={onClose}
          className='p-0.5 select-none'
          data-testid={`window-close-${windowId}`}
        >
          <Image
            src='/images/icons/close_img.jpg'
            alt='close'
            width={CONTROL_ICON_SIZE}
            height={CONTROL_ICON_SIZE}
            className='select-none w-4 h-4'
            draggable={false}
          />
        </Button>
      </div>
    );
  },
);
ControlButtons.displayName = 'ControlButtons';
