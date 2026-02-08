import { renderHook, act } from '@testing-library/react';
import { usePostSelection } from './usePostSelection';

describe('usePostSelection', () => {
  it('[init] should start with no selection', () => {
    // Arrange & Act
    const { result } = renderHook(() => usePostSelection());

    // Assert
    expect(result.current.selectedSlug).toBeNull();
  });

  it('[select] should select a post when selectPost is called', () => {
    // Arrange
    const { result } = renderHook(() => usePostSelection());

    // Act
    act(() => {
      result.current.selectPost('test-slug');
    });

    // Assert
    expect(result.current.selectedSlug).toBe('test-slug');
  });

  it('[clear] should clear selection when clearSelection is called', () => {
    // Arrange
    const { result } = renderHook(() => usePostSelection());

    // Act - Select first
    act(() => {
      result.current.selectPost('test-slug');
    });
    expect(result.current.selectedSlug).toBe('test-slug');

    // Act - Clear
    act(() => {
      result.current.clearSelection();
    });

    // Assert
    expect(result.current.selectedSlug).toBeNull();
  });

  it('[select] should switch selection to different post', () => {
    // Arrange
    const { result } = renderHook(() => usePostSelection());

    // Act - Select first post
    act(() => {
      result.current.selectPost('slug-a');
    });
    expect(result.current.selectedSlug).toBe('slug-a');

    // Act - Select second post
    act(() => {
      result.current.selectPost('slug-b');
    });

    // Assert
    expect(result.current.selectedSlug).toBe('slug-b');
  });

  it('[stability] should have stable function references across re-renders', () => {
    // Arrange
    const { result, rerender } = renderHook(() => usePostSelection());

    // Act
    const firstSelectRef = result.current.selectPost;
    const firstClearRef = result.current.clearSelection;

    rerender();

    // Assert
    expect(result.current.selectPost).toBe(firstSelectRef);
    expect(result.current.clearSelection).toBe(firstClearRef);
  });
});
