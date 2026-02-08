import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { GuestbookForm } from './GuestbookForm';

vi.mock('@/libs/parseWithZod', () => ({
  parseWithZod: vi.fn((data) => {
    if (data.success === true) return data;
    if (data.success === false) return data;
    throw new Error('Invalid response format');
  }),
}));

global.fetch = vi.fn();

const mockSuccessResponse = {
  success: true as const,
  data: {
    id: 1,
    createdAt: '2024-01-01T00:00:00Z',
    nickname: 'testuser',
    location: null,
    website: null,
    message: 'Hello!',
  },
};

function mockFetchSuccess(): void {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    json: () => Promise.resolve(mockSuccessResponse),
  });
}

function mockFetchError(errorMessage: string): void {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    json: () => Promise.resolve({ success: false, error: errorMessage }),
  });
}

function mockFetchNetworkError(): void {
  (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
    new Error('Network error'),
  );
}

function getNicknameInput(): HTMLInputElement {
  return screen.getByPlaceholderText('yuza') as HTMLInputElement;
}

function getMessageInput(): HTMLTextAreaElement {
  return screen.getByRole('textbox', {
    name: /message/i,
  }) as HTMLTextAreaElement;
}

function getSubmitButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: /submit/i }) as HTMLButtonElement;
}

describe('GuestbookForm Integration', () => {
  const mockRefreshEntries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Success/Error Branching', () => {
    it('[success] should call refreshEntries and reset form on successful submission', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetchSuccess();
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);
      const nicknameInput = getNicknameInput();
      const messageInput = getMessageInput();

      // Act
      await user.type(nicknameInput, 'testuser');
      await user.type(messageInput, 'Hello!');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(mockRefreshEntries).toHaveBeenCalledTimes(1);
        expect(nicknameInput.value).toBe('');
        expect(messageInput.value).toBe('');
      });
    });

    it('[error] should show error message and preserve form data on API error', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetchError('Database connection failed');
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);
      const nicknameInput = getNicknameInput();
      const messageInput = getMessageInput();

      // Act
      await user.type(nicknameInput, 'testuser');
      await user.type(messageInput, 'Hello!');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/Database connection failed/),
        ).toBeInTheDocument();
        expect(mockRefreshEntries).not.toHaveBeenCalled();
        expect(nicknameInput.value).toBe('testuser');
        expect(messageInput.value).toBe('Hello!');
      });
    });

    it('[error] should show network error message on fetch failure', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetchNetworkError();
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Act
      await user.type(getNicknameInput(), 'testuser');
      await user.type(getMessageInput(), 'Hello!');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('An unexpected network error occurred.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Client Validation', () => {
    it('[validation] should show error and skip API call when nickname is empty', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Act
      await user.type(getMessageInput(), 'Hello!');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/nickname requires at least 1 character/i),
        ).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('[validation] should show error and skip API call when message is empty', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Act
      await user.type(getNicknameInput(), 'testuser');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/message requires at least 1 character/i),
        ).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('[validation] should show error when nickname exceeds 50 characters', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);
      const longNickname = 'a'.repeat(51);

      // Act
      await user.type(getNicknameInput(), longNickname);
      await user.type(getMessageInput(), 'Hello!');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/nickname must be less than 50 characters/i),
        ).toBeInTheDocument();
      });
    });

    it('[validation] should succeed when optional fields (website, location) are empty', async () => {
      // Arrange
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockFetchSuccess();
      render(<GuestbookForm refreshEntries={mockRefreshEntries} />);

      // Act
      await user.type(getNicknameInput(), 'testuser');
      await user.type(getMessageInput(), 'Hello!');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(
          screen.getByText('Message added successfully!'),
        ).toBeInTheDocument();
      });
    });
  });
});
