import type { Position, Size } from './common';

export const APP_IDS = [
  'blog',
  'about',
  'guestbook',
  'analytics',
  'resume',
] as const;

export type AppId = (typeof APP_IDS)[number];

export interface App {
  id: AppId;
  title: string;
  iconSrc: string;
  size?: Size;
  position?: Position;
  canMinimize?: boolean;
  canMaximize?: boolean;
  showAddressBar?: boolean;
  showNavigationButtons?: boolean;
  syncWithUrl?: boolean; // If true, opening/closing this app updates the browser URL
}
