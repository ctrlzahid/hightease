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
      document.cookie = `adminToken=${token}; path=/; max-age=86400; secure; samesite=strict`;
      localStorage.setItem('adminToken', token);
      router.push('/admin');
      router.refresh(); // Force a refresh to update the navigation state
    } else {
      setError('Invalid token');
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Admin Login</h1>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='token'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Admin Token
            </label>
            <input
              type='password'
              id='token'
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter admin token'
              required
            />
          </div>
          {error && <p className='text-red-500 text-sm'>{error}</p>}
          <button
            type='submit'
            className='w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
