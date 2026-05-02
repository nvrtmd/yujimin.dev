'use client';

import { useEffect, useState } from 'react';
import type { ResumeData } from '@/app/api/resume/schema';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/models/api';
import { CONTACT_INFO } from '@/config/personal';
import { DownloadIcon } from '@/components/icons/resume';
import { RESUME_CONFIG } from './resumeAppConfig';
import { SectionTitle } from './SectionTitle';
import { ExperienceItem } from './ExperienceItem';
import { OpenSourceItem } from './OpenSourceItem';
import { LeadershipItem } from './LeadershipItem';
import { ResumeSkeleton } from './ResumeSkeleton';
import { validateResumeData } from '@/libs/resume/validateResumeData';

type ResumeApiResponse = ApiSuccessResponse<ResumeData> | ApiErrorResponse;

const { FETCH_CACHE_OPTION } = RESUME_CONFIG;
const TEXT = {
  DOWNLOAD_PDF: 'Download PDF',
  SKILLS: 'Technical Skills',
  EXPERIENCE: 'Experience',
  OPEN_SOURCE: 'Open Source',
  LEADERSHIP: 'Leadership & Community',
  EDUCATION: 'Education',
  ERROR_HEADER: 'Error loading resume',
  NO_DATA: 'No experience data.',
  ERROR_FALLBACK: 'Failed to load',
  ERROR_UNKNOWN: 'Unknown error',
} as const;

export function ResumeApp() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch('/api/resume', { cache: FETCH_CACHE_OPTION });
        const json: ResumeApiResponse = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(
            ('error' in json ? json.error : null) ?? TEXT.ERROR_FALLBACK,
          );
        }

        validateResumeData(json.data);

        setData(json.data);
        setError(null);
      } catch (e) {
        setError((e as Error).message || TEXT.ERROR_UNKNOWN);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, []);

  if (isLoading)
    return (
      <div className='w-full h-full overflow-y-auto bg-white'>
        <ResumeSkeleton />
      </div>
    );

  if (error) {
    return (
      <div className='w-full h-full overflow-y-auto bg-white flex items-center justify-center'>
        <div className='p-6 bg-red-50 text-red-700 rounded-lg border border-red-100 max-w-md text-center'>
          <p className='font-bold mb-2'>{TEXT.ERROR_HEADER}</p>
          <p className='text-sm opacity-80'>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    Skills: skills,
    Experience: experience,
    'Open Source': openSource,
    'Leadership & Community': leadership,
    Education: education,
    pdfUrl,
  } = data;

  return (
    <div className='w-full h-full overflow-y-auto bg-white'>
      <article className='w-full max-w-3xl mx-auto p-6 sm:p-12 sm:pt-20 text-left font-sans text-zinc-900 bg-white min-h-screen selection:bg-zinc-200 relative'>
        <header className='mb-12'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-2'>
                Yuji Min
              </h1>
              <p className='text-lg md:text-xl text-zinc-500 font-medium mb-6'>
                Software Engineer
              </p>
            </div>

            {pdfUrl && (
              <a
                href={pdfUrl}
                className='p-2 rounded-full text-zinc-400 hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/5 transition-all'
                aria-label={TEXT.DOWNLOAD_PDF}
                title={TEXT.DOWNLOAD_PDF}
              >
                <DownloadIcon />
              </a>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-sm mb-8'>
            {CONTACT_INFO.map((info, index) => {
              return (
                <div key={info.label} className='flex items-center'>
                  {'href' in info ? (
                    <a
                      href={info.href}
                      target='_blank'
                      rel='noreferrer'
                      className='text-zinc-600 font-medium transition-colors hover:text-[var(--color-accent-blue)] border-b border-transparent hover:border-[var(--color-accent-blue)]'
                    >
                      {info.label}
                    </a>
                  ) : (
                    <span className='text-zinc-600 font-medium cursor-text'>
                      {info.label}
                    </span>
                  )}

                  {index < CONTACT_INFO.length - 1 && (
                    <span className='ml-3 text-zinc-300 select-none'>|</span>
                  )}
                </div>
              );
            })}
          </div>
        </header>

        <section>
          <SectionTitle title={TEXT.SKILLS} />
          <div className='grid grid-cols-1 gap-y-4 mb-4'>
            {skills.map((group, i) => (
              <div
                key={i}
                className='flex flex-col sm:flex-row sm:items-start gap-2'
              >
                <h4 className='text-sm font-semibold text-zinc-900 sm:w-48 sm:shrink-0 pt-1'>
                  {group.key}
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {group.value.map((tech, idx) => (
                    <span
                      key={idx}
                      className='px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded text-sm border border-zinc-200/50'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title={TEXT.EXPERIENCE} />
          {experience.length > 0 ? (
            experience.map((node, i) => <ExperienceItem key={i} node={node} />)
          ) : (
            <p className='text-zinc-400 italic'>{TEXT.NO_DATA}</p>
          )}
        </section>

        {openSource.length > 0 && (
          <section>
            <SectionTitle title={TEXT.OPEN_SOURCE} />
            {openSource.map((node, i) => (
              <OpenSourceItem key={i} node={node} />
            ))}
          </section>
        )}

        {leadership.length > 0 && (
          <section>
            <SectionTitle title={TEXT.LEADERSHIP} />
            {leadership.map((node, i) => (
              <LeadershipItem key={i} node={node} />
            ))}
          </section>
        )}

        <section className='pb-12'>
          <SectionTitle title={TEXT.EDUCATION} />
          <div className='space-y-4'>
            {education.map((e, i) => (
              <div key={i}>
                <h3 className='font-bold text-zinc-900 text-base'>
                  {e.degree_info}
                </h3>
                <p className='text-zinc-600 text-sm mt-1'>{e.institution}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
