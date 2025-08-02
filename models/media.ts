import { Schema, model, models, Document, Types } from 'mongoose';

interface IMedia extends Document {
  creatorId: Types.ObjectId;
  type: 'image' | 'video';
  url: string;
  publicId?: string;
  thumbnail?: string;
  customThumbnail?: string; // Custom uploaded thumbnail URL
  customThumbnailPublicId?: string; // Cloudinary public ID for custom thumbnail
  hasCustomThumbnail: boolean; // Flag to indicate custom thumbnail exists
  caption?: string;
  uploadType: 'cloudinary' | 'youtube' | 'vimeo' | 'external';
  externalId?: string; // For YouTube video ID, Vimeo ID, etc.
  createdAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      required: [true, 'Creator ID is required'],
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: [true, 'Media type is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    publicId: {
      type: String,
      // Only required for cloudinary uploads
    },
    thumbnail: {
      type: String,
    },
    customThumbnail: {
      type: String,
    },
    customThumbnailPublicId: {
      type: String,
    },
    hasCustomThumbnail: {
      type: Boolean,
      default: false,
    },
    caption: {
      type: String,
      trim: true,
    },
    uploadType: {
      type: String,
      enum: ['cloudinary', 'youtube', 'vimeo', 'external'],
      required: [true, 'Upload type is required'],
      default: 'cloudinary',
    },
    externalId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
mediaSchema.index({ creatorId: 1, type: 1 });
mediaSchema.index({ publicId: 1 });

export const Media = models.Media || model<IMedia>('Media', mediaSchema);
