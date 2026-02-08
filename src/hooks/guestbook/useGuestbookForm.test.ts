import { renderHook, act, waitFor } from '@/__tests__/utils/test-utils';
import { useGuestbookForm } from './useGuestbookForm';
import type { GuestbookForm } from '@/models';

describe('useGuestbookForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[init] should expose form API with correct initial state', () => {
    const { result } = renderHook(() => useGuestbookForm(mockOnSubmit));

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.reset).toBeDefined();
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('[submit] should call onSubmit with valid data', async () => {
    const { result } = renderHook(() => useGuestbookForm(mockOnSubmit));

    const validData: GuestbookForm = {
      nickname: 'TestUser',
      location: 'Seoul',
      website: 'https://example.com',
      message: 'Hello, World!',
    };

    await act(async () => {
      result.current.reset(validData);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(validData, undefined);
  });

  it('[submit] should prevent submission with invalid data', async () => {
    const { result } = renderHook(() => useGuestbookForm(mockOnSubmit));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.errors.nickname).toBeDefined();
    });
  });

  it('[validation] should validate required fields', async () => {
    const { result } = renderHook(() => useGuestbookForm(mockOnSubmit));

    // Empty nickname
    await act(async () => {
      result.current.reset({
        nickname: '',
        location: '',
        website: '',
        message: 'test',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.errors.nickname).toBeDefined();
    });

    // Whitespace-only nickname (trim validation)
    await act(async () => {
      result.current.reset({
        nickname: '   ',
        location: '',
        website: '',
        message: 'test',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.errors.nickname).toBeDefined();
    });

    // Empty message
    await act(async () => {
      result.current.reset({
        nickname: 'test',
        location: '',
        website: '',
        message: '',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.errors.message).toBeDefined();
    });
  });

  it('[validation] should validate optional URL format', async () => {
    const { result } = renderHook(() => useGuestbookForm(mockOnSubmit));

    // Invalid URL should error
    await act(async () => {
      result.current.reset({
        nickname: 'test',
        location: '',
        website: 'not-a-url',
        message: 'test',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.errors.website).toBeDefined();
    });

    // Empty URL should be allowed
    mockOnSubmit.mockClear();
    await act(async () => {
      result.current.reset({
        nickname: 'test',
        location: '',
        website: '',
        message: 'test',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
    expect(result.current.errors.website).toBeUndefined();
  });

  it('[reset] should clear errors after reset with valid values', async () => {
    const { result } = renderHook(() => useGuestbookForm(mockOnSubmit));

    // Trigger errors
    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.errors.nickname).toBeDefined();
    });

    // Reset with valid values
    await act(async () => {
      result.current.reset({
        nickname: 'Valid',
        location: '',
        website: '',
        message: 'Valid',
      });
    });

    await waitFor(() => {
      expect(result.current.errors).toEqual({});
    });
  });
});
