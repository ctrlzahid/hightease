'use client';

import { useState } from 'react';
import MediaGallery from './MediaGallery';

interface MediaItem {
  _id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  customThumbnail?: string;
  customThumbnailPublicId?: string;
  hasCustomThumbnail: boolean;
  caption?: string;
  uploadType?: 'cloudinary' | 'youtube' | 'vimeo' | 'external';
  externalId?: string;
}

interface ContentTabsProps {
  media: MediaItem[];
}

type TabType = 'all' | 'images' | 'videos';

export default function ContentTabs({ media }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filterMedia = (type: TabType): MediaItem[] => {
    switch (type) {
      case 'images':
        return media.filter((item) => item.type === 'image');
      case 'videos':
        return media.filter((item) => item.type === 'video');
      default:
        return media;
    }
  };

  const filteredMedia = filterMedia(activeTab);
  const imageCount = media.filter((item) => item.type === 'image').length;
  const videoCount = media.filter((item) => item.type === 'video').length;

  const TabButton = ({
    tab,
    label,
    count,
    icon,
  }: {
    tab: TabType;
    label: string;
    count: number;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
        activeTab === tab
          ? 'border-white text-white'
          : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
      }`}
    >
      {icon}
      <span className='text-sm font-medium'>{label}</span>
      <span className='bg-gray-700 text-gray-300 text-xs px-1 py-0.5 rounded-full min-w-[18px] text-center'>
        {count}
      </span>
    </button>
  );

  return (
    <div>
      {/* Tab Navigation */}
      <div className='flex justify-center space-x-6 mb-6 border-b border-gray-800'>
        <TabButton
          tab='all'
          label='All'
          count={media.length}
          icon={
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
                d='M19 11H5m14-7H5m14 14H5'
              />
            </svg>
          }
        />
        <TabButton
          tab='images'
          label='Photos'
          count={imageCount}
          icon={
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
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          }
        />
        <TabButton
          tab='videos'
          label='Videos'
          count={videoCount}
          icon={
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
                d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
              />
            </svg>
          }
        />
      </div>

      {/* Content */}
      <div className='min-h-[200px]'>
        <div className='transition-all duration-300 ease-in-out'>
          {filteredMedia.length > 0 ? (
            <div className='animate-fadeIn'>
              <MediaGallery media={filteredMedia} />
            </div>
          ) : (
            <div className='text-center py-12 text-gray-400 animate-fadeIn'>
              <div className='mb-4'>
                {activeTab === 'images' ? (
                  <svg
                    className='w-16 h-16 mx-auto text-gray-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                ) : activeTab === 'videos' ? (
                  <svg
                    className='w-16 h-16 mx-auto text-gray-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-16 h-16 mx-auto text-gray-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M19 11H5m14-7H5m14 14H5'
                    />
                  </svg>
                )}
              </div>
              <p>
                {activeTab === 'images' && 'No photos available yet'}
                {activeTab === 'videos' && 'No videos available yet'}
                {activeTab === 'all' && 'No content available yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
