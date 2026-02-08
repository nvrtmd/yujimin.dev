export const MOBILE_Z_INDEX_OFFSET = 9000;

export const MENU_ITEMS = [
  'File',
  'Edit',
  'View',
  'Go',
  'Favorite',
  'Tools',
  'Help',
] as const;

export const RESIZE_DIRECTIONS = [
  {
    direction: 'nw',
    className: 'top-0 left-0 w-2 h-2 cursor-nwse-resize',
  },
  {
    direction: 'ne',
    className: 'top-0 right-0 w-2 h-2 cursor-nesw-resize',
  },
  {
    direction: 'sw',
    className: 'bottom-0 left-0 w-2 h-2 cursor-nesw-resize',
  },
  {
    direction: 'se',
    className: 'bottom-0 right-0 w-4 h-4 cursor-nwse-resize',
  },
  {
    direction: 'n',
    className: 'top-0 left-2 right-2 h-2 cursor-ns-resize',
  },
  {
    direction: 's',
    className: 'bottom-0 left-2 right-2 h-2 cursor-ns-resize',
  },
  {
    direction: 'w',
    className: 'top-2 bottom-2 left-0 w-2 cursor-ew-resize',
  },
  {
    direction: 'e',
    className: 'top-2 bottom-2 right-0 w-2 cursor-ew-resize',
  },
] as const;
