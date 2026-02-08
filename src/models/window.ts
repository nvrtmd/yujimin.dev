import type { ReactNode } from 'react';
import type { Position, Size } from './common';
import type { App } from './app';

export interface WindowState extends App {
  content?: ReactNode;
  position: Position;
  size: Size;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  previousPosition?: Position;
  previousSize?: Size;
}
