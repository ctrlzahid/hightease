'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PasswordFormProps {
  creatorId: string;
}

export default function PasswordForm({ creatorId }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/passwords/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error('Invalid password');
      }

      // Refresh the page to show content
      router.refresh();
    } catch (err) {
      setError('Invalid password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-md mx-auto bg-gray-900 rounded-lg p-6'>
      <h2 className='text-xl font-semibold mb-4'>Enter Password</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Password
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter your access password'
            required
          />
        </div>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <button
          type='submit'
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Validating...' : 'Access Content'}
        </button>
      </form>
    </div>
  );
}
