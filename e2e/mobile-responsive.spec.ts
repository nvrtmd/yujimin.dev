import { test, expect } from '@playwright/test';

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };

test.describe('Mobile Responsiveness - useMobile Hook', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByTestId('desktop-icon-about-me')).toBeVisible({
      timeout: 500,
    });
  });

  test.describe('Desktop Mode (>= 768px)', () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test('[desktop-interaction] should require double-click to open window', async ({
      page,
    }) => {
      // Arrange
      const aboutIcon = page.getByTestId('desktop-icon-about-me');

      // Act - Single click
      await aboutIcon.click();

      // Assert - Window should NOT open
      await expect(page.getByTestId('window-about-me')).not.toBeVisible();

      // Act - Double click
      await aboutIcon.dblclick();

      // Assert - Window should open
      await expect(page.getByTestId('window-about-me')).toBeVisible();
    });

    test('[desktop-layout] should support multiple windows without fullscreen', async ({
      page,
    }) => {
      // Arrange
      const aboutIcon = page.getByTestId('desktop-icon-about-me');
      const guestbookIcon = page.getByTestId('desktop-icon-guestbook');

      // Act - Open both windows
      await aboutIcon.dblclick();
      await expect(page.getByTestId('window-about-me')).toBeVisible();

      await guestbookIcon.dblclick();
      await expect(page.getByTestId('window-guestbook')).toBeVisible();

      // Assert - Both windows visible simultaneously
      const aboutWindow = page.getByTestId('window-about-me');
      const guestbookWindow = page.getByTestId('window-guestbook');

      await expect(aboutWindow).toBeVisible();
      await expect(guestbookWindow).toBeVisible();

      // Assert - Windows should NOT fill entire viewport
      const aboutBox = await aboutWindow.boundingBox();
      expect(aboutBox!.width).toBeLessThan(DESKTOP_VIEWPORT.width);
      expect(aboutBox!.height).toBeLessThan(DESKTOP_VIEWPORT.height);
    });
  });

  test.describe('Mobile Mode (< 768px)', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test('[mobile-interaction] should open window on single tap', async ({
      page,
    }) => {
      // Arrange
      const aboutIcon = page.getByTestId('desktop-icon-about-me');

      // Act
      await aboutIcon.click();

      // Assert
      await expect(page.getByTestId('window-about-me')).toBeVisible();
    });

    test('[mobile-layout] should show window in fullscreen mode', async ({
      page,
    }) => {
      // Arrange
      const aboutIcon = page.getByTestId('desktop-icon-about-me');

      // Act
      await aboutIcon.click();

      // Assert - Window should be visible
      const aboutWindow = page.getByTestId('window-about-me');
      await expect(aboutWindow).toBeVisible();

      // Assert - Window should fill viewport
      const windowBox = await aboutWindow.boundingBox();
      expect(windowBox!.width).toBeGreaterThanOrEqual(
        MOBILE_VIEWPORT.width - 10,
      );
      expect(windowBox!.height).toBeGreaterThanOrEqual(
        MOBILE_VIEWPORT.height - 100,
      );
    });
  });

  test.describe('Viewport Resize', () => {
    test('[resize] should switch from desktop to mobile behavior on resize', async ({
      page,
    }) => {
      // Arrange - Start in desktop mode
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.reload();
      await expect(page.getByTestId('desktop-icon-about-me')).toBeVisible({
        timeout: 500,
      });
      const aboutIcon = page.getByTestId('desktop-icon-about-me');

      // Act & Assert - Desktop: single click should NOT open window
      await aboutIcon.click();
      await expect(page.getByTestId('window-about-me')).not.toBeVisible();

      // Arrange - Resize to mobile
      await page.setViewportSize(MOBILE_VIEWPORT);

      // Act - Single tap on different icon
      const guestbookIcon = page.getByTestId('desktop-icon-guestbook');
      await guestbookIcon.click();

      // Assert - Should open (mobile behavior)
      await expect(page.getByTestId('window-guestbook')).toBeVisible();
    });
  });
});
