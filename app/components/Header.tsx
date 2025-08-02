'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className='sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800'>
      <div className='container mx-auto px-2 sm:px-4'>
        <div className='flex items-center justify-between h-12 sm:h-14'>
          {/* Left spacer for balance */}
          <div className='w-8 sm:w-10'></div>

          {/* Center Logo */}
          <Link href='/' className='hover:opacity-80 transition-opacity'>
            <img
              src='/hightease.svg'
              alt='HighTease'
              className='h-8 sm:h-10 w-auto'
            />
          </Link>

          {/* Right Admin Icon */}
          <Link
            href='/admin/login'
            className='p-2 hover:bg-gray-800 rounded-lg transition-colors'
            title='Admin Login'
          >
            <svg
              className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-white transition-colors'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
