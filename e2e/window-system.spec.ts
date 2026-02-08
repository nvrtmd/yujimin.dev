import { test, expect, Page } from '@playwright/test';

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const TASKBAR_HEIGHT = 38;

test.use({ viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT } });

async function openWindow(page: Page, appId: string): Promise<void> {
  const icon = page.getByTestId(`desktop-icon-${appId}`);
  await icon.dblclick();
  await expect(page.getByTestId(`window-${appId}`)).toBeVisible();
}

async function getZIndex(
  locator: ReturnType<Page['getByTestId']>,
): Promise<number> {
  const zIndex = await locator.evaluate(
    (el) => window.getComputedStyle(el).zIndex,
  );
  return Number(zIndex);
}

test.describe('Window System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('desktop-icon-about')).toBeVisible();
  });

  test.describe('Opening Windows', () => {
    test('[open] should open about window on desktop icon double-click', async ({
      page,
    }) => {
      // Act
      await openWindow(page, 'about');

      // Assert
      await expect(page.getByTestId('window-about')).toBeVisible();
    });

    test('[open] should show about window in taskbar when opened', async ({
      page,
    }) => {
      // Act
      await openWindow(page, 'about');

      // Assert
      await expect(page.getByTestId('taskbar-button-about')).toBeVisible();
    });

    test('[open] should not duplicate about window if already open', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'about');

      // Act - Try to open again
      await page.getByTestId('desktop-icon-about').dblclick();

      // Assert - Should only have one window
      const windows = page.locator('[data-testid="window-about"]');
      await expect(windows).toHaveCount(1);
    });

    test('[open] should open multiple different windows simultaneously', async ({
      page,
    }) => {
      // Act
      await openWindow(page, 'about');
      await openWindow(page, 'guestbook');

      // Assert
      await expect(page.getByTestId('window-about')).toBeVisible();
      await expect(page.getByTestId('window-guestbook')).toBeVisible();
    });
  });

  test.describe('Window Controls', () => {
    test('[close] should close guestbook window and remove taskbar button', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');

      // Act
      await page.getByTestId('window-close-guestbook').click();

      // Assert
      await expect(page.getByTestId('window-guestbook')).not.toBeVisible();
      await expect(
        page.getByTestId('taskbar-button-guestbook'),
      ).not.toBeVisible();
    });

    test('[minimize] should hide guestbook window but keep taskbar button', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');

      // Act
      await page.getByTestId('window-minimize-guestbook').click();

      // Assert
      await expect(page.getByTestId('window-guestbook')).not.toBeVisible();
      await expect(page.getByTestId('taskbar-button-guestbook')).toBeVisible();
    });

    test('[restore] should restore minimized guestbook window from taskbar', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      await page.getByTestId('window-minimize-guestbook').click();
      await expect(page.getByTestId('window-guestbook')).not.toBeVisible();

      // Act
      await page.getByTestId('taskbar-button-guestbook').click();

      // Assert
      await expect(page.getByTestId('window-guestbook')).toBeVisible();
    });

    test('[maximize] should maximize guestbook window to fill viewport', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      const guestbookWindow = page.getByTestId('window-guestbook');

      // Act
      await page.getByTestId('window-maximize-guestbook').click();

      // Assert
      await expect(guestbookWindow).toBeVisible();
      const maximizedBox = await guestbookWindow.boundingBox();
      expect(maximizedBox?.width).toBe(VIEWPORT_WIDTH);
      expect(maximizedBox?.height).toBe(VIEWPORT_HEIGHT - TASKBAR_HEIGHT);
      expect(maximizedBox?.x).toBe(0);
      expect(maximizedBox?.y).toBe(0);
    });

    test('[maximize-toggle] should restore guestbook window when clicking maximize again', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      const guestbookWindow = page.getByTestId('window-guestbook');
      await page.getByTestId('window-maximize-guestbook').click();
      const maximizedBox = await guestbookWindow.boundingBox();

      // Act
      await page.getByTestId('window-maximize-guestbook').click();

      // Assert
      await expect(guestbookWindow).toBeVisible();
      const restoredBox = await guestbookWindow.boundingBox();
      expect(restoredBox?.width).toBeLessThanOrEqual(maximizedBox?.width ?? 0);
      expect(restoredBox?.height).toBeLessThanOrEqual(
        maximizedBox?.height ?? 0,
      );
    });

    test('[titlebar-dblclick] should maximize guestbook window when double-clicking titlebar', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      const guestbookWindow = page.getByTestId('window-guestbook');
      const titleBar = page.getByTestId('window-titlebar-guestbook');

      // Act
      await titleBar.dblclick();

      // Assert
      await expect(guestbookWindow).toBeVisible();
      const maximizedBox = await guestbookWindow.boundingBox();
      expect(maximizedBox?.width).toBe(VIEWPORT_WIDTH);
      expect(maximizedBox?.height).toBe(VIEWPORT_HEIGHT - TASKBAR_HEIGHT);
      expect(maximizedBox?.x).toBe(0);
      expect(maximizedBox?.y).toBe(0);
    });

    test('[titlebar-dblclick-toggle] should restore guestbook window when double-clicking titlebar again', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      const guestbookWindow = page.getByTestId('window-guestbook');
      const titleBar = page.getByTestId('window-titlebar-guestbook');
      await titleBar.dblclick();
      const maximizedBox = await guestbookWindow.boundingBox();

      // Act
      await titleBar.dblclick();

      // Assert
      await expect(guestbookWindow).toBeVisible();
      const restoredBox = await guestbookWindow.boundingBox();
      expect(restoredBox?.width).toBeLessThanOrEqual(maximizedBox?.width ?? 0);
      expect(restoredBox?.height).toBeLessThanOrEqual(
        maximizedBox?.height ?? 0,
      );
    });
  });

  test.describe('Window Drag', () => {
    test('[drag] should move guestbook window when dragging titlebar', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      const titleBar = page.getByTestId('window-titlebar-guestbook');
      const guestbookWindow = page.getByTestId('window-guestbook');
      const initialBox = await guestbookWindow.boundingBox();

      // Act
      await titleBar.hover();
      await page.mouse.down();
      await page.mouse.move(initialBox!.x + 100, initialBox!.y + 50);
      await page.mouse.up();

      // Assert
      const newBox = await guestbookWindow.boundingBox();
      expect(newBox!.x).not.toBe(initialBox!.x);
      expect(newBox!.y).not.toBe(initialBox!.y);
    });
  });

  test.describe('Window Resize', () => {
    test('[resize] should resize guestbook window when dragging southeast handle', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      const guestbookWindow = page.getByTestId('window-guestbook');
      const resizeHandle = page.getByTestId('resize-handle-se-guestbook');
      const initialBox = await guestbookWindow.boundingBox();

      // Act
      await resizeHandle.hover();
      await page.mouse.down();
      await page.mouse.move(
        initialBox!.x + initialBox!.width + 100,
        initialBox!.y + initialBox!.height + 100,
      );
      await page.mouse.up();

      // Assert
      const newBox = await guestbookWindow.boundingBox();
      expect(newBox!.width).toBeGreaterThan(initialBox!.width);
      expect(newBox!.height).toBeGreaterThan(initialBox!.height);
    });

    test('[resize-min] should not resize guestbook window below minimum size', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      const guestbookWindow = page.getByTestId('window-guestbook');
      const resizeHandle = page.getByTestId('resize-handle-se-guestbook');
      const initialBox = await guestbookWindow.boundingBox();

      // Act - Try to resize very small
      await resizeHandle.hover();
      await page.mouse.down();
      await page.mouse.move(initialBox!.x + 50, initialBox!.y + 50);
      await page.mouse.up();

      // Assert - Should have minimum size (290x270)
      const newBox = await guestbookWindow.boundingBox();
      expect(newBox!.width).toBeGreaterThanOrEqual(290);
      expect(newBox!.height).toBeGreaterThanOrEqual(270);
    });
  });

  test.describe('Window Z-Index (Focus)', () => {
    test('[focus-click] should bring guestbook window to front when clicked', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      await openWindow(page, 'analytics');
      const guestbookWindow = page.getByTestId('window-guestbook');
      const analyticsWindow = page.getByTestId('window-analytics');
      const analyticsZIndex = await getZIndex(analyticsWindow);

      // Act
      await page.getByTestId('window-titlebar-guestbook').click();

      // Assert
      const newGuestbookZIndex = await getZIndex(guestbookWindow);
      expect(newGuestbookZIndex).toBeGreaterThan(analyticsZIndex);
    });

    test('[focus-taskbar] should bring guestbook window to front via taskbar click', async ({
      page,
    }) => {
      // Arrange
      await openWindow(page, 'guestbook');
      await openWindow(page, 'analytics');
      const guestbookWindow = page.getByTestId('window-guestbook');
      const analyticsWindow = page.getByTestId('window-analytics');

      // Act
      await page.getByTestId('taskbar-button-guestbook').click();

      // Assert
      const guestbookZIndex = await getZIndex(guestbookWindow);
      const analyticsZIndex = await getZIndex(analyticsWindow);
      expect(guestbookZIndex).toBeGreaterThan(analyticsZIndex);
    });
  });
});
