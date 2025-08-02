import { v2 as cloudinary } from 'cloudinary';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  file: string,
  options?: { transformation?: Record<string, any>[]; folder?: string }
): Promise<{ url: string; publicId: string }> => {
  try {
    const uploadOptions: Record<string, any> = {
      resource_type: 'image',
      folder: options?.folder || 'creator-content/images',
    };

    if (options?.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

export const uploadVideo = async (
  file: string
): Promise<{ url: string; publicId: string; thumbnail: string }> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'video',
      folder: 'creator-content/videos',
      eager: [
        { width: 300, height: 300, crop: 'pad', audio_codec: 'none' },
        {
          width: 160,
          height: 100,
          crop: 'crop',
          gravity: 'south',
          audio_codec: 'none',
        },
      ],
      eager_async: true,
      eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnail: result.thumbnail_url || '',
    };
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};

export const deleteMedia = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting media from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;
