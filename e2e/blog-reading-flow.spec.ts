import { test, expect, Page } from '@playwright/test';

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Helper: Open blog window via double-click (desktop)
async function openBlogWindow(page: Page): Promise<void> {
  const blogIcon = page.getByTestId('desktop-icon-blog');
  const blogWindow = page.getByTestId('window-blog');

  await blogIcon.dblclick();
  await expect(blogWindow).toBeVisible();
}

// Helper: Open blog window via single tap (mobile)
async function openBlogWindowMobile(page: Page): Promise<void> {
  const blogIcon = page.getByTestId('desktop-icon-blog');
  const blogWindow = page.getByTestId('window-blog');

  await blogIcon.click();
  await expect(blogWindow).toBeVisible();
}

// ==========================================================================
// Desktop Blog Flow
// ==========================================================================

test.describe('Blog Desktop Flow', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('desktop-icon-blog')).toBeVisible();
  });

  test('[open] should open blog window on double-click', async ({ page }) => {
    // Arrange
    const blogIcon = page.getByTestId('desktop-icon-blog');
    const blogWindow = page.getByTestId('window-blog');

    // Act
    await blogIcon.dblclick();

    // Assert
    await expect(blogWindow).toBeVisible();
    await expect(page).toHaveURL('/blog');
  });

  test('[view] should switch between gallery and list view', async ({
    page,
  }) => {
    // Arrange
    await openBlogWindow(page);
    const posts = page.locator('[data-testid^="post-item-"]');
    await expect(posts.first()).toBeVisible();

    const galleryViewBtn = page.getByTestId('view-gallery-button');
    const listViewBtn = page.getByTestId('view-list-button');

    // Act & Assert - Gallery View (shows images)
    await galleryViewBtn.click();
    await expect(
      page.locator('[data-testid^="post-item-"] img').first(),
    ).toBeVisible();

    // Act & Assert - List View (shows table headers)
    await listViewBtn.click();
    await expect(page.getByText('Title')).toBeVisible();
    await expect(page.getByText('Date')).toBeVisible();
  });

  test('[flow] should complete full reading flow: open → detail → back', async ({
    page,
  }) => {
    // Arrange
    await openBlogWindow(page);
    const posts = page.locator('[data-testid^="post-item-"]');
    await expect(posts.first()).toBeVisible();

    // Act - Navigate to detail
    const firstPost = posts.first();
    await firstPost.dblclick({ force: true });

    // Assert - Detail page loaded
    await expect(page).toHaveURL(/\/blog\/.+/);

    // Act - Navigate back
    await page.goBack();

    // Assert - Back to list
    await expect(page).toHaveURL('/blog');
    await expect(posts.first()).toBeVisible();
  });
});

// ==========================================================================
// Mobile Blog Flow
// ==========================================================================

test.describe('Blog Mobile Flow', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('desktop-icon-blog')).toBeVisible();
  });

  test('[sidebar] should hide sidebar by default on mobile', async ({
    page,
  }) => {
    // Arrange
    const sidebar = page.getByTestId('blog-sidebar');

    // Act
    await openBlogWindowMobile(page);

    // Assert
    await expect(sidebar).toBeHidden();
  });

  test('[sidebar] should show sidebar on toggle button click', async ({
    page,
  }) => {
    // Arrange
    await openBlogWindowMobile(page);
    const toggleButton = page.getByRole('button', { name: 'Toggle Sidebar' });
    const sidebar = page.getByTestId('blog-sidebar');

    // Act
    await toggleButton.click();

    // Assert
    await expect(sidebar).toBeVisible();
  });

  test('[sidebar] should auto-close on category selection', async ({
    page,
  }) => {
    // Arrange
    await openBlogWindowMobile(page);
    const toggleButton = page.getByRole('button', { name: 'Toggle Sidebar' });
    const sidebar = page.getByTestId('blog-sidebar');

    await toggleButton.click();
    await expect(sidebar).toBeVisible();

    const categoryNode = page
      .locator('[data-testid="blog-sidebar"] >> text=/\\w+ \\(\\d+\\)/')
      .first();

    // Act
    await categoryNode.click();

    // Assert
    await expect(sidebar).toBeHidden();
  });

  test('[layout] should display blog window in fullscreen', async ({
    page,
  }) => {
    // Arrange
    const blogWindow = page.getByTestId('window-blog');

    // Act
    await openBlogWindowMobile(page);

    // Assert
    const windowBox = await blogWindow.boundingBox();
    expect(windowBox!.width).toBeGreaterThanOrEqual(MOBILE_VIEWPORT.width - 10);
  });
});
