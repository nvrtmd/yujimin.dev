const REQUIRED_SECTIONS = [
  'Skills',
  'Experience',
  'Open Source',
  'Leadership & Community',
  'Education',
] as const;

// Throws if the API response is missing required sections or pdfUrl
export function validateResumeData(data: unknown): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response: missing data');
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!(section in data)) {
      throw new Error(`Invalid API response: missing ${section} section`);
    }
  }

  const resume = data as Record<string, unknown>;
  if (!resume.pdfUrl || typeof resume.pdfUrl !== 'string') {
    throw new Error('Invalid API response: missing pdfUrl');
  }
}
