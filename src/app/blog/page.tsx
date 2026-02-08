import { getPostList, getAllCategories } from '@/libs/posts';
import { BlogApp } from '@/components/blog/BlogApp';

export default async function BlogPage() {
  const posts = getPostList();
  const categories = getAllCategories();

  return <BlogApp posts={posts} initialCategories={categories} />;
}
