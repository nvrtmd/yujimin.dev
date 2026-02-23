export type SortKey = 'title' | 'summary' | 'date' | 'category';
export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const DEFAULT_CATEGORY = 'all';
export const BLOG_ROOT_NODE = 'blogRoot';

export const SORT_HEADER_BASE_CLASS =
  'border-r border-white border-b border-b-[var(--color-border-dark)] p-1 px-2 border-t border-t-white border-l border-l-white active:border-l-[var(--color-border-dark)] active:border-t-[var(--color-border-dark)] active:border-r-white active:border-b-white truncate select-none flex items-center bg-[var(--color-window-bg)]';

export const SORT_HEADERS = [
  {
    key: 'title' as const,
    label: 'Title',
    sizeClass: 'flex-[2] min-w-[150px]',
  },
  {
    key: 'summary' as const,
    label: 'Summary',
    sizeClass: 'flex-[3] min-w-[200px]',
  },
  { key: 'date' as const, label: 'Date', sizeClass: 'w-32 shrink-0' },
  { key: 'category' as const, label: 'Category', sizeClass: 'w-24 shrink-0' },
] as const;
