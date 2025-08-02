'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (token === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      // Set both cookie and localStorage
      document.cookie = `adminToken=${token}; path=/; max-age=86400; samesite=lax`;
      localStorage.setItem('adminToken', token);
      router.push('/admin');
      router.refresh(); // Force a refresh to update the navigation state
    } else {
      setError('Invalid token');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center'>
      {/* Login Card */}
      <div className='w-full max-w-md mx-4'>
        <div className='bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8 sm:p-10'>
          <div className='text-center mb-8'>
            <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>
              Admin Portal
            </h1>
            <p className='text-gray-400 text-sm'>
              Enter your admin token to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label
                htmlFor='token'
                className='block text-sm font-medium text-gray-300 mb-3'
              >
                Admin Token
              </label>
              <input
                type='password'
                id='token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
                placeholder='Enter admin token'
                required
              />
            </div>

            {error && (
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3'>
                <p className='text-red-400 text-sm text-center'>{error}</p>
              </div>
            )}

            <button
              type='submit'
              className='w-full py-3 px-6 bg-white hover:bg-gray-100 text-black rounded-lg font-semibold transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20 shadow-lg'
            >
              Access Admin Portal
            </button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-gray-500 text-xs'>Authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
