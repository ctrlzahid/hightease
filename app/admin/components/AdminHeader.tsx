'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any admin session data
    document.cookie =
      'admin-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  return (
    <header className='sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800'>
      <div className='container mx-auto px-2 sm:px-4'>
        <div className='flex items-center justify-between h-12 sm:h-14'>
          {/* Left - Logo */}
          <Link href='/admin' className='hover:opacity-80 transition-opacity'>
            <img
              src='/hightease.svg'
              alt='HighTease Admin'
              className='h-8 sm:h-10 w-auto'
            />
          </Link>

          {/* Right - Logout */}
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            <span className='hidden sm:inline'>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
