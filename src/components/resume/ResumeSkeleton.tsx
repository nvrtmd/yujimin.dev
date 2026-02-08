export const ResumeSkeleton = () => (
  <div
    className='w-full max-w-3xl mx-auto p-6 sm:p-12 animate-pulse'
    data-testid='resume-skeleton'
  >
    <div className='flex justify-between items-start mb-4'>
      <div className='h-12 bg-zinc-200 rounded w-1/3'></div>
      <div className='h-8 bg-zinc-200 rounded w-8'></div>
    </div>
    <div className='h-5 bg-zinc-200 rounded w-1/4 mb-4'></div>
    <div className='flex gap-4 mb-12'>
      <div className='h-4 bg-zinc-200 rounded w-20'></div>
      <div className='h-4 bg-zinc-200 rounded w-20'></div>
    </div>
    <div className='space-y-8'>
      <div className='h-32 bg-zinc-50 rounded'></div>
      <div className='h-6 bg-zinc-200 rounded w-1/6'></div>
      <div className='space-y-2'>
        <div className='h-4 bg-zinc-100 rounded w-full'></div>
        <div className='h-4 bg-zinc-100 rounded w-5/6'></div>
      </div>
    </div>
  </div>
);
