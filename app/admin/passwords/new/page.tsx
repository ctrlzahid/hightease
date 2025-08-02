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
  const [magicLink, setMagicLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'password' | 'link' | null>(null);

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

  const copyToClipboard = async (
    e: React.MouseEvent,
    text: string,
    type: 'password' | 'link'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
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

      // Generate magic link
      const selectedCreator = creators.find(
        (c) => c._id === formData.creatorId
      );
      if (selectedCreator) {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const magicLink = `${baseUrl}/creators/${selectedCreator.slug}?token=${password}`;
        setMagicLink(magicLink);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold text-white mb-2'>
          Generate Access Password
        </h1>
        <p className='text-gray-400'>
          Create a new access password for creator content
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className='bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-xl p-8 border border-gray-700'
      >
        <div className='space-y-6'>
          {/* Creator Selection */}
          <div>
            <label
              htmlFor='creatorId'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Creator <span className='text-red-400'>*</span>
            </label>
            <select
              id='creatorId'
              value={formData.creatorId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, creatorId: e.target.value }))
              }
              className='w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Password Type
            </label>
            <select
              id='type'
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className='w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='single-use'>Single Use</option>
              <option value='multi-use'>Multi Use</option>
            </select>
          </div>

          {/* Expiration Date */}
          <div>
            <label
              htmlFor='expiresAt'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Expiration Date
            </label>
            <input
              type='datetime-local'
              id='expiresAt'
              value={formData.expiresAt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))
              }
              className='w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <p className='mt-1 text-sm text-gray-500'>
              Leave empty for passwords that never expire
            </p>
          </div>

          {/* Max Usages (for multi-use) */}
          {formData.type === 'multi-use' && (
            <div>
              <label
                htmlFor='maxUsages'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Maximum Uses
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
                className='w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Leave empty for unlimited uses'
              />
            </div>
          )}

          {error && (
            <div className='bg-red-900/50 border border-red-600 text-red-300 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}

          {generatedPassword && (
            <div className='bg-green-900/50 border border-green-600 rounded-lg p-4 space-y-4'>
              {/* Generated Password */}
              <div>
                <h3 className='text-sm font-medium text-green-300 mb-3'>
                  Generated Password:
                </h3>
                <div className='flex gap-2'>
                  <div className='flex-1 font-mono text-lg bg-gray-800 text-white p-3 rounded border border-gray-600 break-all'>
                    {generatedPassword}
                  </div>
                  <button
                    type='button'
                    onClick={(e) =>
                      copyToClipboard(e, generatedPassword, 'password')
                    }
                    className='px-3 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors'
                  >
                    {copied === 'password' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {/* Magic Link */}
              {magicLink && (
                <div>
                  <h3 className='text-sm font-medium text-green-300 mb-3'>
                    Magic Link:
                  </h3>
                  <div className='flex gap-2'>
                    <div className='flex-1 font-mono text-sm bg-gray-800 text-white p-3 rounded border border-gray-600 break-all'>
                      {magicLink}
                    </div>
                    <button
                      type='button'
                      onClick={(e) => copyToClipboard(e, magicLink, 'link')}
                      className='px-3 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors'
                    >
                      {copied === 'link' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              )}

              <p className='text-sm text-green-400'>
                Make sure to copy these now. You won't be able to see them
                again.
              </p>
            </div>
          )}

          <div className='flex flex-col sm:flex-row gap-4 pt-6'>
            <button
              type='button'
              onClick={() => router.back()}
              className='flex-1 px-6 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Generating...' : 'Generate Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
