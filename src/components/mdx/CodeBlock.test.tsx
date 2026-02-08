import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // [render] Rendering
  // ==========================================================================

  it('[render] should render code content and copy button', () => {
    // Arrange & Act
    render(
      <CodeBlock>
        <code>const x = 1;</code>
      </CodeBlock>,
    );

    // Assert
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy code' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Source Code')).toBeInTheDocument();
  });

  it('[render] should display a copy icon inside the button', () => {
    // Arrange & Act
    render(
      <CodeBlock>
        <code>const x = 1;</code>
      </CodeBlock>,
    );

    const button = screen.getByRole('button', { name: 'Copy code' });

    // Assert - button always shows "Copy" text
    expect(button).toHaveTextContent('Copy');
    // Assert - copy icon is present (svg with data-testid)
    expect(
      button.querySelector('[data-testid="copy-icon"]'),
    ).toBeInTheDocument();
  });

  // ==========================================================================
  // [copy] Copy Feedback UI
  // ==========================================================================

  it('[copy] should keep button text as "Copy" after clicking and change icon to checkmark', async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <CodeBlock>
        <code>test code</code>
      </CodeBlock>,
    );

    const button = screen.getByRole('button', { name: 'Copy code' });

    // Act
    await user.click(button);

    // Assert - Text stays "Copy" (no UI shift from text change)
    await waitFor(() => {
      expect(button).toHaveTextContent('Copy');
    });

    // Assert - aria-label changes to "Copied" for accessibility
    expect(button).toHaveAttribute('aria-label', 'Copied');

    // Assert - Checkmark icon replaces copy icon
    expect(
      button.querySelector('[data-testid="check-icon"]'),
    ).toBeInTheDocument();
    expect(
      button.querySelector('[data-testid="copy-icon"]'),
    ).not.toBeInTheDocument();
  });

  it('[copy] should reset icon and aria-label after 1500ms', async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <CodeBlock>
        <code>test code</code>
      </CodeBlock>,
    );

    const button = screen.getByRole('button', { name: 'Copy code' });

    // Act - Click and wait for feedback
    await user.click(button);
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Copied');
    });

    // Act - Advance time past feedback duration
    await vi.advanceTimersByTimeAsync(1500);

    // Assert - Reset to original state
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Copy code');
      expect(
        button.querySelector('[data-testid="copy-icon"]'),
      ).toBeInTheDocument();
      expect(
        button.querySelector('[data-testid="check-icon"]'),
      ).not.toBeInTheDocument();
    });
  });

  it('[copy] should not change button state when code is empty', async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <CodeBlock>
        <code></code>
      </CodeBlock>,
    );

    const button = screen.getByRole('button', { name: 'Copy code' });

    // Act
    await user.click(button);

    // Assert - Button should remain in default state (no feedback for empty code)
    expect(button).toHaveTextContent('Copy');
    expect(button).toHaveAttribute('aria-label', 'Copy code');
    expect(
      button.querySelector('[data-testid="copy-icon"]'),
    ).toBeInTheDocument();
  });

  // ==========================================================================
  // [a11y] Accessibility
  // ==========================================================================

  it('[a11y] should have proper aria-label for screen readers', () => {
    // Arrange & Act
    render(
      <CodeBlock>
        <code>const x = 1;</code>
      </CodeBlock>,
    );

    const button = screen.getByRole('button', { name: 'Copy code' });

    // Assert
    expect(button).toHaveAttribute('aria-label', 'Copy code');
  });
});
