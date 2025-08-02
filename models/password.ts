import { Schema, model, models, Document, Types } from 'mongoose';

interface IPassword extends Document {
  creatorId: Types.ObjectId;
  hashedPassword: string;
  type: 'single-use' | 'multi-use';
  expiresAt?: Date;
  maxUsages?: number;
  usageCount: number;
  createdAt: Date;
  isValid(): boolean;
}

const passwordSchema = new Schema<IPassword>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      required: [true, 'Creator ID is required'],
    },
    hashedPassword: {
      type: String,
      required: [true, 'Hashed password is required'],
    },
    type: {
      type: String,
      enum: ['single-use', 'multi-use'],
      required: [true, 'Password type is required'],
    },
    expiresAt: {
      type: Date,
    },
    maxUsages: {
      type: Number,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if password is still valid
passwordSchema.methods.isValid = function (): boolean {
  // Check expiration
  if (this.expiresAt && new Date() > this.expiresAt) {
    return false;
  }

  // Check usage count for single-use passwords
  if (this.type === 'single-use' && this.usageCount > 0) {
    return false;
  }

  // Check max usages for multi-use passwords
  if (this.maxUsages && this.usageCount >= this.maxUsages) {
    return false;
  }

  return true;
};

// Create indexes
passwordSchema.index({ creatorId: 1 });
passwordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Password =
  models.Password || model<IPassword>('Password', passwordSchema);
