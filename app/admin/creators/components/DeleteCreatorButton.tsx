'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteCreatorButtonProps {
  creatorId: string;
  creatorName: string;
  creatorSlug: string;
}

export default function DeleteCreatorButton({
  creatorId,
  creatorName,
  creatorSlug,
}: DeleteCreatorButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/creators/${creatorSlug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to update the creators list
        router.refresh();
        setShowConfirm(false);
      } else {
        const error = await response.text();
        alert(`Failed to delete creator: ${error}`);
      }
    } catch (error) {
      alert(`Error deleting creator: ${error}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className='flex flex-col gap-2 items-center'>
        <span className='text-xs text-red-400 text-center'>
          Delete "{creatorName}"?
        </span>
        <div className='flex gap-2'>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='flex-1 bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 text-center'
          >
            {isDeleting ? 'Deleting...' : 'Yes'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className='flex-1 bg-white hover:bg-gray-100 text-black px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 text-center'
          >
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className='w-full md:w-auto bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-colors text-center'
    >
      Delete
    </button>
  );
}
