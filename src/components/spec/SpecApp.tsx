'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const ICON_SIZE = 18;

const REPO_URL = 'https://github.com/nvrtmd/yujimin.dev';

export function SpecApp() {
  const t = useTranslations('spec');
  const features = [
    {
      title: t('features.windows.title'),
      description: t('features.windows.description'),
    },
    {
      title: t('features.blog.title'),
      description: t('features.blog.description'),
    },
    {
      title: t('features.guestbook.title'),
      description: t('features.guestbook.description'),
    },
    {
      title: t('features.resume.title'),
      description: t('features.resume.description'),
    },
    {
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
    },
  ] as const;

  const techStack = [
    { label: t('tech.framework.label'), value: t('tech.framework.value') },
    { label: t('tech.styling.label'), value: t('tech.styling.value') },
    { label: t('tech.content.label'), value: t('tech.content.value') },
    { label: t('tech.database.label'), value: t('tech.database.value') },
    { label: t('tech.hosting.label'), value: t('tech.hosting.value') },
  ] as const;

  return (
    <div className='w-full h-full overflow-y-auto bg-white'>
      <div className='flex flex-col min-h-full text-black p-6 gap-10'>
        <div className='flex flex-col sm:flex-row items-end gap-6 sm:gap-4'>
          <div className='order-1 sm:order-2 shrink-0'>
            <Image
              src='/images/icons/computer_img.webp'
              alt={t('computerAlt')}
              width={120}
              height={120}
            />
          </div>

          <section className='space-y-2 order-2 sm:order-1 w-full'>
            <h2 className='text-2xl font-bold'>{t('heading')}</h2>
            <p className='text-base leading-relaxed text-gray-700'>
              {t('intro')}
            </p>
          </section>
        </div>

        <hr className='border-gray-200' />

        <section className='space-y-3'>
          <h3 className='text-lg font-bold bg-gray-50 px-3 py-1 -mx-3 border-l-3 border-gray-400'>
            {t('repositoryHeading')}
          </h3>
          <a
            href={REPO_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 text-base text-gray-700 hover:text-black hover:underline transition-colors'
          >
            <Image
              src='/images/icons/github-logo-black.svg'
              alt={t('repositoryAlt')}
              width={ICON_SIZE}
              height={ICON_SIZE}
            />
            <span className='break-all'>{REPO_URL}</span>
          </a>
        </section>

        <hr className='border-gray-200' />

        <section className='space-y-3'>
          <h3 className='text-lg font-bold bg-gray-50 px-3 py-1 -mx-3 border-l-3 border-gray-400'>
            {t('whatsInsideHeading')}
          </h3>
          <ul className='grid gap-2 text-base'>
            {features.map((feature) => (
              <li key={feature.title} className='leading-relaxed'>
                <span className='font-semibold'>{feature.title}</span>
                <span className='text-gray-600'> — {feature.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className='border-gray-200' />

        <section className='space-y-3'>
          <h3 className='text-lg font-bold bg-gray-50 px-3 py-1 -mx-3 border-l-3 border-gray-400'>
            {t('builtWithHeading')}
          </h3>
          <dl className='grid gap-1.5 text-base'>
            {techStack.map((item) => (
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
