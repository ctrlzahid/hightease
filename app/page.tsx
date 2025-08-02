'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import EmptyStates from './components/EmptyStates';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface CreatorWithStats {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [creators, setCreators] = useState<CreatorWithStats[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorWithStats[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<
    'name_asc' | 'name_desc' | 'items_asc' | 'items_desc'
  >('name_asc');

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await fetch('/api/creators');
        const data = await response.json();
        setCreators(data);
        setFilteredCreators(data);
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  useEffect(() => {
    const filtered = creators.filter(
      (creator) =>
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (creator.location &&
          creator.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'items_asc':
          return a.mediaCount - b.mediaCount;
        case 'items_desc':
          return b.mediaCount - a.mediaCount;
        default:
          return 0;
      }
    });

    setFilteredCreators(filtered);
  }, [creators, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
          <p>Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen text-white'>
      <Header />
      <div className='container mx-auto px-2 sm:px-4 py-4 sm:py-6'>
        {/* Search & Sort Section */}
        <div className='mb-6 space-y-4'>
          {/* Search Bar */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg
                className='w-5 h-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <input
              type='text'
              placeholder='Search by name or location...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 bg-gray-950/80 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent backdrop-blur-sm'
            />
          </div>

          {/* Sort & Results Count */}
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-400'>
              {filteredCreators.length}{' '}
              {filteredCreators.length === 1 ? 'creator' : 'creators'}
            </div>
            <div className='relative'>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className='appearance-none bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent cursor-pointer backdrop-blur-sm'
              >
                <option value='name_asc'>Name A-Z</option>
                <option value='name_desc'>Name Z-A</option>
                <option value='items_desc'>Most Items</option>
                <option value='items_asc'>Least Items</option>
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {filteredCreators.length > 0 ? (
          /* Pinterest-Style Masonry Layout for Creators */
          <div className='columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6 md:gap-8'>
            {filteredCreators.map((creator) => (
              <Link
                key={creator._id.toString()}
                href={`/creators/${creator.slug}`}
                className='block break-inside-avoid mb-4 sm:mb-6 md:mb-8 group cursor-pointer'
              >
                <div className='relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]'>
                  {/* Background Image */}
                  <div className='absolute inset-0'>
                    {creator.avatar ? (
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center'>
                        <span className='text-4xl sm:text-5xl font-bold text-gray-300'>
                          {getInitials(creator.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Gradient Overlay - Tinder Style */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent'></div>

                  {/* Text Content Overlay - Bottom Left */}
                  <div className='absolute bottom-0 left-0 right-0 p-4 text-white'>
                    {/* Name and Age */}
                    <h2 className='text-lg sm:text-xl font-bold mb-1'>
                      {creator.name}
                      {creator.age ? `, ${creator.age}` : ''}
                    </h2>

                    {/* Location with Gender Icon */}
                    {creator.location && (
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='text-sm text-gray-200'>
                          {creator.location}
                        </p>
                        {creator.gender && (
                          <div className='flex items-center'>
                            {creator.gender === 'male' ? (
                              <svg
                                className='w-4 h-4 text-blue-400'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path d='M9.5 11c1.93 0 3.5 1.57 3.5 3.5S11.43 18 9.5 18 6 16.43 6 14.5 7.57 11 9.5 11zm0-2C6.46 9 4 11.46 4 14.5S6.46 20 9.5 20s5.5-2.46 5.5-5.5c0-1.16-.36-2.23-.97-3.12L18 7.41V10h2V4h-6v2h2.59l-3.97 3.97C11.73 9.36 10.66 9 9.5 9z' />
                              </svg>
                            ) : creator.gender === 'female' ? (
                              <svg
                                className='w-4 h-4 text-pink-400'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path d='M12 2C8.69 2 6 4.69 6 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1 2v2H9v2h2v2h2v-2h2v-2h-2v-2z' />
                              </svg>
                            ) : (
                              <svg
                                className='w-4 h-4 text-purple-400'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path d='M12 2C8.69 2 6 4.69 6 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z' />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Items Count */}
                    <div className='text-xs text-gray-300'>
                      {creator.mediaCount}{' '}
                      {creator.mediaCount === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty States - Rendered outside the grid */
          <EmptyStates
            searchTerm={searchTerm}
            hasCreators={creators.length > 0}
            onClearSearch={() => setSearchTerm('')}
          />
        )}
      </div>
    </div>
  );
}
