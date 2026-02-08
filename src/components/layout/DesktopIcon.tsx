'use client';

import Image from 'next/image';
import { MouseEventHandler } from 'react';
import { useSelectedStyle } from '@/hooks/useSelectedStyle';

interface DesktopIconProps {
  id: string;
  iconSrc: string;
  title: string;
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
  position?: { x: number; y: number };
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

export function DesktopIcon({
  id,
  iconSrc,
  title,
  isSelected,
  onClick,
  position,
  onMouseDown,
  className = '',
}: DesktopIconProps) {
  const selectedStyle = useSelectedStyle(isSelected);

  return (
    <div
      data-testid={`desktop-icon-${id}`}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={`${className} flex flex-col items-center w-28 p-2 select-none group`}
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      <div className='relative mb-1 w-14 h-14'>
        {isSelected && (
          <div
            className='absolute inset-0 bg-[var(--color-selection-overlay)]'
            style={{
              maskImage: `url(${iconSrc})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: `url(${iconSrc})`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
            }}
          />
        )}
        <Image
          src={iconSrc}
          alt={title}
          fill
          className={`object-contain ${selectedStyle.imageTint}`}
          sizes='64px'
          priority
          draggable={false}
        />
      </div>

      <div
        className={`
          text-center text-lg p-0.5 border 
          ${selectedStyle.container} 
          ${!isSelected ? 'text-white drop-shadow-md' : ''} 
        `}
      >
        <span className='line-clamp-2 leading-tight'>{title}</span>
      </div>
    </div>
  );
}
