'use client';

import { useState } from 'react';

interface Creator {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
}

interface CreatorHeaderProps {
  creator: Creator;
  isAdmin?: boolean;
}

export default function CreatorHeader({
  creator,
  isAdmin = false,
}: CreatorHeaderProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !isAdmin) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`/api/creators/${creator.slug}/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload avatar');
      }

      // Refresh the page to show new avatar
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='flex flex-col items-center text-center mb-8 pb-8 border-b border-gray-800'>
      {/* Avatar Section */}
      <div className='relative mb-4'>
        <div className='w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center'>
          {creator.avatar && !avatarError ? (
            <img
              src={creator.avatar}
              alt={creator.name}
              className='w-full h-full object-cover'
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className='text-3xl font-bold text-gray-300'>
              {getInitials(creator.name)}
            </span>
          )}
        </div>

        {isAdmin && (
          <div className='absolute -bottom-2 -right-2'>
            <input
              type='file'
              id='avatar-upload'
              accept='image/*'
              onChange={handleAvatarUpload}
              className='hidden'
            />
            <label
              htmlFor='avatar-upload'
              className={`bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer inline-flex items-center justify-center transition-colors
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
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
                    d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              )}
            </label>
          </div>
        )}
      </div>

      {/* Creator Info */}
      <h1 className='text-3xl font-bold mb-2'>{creator.name}</h1>
      {creator.bio && (
        <p className='text-gray-300 max-w-2xl leading-relaxed'>{creator.bio}</p>
      )}
    </div>
  );
}
