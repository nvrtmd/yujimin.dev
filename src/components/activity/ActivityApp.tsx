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
        안녕하세요! 제 블로그에 오신 것을 환영합니다.
        <br />이 곳은 기술과 경험을 공유하는 공간입니다.
      </p>
    </div>
  );
}
