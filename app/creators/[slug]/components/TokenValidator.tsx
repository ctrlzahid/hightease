'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TokenValidatorProps {
  creatorId: string;
  creatorSlug: string;
  token: string;
}

export default function TokenValidator({
  creatorId,
  creatorSlug,
  token,
}: TokenValidatorProps) {
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch('/api/passwords/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creatorId,
            token,
          }),
        });

        if (response.ok) {
          // Refresh the page to show content
          router.refresh();
        } else {
          // If token is invalid, redirect to the creator page without token
          router.replace(`/creators/${creatorSlug}`);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        router.replace(`/creators/${creatorSlug}`);
      }
    };

    validateToken();
  }, [creatorId, token, router]);

  return (
    <div className='flex justify-center items-center min-h-[400px]'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 mx-auto mb-4'></div>
        <p className='text-gray-400'>Validating access...</p>
      </div>
    </div>
  );
}
