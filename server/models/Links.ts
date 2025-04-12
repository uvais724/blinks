import mongoose, { Document, Schema, Model } from 'mongoose';

interface ILink extends Document {
  url: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  title: string;
  description: string;
  thumbnail: string;
  domain: string;
  contentType: 'video' | 'post' | 'reel' | 'tweet';
  likes: number;
  saves: number;
  //tags: string[];
}

const LinkSchema: Schema = new Schema({
  url: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  domain: { type: String, required: true },
  contentType: { type: String, enum: ['video', 'post', 'reel', 'tweet'], default: 'post' },
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  //tags: [{ type: String }],
});

const Link: Model<ILink> = mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);
export default Link;