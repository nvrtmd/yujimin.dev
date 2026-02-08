import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import { TOC } from './TOC';

// =============================================================================
// Tests
// =============================================================================

describe('TOC', () => {
  const createMockHeadings = () => {
    const proseDiv = document.createElement('div');
    proseDiv.className = 'prose';

    const h2 = document.createElement('h2');
    h2.id = 'introduction';
    h2.innerText = 'Introduction';

    proseDiv.appendChild(h2);
    document.body.appendChild(proseDiv);

    return proseDiv;
  };

  it('[empty] should return null when no headings exist', () => {
    // Arrange & Act
    const { container } = render(<TOC />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  describe('With Headings', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = createMockHeadings();
    });

    afterEach(() => {
      document.body.removeChild(mockElement);
    });

    it('[link] should generate correct href for heading', () => {
      // Arrange & Act
      render(<TOC />);

      // Assert
      const link = screen.getByText('Introduction').closest('a');
      expect(link).toHaveAttribute('href', '#introduction');
    });

    it('[fallback] should use href="#" when heading has no id', () => {
      // Arrange
      document.body.removeChild(mockElement);

      const proseDiv = document.createElement('div');
      proseDiv.className = 'prose';
      const h2 = document.createElement('h2');
      h2.innerText = 'No ID Heading';
      proseDiv.appendChild(h2);
      document.body.appendChild(proseDiv);

      // Act
      render(<TOC />);

      // Assert
      const link = screen.getByText('No ID Heading').closest('a');
      expect(link).toHaveAttribute('href', '#');

      // Cleanup
      document.body.removeChild(proseDiv);
      mockElement = createMockHeadings();
    });
  });
});
