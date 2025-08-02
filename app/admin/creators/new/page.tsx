'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/utils/slug';

interface CreatorFormData {
  name: string;
  slug: string;
  bio: string;
}

export default function NewCreator() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatorFormData>({
    name: '',
    slug: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save creator');
      }

      router.push('/admin/creators');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save creator. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-8'>Add New Creator</h1>

      <form
        onSubmit={handleSubmit}
        className='max-w-2xl bg-white shadow rounded-lg p-6'
      >
        <div className='space-y-6'>
          {/* Name Field */}
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Name
            </label>
            <input
              type='text'
              id='name'
              value={formData.name}
              onChange={handleNameChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter creator name'
              required
            />
          </div>

          {/* Slug Field */}
          <div>
            <label
              htmlFor='slug'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              URL Slug
            </label>
            <input
              type='text'
              id='slug'
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter URL slug'
              required
            />
            <p className='mt-1 text-sm text-gray-500'>
              This will be used in the URL: /creators/[slug]
            </p>
          </div>

          {/* Bio Field */}
          <div>
            <label
              htmlFor='bio'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Bio
            </label>
            <textarea
              id='bio'
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={4}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter creator bio (optional)'
            />
          </div>

          {error && <div className='text-red-500 text-sm'>{error}</div>}

          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={() => router.back()}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Save Creator'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
