'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import CreatorForm from '../../components/CreatorForm';

interface CreatorFormData {
  name: string;
  slug: string;
  bio: string;
  age: number | null;
  gender: 'male' | 'female' | 'other';
  location: string;
}

export default function EditCreator({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [creator, setCreator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCreator();
  }, [slug]);

  const fetchCreator = async () => {
    try {
      const response = await fetch(`/api/creators/${slug}`);
      if (response.ok) {
        const creatorData = await response.json();
        setCreator(creatorData);
      } else {
        setError('Failed to fetch creator');
      }
    } catch (err) {
      setError('Failed to fetch creator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: CreatorFormData, avatarFile?: File) => {
    setIsSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      data.append('bio', formData.bio);
      if (formData.age) {
        data.append('age', formData.age.toString());
      }
      data.append('gender', formData.gender);
      data.append('location', formData.location);

      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const response = await fetch(`/api/creators/${slug}`, {
        method: 'PUT',
        body: data,
      });

      if (response.ok) {
        router.push('/admin/creators');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update creator');
      }
    } catch (err) {
      setError('Failed to update creator. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20'></div>
      </div>
    );
  }

  if (error && !creator) {
    return (
      <div className='text-center py-12'>
        <h1 className='text-xl text-gray-400'>Creator not found</h1>
      </div>
    );
  }

  return (
    <CreatorForm
      mode='edit'
      initialData={{
        name: creator?.name || '',
        slug: creator?.slug || '',
        bio: creator?.bio || '',
        age: creator?.age || null,
        gender: creator?.gender || 'female',
        location: creator?.location || '',
        avatar: creator?.avatar || '',
      }}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/creators')}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
}
