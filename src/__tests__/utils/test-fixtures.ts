import type { App, WindowState } from '@/models';

/**
 * Creates a mock CSR WindowState for testing
 */
export const createMockCsrWindow = (
  overrides: Partial<WindowState> = {},
): WindowState => ({
  id: 'about',
  title: 'About',
  iconSrc: '/test.png',
  renderType: 'csr',
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  zIndex: 1,
  isMinimized: false,
  isMaximized: false,
  ...overrides,
});

/**
 * Creates a mock SSG WindowState for testing
 */
export const createMockSsgWindow = (
  overrides: Partial<WindowState> = {},
): WindowState => ({
  id: 'blog',
  title: 'Blog',
  iconSrc: '/test.png',
  renderType: 'ssg',
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  zIndex: 1,
  isMinimized: false,
  isMaximized: false,
  ...overrides,
});

/**
 * Creates a mock CSR App for testing
 */
export const createMockCsrApp = (overrides: Partial<App> = {}): App => ({
  id: 'about',
  title: 'About',
  iconSrc: '/test.png',
  renderType: 'csr',
  ...overrides,
});

/**
 * Creates a mock SSG App for testing
 */
export const createMockSsgApp = (overrides: Partial<App> = {}): App => ({
  id: 'blog',
  title: 'Blog',
  iconSrc: '/test.png',
  renderType: 'ssg',
  ...overrides,
});
