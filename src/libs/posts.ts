import { enBlogPosts, koBlogPosts } from '#site/content';

function getLocalizedPosts(locale: string) {
  if (locale === 'ko') {
    const koMap = new Map(koBlogPosts.map((p) => [p.slug, p]));
    return enBlogPosts.map((p) => koMap.get(p.slug) ?? p);
  }
  return enBlogPosts;
}

export function getPostList(locale: string) {
  return getLocalizedPosts(locale)
    .map(({ body: _body, ...post }) => post)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale: string) {
  return getLocalizedPosts(locale).find((p) => p.slug === slug);
}

export function getAllCategories(locale: string) {
  return Array.from(
    new Set(getLocalizedPosts(locale).map((p) => p.category)),
  ) as string[];
}
