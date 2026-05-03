import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mdx } from '@/components/mdx';
import { formatPostDate, getPostBySlug, getPostList } from '@/libs';

const CONTAINER_MAX_WIDTH = 'max-w-3xl';
const AUTHOR_NAME = 'Yuji Min';

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = getPostList('en');

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog.post' });

  const post = getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  return (
    <div className='h-full w-full bg-white overflow-y-auto font-sans text-black'>
      <div
        className={`${CONTAINER_MAX_WIDTH} mx-auto px-6 py-8 sm:px-10 sm:py-12`}
      >
        <div className='border-b-2 border-black pb-4 mb-8 select-text'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-4 font-sans leading-tight'>
            {post.title}
          </h1>
          <div className='flex justify-between items-end text-sm text-gray-600 font-sans'>
            <span className='font-bold text-black'>
              {t('authorPrefix')} {AUTHOR_NAME}
            </span>
            <span>{formatPostDate(post.date)}</span>
          </div>
        </div>

        <div className='min-h-[20rem] select-text'>
          <Mdx code={post.body} />
        </div>

        <div className='mt-16 pt-8 border-t border-dotted border-gray-400 text-center text-sm font-sans text-gray-500 select-none'>
          {t('endOfDocument')}
        </div>
      </div>
    </div>
  );
}
