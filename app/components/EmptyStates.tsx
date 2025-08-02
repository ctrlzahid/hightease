'use client';

interface EmptyStatesProps {
  searchTerm: string;
  hasCreators: boolean;
  onClearSearch: () => void;
}

export default function EmptyStates({
  searchTerm,
  hasCreators,
  onClearSearch,
}: EmptyStatesProps) {
  // Search results empty state
  if (hasCreators && searchTerm) {
    return (
      <div className='max-w-2xl mx-auto text-center py-16 sm:py-24'>
        {/* Animated Search Icon */}
        <div className='relative mb-8'>
          <div className='w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-500/30'>
            <svg
              className='w-12 h-12 text-blue-400 animate-pulse'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          {/* Floating Elements */}
          <div className='absolute -top-2 -right-2 w-6 h-6 bg-cyan-500/30 rounded-full animate-bounce'></div>
          <div
            className='absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500/30 rounded-full animate-bounce'
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div className='absolute top-1/2 -right-6 w-3 h-3 bg-blue-500/40 rounded-full animate-ping'></div>
        </div>

        {/* Main Message */}
        <div className='space-y-4 mb-8'>
          <h2 className='text-2xl sm:text-3xl font-bold text-white'>
            No creators found
          </h2>
          <p className='text-lg text-gray-300 max-w-md mx-auto leading-relaxed'>
            We couldn't find any creators matching "{searchTerm}". Try adjusting
            your search terms or browse all available creators.
          </p>
        </div>

        {/* Search Tips */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-lg mx-auto'>
          <div className='text-center'>
            <div className='w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/30'>
              <svg
                className='w-6 h-6 text-green-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='text-sm font-semibold text-white mb-1'>
              Try Different Terms
            </h3>
            <p className='text-xs text-gray-400'>Use broader search terms</p>
          </div>

          <div className='text-center'>
            <div className='w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center border border-orange-500/30'>
              <svg
                className='w-6 h-6 text-orange-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 10h16M4 14h16M4 18h16'
                />
              </svg>
            </div>
            <h3 className='text-sm font-semibold text-white mb-1'>
              Browse All
            </h3>
            <p className='text-xs text-gray-400'>Explore all creators</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='space-y-4'>
          <button
            onClick={onClearSearch}
            className='bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25'
          >
            Clear Search
          </button>
          <p className='text-sm text-gray-500'>
            Remove search filter to see all creators
          </p>
        </div>
      </div>
    );
  }

  // No creators available empty state
  if (!hasCreators) {
    return (
      <div className='max-w-2xl mx-auto text-center py-16 sm:py-24'>
        {/* Animated Icon */}
        <div className='relative mb-8'>
          <div className='w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-500/30'>
            <svg
              className='w-12 h-12 text-purple-400 animate-pulse'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
          </div>

          {/* Floating Elements */}
          <div className='absolute -top-2 -right-2 w-6 h-6 bg-pink-500/30 rounded-full animate-bounce'></div>
          <div
            className='absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500/30 rounded-full animate-bounce'
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div className='absolute top-1/2 -right-6 w-3 h-3 bg-purple-500/40 rounded-full animate-ping'></div>
        </div>

        {/* Main Message */}
        <div className='space-y-4 mb-8'>
          <h2 className='text-2xl sm:text-3xl font-bold text-white'>
            Discover Amazing Creators
          </h2>
          <p className='text-lg text-gray-300 max-w-md mx-auto leading-relaxed'>
            We're working on bringing you the best content creators. Get ready
            for exclusive photos, videos, and behind-the-scenes moments.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-lg mx-auto'>
          <div className='text-center'>
            <div className='w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-red-500/30'>
              <svg
                className='w-6 h-6 text-red-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
            </div>
            <h3 className='text-sm font-semibold text-white mb-1'>
              Exclusive Content
            </h3>
            <p className='text-xs text-gray-400'>Private photos & videos</p>
          </div>

          <div className='text-center'>
            <div className='w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-blue-500/30'>
              <svg
                className='w-6 h-6 text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
              </svg>
            </div>
            <h3 className='text-sm font-semibold text-white mb-1'>
              Behind Scenes
            </h3>
            <p className='text-xs text-gray-400'>Real moments captured</p>
          </div>

          <div className='text-center'>
            <div className='w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30'>
              <svg
                className='w-6 h-6 text-purple-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='text-sm font-semibold text-white mb-1'>
              Coming Soon
            </h3>
            <p className='text-xs text-gray-400'>Stay tuned for updates</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className='space-y-4'>
          <button className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25'>
            Get Notified
          </button>
          <p className='text-sm text-gray-500'>
            We'll let you know when creators join the platform
          </p>
        </div>
      </div>
    );
  }

  return null;
} 