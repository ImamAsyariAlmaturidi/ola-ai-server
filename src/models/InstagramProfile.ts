import { Schema, model, Document, Types } from "mongoose";

export interface IInstagramProfile extends Document {
  ig_id: string; // Instagram Business Account ID (unique)
  username: string;
  full_name: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  biography?: string;
  website?: string;
  is_verified: boolean;
  user_id: Types.ObjectId | string; // Internal user reference
  created_at: Date;
  updated_at: Date;
}

const InstagramProfileSchema = new Schema<IInstagramProfile>({
  ig_id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  full_name: { type: String, required: true },
  profile_picture_url: { type: String },
  followers_count: { type: Number, default: 0 },
  follows_count: { type: Number, default: 0 },
  biography: { type: String },
  website: { type: String },
  is_verified: { type: Boolean, default: false },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const InstagramProfile = model<IInstagramProfile>(
  "InstagramProfile",
  InstagramProfileSchema
);

export default InstagramProfile;
