import { Metadata } from 'next';
import { getPostList, getAllCategories } from '@/libs/posts';
import { BlogApp } from '@/components/blog/BlogApp';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Technical blog posts by Yuji Min',
  openGraph: {
    title: 'Blog | yujimin.dev',
    description: 'Technical blog posts by Yuji Min',
    images: ['/images/ogImages/default_og_img.jpg'],
  },
};

export default async function BlogPage() {
  const posts = getPostList();
  const categories = getAllCategories();

  return <BlogApp posts={posts} initialCategories={categories} />;
}
