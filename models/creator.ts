import { Schema, model, models, Document } from 'mongoose';

interface ICreator extends Document {
  name: string;
  slug: string;
  bio: string;
  avatar?: string;
  avatarPublicId?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: string;
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
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age must be less than 120'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      lowercase: true,
    },
    location: {
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
