'use client';

import { useState } from 'react';

interface MediaUploadFormProps {
  uploadMode: 'files' | 'urls';
  isUploading: boolean;
  videoUrls: string[];
  videoCaptions: string[];
  onFileUpload: (e: React.FormEvent) => void;
  onVideoUrlSubmit: (e: React.FormEvent) => void;
  onVideoUrlsChange: (urls: string[]) => void;
  onVideoCaptionsChange: (captions: string[]) => void;
  onAddVideoUrl: () => void;
  onRemoveVideoUrl: (index: number) => void;
}

export default function MediaUploadForm({
  uploadMode,
  isUploading,
  videoUrls,
  videoCaptions,
  onFileUpload,
  onVideoUrlSubmit,
  onVideoUrlsChange,
  onVideoCaptionsChange,
  onAddVideoUrl,
  onRemoveVideoUrl,
}: MediaUploadFormProps) {
  return (
    <div className='bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-4 mb-6'>
      {uploadMode === 'files' ? (
        <form onSubmit={onFileUpload} className='space-y-3'>
          <h3 className='text-base font-semibold text-white mb-3'>
            Upload Media Files
          </h3>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Select Photos/Videos
            </label>
            <input
              type='file'
              name='files'
              multiple
              accept='image/*,video/*'
              className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-white file:text-black file:font-medium hover:file:bg-gray-100 transition-colors text-sm'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Captions (one per line)
            </label>
            <textarea
              name='captions'
              rows={2}
              placeholder='Enter captions for each file (optional)'
              className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm'
            />
          </div>
          <button
            type='submit'
            disabled={isUploading}
            className='w-full sm:w-auto px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </form>
      ) : (
        <form onSubmit={onVideoUrlSubmit} className='space-y-3'>
          <h3 className='text-base font-semibold text-white mb-3'>
            Add Videos from URLs
          </h3>
          <p className='text-gray-400 text-xs mb-3'>
            Supports YouTube, Vimeo, and direct video URLs
          </p>

          {videoUrls.map((url, index) => (
            <div
              key={index}
              className='border border-gray-700 rounded-lg p-3 space-y-2'
            >
              <div className='flex items-center gap-2'>
                <h4 className='text-white font-medium text-sm'>
                  Video URL {index + 1}
                </h4>
                {videoUrls.length > 1 && (
                  <button
                    type='button'
                    onClick={() => onRemoveVideoUrl(index)}
                    className='text-red-400 hover:text-red-300 text-xs'
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type='url'
                value={url}
                onChange={(e) => {
                  const newUrls = [...videoUrls];
                  newUrls[index] = e.target.value;
                  onVideoUrlsChange(newUrls);
                }}
                placeholder='https://youtube.com/watch?v=... or https://vimeo.com/...'
                className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                required
              />
              <input
                type='text'
                value={videoCaptions[index]}
                onChange={(e) => {
                  const newCaptions = [...videoCaptions];
                  newCaptions[index] = e.target.value;
                  onVideoCaptionsChange(newCaptions);
                }}
                placeholder='Caption (optional)'
                className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
              />
            </div>
          ))}

          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={onAddVideoUrl}
              className='px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm'
            >
              + Add Another Video
            </button>
            <button
              type='submit'
              disabled={isUploading}
              className='px-4 py-1 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
            >
              {isUploading ? 'Adding Videos...' : 'Add Videos'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
