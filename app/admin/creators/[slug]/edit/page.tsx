'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/utils/slug';

interface CreatorFormData {
  name: string;
  slug: string;
  bio: string;
  avatar?: string;
}

export default function EditCreator({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [formData, setFormData] = useState<CreatorFormData>({
    name: '',
    slug: '',
    bio: '',
    avatar: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    // Fetch creator data
    fetch(`/api/creators/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name,
          slug: data.slug,
          bio: data.bio || '',
          avatar: data.avatar || '',
        });
        setAvatarPreview(data.avatar || '');
        setIsInitialLoad(false);
      })
      .catch((err) => {
        console.error('Error fetching creator:', err);
        setError('Failed to load creator data');
        setIsInitialLoad(false);
      });
  }, [slug]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file for avatar');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await fetch(`/api/creators/${slug}/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await res.json();
      return data.avatar;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Upload avatar if there's a new one
      if (avatarFile) {
        await uploadAvatar();
      }

      const res = await fetch(`/api/creators/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          bio: formData.bio,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update creator');
      }

      router.push('/admin/creators');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update creator');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoad) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-8'>Edit Creator</h1>

      <form
        onSubmit={handleSubmit}
        className='max-w-2xl bg-white shadow rounded-lg p-6'
      >
        <div className='space-y-6'>
          {/* Avatar Field */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Avatar
            </label>
            <div className='flex items-center space-x-4'>
              <div className='w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center'>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-500">
                    {formData.name ? getInitials(formData.name) : '??'}
                  </span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer inline-block"
                >
                  Change Avatar
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
