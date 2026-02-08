import { validateResumeData } from './validateResumeData';

const validData = {
  Skills: [{ key: 'Frontend', value: ['React'] }],
  Experience: [
    {
      title: { role: 'Engineer', company: 'Corp', period: '2024' },
      content: [],
    },
  ],
  'Open Source': [],
  'Leadership & Community': [],
  Education: [{ degree_info: 'B.S.', institution: 'Uni' }],
  pdfUrl: 'https://example.com/resume.pdf',
};

describe('validateResumeData', () => {
  // ========================================================================
  // Valid data
  // ========================================================================

  it('should not throw for valid resume data', () => {
    expect(() => validateResumeData(validData)).not.toThrow();
  });

  // ========================================================================
  // Missing / invalid data
  // ========================================================================

  it('should throw when data is null', () => {
    expect(() => validateResumeData(null)).toThrow(
      'Invalid API response: missing data',
    );
  });

  it('should throw when data is undefined', () => {
    expect(() => validateResumeData(undefined)).toThrow(
      'Invalid API response: missing data',
    );
  });

  it('should throw when data is a string', () => {
    expect(() => validateResumeData('not-an-object')).toThrow(
      'Invalid API response: missing data',
    );
  });

  it('should throw when data is a number', () => {
    expect(() => validateResumeData(42)).toThrow(
      'Invalid API response: missing data',
    );
  });

  // ========================================================================
  // Missing required sections
  // ========================================================================

  it('should throw when Skills section is missing', () => {
    const { Skills: _Skills, ...rest } = validData;
    expect(() => validateResumeData(rest)).toThrow(
      'Invalid API response: missing Skills section',
    );
  });

  it('should throw when Experience section is missing', () => {
    const { Experience: _Experience, ...rest } = validData;
    expect(() => validateResumeData(rest)).toThrow(
      'Invalid API response: missing Experience section',
    );
  });

  it('should throw when Open Source section is missing', () => {
    const { 'Open Source': _, ...rest } = validData;
    expect(() => validateResumeData(rest)).toThrow(
      'Invalid API response: missing Open Source section',
    );
  });

  it('should throw when Leadership & Community section is missing', () => {
    const { 'Leadership & Community': _, ...rest } = validData;
    expect(() => validateResumeData(rest)).toThrow(
      'Invalid API response: missing Leadership & Community section',
    );
  });

  it('should throw when Education section is missing', () => {
    const { Education: _Education, ...rest } = validData;
    expect(() => validateResumeData(rest)).toThrow(
      'Invalid API response: missing Education section',
    );
  });

  // ========================================================================
  // Missing / invalid pdfUrl
  // ========================================================================

  it('should throw when pdfUrl is missing', () => {
    const { pdfUrl: _pdfUrl, ...rest } = validData;
    expect(() => validateResumeData(rest)).toThrow(
      'Invalid API response: missing pdfUrl',
    );
  });

  it('should throw when pdfUrl is empty string', () => {
    expect(() => validateResumeData({ ...validData, pdfUrl: '' })).toThrow(
      'Invalid API response: missing pdfUrl',
    );
  });

  it('should throw when pdfUrl is a number', () => {
    expect(() => validateResumeData({ ...validData, pdfUrl: 123 })).toThrow(
      'Invalid API response: missing pdfUrl',
    );
  });

  it('should throw when pdfUrl is null', () => {
    expect(() => validateResumeData({ ...validData, pdfUrl: null })).toThrow(
      'Invalid API response: missing pdfUrl',
    );
  });
});
