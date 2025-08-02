'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeletePasswordButtonProps {
  passwordId: string;
  creatorName: string;
}

export default function DeletePasswordButton({
  passwordId,
  creatorName,
}: DeletePasswordButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/passwords/${passwordId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to update the passwords list
        router.refresh();
        setShowConfirm(false);
      } else {
        const error = await response.text();
        alert(`Failed to delete password: ${error}`);
      }
    } catch (error) {
      alert(`Error deleting password: ${error}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className='flex flex-col gap-2 items-center'>
        <span className='text-xs text-red-400 text-center'>
          Delete password for "{creatorName}"?
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
      className='bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
    >
      Delete
    </button>
  );
}
