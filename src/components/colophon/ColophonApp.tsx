import Image from 'next/image';

const ICON_SIZE = 18;

const REPO_URL = 'https://github.com/nvrtmd/yujimin.dev';

interface Feature {
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    title: 'Draggable Windows',
    description:
      'Drag, resize, minimize, and maximize — just like a real desktop.',
  },
  {
    title: 'Blog',
    description:
      'Folder-style navigation with list/gallery views and syntax-highlighted code.',
  },
  {
    title: 'Guestbook',
    description: 'Leave a message and browse what others have written.',
  },
  {
    title: 'Resume',
    description:
      'Live resume fetched from Google Docs, cached for instant loading.',
  },
  {
    title: 'Analytics',
    description:
      'Real-time site stats including page views and visitor countries.',
  },
];

interface TechItem {
  label: string;
  value: string;
}

const TECH_STACK: TechItem[] = [
  { label: 'Framework', value: 'Next.js 15 (React 19)' },
  { label: 'Styling', value: 'Tailwind CSS v4' },
  { label: 'Content', value: 'MDX via Velite' },
  { label: 'Database', value: 'Cloudflare D1 (SQLite)' },
  { label: 'Hosting', value: 'Cloudflare Workers' },
];

export function ColophonApp() {
  return (
    <div className='w-full h-full overflow-y-auto bg-white'>
      <div className='flex flex-col min-h-full text-black p-6 gap-10'>
        <section className='space-y-2'>
          <h2 className='text-2xl font-bold'>Colophon</h2>
          <p className='text-base leading-relaxed text-gray-700'>
            Welcome to <strong className='text-black'>yujimin.dev</strong>. Step
            into a retro virtual desktop where my work lives in draggable
            windows — a playful mix of classic interface and modern tech.
          </p>
        </section>

        <hr className='border-gray-200' />

        <a
          href={REPO_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 text-base text-gray-700 hover:text-black hover:underline transition-colors'
        >
          <Image
            src='/images/icons/github-logo-black.svg'
            alt='GitHub'
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
          <span className='break-all'>{REPO_URL}</span>
        </a>

        <hr className='border-gray-200' />

        <section className='space-y-3'>
          <h3 className='text-lg font-bold'>What&apos;s Inside</h3>
          <ul className='grid gap-2 text-base'>
            {FEATURES.map((feature) => (
              <li key={feature.title} className='leading-relaxed'>
                <span className='font-semibold'>{feature.title}</span>
                <span className='text-gray-600'> — {feature.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className='border-gray-200' />

        <section className='space-y-3'>
          <h3 className='text-lg font-bold'>Built With</h3>
          <dl className='grid gap-1.5 text-base'>
            {TECH_STACK.map((item) => (
              <div key={item.label} className='flex gap-2'>
                <dt className='font-semibold shrink-0'>{item.label}:</dt>
                <dd className='text-gray-600'>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
