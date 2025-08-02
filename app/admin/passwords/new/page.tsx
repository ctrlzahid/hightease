'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Creator {
  _id: string;
  name: string;
  slug: string;
}

export default function NewPassword() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [formData, setFormData] = useState({
    creatorId: '',
    type: 'multi-use',
    expiresAt: '',
    maxUsages: '',
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch creators list
    fetch('/api/creators')
      .then((res) => res.json())
      .then((data) => setCreators(data))
      .catch((err) => console.error('Error fetching creators:', err));
  }, []);

  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const password = generateRandomPassword();
    const payload = {
      ...formData,
      password,
      maxUsages: formData.maxUsages ? parseInt(formData.maxUsages) : undefined,
      expiresAt: formData.expiresAt
        ? new Date(formData.expiresAt).toISOString()
        : undefined,
    };

    try {
      const res = await fetch('/api/passwords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create password');
      }

      setGeneratedPassword(password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-8'>
        Generate Access Password
      </h1>

      <form
        onSubmit={handleSubmit}
        className='max-w-2xl bg-white shadow rounded-lg p-6'
      >
        <div className='space-y-6'>
          {/* Creator Selection */}
          <div>
            <label
              htmlFor='creatorId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Creator
            </label>
            <select
              id='creatorId'
              value={formData.creatorId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, creatorId: e.target.value }))
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            >
              <option value=''>Select a creator</option>
              {creators.map((creator) => (
                <option key={creator._id} value={creator._id}>
                  {creator.name}
                </option>
              ))}
            </select>
          </div>

          {/* Password Type */}
          <div>
            <label
              htmlFor='type'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Password Type
            </label>
            <select
              id='type'
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='single-use'>Single Use</option>
              <option value='multi-use'>Multi Use</option>
            </select>
          </div>

          {/* Expiration Date */}
          <div>
            <label
              htmlFor='expiresAt'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Expiration Date (Optional)
            </label>
            <input
              type='datetime-local'
              id='expiresAt'
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))
              }
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Max Usages (for multi-use) */}
          {formData.type === 'multi-use' && (
            <div>
              <label
                htmlFor='maxUsages'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Maximum Uses (Optional)
              </label>
              <input
                type='number'
                id='maxUsages'
                value={formData.maxUsages}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxUsages: e.target.value,
                  }))
                }
                min='1'
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Leave empty for unlimited uses'
              />
            </div>
          )}

          {error && <div className='text-red-500 text-sm'>{error}</div>}

          {generatedPassword && (
            <div className='p-4 bg-green-50 border border-green-200 rounded-md'>
              <h3 className='text-sm font-medium text-green-800 mb-2'>
                Generated Password:
              </h3>
              <div className='font-mono text-lg bg-white p-2 rounded border border-green-200'>
                {generatedPassword}
              </div>
              <p className='text-sm text-green-600 mt-2'>
                Make sure to copy this password now. You won't be able to see it
                again.
              </p>
            </div>
          )}

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
              {isLoading ? 'Generating...' : 'Generate Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
