import Image from 'next/image';

export function ActivityApp() {
  return (
    <div className='p-8 text-center'>
      <Image
        src='/images/profile.png'
        alt='Profile Picture'
        width={128}
        height={128}
        className='rounded-full mx-auto mb-4 border-2 border-gray-300'
      />
      <h1 className='text-3xl font-bold'>Yuji Min</h1>
      <p className='text-lg text-gray-600 mt-2'>Frontend Developer</p>
      <p className='mt-6 max-w-md mx-auto'>
        Hello! Welcome to my blog.
        <br />
        This is a space to share technology and experiences.
      </p>
    </div>
  );
}
