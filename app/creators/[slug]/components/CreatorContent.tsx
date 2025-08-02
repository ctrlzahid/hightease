'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

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

interface CreatorContentProps {
  initialMedia: MediaItem[];
  creatorId: string;
}

export default function CreatorContent({
  initialMedia,
  creatorId,
}: CreatorContentProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<MediaItem | null>(null);

  const lastMediaId = useRef<string | null>(null);

  // Set up intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlayingVideo(null);
      }
    };

    if (playingVideo) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [playingVideo]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreMedia();
    }
  }, [inView]);

  const loadMoreMedia = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const lastId = media[media.length - 1]?._id;
    lastMediaId.current = lastId;

    try {
      const res = await fetch(
        `/api/media/creator/${creatorId}?cursor=${lastId}`
      );
      const newMedia = await res.json();

      if (newMedia.length === 0) {
        setHasMore(false);
      } else {
        setMedia((prev) => [...prev, ...newMedia]);
      }
    } catch (error) {
      console.error('Error loading more media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-8'>
      {media.map((item, index) => (
        <div
          key={item._id}
          className='bg-gray-900 rounded-lg overflow-hidden'
          ref={index === media.length - 3 ? ref : undefined}
        >
          {item.type === 'image' ? (
            <div className='aspect-video relative'>
              <img
                src={item.url}
                alt={item.caption || 'Creator content'}
                className='w-full h-full object-cover'
                loading='lazy'
              />
            </div>
          ) : (
            <div className='aspect-video relative overflow-hidden rounded-lg'>
              {/* Show thumbnail with play button if custom thumbnail exists */}
              {item.hasCustomThumbnail && item.customThumbnail ? (
                <div
                  className='relative w-full h-full cursor-pointer'
                  onClick={() => setPlayingVideo(item)}
                >
                  <img
                    id={`thumbnail-${item._id}`}
                    src={item.customThumbnail}
                    alt={item.caption || 'Video thumbnail'}
                    className='w-full h-full object-cover'
                  />
                  {/* Play button overlay */}
                  <div className='absolute inset-0 video-overlay flex items-center justify-center'>
                    <div className='w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center'>
                      <svg
                        className='w-8 h-8 text-gray-800 ml-1'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M8 5v14l11-7z' />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                /* Show embedded video directly if no custom thumbnail */
                <div
                  className='relative w-full h-full cursor-pointer'
                  onClick={() => setPlayingVideo(item)}
                >
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
                      poster={item.thumbnail}
                      controls
                      className='w-full h-full object-cover'
                    />
                  )}
                  {/* Click overlay for modal */}
                  <div className='absolute inset-0 video-overlay flex items-center justify-center'>
                    <div className='w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center'>
                      <svg
                        className='w-8 h-8 text-gray-800 ml-1'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M8 5v14l11-7z' />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {item.uploadType && item.uploadType !== 'cloudinary' && (
                <div className='absolute top-2 right-2'>
                  <span className='bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded capitalize'>
                    {item.uploadType}
                  </span>
                </div>
              )}
            </div>
          )}
          {item.caption && (
            <div className='p-4'>
              <p className='text-gray-300'>{item.caption}</p>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className='flex justify-center py-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      )}

      {!hasMore && media.length > 0 && (
        <div className='text-center py-4 text-gray-400'>
          No more content to load
        </div>
      )}

      {media.length === 0 && (
        <div className='text-center py-4 text-gray-400'>
          No content available yet
        </div>
      )}

      {/* Video Modal */}
      {playingVideo && (
        <div
          className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-80'
          onClick={() => setPlayingVideo(null)}
          style={{
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div
            className='relative w-[90vw] h-[90vh] max-w-6xl max-h-[80vh] bg-black rounded-lg overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPlayingVideo(null)}
              className='absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            {/* Video content */}
            <div className='w-full h-full'>
              {playingVideo.uploadType === 'youtube' &&
              playingVideo.externalId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${playingVideo.externalId}?autoplay=1`}
                  className='w-full h-full'
                  frameBorder='0'
                  allowFullScreen
                  title='YouTube video'
                />
              ) : playingVideo.uploadType === 'vimeo' &&
                playingVideo.externalId ? (
                <iframe
                  src={`https://player.vimeo.com/video/${playingVideo.externalId}?autoplay=1`}
                  className='w-full h-full'
                  frameBorder='0'
                  allowFullScreen
                  title='Vimeo video'
                />
              ) : (
                <video
                  src={playingVideo.url}
                  controls
                  autoPlay
                  className='w-full h-full object-contain'
                />
              )}
            </div>

            {/* Caption */}
            {playingVideo.caption && (
              <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4'>
                <p className='text-sm'>{playingVideo.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
