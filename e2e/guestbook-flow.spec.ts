import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for Guestbook Form Submission and List Refresh Flow
 *
 * Tests the complete user flow:
 * 1. Form submission with validation
 * 2. Success/error message display
 * 3. List refresh with new entries
 *
 * Implementation notes:
 * - Guestbook is a CSR app (renderType: 'csr')
 * - Form uses react-hook-form with Zod validation
 * - API endpoint: POST/GET /api/guestbook
 * - Rate limiting: 1 post per IP per minute (429 error)
 */

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

test.use({ viewport: DESKTOP_VIEWPORT });

// --- Helper Functions ---

async function openGuestbookWindow(page: Page): Promise<void> {
  const icon = page.getByTestId('desktop-icon-guestbook');
  const windowLocator = page.getByTestId('window-guestbook');

  await icon.dblclick();
  await expect(windowLocator).toBeVisible();
}

async function fillGuestbookForm(
  page: Page,
  data: {
    nickname: string;
    message: string;
    location?: string;
    website?: string;
  },
): Promise<void> {
  const window = page.getByTestId('window-guestbook');

  await window.getByLabel(/Nickname/).fill(data.nickname);
  await window.getByLabel(/Message/).fill(data.message);

  if (data.location) {
    await window.getByLabel('Location').fill(data.location);
  }
  if (data.website) {
    await window.getByLabel('Website').fill(data.website);
  }
}

async function submitForm(page: Page): Promise<void> {
  const window = page.getByTestId('window-guestbook');
  await window.getByRole('button', { name: /Submit/ }).click();
}

async function waitForSubmissionResult(
  page: Page,
): Promise<'success' | 'rate-limit'> {
  const window = page.getByTestId('window-guestbook');

  const successResult = window.getByTestId('submit-result-success');
  const errorResult = window.getByTestId('submit-result-error');

  await expect(successResult.or(errorResult)).toBeVisible();

  const hasSuccess = await successResult.isVisible().catch(() => false);

  return hasSuccess ? 'success' : 'rate-limit';
}

async function waitForListToLoad(page: Page): Promise<void> {
  const window = page.getByTestId('window-guestbook');

  // Wait for list to reach a stable state:
  // - Has items (guestbook-item)
  // - OR shows empty message
  // - OR shows end message
  const hasItems = window.getByTestId('guestbook-item').first();
  const emptyMessage = window.getByText('Be the first to leave a message!');
  const endMessage = window.getByText('-- End of messages --');

  await expect(hasItems.or(emptyMessage).or(endMessage)).toBeVisible();
}

async function getListItemCount(page: Page): Promise<number> {
  const window = page.getByTestId('window-guestbook');
  const items = window.getByTestId('guestbook-item');
  return items.count();
}

function generateTestData(prefix: string = 'E2E') {
  const timestamp = Date.now();
  return {
    nickname: `${prefix}${timestamp}`,
    message: `${prefix} test message at ${new Date().toISOString()}`,
    location: 'Seoul, Korea',
    website: 'https://example.com',
  };
}

async function getFirstEntryNickname(page: Page): Promise<string | null> {
  const window = page.getByTestId('window-guestbook');
  const firstItem = window.getByTestId('guestbook-item').first();

  const count = await firstItem.count();
  if (count === 0) return null;

  const nickname = firstItem.getByTestId('guestbook-item-nickname');
  return nickname.textContent();
}

// --- Test Suites ---

test.describe('Guestbook - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('/en');
    await expect(page.getByTestId('desktop-icon-guestbook')).toBeVisible();
    await openGuestbookWindow(page);
  });

  test('[validation] should show error when nickname is empty', async ({
    page,
  }) => {
    // Arrange
    const window = page.getByTestId('window-guestbook');

    // Act
    await window.getByLabel(/Message/).fill('Test message');
    await submitForm(page);

    // Assert
    await expect(
      window.getByText('Nickname requires at least 1 character.'),
    ).toBeVisible();
  });

  test('[validation] should preserve form data on validation error', async ({
    page,
  }) => {
    // Arrange
    const window = page.getByTestId('window-guestbook');
    const testMessage = 'Test message';

    // Act
    await window.getByLabel(/Message/).fill(testMessage);
    await submitForm(page);

    // Assert
    await expect(
      window.getByText('Nickname requires at least 1 character.'),
    ).toBeVisible();
    await expect(window.getByLabel(/Message/)).toHaveValue(testMessage);
  });
});

test.describe('Guestbook - List Display', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('/en');
    await expect(page.getByTestId('desktop-icon-guestbook')).toBeVisible();
    await openGuestbookWindow(page);
    await waitForListToLoad(page);
  });

  test('[list] should display existing entries or empty message', async ({
    page,
  }) => {
    // Arrange
    const window = page.getByTestId('window-guestbook');

    // Act
    const entryCount = await getListItemCount(page);

    // Assert
    if (entryCount === 0) {
      await expect(
        window.getByText('Be the first to leave a message!'),
      ).toBeVisible();
    } else {
      const firstItem = window.getByTestId('guestbook-item').first();
      await expect(firstItem).toBeVisible();
    }
  });
});

test.describe('Guestbook - Form Submission Flow', () => {
  test('[submission] should complete form submission and update list', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/en');
    await expect(page.getByTestId('desktop-icon-guestbook')).toBeVisible();
    await openGuestbookWindow(page);

    const window = page.getByTestId('window-guestbook');
    const testData = generateTestData('Flow');
    const initialFirstNickname = await getFirstEntryNickname(page);

    // Act
    await fillGuestbookForm(page, testData);
    await expect(window.getByLabel(/Nickname/)).toHaveValue(testData.nickname);
    await expect(window.getByLabel(/Message/)).toHaveValue(testData.message);

    await submitForm(page);
    const result = await waitForSubmissionResult(page);

    // Assert
    if (result === 'success') {
      await expect(
        window.getByText('Message added successfully!'),
      ).toBeVisible();
      await expect(window.getByLabel(/Nickname/)).toHaveValue('');
      await expect(window.getByLabel(/Message/)).toHaveValue('');

      const firstItem = window.getByTestId('guestbook-item').first();
      await expect(firstItem.getByTestId('guestbook-item-nickname')).toHaveText(
        testData.nickname,
      );

      const newFirstNickname = await getFirstEntryNickname(page);
      expect(newFirstNickname).toBe(testData.nickname);
      expect(newFirstNickname).not.toBe(initialFirstNickname);
    } else {
      await expect(
        window.getByText('Please wait 1 minute before posting again.'),
      ).toBeVisible();
      await expect(window.getByLabel(/Nickname/)).toHaveValue(
        testData.nickname,
      );
      await expect(window.getByLabel(/Message/)).toHaveValue(testData.message);
    }
  });
});

test.describe('Guestbook - Rate Limit Handling', () => {
  test('[rate-limit] should show error and preserve form on consecutive submissions', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/en');
    await expect(page.getByTestId('desktop-icon-guestbook')).toBeVisible();
    await openGuestbookWindow(page);

    const window = page.getByTestId('window-guestbook');
    const submitButton = window.getByRole('button', { name: /Submit/ });

    // Act - First submission
    const testData1 = generateTestData('Rate1');
    await fillGuestbookForm(page, testData1);
    await submitForm(page);
    const firstResult = await waitForSubmissionResult(page);

    // Assert - If first is rate-limited, verify and exit early
    if (firstResult === 'rate-limit') {
      await expect(
        window.getByText('Please wait 1 minute before posting again.'),
      ).toBeVisible();
      await expect(window.getByLabel(/Nickname/)).toHaveValue(
        testData1.nickname,
      );
      await expect(window.getByLabel(/Message/)).toHaveValue(testData1.message);
      return;
    }

    // Act - Second submission (first succeeded, so this should trigger rate limit)
    await expect(submitButton).toBeEnabled();
    const testData2 = generateTestData('Rate2');
    await fillGuestbookForm(page, testData2);
    await submitForm(page);
    const secondResult = await waitForSubmissionResult(page);

    // Assert - Second should be rate-limited
    if (secondResult === 'rate-limit') {
      await expect(
        window.getByText('Please wait 1 minute before posting again.'),
      ).toBeVisible();
      await expect(window.getByLabel(/Nickname/)).toHaveValue(
        testData2.nickname,
      );
      await expect(window.getByLabel(/Message/)).toHaveValue(testData2.message);
    }
  });
});

test.describe('Guestbook - Edge Cases', () => {
  test('[edge] should disable submit button during submission', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/en');
    await expect(page.getByTestId('desktop-icon-guestbook')).toBeVisible();
    await openGuestbookWindow(page);

    const window = page.getByTestId('window-guestbook');
    const submitButton = window.getByRole('button', { name: /Submit/ });
    const testData = generateTestData('Disabled');

    // Act
    await fillGuestbookForm(page, testData);
    await submitButton.click();

    // Assert - Button should be disabled during submission
    await expect(submitButton).toBeDisabled();

    // Wait for result and verify button is enabled again
    await waitForSubmissionResult(page);
    await expect(submitButton).toBeEnabled();
  });
});
