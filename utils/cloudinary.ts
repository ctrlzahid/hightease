/**
 * Generate optimized Cloudinary URLs for different use cases
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'crop';
  quality?: 'auto' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}

/**
 * Generate a Cloudinary transformation URL
 */
export function getCloudinaryUrl(
  originalUrl: string,
  options: CloudinaryTransformOptions = {}
): string {
  // If it's not a Cloudinary URL, return the original
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  // Extract the base URL and public ID
  const urlParts = originalUrl.split('/');
  const uploadIndex = urlParts.findIndex((part) => part === 'upload');

  if (uploadIndex === -1) {
    return originalUrl;
  }

  // Build transformation string
  const transformations: string[] = [];

  if (options.width || options.height) {
    const size = [];
    if (options.width) size.push(`w_${options.width}`);
    if (options.height) size.push(`h_${options.height}`);
    if (options.crop) size.push(`c_${options.crop}`);
    if (options.gravity) size.push(`g_${options.gravity}`);
    transformations.push(size.join(','));
  }

  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  // Insert transformations into URL
  const transformationString = transformations.join('/');
  urlParts.splice(uploadIndex + 1, 0, transformationString);

  return urlParts.join('/');
}

/**
 * Generate thumbnail URL for gallery display
 */
export function getThumbnailUrl(
  originalUrl: string,
  size: 'small' | 'medium' | 'large' = 'medium',
  preserveAspectRatio: boolean = false
): string {
  const sizes = {
    small: { width: 300, height: 200 },
    medium: { width: 640, height: 360 },
    large: { width: 1280, height: 720 },
  };

  const options: CloudinaryTransformOptions = preserveAspectRatio
    ? {
        width: sizes[size].width,
        crop: 'scale',
        quality: 'auto:good',
        format: 'auto',
      }
    : {
        ...sizes[size],
        crop: 'fill',
        quality: 'auto:good',
        format: 'auto',
      };

  return getCloudinaryUrl(originalUrl, options);
}

/**
 * Generate optimized image URL for different contexts
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  context: 'thumbnail' | 'preview' | 'full' | 'avatar' = 'preview'
): string {
  const presets: Record<string, CloudinaryTransformOptions> = {
    // Thumbnail: Fixed aspect ratio for consistent grid layout
    thumbnail: { width: 300, height: 200, crop: 'fill', quality: 'auto:good' },
    // Preview: Preserve aspect ratio, limit width for performance
    preview: { width: 640, crop: 'scale', quality: 'auto:good' },
    // Full: Preserve aspect ratio, limit width for performance
    full: { width: 1920, crop: 'scale', quality: 'auto:best' },
    // Avatar: Fixed aspect ratio for consistent circular/square display
    avatar: {
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:good',
    },
  };

  return getCloudinaryUrl(originalUrl, presets[context]);
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(originalUrl: string) {
  return {
    sm: getCloudinaryUrl(originalUrl, {
      width: 640,
      crop: 'scale',
      quality: 'auto:good',
    }),
    md: getCloudinaryUrl(originalUrl, {
      width: 1280,
      crop: 'scale',
      quality: 'auto:good',
    }),
    lg: getCloudinaryUrl(originalUrl, {
      width: 1920,
      crop: 'scale',
      quality: 'auto:best',
    }),
  };
}
