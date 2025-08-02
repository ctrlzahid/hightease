import { Schema, model, models, Document, Types } from 'mongoose';

interface IAccessLog extends Document {
  passwordId: Types.ObjectId;
  creatorId: Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  usedAt: Date;
}

const accessLogSchema = new Schema<IAccessLog>({
  passwordId: {
    type: Schema.Types.ObjectId,
    ref: 'Password',
    required: [true, 'Password ID is required'],
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'Creator',
    required: [true, 'Creator ID is required'],
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
  },
  usedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
accessLogSchema.index({ passwordId: 1 });
accessLogSchema.index({ creatorId: 1 });
accessLogSchema.index({ usedAt: 1 });

export const AccessLog =
  models.AccessLog || model<IAccessLog>('AccessLog', accessLogSchema);
