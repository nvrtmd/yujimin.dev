import type { Position, Size } from './common';
export type AppId =
  | 'blog'
  | 'about'
  | 'etc'
  | 'guestbook'
  | 'analytics'
  | 'resume';
export type AppRenderType = 'ssg' | 'csr';

export interface App {
  id: AppId;
  title: string;
  iconSrc: string;
  renderType: AppRenderType;
  size?: Size;
  position?: Position;
  canMinimize?: boolean;
  canMaximize?: boolean;
}
