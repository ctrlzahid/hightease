'use client';

import { useState, useRef } from 'react';

interface CreatorFormData {
  name: string;
  slug: string;
  bio: string;
  age: number | null;
  gender: 'male' | 'female' | 'other';
  location: string;
}

interface CreatorFormProps {
  mode: 'add' | 'edit';
  initialData?: Partial<CreatorFormData> & { avatar?: string };
  onSubmit: (data: CreatorFormData, avatarFile?: File) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export default function CreatorForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
}: CreatorFormProps) {
  const [formData, setFormData] = useState<CreatorFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    bio: initialData?.bio || '',
    age: initialData?.age || null,
    gender: initialData?.gender || 'female',
    location: initialData?.location || '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar || null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof CreatorFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          avatar: 'Please select a valid image file',
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: 'File size must be less than 5MB',
        }));
        return;
      }

      setAvatarFile(file);
      setErrors((prev) => ({ ...prev, avatar: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        'URL slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.age && (formData.age < 13 || formData.age > 100)) {
      newErrors.age = 'Age must be between 13 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData, avatarFile || undefined);
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-xl'>
        <div className='bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-white mb-6 text-center'>
            {mode === 'add' ? 'Add New Creator' : 'Edit Creator'}
          </h1>

          {error && (
            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4'>
              <p className='text-red-400 text-sm text-center'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Avatar Section */}
            <div className='flex flex-col items-center gap-4'>
              <div className='relative'>
                <div className='w-20 h-20 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-600'>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt='Avatar preview'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-400'>
                      <svg
                        className='w-6 h-6'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type='button'
                    onClick={removeAvatar}
                    className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
                  >
                    <svg
                      className='w-3 h-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className='text-center'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='px-3 py-1.5 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm'
                >
                  {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                </button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  className='hidden'
                />
                <p className='text-gray-400 text-xs mt-2'>
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                {errors.avatar && (
                  <p className='text-red-400 text-xs mt-1'>{errors.avatar}</p>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1.5'>
                Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                placeholder='Enter creator name'
              />
              {errors.name && (
                <p className='text-red-400 text-xs mt-1'>{errors.name}</p>
              )}
            </div>

            {/* URL Slug */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1.5'>
                URL Slug *
              </label>
              <input
                type='text'
                value={formData.slug}
                onChange={(e) => {
                  const slugValue = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-');
                  setFormData((prev) => ({ ...prev, slug: slugValue }));
                  if (errors.slug) {
                    setErrors((prev) => ({ ...prev, slug: '' }));
                  }
                }}
                className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                placeholder='creator-name'
              />
              <p className='text-gray-400 text-xs mt-1'>
                This will be used in the URL: /creators/[slug]
              </p>
              {errors.slug && (
                <p className='text-red-400 text-xs mt-1'>{errors.slug}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1.5'>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={2}
                className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm'
                placeholder='Enter creator bio'
              />
            </div>

            {/* Age and Gender Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1.5'>
                  Age
                </label>
                <input
                  type='number'
                  value={formData.age || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'age',
                      e.target.value ? parseInt(e.target.value) : 0
                    )
                  }
                  min={13}
                  max={100}
                  className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                  placeholder='Enter age'
                />
                {errors.age && (
                  <p className='text-red-400 text-xs mt-1'>{errors.age}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1.5'>
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    handleInputChange(
                      'gender',
                      e.target.value as 'male' | 'female' | 'other'
                    )
                  }
                  className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                >
                  <option value='female'>Female</option>
                  <option value='male'>Male</option>
                  <option value='other'>Other</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1.5'>
                Location
              </label>
              <input
                type='text'
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                placeholder='Enter location'
              />
              {errors.location && (
                <p className='text-red-400 text-xs mt-1'>{errors.location}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onCancel}
                className='flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
              >
                {isSubmitting
                  ? mode === 'add'
                    ? 'Adding...'
                    : 'Saving...'
                  : mode === 'add'
                  ? 'Add Creator'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
