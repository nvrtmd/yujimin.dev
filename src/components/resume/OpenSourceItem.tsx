import { LinkIcon } from '@/components/icons/resume';
import { parseResumeUrl } from '@/libs/resume/parseResumeUrl';
import type { OpenSourceNode } from './types';
import { RESUME_CONFIG } from './resumeAppConfig';

export const OpenSourceItem: React.FC<{ node: OpenSourceNode }> = ({
  node,
}) => {
  const { title, content } = node;
  const { project_info, links, period } = title;

  return (
    <div className='mb-10 last:mb-0 group'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-baseline mb-2'>
        <h3 className='text-lg font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors'>
          {project_info}
        </h3>
        <span className='text-sm text-zinc-500 font-mono mt-1 md:mt-0 shrink-0'>
          {period}
        </span>
      </div>

      {links && (
        <div className='mb-3 flex flex-wrap gap-3'>
          {links.split(RESUME_CONFIG.LINK_SEPARATOR).map((url, idx) => {
            const cleanUrl = url.trim();
            const { hostname, pathname } = parseResumeUrl(cleanUrl);

            return (
              <a
                key={idx}
                href={cleanUrl}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center text-xs font-medium text-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/5 px-2 py-1 rounded hover:bg-[var(--color-accent-blue)]/10 transition-colors'
              >
                <LinkIcon />
                {hostname}
                {pathname}
              </a>
            );
          })}
        </div>
      )}

      {content.length > 0 && (
        <ul className='list-disc pl-5 space-y-2 text-zinc-700 leading-relaxed text-[0.95rem] marker:text-zinc-300'>
          {content.map((d, i) => (
            <li key={i} className='pl-1'>
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
