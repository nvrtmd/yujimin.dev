import { getPostList, getPostBySlug, getAllCategories } from './posts';

describe('getPostList', () => {
  it('[return] should return posts without body, sorted by date descending', () => {
    // Arrange & Act
    const posts = getPostList('en');

    // Assert - First post structure and value
    expect(posts).toHaveLength(3);
    expect(posts[0]).toMatchObject({
      slug: 'test-post-2',
      title: 'Test Post 2',
      date: '2024-01-20T00:00:00.000Z',
    });
    expect(posts[0]).not.toHaveProperty('body');

    // Assert - All posts sorted by date descending and body removed
    for (let i = 0; i < posts.length - 1; i++) {
      const currentDate = new Date(posts[i].date).getTime();
      const nextDate = new Date(posts[i + 1].date).getTime();
      expect(currentDate).toBeGreaterThanOrEqual(nextDate);
      expect(posts[i + 1]).not.toHaveProperty('body');
    }
  });
});

describe('getPostBySlug', () => {
  it('[found] should return post with all fields including body', () => {
    // Arrange & Act
    const post = getPostBySlug('test-post-2', 'en');

    // Assert
    expect(post).toMatchObject({
      slug: 'test-post-2',
      title: 'Test Post 2',
      date: '2024-01-20T00:00:00.000Z',
      summary: 'Test summary 2',
      category: 'life',
      thumbnail: '/images/test.jpg',
      body: '<p>Test content 2</p>',
    });
  });

  it('[not-found] should return undefined for non-existent slug', () => {
    // Arrange & Act & Assert
    expect(getPostBySlug('non-existent-slug', 'en')).toBeUndefined();
  });
});

describe('getAllCategories', () => {
  it('[return] should return unique categories from all posts', () => {
    // Arrange & Act
    const categories = getAllCategories('en');

    // Assert
    expect(categories).toHaveLength(2);
    expect(categories).toContain('tech');
    expect(categories).toContain('life');
    expect(new Set(categories).size).toBe(categories.length);
  });
});
