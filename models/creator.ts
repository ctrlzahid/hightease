import { Schema, model, models, Document } from 'mongoose';

interface ICreator extends Document {
  name: string;
  slug: string;
  bio: string;
  avatar?: string;
  avatarPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const creatorSchema = new Schema<ICreator>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      trim: true,
    },
    avatarPublicId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
creatorSchema.index({ slug: 1 });

export const Creator =
  models.Creator || model<ICreator>('Creator', creatorSchema);
