'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatorForm from '../components/CreatorForm';

interface CreatorFormData {
  name: string;
  slug: string;
  bio: string;
  age: number | null;
  gender: 'male' | 'female' | 'other';
  location: string;
}

export default function NewCreator() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

      const response = await fetch('/api/creators', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        router.push('/admin/creators');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create creator');
      }
    } catch (err) {
      setError('Failed to create creator. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

      return (
      <CreatorForm
        mode='add'
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/creators')}
        isSubmitting={isSubmitting}
        error={error}
      />
    );
}
