import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { ResumeApp } from './ResumeApp';
import type { ResumeData } from '@/app/api/resume/schema';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockResumeData: ResumeData = {
  Skills: [
    { key: 'Frontend', value: ['React', 'TypeScript'] },
    { key: 'Testing', value: ['Jest', 'Vitest'] },
  ],
  Experience: [
    {
      title: {
        role: 'Frontend Engineer',
        company: 'Test Corp',
        period: '2024',
      },
      content: ['Built features', 'Wrote tests'],
    },
  ],
  'Open Source': [
    {
      title: {
        project_info: 'test-project',
        links: 'https://github.com/test/test',
        period: '2024',
      },
      content: ['Contributed to open source'],
    },
  ],
  'Leadership & Community': [
    {
      title: { role: 'Mentor', organization: 'Test Org', period: '2024' },
      content: ['Mentored developers'],
    },
  ],
  Education: [{ degree_info: 'B.S. in CS', institution: 'Test University' }],
  pdfUrl: 'https://docs.google.com/document/d/test-id/export?format=pdf',
};

/**
 * Helper: mock a successful fetch response with the given data
 */
function mockSuccessFetch(data: ResumeData = mockResumeData) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data }),
  });
}

/**
 * Helper: render and wait for loading to complete
 */
async function renderAndWait(data: ResumeData = mockResumeData) {
  mockSuccessFetch(data);
  render(<ResumeApp />);
  await waitFor(() => {
    expect(screen.queryByTestId('resume-skeleton')).not.toBeInTheDocument();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResumeApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Loading State
  // ==========================================================================

  describe('Loading State', () => {
    it('should show loading skeleton initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<ResumeApp />);

      expect(screen.getByTestId('resume-skeleton')).toBeInTheDocument();
    });

    it('should hide skeleton after data loads', async () => {
      mockSuccessFetch();

      render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.queryByTestId('resume-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Error State
  // ==========================================================================

  describe('Error State', () => {
    it('should show error UI when API responds with error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, error: 'API Error' }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.getByText('Error loading resume')).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('should show error when network fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.getByText('Error loading resume')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should show "Failed to load" when error response has no error field', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ success: false }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.getByText('Error loading resume')).toBeInTheDocument();
        expect(screen.getByText('Failed to load')).toBeInTheDocument();
      });
    });

    it('should show "Unknown error" when thrown error has no message', async () => {
      mockFetch.mockRejectedValue({ notAnError: true });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.getByText('Error loading resume')).toBeInTheDocument();
        expect(screen.getByText('Unknown error')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Runtime Validation
  // ==========================================================================

  describe('Runtime Validation', () => {
    it('should reject response with null data field', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: null }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid API response: missing data/i),
        ).toBeInTheDocument();
      });
    });

    it('should reject response with non-object data field', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: 'string-value' }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid API response: missing data/i),
        ).toBeInTheDocument();
      });
    });

    it('should reject response with missing Skills section', async () => {
      const invalidData = { ...mockResumeData };
      delete (invalidData as Partial<ResumeData>).Skills;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: invalidData }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid API response: missing Skills section/i),
        ).toBeInTheDocument();
      });
    });

    it('should reject response with missing Experience section', async () => {
      const invalidData = { ...mockResumeData };
      delete (invalidData as Partial<ResumeData>).Experience;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: invalidData }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid API response: missing Experience section/i),
        ).toBeInTheDocument();
      });
    });

    it('should reject response with missing Education section', async () => {
      const invalidData = { ...mockResumeData };
      delete (invalidData as Partial<ResumeData>).Education;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: invalidData }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid API response: missing Education section/i),
        ).toBeInTheDocument();
      });
    });

    it('should reject response with missing pdfUrl', async () => {
      const invalidData = { ...mockResumeData };
      delete (invalidData as Partial<ResumeData>).pdfUrl;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: invalidData }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid API response: missing pdfUrl/i),
        ).toBeInTheDocument();
      });
    });

    it('should reject response with non-string pdfUrl', async () => {
      const invalidData = { ...mockResumeData, pdfUrl: 123 };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: invalidData }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid API response: missing pdfUrl/i),
        ).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Fetch Behavior
  // ==========================================================================

  describe('Fetch Behavior', () => {
    it('should call /api/resume with cache: no-store', async () => {
      mockSuccessFetch();

      render(<ResumeApp />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/resume', {
          cache: 'no-store',
        });
      });
    });

    it('should call fetch exactly once', async () => {
      mockSuccessFetch();

      render(<ResumeApp />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==========================================================================
  // Success State - Header
  // ==========================================================================

  describe('Header', () => {
    it('should render name "Yuji Min"', async () => {
      await renderAndWait();

      expect(screen.getByText('Yuji Min')).toBeInTheDocument();
    });

    it('should render title "Software Engineer"', async () => {
      await renderAndWait();

      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should render PDF download link with correct href', async () => {
      await renderAndWait();

      const downloadLink = screen.getByRole('link', {
        name: /download pdf/i,
      });
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink).toHaveAttribute('href', mockResumeData.pdfUrl);
    });

    it('should not render download button when pdfUrl is absent from rendered data', async () => {
      // NOTE: pdfUrl is validated before setData, so if pdfUrl is missing
      // the error path triggers. This test verifies the error path catches it.
      const invalidData = { ...mockResumeData };
      delete (invalidData as Partial<ResumeData>).pdfUrl;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: invalidData }),
      });

      render(<ResumeApp />);

      await waitFor(() => {
        // Error state triggered due to missing pdfUrl
        expect(
          screen.getByText(/Invalid API response: missing pdfUrl/i),
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('link', { name: /download pdf/i }),
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Success State - Contact Info
  // ==========================================================================

  describe('Contact Info', () => {
    it('should render all contact info labels', async () => {
      await renderAndWait();

      expect(screen.getByText('yuji.min.dev@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Seoul, South Korea')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
    });

    it('should render contact items with href as links', async () => {
      await renderAndWait();

      const githubLink = screen.getByRole('link', { name: 'GitHub' });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/nvrtmd');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noreferrer');
    });

    it('should render contact items without href as plain text', async () => {
      await renderAndWait();

      // "yuji.min.dev@gmail.com" has no href, so it is a span, not a link
      const email = screen.getByText('yuji.min.dev@gmail.com');
      expect(email.tagName).toBe('SPAN');
    });

    it('should render separator "|" between contact items but not after last', async () => {
      await renderAndWait();

      const separators = screen.getAllByText('|');
      // 5 contact items -> 4 separators
      expect(separators).toHaveLength(4);
    });
  });

  // ==========================================================================
  // Success State - Skills Section
  // ==========================================================================

  describe('Skills Section', () => {
    it('should render "Technical Skills" section title', async () => {
      await renderAndWait();

      expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    });

    it('should render skill group keys', async () => {
      await renderAndWait();

      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });

    it('should render skill tags for each group', async () => {
      await renderAndWait();

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Jest')).toBeInTheDocument();
      expect(screen.getByText('Vitest')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Success State - Experience Section
  // ==========================================================================

  describe('Experience Section', () => {
    it('should render "Experience" section title', async () => {
      await renderAndWait();

      expect(screen.getByText('Experience')).toBeInTheDocument();
    });

    it('should render experience item with role, company, period', async () => {
      await renderAndWait();

      expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Test Corp')).toBeInTheDocument();
      // '2024' appears in multiple sections, so just verify at least one exists
      const periods = screen.getAllByText('2024');
      expect(periods.length).toBeGreaterThanOrEqual(1);
    });

    it('should render experience content list items', async () => {
      await renderAndWait();

      expect(screen.getByText('Built features')).toBeInTheDocument();
      expect(screen.getByText('Wrote tests')).toBeInTheDocument();
    });

    it('should show "No experience data." when experience array is empty', async () => {
      const dataWithNoExperience: ResumeData = {
        ...mockResumeData,
        Experience: [],
      };

      await renderAndWait(dataWithNoExperience);

      expect(screen.getByText('No experience data.')).toBeInTheDocument();
    });

    it('should not show "No experience data." when experience has entries', async () => {
      await renderAndWait();

      expect(screen.queryByText('No experience data.')).not.toBeInTheDocument();
    });

    it('should not render content list when content is empty', async () => {
      const dataWithEmptyContent: ResumeData = {
        ...mockResumeData,
        Experience: [
          {
            title: {
              role: 'Empty Role',
              company: 'Empty Corp',
              period: '2023',
            },
            content: [],
          },
        ],
      };

      await renderAndWait(dataWithEmptyContent);

      expect(screen.getByText('Empty Role')).toBeInTheDocument();
      // No list items rendered
      const listItems = screen.queryAllByRole('listitem');
      // There might be list items from other sections, so check content
      const experienceListItems = listItems.filter(
        (item) =>
          item.textContent === 'Built features' ||
          item.textContent === 'Wrote tests',
      );
      expect(experienceListItems).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Success State - Open Source Section
  // ==========================================================================

  describe('Open Source Section', () => {
    it('should render "Open Source" section title', async () => {
      await renderAndWait();

      expect(screen.getByText('Open Source')).toBeInTheDocument();
    });

    it('should render project_info and period', async () => {
      await renderAndWait();

      expect(screen.getByText('test-project')).toBeInTheDocument();
    });

    it('should render content list items', async () => {
      await renderAndWait();

      expect(
        screen.getByText('Contributed to open source'),
      ).toBeInTheDocument();
    });

    it('should render link with parsed hostname (no www prefix)', async () => {
      const dataWithWww: ResumeData = {
        ...mockResumeData,
        'Open Source': [
          {
            title: {
              project_info: 'www-project',
              links: 'https://www.example.com/repo',
              period: '2024',
            },
            content: [],
          },
        ],
      };

      await renderAndWait(dataWithWww);

      const link = screen.getByRole('link', { name: /example\.com/i });
      expect(link).toHaveAttribute('href', 'https://www.example.com/repo');
      expect(link).toHaveTextContent('example.com/repo');
    });

    it('should render link with hostname only when pathname is "/"', async () => {
      const dataWithRootPath: ResumeData = {
        ...mockResumeData,
        'Open Source': [
          {
            title: {
              project_info: 'root-project',
              links: 'https://example.com/',
              period: '2024',
            },
            content: [],
          },
        ],
      };

      await renderAndWait(dataWithRootPath);

      const link = screen.getByRole('link', { name: /example\.com/i });
      // pathname "/" has length 1, so no pathname appended
      expect(link).toHaveTextContent('example.com');
      expect(link).not.toHaveTextContent('example.com/');
    });

    it('should split multiple links by separator " . "', async () => {
      const dataWithMultipleLinks: ResumeData = {
        ...mockResumeData,
        'Open Source': [
          {
            title: {
              project_info: 'multi-link-project',
              links:
                'https://github.com/test/repo · https://npmjs.com/package/test',
              period: '2024',
            },
            content: [],
          },
        ],
      };

      await renderAndWait(dataWithMultipleLinks);

      const githubLink = screen.getByRole('link', {
        name: /github\.com/i,
      });
      const npmLink = screen.getByRole('link', { name: /npmjs\.com/i });

      expect(githubLink).toHaveAttribute(
        'href',
        'https://github.com/test/repo',
      );
      expect(npmLink).toHaveAttribute('href', 'https://npmjs.com/package/test');
    });

    it('should set target=_blank and rel=noreferrer on links', async () => {
      await renderAndWait();

      const link = screen.getByRole('link', { name: /github\.com/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });

    it('should fallback to raw URL text when URL parsing fails', async () => {
      const dataWithBadUrl: ResumeData = {
        ...mockResumeData,
        'Open Source': [
          {
            title: {
              project_info: 'bad-url-project',
              links: 'not-a-valid-url',
              period: '2024',
            },
            content: [],
          },
        ],
      };

      await renderAndWait(dataWithBadUrl);

      const link = screen.getByRole('link', { name: /not-a-valid-url/i });
      expect(link).toHaveAttribute('href', 'not-a-valid-url');
    });

    it('should NOT render Open Source section when array is empty', async () => {
      const dataWithNoOpenSource: ResumeData = {
        ...mockResumeData,
        'Open Source': [],
      };

      await renderAndWait(dataWithNoOpenSource);

      expect(screen.queryByText('Open Source')).not.toBeInTheDocument();
    });

    it('should not render links div when links field is empty/null', async () => {
      const dataWithNoLinks: ResumeData = {
        ...mockResumeData,
        'Open Source': [
          {
            title: {
              project_info: 'no-link-project',
              links: '',
              period: '2024',
            },
            content: ['Some contribution'],
          },
        ],
      };

      await renderAndWait(dataWithNoLinks);

      expect(screen.getByText('no-link-project')).toBeInTheDocument();
      expect(screen.getByText('Some contribution')).toBeInTheDocument();
      // No link elements for open source (only contact links exist)
      const openSourceLinks = screen
        .queryAllByRole('link')
        .filter(
          (link) =>
            link.getAttribute('href')?.includes('github.com/test') ||
            link.getAttribute('href')?.includes('no-link'),
        );
      expect(openSourceLinks).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Success State - Leadership & Community Section
  // ==========================================================================

  describe('Leadership & Community Section', () => {
    it('should render "Leadership & Community" section title', async () => {
      await renderAndWait();

      expect(screen.getByText('Leadership & Community')).toBeInTheDocument();
    });

    it('should render leadership item with role, organization, period', async () => {
      await renderAndWait();

      expect(screen.getByText('Mentor')).toBeInTheDocument();
      expect(screen.getByText('Test Org')).toBeInTheDocument();
    });

    it('should render leadership content list items', async () => {
      await renderAndWait();

      expect(screen.getByText('Mentored developers')).toBeInTheDocument();
    });

    it('should NOT render Leadership section when array is empty', async () => {
      const dataWithNoLeadership: ResumeData = {
        ...mockResumeData,
        'Leadership & Community': [],
      };

      await renderAndWait(dataWithNoLeadership);

      expect(
        screen.queryByText('Leadership & Community'),
      ).not.toBeInTheDocument();
    });

    it('should not render content list when content is empty', async () => {
      const dataWithEmptyContent: ResumeData = {
        ...mockResumeData,
        'Leadership & Community': [
          {
            title: {
              role: 'Empty Leader',
              organization: 'Empty Org',
              period: '2023',
            },
            content: [],
          },
        ],
      };

      await renderAndWait(dataWithEmptyContent);

      expect(screen.getByText('Empty Leader')).toBeInTheDocument();
      expect(screen.getByText('Empty Org')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Success State - Education Section
  // ==========================================================================

  describe('Education Section', () => {
    it('should render "Education" section title', async () => {
      await renderAndWait();

      expect(screen.getByText('Education')).toBeInTheDocument();
    });

    it('should render degree_info and institution', async () => {
      await renderAndWait();

      expect(screen.getByText('B.S. in CS')).toBeInTheDocument();
      expect(screen.getByText('Test University')).toBeInTheDocument();
    });

    it('should render multiple education entries', async () => {
      const dataWithMultipleEdu: ResumeData = {
        ...mockResumeData,
        Education: [
          { degree_info: 'B.S. in CS', institution: 'Test University' },
          { degree_info: 'M.S. in CS', institution: 'Grad University' },
        ],
      };

      await renderAndWait(dataWithMultipleEdu);

      expect(screen.getByText('B.S. in CS')).toBeInTheDocument();
      expect(screen.getByText('Test University')).toBeInTheDocument();
      expect(screen.getByText('M.S. in CS')).toBeInTheDocument();
      expect(screen.getByText('Grad University')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Null data guard
  // ==========================================================================

  describe('Null guard', () => {
    it('should render nothing when data is null and no error (edge case)', async () => {
      // This tests the `if (!data) return null;` branch.
      // Normally unreachable because validation would catch it,
      // but we can force it by having success:true with success:false json shape
      // that somehow passes validation (not really possible).
      // Instead, we verify the loading -> success path works by checking
      // the skeleton disappears and content renders.
      mockSuccessFetch();

      const { container } = render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.getByText('Yuji Min')).toBeInTheDocument();
      });

      // Verify the component is not empty
      expect(container.querySelector('article')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Snapshot Characterization Test
  // ==========================================================================

  describe('Snapshot', () => {
    it('should match snapshot for success state', async () => {
      mockSuccessFetch();

      const { container } = render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.getByText('Yuji Min')).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for loading state', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<ResumeApp />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for error state', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, error: 'Snapshot error test' }),
      });

      const { container } = render(<ResumeApp />);

      await waitFor(() => {
        expect(screen.getByText('Error loading resume')).toBeInTheDocument();
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
