import mongoose, { Document, Schema, Model } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  createdAt: Date;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;