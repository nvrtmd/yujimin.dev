import { render, screen, fireEvent, act } from '@/__tests__/utils/test-utils';
import { GuestbookForm } from './GuestbookForm';

const mockRegister = vi.fn((name: string) => ({
  name,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}));

const mockHandleSubmit = vi.fn();
const mockReset = vi.fn();

let mockErrors: Record<string, { message?: string }> = {};
let mockIsSubmitting = false;

vi.mock('@/hooks/guestbook/useGuestbookForm', () => ({
  useGuestbookForm: vi.fn((onSubmit) => {
    mockHandleSubmit.mockImplementation((e) => {
      e?.preventDefault?.();
      return onSubmit({
        nickname: 'testuser',
        location: 'Seoul',
        website: 'https://example.com',
        message: 'Hello!',
      });
    });

    return {
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      reset: mockReset,
      errors: mockErrors,
      isSubmitting: mockIsSubmitting,
    };
  }),
}));

global.fetch = vi.fn();

function mockFetchSuccess(): void {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          id: 1,
          createdAt: '2024-01-01T00:00:00Z',
          nickname: 'testuser',
          location: null,
          website: null,
          message: 'Hello!',
        },
      }),
  });
}

function mockFetchError(errorMessage: string): void {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    json: () => Promise.resolve({ success: false, error: errorMessage }),
  });
}

function getSubmitButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: /submit/i }) as HTMLButtonElement;
}

function getFormElement(): HTMLFormElement {
  return getSubmitButton().closest('form') as HTMLFormElement;
}

describe('GuestbookForm', () => {
  const mockRefreshEntries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockErrors = {};
    mockIsSubmitting = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Submit Button State', () => {
    it('[submit] should disable button when isSubmitting is true', () => {
      // Arrange
      mockIsSubmitting = false;
      const { rerender } = render(
        <GuestbookForm refreshEntries={mockRefreshEntries} />,
      );
      const button = getSubmitButton();

      // Assert - initial state
      expect(button).toHaveTextContent('Submit');
      expect(button).not.toBeDisabled();

      // Act - change to submitting state
      mockIsSubmitting = true;
      rerender(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Assert - submitting state
      const submittingButton = screen.getByRole('button');
      expect(submittingButton).toBeDisabled();
    });
  });

  describe('Message Auto-Hide Timer', () => {
    it('[timer] should hide success message after 3 seconds', async () => {
      // Arrange
      mockFetchSuccess();
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Act - submit form
      await act(async () => {
        fireEvent.submit(getFormElement());
      });

      // Assert - success message visible
      expect(screen.getByTestId('submit-result-success')).toBeInTheDocument();
      expect(screen.getByTestId('submit-result-success')).toHaveTextContent(
        'Message added successfully!',
      );

      // Act - advance timer
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Assert - success message hidden
      expect(
        screen.queryByTestId('submit-result-success'),
      ).not.toBeInTheDocument();
    });

    it('[timer] should hide error message after 3 seconds', async () => {
      // Arrange
      mockFetchError('Validation failed');
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Act - submit form
      await act(async () => {
        fireEvent.submit(getFormElement());
      });

      // Assert - error message visible
      expect(screen.getByTestId('submit-result-error')).toBeInTheDocument();
      expect(screen.getByTestId('submit-result-error')).toHaveTextContent(
        /Validation failed/,
      );

      // Act - advance timer
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Assert - error message hidden
      expect(
        screen.queryByTestId('submit-result-error'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Validation Error Display', () => {
    it('[validation] should display field errors from errors object', () => {
      // Arrange
      mockErrors = {
        nickname: { message: 'Nickname is required' },
        message: { message: 'Message is required' },
      };

      // Act
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Assert
      expect(screen.getByText('Nickname is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });
});
