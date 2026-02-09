import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostList, getPostBySlug, formatPostDate } from '@/libs';
import { Mdx } from '@/components/mdx';

const CONTAINER_MAX_WIDTH = 'max-w-3xl';
const AUTHOR_NAME = 'Yuji Min';
const END_OF_DOCUMENT_TEXT = '*** End of Document ***';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = getPostList();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  const postUrl = `https://yujimin.dev/blog/${slug}`;
  const ogImage = '/images/og-image.png';

  return {
    title: post.title,
    description: post.summary,
    authors: [{ name: AUTHOR_NAME }],
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [AUTHOR_NAME],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

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
            <span className='font-bold text-black'>by {AUTHOR_NAME}</span>
            <span>{formatPostDate(post.date)}</span>
          </div>
        </div>

        <div className='min-h-[20rem] select-text'>
          <Mdx code={post.body} />
        </div>

        <div className='mt-16 pt-8 border-t border-dotted border-gray-400 text-center text-sm font-sans text-gray-500 select-none'>
          {END_OF_DOCUMENT_TEXT}
        </div>
      </div>
    </div>
  );
}
