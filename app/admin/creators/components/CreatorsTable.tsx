'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeleteCreatorButton from './DeleteCreatorButton';

interface Creator {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  mediaCount: number;
  createdAt: string;
}

interface CreatorsTableProps {
  creators: Creator[];
}

export default function CreatorsTable({
  creators: initialCreators,
}: CreatorsTableProps) {
  const [creators, setCreators] = useState(initialCreators);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCreatorLink = async (slug: string) => {
    const link = `${window.location.origin}/creators/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(slug);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCreatorClick = (slug: string) => {
    window.open(`/creators/${slug}`, '_blank');
  };

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8'>
        <h1 className='text-xl sm:text-2xl font-bold text-white'>Creators</h1>
        <Link
          href='/admin/creators/new'
          className='bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-lg'
        >
          + Add Creator
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className='hidden md:block bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-700'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead className='bg-gray-800'>
            <tr>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Creator
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Media Count
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Created
              </th>
              <th className='px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-gray-900/50 divide-y divide-gray-700'>
            {creators.map((creator) => (
              <tr
                key={creator._id.toString()}
                className='hover:bg-gray-800/50 cursor-pointer transition-colors'
                onClick={() => handleCreatorClick(creator.slug)}
              >
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-4'>
                    {creator.avatar ? (
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className='w-12 h-12 rounded-full object-cover'
                      />
                    ) : (
                      <div className='w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center'>
                        <span className='text-lg font-bold text-gray-300'>
                          {creator.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className='text-sm font-medium text-white'>
                        {creator.name}
                      </div>
                      {creator.bio && (
                        <div className='text-sm text-gray-400 truncate max-w-xs'>
                          {creator.bio}
                        </div>
                      )}
                      <div className='text-xs text-gray-500'>
                        /{creator.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800'>
                    {creator.mediaCount} items
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <span className='text-sm text-gray-300'>
                    {new Date(creator.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <div
                    className='flex gap-2 justify-center'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/admin/creators/${creator.slug}/edit`}
                      className='bg-white hover:bg-gray-100 text-black px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/creators/${creator.slug}/media`}
                      className='bg-white hover:bg-gray-100 text-black px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
                    >
                      Media
                    </Link>
                    <button
                      onClick={() => copyCreatorLink(creator.slug)}
                      className='bg-white hover:bg-gray-100 text-black px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
                    >
                      {copiedId === creator.slug ? 'Copied!' : 'Copy Link'}
                    </button>
                    <DeleteCreatorButton
                      creatorId={creator._id.toString()}
                      creatorName={creator.name}
                      creatorSlug={creator.slug}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {creators.length === 0 && (
              <tr>
                <td colSpan={4} className='px-6 py-8 text-center text-gray-400'>
                  No creators found. Add your first creator to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className='md:hidden space-y-4'>
        {creators.map((creator) => (
          <div
            key={creator._id.toString()}
            className='bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden'
          >
            <div
              className='p-4 cursor-pointer hover:bg-gray-800/50 transition-colors'
              onClick={() => handleCreatorClick(creator.slug)}
            >
              <div className='flex items-center gap-4 mb-4'>
                {creator.avatar ? (
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className='w-16 h-16 rounded-full object-cover'
                  />
                ) : (
                  <div className='w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center'>
                    <span className='text-xl font-bold text-gray-300'>
                      {creator.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-white'>
                    {creator.name}
                  </h3>
                  <p className='text-sm text-gray-400'>/{creator.slug}</p>
                  <div className='flex items-center gap-4 mt-2'>
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800'>
                      {creator.mediaCount} items
                    </span>
                    <span className='text-xs text-gray-500'>
                      {new Date(creator.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {creator.bio && (
                <p className='text-sm text-gray-400 mb-4 line-clamp-2'>
                  {creator.bio}
                </p>
              )}
            </div>

            <div className='border-t border-gray-700 p-4 bg-gray-800/50'>
              <div className='grid grid-cols-2 gap-2'>
                <Link
                  href={`/admin/creators/${creator.slug}/edit`}
                  className='w-full bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors'
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/creators/${creator.slug}/media`}
                  className='w-full bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors'
                >
                  Media
                </Link>
                <button
                  onClick={() => copyCreatorLink(creator.slug)}
                  className='w-full bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                >
                  {copiedId === creator.slug ? 'Copied!' : 'Copy Link'}
                </button>
                <DeleteCreatorButton
                  creatorId={creator._id.toString()}
                  creatorName={creator.name}
                  creatorSlug={creator.slug}
                />
              </div>
            </div>
          </div>
        ))}

        {creators.length === 0 && (
          <div className='bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg p-8 text-center'>
            <p className='text-gray-400'>
              No creators found. Add your first creator to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
