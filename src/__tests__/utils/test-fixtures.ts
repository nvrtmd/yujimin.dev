import type { App, WindowState } from '@/models';

/**
 * Creates a mock WindowState for testing (formerly CSR window)
 */
export const createMockCsrWindow = (
  overrides: Partial<WindowState> = {},
): WindowState => ({
  id: 'about',
  title: 'About',
  iconSrc: '/test.png',
  showAddressBar: false,
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  zIndex: 1,
  isMinimized: false,
  isMaximized: false,
  ...overrides,
});

/**
 * Creates a mock WindowState with address bar (formerly SSG window)
 */
export const createMockSsgWindow = (
  overrides: Partial<WindowState> = {},
): WindowState => ({
  id: 'blog',
  title: 'Blog',
  iconSrc: '/test.png',
  showAddressBar: true,
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  zIndex: 1,
  isMinimized: false,
  isMaximized: false,
  ...overrides,
});

/**
 * Creates a mock App without address bar (formerly CSR app)
 */
export const createMockCsrApp = (overrides: Partial<App> = {}): App => ({
  id: 'about',
  title: 'About',
  iconSrc: '/test.png',
  showAddressBar: false,
  ...overrides,
});

/**
 * Creates a mock App with address bar (formerly SSG app)
 */
export const createMockSsgApp = (overrides: Partial<App> = {}): App => ({
  id: 'blog',
  title: 'Blog',
  iconSrc: '/test.png',
  showAddressBar: true,
  ...overrides,
});
