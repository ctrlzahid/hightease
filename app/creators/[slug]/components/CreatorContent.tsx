'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface MediaItem {
  _id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
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

  const lastMediaId = useRef<string | null>(null);

  // Set up intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

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
    </div>
  );
}
