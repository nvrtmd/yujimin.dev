import type { Position, Size } from './common';
export type AppId = 'blog' | 'about' | 'guestbook' | 'analytics' | 'resume';

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
