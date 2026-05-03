import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAllCategories, getPostList } from '@/libs/posts';
import { BlogApp } from '@/components/blog/BlogApp';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: ['/images/ogImages/default_og_img.jpg'],
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const posts = getPostList(locale);
  const categories = getAllCategories(locale);

  return <BlogApp posts={posts} initialCategories={categories} />;
}
