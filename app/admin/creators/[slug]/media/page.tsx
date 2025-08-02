'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Media {
  _id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
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

  useEffect(() => {
    // Fetch creator data
    fetch(`/api/creators/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setCreator(data);
        // After getting creator, fetch their media
        return fetch(`/api/media/creator/${data._id}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setMedia(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setIsLoading(false);
      });
  }, [slug]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !creator) return;

    setIsUploading(true);
    setUploadProgress(0);

    const files = Array.from(e.target.files);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('creatorId', creator._id);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const newMedia = await res.json();
      setMedia((prev) => [...newMedia, ...prev]);

      // Clear the input
      e.target.value = '';
    } catch (err) {
      setError('Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUrlSubmit = async () => {
    if (!creator) return;

    const validUrls = videoUrls.filter((url) => url.trim() !== '');
    if (validUrls.length === 0) {
      setError('Please enter at least one video URL.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('creatorId', creator._id);

    validUrls.forEach((url) => {
      formData.append('videoUrls', url);
    });

    videoCaptions.forEach((caption) => {
      formData.append('captions', caption);
    });

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const newMedia = await res.json();
      setMedia((prev) => [...newMedia, ...prev]);

      // Clear the inputs
      setVideoUrls(['']);
      setVideoCaptions(['']);
    } catch (err) {
      setError('Failed to upload videos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addVideoUrlField = () => {
    setVideoUrls([...videoUrls, '']);
    setVideoCaptions([...videoCaptions, '']);
  };

  const removeVideoUrlField = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
    setVideoCaptions(videoCaptions.filter((_, i) => i !== index));
  };

  const updateVideoUrl = (index: number, value: string) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };

  const updateVideoCaption = (index: number, value: string) => {
    const newCaptions = [...videoCaptions];
    newCaptions[index] = value;
    setVideoCaptions(newCaptions);
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete media');
      }

      setMedia((prev) => prev.filter((item) => item._id !== mediaId));
    } catch (err) {
      setError('Failed to delete media. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (!creator) {
    return <div>Creator not found</div>;
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Media - {creator.name}
        </h1>
        <div className='flex space-x-2'>
          <button
            onClick={() => setUploadMode('files')}
            className={`px-4 py-2 rounded-md transition-colors ${
              uploadMode === 'files'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upload Files
          </button>
          <button
            onClick={() => setUploadMode('urls')}
            className={`px-4 py-2 rounded-md transition-colors ${
              uploadMode === 'urls'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Video URLs
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className='bg-white shadow rounded-lg p-6 mb-6'>
        {uploadMode === 'files' ? (
          <div>
            <input
              type='file'
              id='media-upload'
              multiple
              accept='image/*,video/*'
              onChange={handleFileUpload}
              className='hidden'
            />
            <label
              htmlFor='media-upload'
              className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer inline-block
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Choose Files to Upload'}
            </label>
            <p className='text-sm text-gray-500 mt-2'>
              Supports images and videos. Files will be uploaded to Cloudinary.
            </p>
          </div>
        ) : (
          <div>
            <h3 className='text-lg font-semibold mb-4'>Add Videos from URLs</h3>
            <p className='text-sm text-gray-500 mb-4'>
              Supports YouTube, Vimeo, and direct video URLs.
            </p>
            <div className='space-y-4'>
              {videoUrls.map((url, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='flex justify-between items-center mb-2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Video URL {index + 1}
                    </label>
                    {videoUrls.length > 1 && (
                      <button
                        onClick={() => removeVideoUrlField(index)}
                        className='text-red-600 hover:text-red-800 text-sm'
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type='url'
                    value={url}
                    onChange={(e) => updateVideoUrl(index, e.target.value)}
                    placeholder='https://youtube.com/watch?v=... or https://vimeo.com/...'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2'
                  />
                  <input
                    type='text'
                    value={videoCaptions[index] || ''}
                    onChange={(e) => updateVideoCaption(index, e.target.value)}
                    placeholder='Caption (optional)'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              ))}
            </div>
            <div className='flex justify-between items-center mt-4'>
              <button
                onClick={addVideoUrlField}
                className='text-blue-600 hover:text-blue-800 text-sm'
              >
                + Add Another Video
              </button>
              <button
                onClick={handleVideoUrlSubmit}
                disabled={isUploading}
                className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploading ? 'Adding Videos...' : 'Add Videos'}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className='bg-red-50 text-red-500 p-4 rounded-md mb-6'>
          {error}
        </div>
      )}

      {isUploading && (
        <div className='mb-6'>
          <div className='h-2 bg-gray-200 rounded-full'>
            <div
              className='h-full bg-blue-600 rounded-full transition-all duration-300'
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {media.map((item) => (
          <div
            key={item._id}
            className='bg-white shadow rounded-lg overflow-hidden'
          >
            <div className='aspect-video relative'>
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.caption || 'Media content'}
                  className='w-full h-full object-cover'
                />
              ) : (
                <>
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
                </>
              )}
              {item.uploadType && item.uploadType !== 'cloudinary' && (
                <div className='absolute top-2 right-2'>
                  <span className='bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded capitalize'>
                    {item.uploadType}
                  </span>
                </div>
              )}
            </div>
            <div className='p-4'>
              {item.caption && (
                <p className='text-sm text-gray-600 mb-2'>{item.caption}</p>
              )}
              <div className='flex justify-between items-center'>
                <span className='text-xs text-gray-500'>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(item._id)}
                  className='text-red-600 hover:text-red-800 text-sm'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <div className='col-span-full text-center text-gray-500 py-12'>
            No media found. Upload some media to get started.
          </div>
        )}
      </div>
    </div>
  );
}
