import mongoose, { Document, Schema, Model } from 'mongoose';

interface ICollection extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  isPrivate: boolean;
  links: mongoose.Types.ObjectId[];
  coverImage: string;
}

const CollectionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPrivate: { type: Boolean, default: false },
  links: [{ type: Schema.Types.ObjectId, ref: 'Link' }],
  coverImage: { type: String, default: '' },
});

const Collection: Model<ICollection> = mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);
export default Collection;