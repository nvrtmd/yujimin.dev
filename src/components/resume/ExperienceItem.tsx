import type { ExperienceNode } from './types';

export const ExperienceItem: React.FC<{ node: ExperienceNode }> = ({
  node,
}) => {
  const { title, content } = node;
  const { role, company, period } = title;

  return (
    <div className='mb-10 last:mb-0 group'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-baseline mb-2'>
        <div className='flex flex-col md:flex-row md:items-baseline gap-x-2'>
          <h3 className='text-lg font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors'>
            {role}
          </h3>
          <span className='text-zinc-600 font-medium md:before:content-["@"] md:before:mr-1'>
            {company}
          </span>
        </div>
        <span className='text-sm text-zinc-500 font-mono mt-1 md:mt-0 shrink-0'>
          {period}
        </span>
      </div>

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
