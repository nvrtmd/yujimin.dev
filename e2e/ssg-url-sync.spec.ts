import { test, expect, Page } from '@playwright/test';

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

test.use({ viewport: DESKTOP_VIEWPORT });

async function openWindowViaIcon(page: Page, appId: string): Promise<void> {
  const icon = page.getByTestId(`desktop-icon-${appId}`);
  await icon.dblclick();
  await expect(page.getByTestId(`window-${appId}`)).toBeVisible();
}

async function closeWindow(page: Page, appId: string): Promise<void> {
  await page.getByTestId(`window-close-${appId}`).click();
  await expect(page.getByTestId(`window-${appId}`)).not.toBeVisible();
}

test.describe('SSG URL Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('desktop-icon-blog')).toBeVisible();
  });

  test.describe('Icon Interaction -> URL Update', () => {
    test('[ssg-open] should change URL to /blog when opening blog window via icon', async ({
      page,
    }) => {
      // Arrange
      await expect(page).toHaveURL('/');

      // Act
      await openWindowViaIcon(page, 'blog');

      // Assert
      await expect(page).toHaveURL('/blog');
      await expect(page.getByTestId('window-blog')).toBeVisible();
    });

    test('[csr-open] should NOT change URL when opening about window (CSR)', async ({
      page,
    }) => {
      // Arrange & Act
      await openWindowViaIcon(page, 'about');

      // Assert
      await expect(page).toHaveURL('/');
      await expect(page.getByTestId('window-about')).toBeVisible();
    });
  });

  test.describe('Window Close -> URL Update', () => {
    test('[ssg-close] should return URL to / when closing blog window', async ({
      page,
    }) => {
      // Arrange
      await openWindowViaIcon(page, 'blog');
      await expect(page).toHaveURL('/blog');

      // Act
      await closeWindow(page, 'blog');

      // Assert
      await expect(page).toHaveURL('/');
      await expect(page.getByTestId('window-blog')).not.toBeVisible();
    });
  });

  test.describe('Browser Navigation', () => {
    test('[browser-back] should change URL to / but blog window remains open', async ({
      page,
    }) => {
      // Arrange
      await openWindowViaIcon(page, 'blog');
      await expect(page).toHaveURL('/blog');
      await expect(page.getByTestId('window-blog')).toBeVisible();

      // Act
      await page.goBack();

      // Assert
      await expect(page).toHaveURL('/');
      await expect(page.getByTestId('window-blog')).toBeVisible();
    });
  });

  test.describe('Direct URL Navigation', () => {
    test('[direct-url] should open blog window when navigating directly to /blog', async ({
      page,
    }) => {
      // Act
      await page.goto('/blog');

      // Assert
      await expect(page.getByTestId('window-blog')).toBeVisible();
      await expect(page).toHaveURL('/blog');
    });

    test('[direct-url-refresh] should maintain blog window when refreshing page at /blog', async ({
      page,
    }) => {
      // Arrange
      await page.goto('/blog');
      await expect(page.getByTestId('window-blog')).toBeVisible();

      // Act
      await page.reload();

      // Assert
      await expect(page.getByTestId('window-blog')).toBeVisible();
      await expect(page).toHaveURL('/blog');
    });
  });

  test.describe('Window State Persistence', () => {
    test('[query-params] should maintain blog window visibility when URL has query params', async ({
      page,
    }) => {
      // Arrange
      await openWindowViaIcon(page, 'blog');
      await expect(page).toHaveURL('/blog');
      await expect(page.getByTestId('window-blog')).toBeVisible();

      // Act
      await page.goto('/blog?category=Web+Dev');

      // Assert
      await expect(page.getByTestId('window-blog')).toBeVisible();
      await expect(page).toHaveURL(/\/blog\?category=Web\+Dev/);
    });
  });

  test.describe('Mixed CSR and SSG Windows', () => {
    test('[mixed] should only update URL for blog window (SSG), not about window (CSR)', async ({
      page,
    }) => {
      // Arrange - Open SSG window
      await openWindowViaIcon(page, 'blog');
      await expect(page).toHaveURL('/blog');

      // Act - Open CSR window
      await openWindowViaIcon(page, 'about');

      // Assert - URL should remain at /blog
      await expect(page).toHaveURL('/blog');

      // Act - Close CSR window
      await page.getByTestId('window-close-about').click();
      await expect(page.getByTestId('window-about')).not.toBeVisible();

      // Assert - URL still at /blog
      await expect(page).toHaveURL('/blog');

      // Act - Close SSG window
      await closeWindow(page, 'blog');

      // Assert - URL returns to /
      await expect(page).toHaveURL('/');
    });
  });
});
