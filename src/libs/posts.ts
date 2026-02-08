import { blogPosts } from '#site/content';

export function getPostList() {
  return [...blogPosts]
    .map(({ body: _body, ...post }) => post)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllCategories() {
  return Array.from(new Set(blogPosts.map((post) => post.category)));
}
