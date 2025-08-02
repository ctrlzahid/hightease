'use client';

import { useState } from 'react';
import CustomGallery from './CustomGallery';

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

interface MediaGalleryProps {
  media: MediaItem[];
  onImageClick?: (index: number) => void;
}

export default function MediaGallery({
  media,
  onImageClick,
}: MediaGalleryProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getVideoThumbnailUrl = (item: MediaItem) => {
    // Try to generate thumbnail URL if missing but we have the info
    let thumbnailUrl = item.thumbnail;

    if (!thumbnailUrl && item.uploadType === 'youtube' && item.externalId) {
      thumbnailUrl = `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg`;
    }

    // Return the thumbnail or a default placeholder
    return (
      thumbnailUrl ||
      `data:image/svg+xml;base64,${btoa(`
      <svg width="480" height="360" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <circle cx="240" cy="180" r="30" fill="#666"/>
        <polygon points="225,165 225,195 255,180" fill="#fff"/>
        <text x="50%" y="70%" font-family="Arial" font-size="14" fill="#888" text-anchor="middle">
          Video
        </text>
      </svg>
    `)}`
    );
  };

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setShowGallery(true);
    onImageClick?.(index);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const closeGallery = () => {
    setShowGallery(false);
  };

  const renderVideoEmbed = (item: MediaItem) => {
    return (
      <div className='relative'>
        {item.uploadType === 'youtube' && item.externalId ? (
          <iframe
            src={`https://www.youtube.com/embed/${item.externalId}`}
            className='w-full h-full'
            frameBorder='0'
            allowFullScreen
            title='YouTube video'
          />
        ) : item.uploadType === 'vimeo' && item.externalId ? (
          <iframe
            src={`https://player.vimeo.com/video/${item.externalId}`}
            className='w-full h-full'
            frameBorder='0'
            allowFullScreen
            title='Vimeo video'
          />
        ) : (
          <video
            src={item.url}
            poster={getVideoThumbnailUrl(item)}
            controls
            className='w-full h-full object-cover'
          />
        )}
        {item.uploadType && item.uploadType !== 'cloudinary' && (
          <div className='absolute top-2 right-2'>
            <span className='bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded capitalize'>
              {item.uploadType}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (media.length === 0) {
    return (
      <div className='text-center py-12 text-gray-400'>
        <svg
          className='w-16 h-16 mx-auto mb-4 text-gray-600'
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
        <p>No content available yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid Layout */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {media.map((item, index) => (
          <div
            key={item._id}
            className='aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform'
            onClick={() => handleImageClick(index)}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.caption || 'Creator content'}
                className='w-full h-full object-cover'
                loading='lazy'
              />
            ) : /* Show custom thumbnail for videos if available, otherwise embed */
            item.hasCustomThumbnail && item.customThumbnail ? (
              <div className='relative'>
                <img
                  src={item.customThumbnail}
                  alt={item.caption || 'Video thumbnail'}
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 video-overlay flex items-center justify-center'>
                  <div className='w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-gray-800 ml-1'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M8 5v14l11-7z' />
                    </svg>
                  </div>
                </div>
                {item.uploadType && item.uploadType !== 'cloudinary' && (
                  <div className='absolute top-2 right-2'>
                    <span className='bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded capitalize'>
                      {item.uploadType}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              renderVideoEmbed(item)
            )}
          </div>
        ))}
      </div>

      {/* Custom Gallery Modal */}
      <CustomGallery
        media={media}
        isOpen={showGallery}
        currentIndex={currentIndex}
        onClose={closeGallery}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onThumbnailClick={handleThumbnailClick}
      />
    </>
  );
}
