'use client';

import { useEffect } from 'react';

interface MediaItem {
  _id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  uploadType?: 'cloudinary' | 'youtube' | 'vimeo' | 'external';
  externalId?: string;
}

interface CustomGalleryProps {
  media: MediaItem[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onThumbnailClick: (index: number) => void;
}

export default function CustomGallery({
  media,
  isOpen,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
  onThumbnailClick,
}: CustomGalleryProps) {
  // Handle keyboard navigation - must be before early return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!isOpen || media.length === 0) return null;

  const currentItem = media[currentIndex];

  const getVideoThumbnailUrl = (item: MediaItem) => {
    let thumbnailUrl = item.thumbnail;

    if (!thumbnailUrl && item.uploadType === 'youtube' && item.externalId) {
      thumbnailUrl = `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg`;
    }

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

  const renderCurrentMedia = () => {
    if (currentItem.type === 'image') {
      return (
        <img
          src={currentItem.url}
          alt={currentItem.caption || 'Image'}
          className='max-w-full max-h-[80vh] object-contain mx-auto'
        />
      );
    } else {
      // Handle video display
      if (currentItem.uploadType === 'youtube' && currentItem.externalId) {
        return (
          <iframe
            width='800'
            height='450'
            src={`https://www.youtube.com/embed/${currentItem.externalId}?autoplay=1`}
            frameBorder='0'
            allowFullScreen
            allow='autoplay; encrypted-media'
            className='max-w-full max-h-[80vh] mx-auto rounded-lg'
          />
        );
      } else if (currentItem.uploadType === 'vimeo' && currentItem.externalId) {
        return (
          <iframe
            width='800'
            height='450'
            src={`https://player.vimeo.com/video/${currentItem.externalId}?autoplay=1`}
            frameBorder='0'
            allowFullScreen
            allow='autoplay; encrypted-media'
            className='max-w-full max-h-[80vh] mx-auto rounded-lg'
          />
        );
      } else {
        return (
          <video
            width='800'
            height='450'
            controls
            autoPlay
            poster={getVideoThumbnailUrl(currentItem)}
            className='max-w-full max-h-[80vh] mx-auto rounded-lg'
          >
            <source src={currentItem.url} type='video/mp4' />
            Your browser does not support the video tag.
          </video>
        );
      }
    }
  };

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col'>
      {/* Header */}
      <div className='flex justify-between items-center p-4 bg-black bg-opacity-50'>
        <div className='text-white'>
          {currentIndex + 1} of {media.length}
          {currentItem.caption && (
            <span className='ml-4 text-gray-300'>{currentItem.caption}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className='text-white hover:text-gray-300 text-2xl font-bold p-2'
          aria-label='Close gallery'
        >
          ×
        </button>
      </div>

      {/* Main content area */}
      <div className='flex-1 flex items-center justify-center p-4 relative'>
        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            onClick={onPrevious}
            className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 z-10'
            aria-label='Previous'
          >
            <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
            </svg>
          </button>
        )}

        {/* Current media */}
        <div className='flex-1 flex items-center justify-center'>
          {renderCurrentMedia()}
        </div>

        {/* Next button */}
        {currentIndex < media.length - 1 && (
          <button
            onClick={onNext}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 z-10'
            aria-label='Next'
          >
            <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z' />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className='bg-black bg-opacity-50 p-4'>
        <div className='flex space-x-2 overflow-x-auto'>
          {media.map((item, index) => (
            <button
              key={item._id}
              onClick={() => onThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                index === currentIndex ? 'border-white' : 'border-transparent'
              } hover:border-gray-300 transition-colors`}
            >
              {item.type === 'image' ? (
                <img
                  src={item.thumbnail || item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='relative w-full h-full'>
                  <img
                    src={getVideoThumbnailUrl(item)}
                    alt={`Video thumbnail ${index + 1}`}
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      if (
                        item.uploadType === 'youtube' &&
                        item.externalId &&
                        !e.currentTarget.src.includes('default.jpg')
                      ) {
                        e.currentTarget.src = `https://img.youtube.com/vi/${item.externalId}/default.jpg`;
                      }
                    }}
                  />
                  <div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
                    <svg
                      className='w-4 h-4 text-white'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M8 5v14l11-7z' />
                    </svg>
                  </div>
                  {item.uploadType && item.uploadType !== 'cloudinary' && (
                    <div className='absolute top-1 right-1'>
                      <span className='bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded capitalize'>
                        {item.uploadType}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
