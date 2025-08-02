'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import MediaCard from '../components/MediaCard';
import MediaUploadForm from '../components/MediaUploadForm';
import MediaPreviewModal from '../components/MediaPreviewModal';

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

interface Creator {
  _id: string;
  name: string;
  slug: string;
}

export default function CreatorMedia({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'files' | 'urls'>('files');
  const [videoUrls, setVideoUrls] = useState<string[]>(['']);
  const [videoCaptions, setVideoCaptions] = useState<string[]>(['']);

  const [thumbnailUploading, setThumbnailUploading] = useState<Set<string>>(
    new Set()
  );
  const [thumbnailGenerating, setThumbnailGenerating] = useState<Set<string>>(
    new Set()
  );
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const toggleUploadForm = (mode: 'files' | 'urls') => {
    if (showUploadForm && uploadMode === mode) {
      setShowUploadForm(false);
    } else {
      setShowUploadForm(true);
      setUploadMode(mode);
    }
  };

  useEffect(() => {
    fetchCreator();
    fetchMedia();
  }, [slug]);

  const fetchCreator = async () => {
    try {
      const response = await fetch(`/api/creators/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCreator(data);
      }
    } catch (err) {
      setError('Failed to fetch creator');
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/media/creator-slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setMedia(Array.isArray(data) ? data : []);
      } else {
        setMedia([]);
      }
    } catch (err) {
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append('creatorId', creator._id);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        form.reset();
        fetchMedia();
        setError('');
      } else {
        const error = await response.json();
        setError(error.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadForm(false);
    }
  };

  const handleVideoUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) return;

    const formData = new FormData();
    formData.append('creatorId', creator._id);

    videoUrls.forEach((url, index) => {
      if (url.trim()) {
        formData.append('videoUrls', url.trim());
        formData.append('captions', videoCaptions[index] || '');
      }
    });

    setIsUploading(true);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedMedia = await response.json();

        // Auto-generate thumbnails for YouTube/Vimeo videos
        if (uploadedMedia.media) {
          for (const mediaItem of uploadedMedia.media) {
            if (
              mediaItem.uploadType === 'youtube' ||
              mediaItem.uploadType === 'vimeo'
            ) {
              handleThumbnailGenerate(mediaItem._id);
            }
          }
        }

        setVideoUrls(['']);
        setVideoCaptions(['']);
        fetchMedia();
        setError('');
      } else {
        const error = await response.json();
        setError(error.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setShowUploadForm(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMedia(media.filter((item) => item._id !== mediaId));
      }
    } catch (err) {
      setError('Failed to delete media');
    }
  };

  const handleEdit = async (mediaId: string, newCaption: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: newCaption }),
      });

      if (response.ok) {
        setMedia(
          media.map((item) =>
            item._id === mediaId ? { ...item, caption: newCaption } : item
          )
        );
      }
    } catch (err) {
      setError('Failed to update caption');
    }
  };

  const handleThumbnailUpload = async (mediaId: string, file: File) => {
    setThumbnailUploading((prev) => new Set(prev).add(mediaId));

    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await fetch(`/api/media/${mediaId}/thumbnail`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const updatedMedia = await response.json();
        setMedia(
          media.map((item) =>
            item._id === mediaId ? { ...item, ...updatedMedia } : item
          )
        );
      }
    } catch (err) {
      setError('Failed to upload thumbnail');
    } finally {
      setThumbnailUploading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleThumbnailGenerate = async (mediaId: string) => {
    setThumbnailGenerating((prev) => new Set(prev).add(mediaId));

    try {
      const response = await fetch(`/api/media/${mediaId}/thumbnail`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updatedMedia = await response.json();
        setMedia(
          media.map((item) =>
            item._id === mediaId ? { ...item, ...updatedMedia } : item
          )
        );
      }
    } catch (err) {
      setError('Failed to generate thumbnail');
    } finally {
      setThumbnailGenerating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleThumbnailDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}/thumbnail`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMedia(
          media.map((item) =>
            item._id === mediaId
              ? {
                  ...item,
                  customThumbnail: undefined,
                  hasCustomThumbnail: false,
                }
              : item
          )
        );
      }
    } catch (err) {
      setError('Failed to delete thumbnail');
    }
  };

  const addVideoUrl = () => {
    setVideoUrls([...videoUrls, '']);
    setVideoCaptions([...videoCaptions, '']);
  };

  const removeVideoUrl = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
    setVideoCaptions(videoCaptions.filter((_, i) => i !== index));
  };

  const getVideoThumbnailUrl = (item: Media): string => {
    if (item.hasCustomThumbnail && item.customThumbnail) {
      return item.customThumbnail;
    }

    if (item.uploadType === 'youtube' && item.externalId) {
      return `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg`;
    }

    if (item.uploadType === 'vimeo' && item.externalId) {
      return `https://vumbnail.com/${item.externalId}.jpg`;
    }

    return '/placeholder-video.svg';
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20'></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className='text-center py-12'>
        <h1 className='text-xl text-gray-400'>Creator not found</h1>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-white'>
          Media - {creator.name}
        </h1>
        <div className='flex gap-2'>
          <button
            onClick={() => toggleUploadForm('files')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showUploadForm && uploadMode === 'files'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Upload Media
          </button>
          <button
            onClick={() => toggleUploadForm('urls')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showUploadForm && uploadMode === 'urls'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Add External Video
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6'>
          <p className='text-red-400 text-center'>{error}</p>
        </div>
      )}

      {/* Upload Forms */}
      {showUploadForm && (
        <MediaUploadForm
          uploadMode={uploadMode}
          isUploading={isUploading}
          videoUrls={videoUrls}
          videoCaptions={videoCaptions}
          onFileUpload={handleFileUpload}
          onVideoUrlSubmit={handleVideoUrlSubmit}
          onVideoUrlsChange={setVideoUrls}
          onVideoCaptionsChange={setVideoCaptions}
          onAddVideoUrl={addVideoUrl}
          onRemoveVideoUrl={removeVideoUrl}
        />
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className='text-center py-12'>
          <div className='w-16 h-16 mx-auto mb-4 text-gray-600'>
            <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-400 mb-2'>
            No media found
          </h3>
          <p className='text-gray-500'>
            Upload some photos or videos to get started
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {media.map((item) => (
            <MediaCard
              key={item._id}
              item={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onThumbnailUpload={handleThumbnailUpload}
              onThumbnailGenerate={handleThumbnailGenerate}
              onThumbnailDelete={handleThumbnailDelete}
              onPreview={setPreviewMedia}
              thumbnailUploading={thumbnailUploading}
              thumbnailGenerating={thumbnailGenerating}
              getVideoThumbnailUrl={getVideoThumbnailUrl}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <MediaPreviewModal
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
        getVideoThumbnailUrl={getVideoThumbnailUrl}
      />
    </div>
  );
}
