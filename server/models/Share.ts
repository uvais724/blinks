import mongoose, { Schema, Document } from 'mongoose';

interface IShare extends Document {
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'link' | 'collection';
}

const ShareSchema = new Schema<IShare>({
  itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'type' },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  type: { type: String, enum: ['link', 'collection'], required: true },
});

const Share = mongoose.models.Share || mongoose.model<IShare>('Share', ShareSchema);
export default Share;