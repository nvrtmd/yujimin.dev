'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const PROFILE_IMAGE_SIZE = 180;
const ICON_SIZE = 20;

interface ContactLink {
  href?: string;
  icon: string;
  alt: string;
  text: string;
}

export function AboutApp() {
  const t = useTranslations('about');
  const contactLinks: ContactLink[] = [
    {
      icon: '/images/icons/mail-logo.svg',
      alt: t('emailAlt'),
      text: 'yuji.min.dev@gmail.com',
    },
    {
      href: 'https://github.com/nvrtmd',
      icon: '/images/icons/github-logo.svg',
      alt: t('githubAlt'),
      text: 'https://github.com/nvrtmd',
    },
    {
      href: 'https://www.linkedin.com/in/yujimin/',
      icon: '/images/icons/linkedin-logo.svg',
      alt: t('linkedinAlt'),
      text: 'https://www.linkedin.com/in/yujimin/',
    },
  ];

  return (
    <div className='w-full h-full overflow-y-auto bg-black'>
      <div className='flex flex-col min-h-full text-[var(--color-terminal-text)] p-6 gap-8'>
        <div className='flex flex-col sm:flex-row items-end gap-6 sm:gap-4'>
          <div className='order-1 sm:order-2 shrink-0'>
            <Image
              src='/images/profile_img.webp'
              alt={t('profileAlt')}
              width={PROFILE_IMAGE_SIZE}
              height={PROFILE_IMAGE_SIZE}
            />
          </div>

          <div className='flex flex-col w-full order-2 sm:order-1 gap-3'>
            <h2 className='text-3xl font-bold underline decoration-2 underline-offset-4'>
              {t('heading')}
            </h2>
            <div className='space-y-2 text-lg leading-relaxed opacity-90'>
              <p className='font-bold text-xl'>{t('greeting')}</p>
              <p>{t('bio1')}</p>
              <p>{t('bio2')}</p>
            </div>
          </div>
        </div>

        <div className='grid gap-3 border-2 border-[var(--color-terminal-border)] p-4 bg-[var(--color-terminal-bg)] sm:bg-transparent'>
          <h3 className='text-xl font-bold underline decoration-dotted underline-offset-4 mb-1'>
            {t('linksHeading')}
          </h3>
          <div className='grid gap-3 text-base sm:text-lg'>
            {contactLinks.map((link) => {
              const content = (
                <>
                  <Image
                    src={link.icon}
                    alt={link.alt}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                  />
                  <span className='break-all'>{link.text}</span>
                </>
              );

              if (link.href) {
                return (
                  <a
                    key={link.alt}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-3 hover:text-white hover:underline transition-all'
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div
                  key={link.alt}
                  className='flex items-center gap-3 transition-opacity'
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
