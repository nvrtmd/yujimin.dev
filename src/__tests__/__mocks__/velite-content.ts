// Mock data for #site/content (Velite-generated content)
// Schema matches velite.config.ts: slug, title, date, summary, category, thumbnail?, body
export const blogPosts = [
  {
    slug: 'test-post-1',
    title: 'Test Post 1',
    date: '2024-01-15T00:00:00.000Z',
    summary: 'Test summary 1',
    category: 'tech',
    body: '<p>Test content 1</p>',
  },
  {
    slug: 'test-post-2',
    title: 'Test Post 2',
    date: '2024-01-20T00:00:00.000Z',
    summary: 'Test summary 2',
    category: 'life',
    thumbnail: '/images/test.jpg',
    body: '<p>Test content 2</p>',
  },
  {
    slug: 'draft-post',
    title: 'Draft Post',
    date: '2024-01-10T00:00:00.000Z',
    summary: 'Draft summary',
    category: 'tech',
    body: '<p>Draft content</p>',
  },
];
