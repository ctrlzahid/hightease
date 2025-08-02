'use client';

import { useState } from 'react';

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

interface MediaCardProps {
  item: Media;
  onDelete: (mediaId: string) => void;
  onEdit: (mediaId: string, caption: string) => void;
  onThumbnailUpload: (mediaId: string, file: File) => void;
  onThumbnailGenerate: (mediaId: string) => void;
  onThumbnailDelete: (mediaId: string) => void;
  onPreview: (media: Media) => void;
  thumbnailUploading: Set<string>;
  thumbnailGenerating: Set<string>;
  getVideoThumbnailUrl: (item: Media) => string;
}

export default function MediaCard({
  item,
  onDelete,
  onEdit,
  onThumbnailUpload,
  onThumbnailGenerate,
  onThumbnailDelete,
  onPreview,
  thumbnailUploading,
  thumbnailGenerating,
  getVideoThumbnailUrl,
}: MediaCardProps) {
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [thumbnailDeleteConfirm, setThumbnailDeleteConfirm] = useState<
    string | null
  >(null);

  const handleEdit = (mediaId: string, newCaption: string) => {
    onEdit(mediaId, newCaption);
    setEditingMedia(null);
    setEditCaption('');
  };

  return (
    <div className='bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-3'>
      <div className='flex gap-3'>
        {/* Media Preview */}
        <div className='relative flex-shrink-0'>
          <div className='relative aspect-square bg-gray-800 rounded-lg overflow-hidden w-20 h-20'>
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.caption || 'Media'}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='relative w-full h-full'>
                <img
                  src={getVideoThumbnailUrl(item)}
                  alt={item.caption || 'Video thumbnail'}
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M8 5v14l11-7z' />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onPreview(item)}
            className='absolute top-1 right-1 p-1 bg-black/50 rounded text-white hover:bg-black/70 transition-colors'
          >
            <svg
              className='w-3 h-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
          </button>
        </div>

        {/* Media Details */}
        <div className='flex-1 min-w-0'>
          {/* Caption */}
          <div className='mb-2'>
            {editingMedia?._id === item._id ? (
              <div className='flex gap-1'>
                <input
                  type='text'
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className='flex-1 px-2 py-1 text-xs bg-gray-800/50 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500'
                  placeholder='Enter caption...'
                />
                <button
                  onClick={() => handleEdit(item._id, editCaption)}
                  className='px-2 py-1 text-xs bg-white text-black rounded font-medium hover:bg-gray-100 transition-colors'
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingMedia(null);
                    setEditCaption('');
                  }}
                  className='px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded font-medium hover:bg-gray-600 transition-colors'
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className='flex items-start gap-1'>
                <p className='text-gray-300 text-xs line-clamp-2 flex-1'>
                  {item.caption || ''}
                </p>
                <button
                  onClick={() => {
                    setEditingMedia(item);
                    setEditCaption(item.caption || '');
                  }}
                  className='text-gray-400 hover:text-white transition-colors flex-shrink-0'
                >
                  <svg
                    className='w-3 h-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Type Chip */}
          <div className='mb-2'>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                item.type === 'image'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {item.type === 'image' ? 'Image' : 'Video'}
            </span>
          </div>

          {/* Created Date */}
          <div className='text-xs text-gray-400'>
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex justify-between items-center gap-2 mt-3 pt-3 border-t border-gray-700'>
        {/* Video Thumbnail Management */}
        {item.type === 'video' && (
          <div className='border border-gray-600 rounded-lg p-2 relative'>
            <div className='absolute -top-2 left-2 px-1 bg-gray-900 text-xs text-gray-400'>
              Thumbnail
            </div>
            <div className='flex flex-wrap gap-1 pt-1'>
              {/* Upload Custom Thumbnail */}
              <button
                type='button'
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) onThumbnailUpload(item._id, file);
                  };
                  input.click();
                }}
                disabled={thumbnailUploading.has(item._id)}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                  thumbnailUploading.has(item._id)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {thumbnailUploading.has(item._id) ? 'Uploading...' : 'Upload'}
              </button>

              {/* Auto-Generate for YouTube/Vimeo */}
              {(item.uploadType === 'youtube' ||
                item.uploadType === 'vimeo') && (
                <button
                  onClick={() => onThumbnailGenerate(item._id)}
                  disabled={thumbnailGenerating.has(item._id)}
                  className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                    thumbnailGenerating.has(item._id)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {thumbnailGenerating.has(item._id)
                    ? 'Generating...'
                    : 'Generate'}
                </button>
              )}

              {/* Remove Custom Thumbnail */}
              {item.hasCustomThumbnail && (
                <button
                  onClick={() => setThumbnailDeleteConfirm(item._id)}
                  className='text-xs px-2 py-1 bg-white text-black rounded hover:bg-gray-100 transition-colors font-medium'
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty div for images to maintain layout */}
        {item.type === 'image' && <div></div>}

        {/* Delete Button */}
        <button
          onClick={() => setDeleteConfirm(item._id)}
          className='px-3 py-1 text-xs bg-red-200 text-red-800 rounded font-medium hover:bg-red-300 transition-colors'
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm === item._id && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-gray-900 rounded-lg p-6 max-w-sm mx-4'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Delete Media
            </h3>
            <p className='text-gray-300 mb-6'>
              Are you sure you want to delete this media? This action cannot be
              undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => onDelete(item._id)}
                className='flex-1 px-4 py-2 bg-red-200 text-red-800 rounded font-medium hover:bg-red-300 transition-colors'
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className='flex-1 px-4 py-2 bg-white text-black rounded font-medium hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Delete Confirmation Modal */}
      {thumbnailDeleteConfirm === item._id && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-gray-900 rounded-lg p-6 max-w-sm mx-4'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Remove Thumbnail
            </h3>
            <p className='text-gray-300 mb-6'>
              Are you sure you want to remove the custom thumbnail? The video
              will use the default thumbnail.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  onThumbnailDelete(item._id);
                  setThumbnailDeleteConfirm(null);
                }}
                className='flex-1 px-4 py-2 bg-red-200 text-red-800 rounded font-medium hover:bg-red-300 transition-colors'
              >
                Remove
              </button>
              <button
                onClick={() => setThumbnailDeleteConfirm(null)}
                className='flex-1 px-4 py-2 bg-white text-black rounded font-medium hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
