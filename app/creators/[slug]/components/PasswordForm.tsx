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
    <div className='max-w-md mx-auto bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-6'>
      <div className='text-center mb-6'>
        <div className='space-y-2 text-sm text-gray-300'>
          <p>
            🔥{' '}
            <span className='text-purple-300 font-medium'>
              Exclusive Content
            </span>{' '}
            awaits...
          </p>
          <p>💋 Private photos & videos</p>
          <p>✨ Behind-the-scenes moments</p>
          <p>
            🎭{' '}
            <span className='text-pink-300 font-medium'>Naughty surprises</span>{' '}
            inside
          </p>
        </div>
      </div>

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
            className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
            placeholder='Enter your access password'
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
          disabled={isLoading}
          className='w-full px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
        >
          {isLoading ? 'Validating...' : '🔥 Access Exclusive Content'}
        </button>
      </form>
    </div>
  );
}
