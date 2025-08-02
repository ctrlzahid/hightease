'use client';

interface Media {
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
  createdAt: string;
}

interface MediaPreviewModalProps {
  media: Media | null;
  onClose: () => void;
  getVideoThumbnailUrl: (item: Media) => string;
}

export default function MediaPreviewModal({
  media,
  onClose,
  getVideoThumbnailUrl,
}: MediaPreviewModalProps) {
  if (!media) return null;

  const getEmbedUrl = (url: string, uploadType?: string) => {
    if (uploadType === 'youtube') {
      const videoId = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      )?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } else if (uploadType === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  };

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='relative max-w-4xl max-h-[90vh] w-full'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors'
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

        {/* Media Content */}
        <div className='bg-gray-900 rounded-lg overflow-hidden'>
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.caption || 'Media preview'}
              className='w-full h-auto max-h-[80vh] object-contain'
            />
          ) : (
            <div
              className='relative w-full'
              style={{ paddingBottom: '56.25%' }}
            >
              <iframe
                src={getEmbedUrl(media.url, media.uploadType)}
                className='absolute inset-0 w-full h-full'
                frameBorder='0'
                allowFullScreen
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              />
            </div>
          )}

          {/* Caption */}
          {media.caption && (
            <div className='p-4 border-t border-gray-700'>
              <p className='text-white text-sm'>{media.caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
