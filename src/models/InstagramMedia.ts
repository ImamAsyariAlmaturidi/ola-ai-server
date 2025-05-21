import { Schema, model, Document, Types } from "mongoose";

export interface IInstagramMedia extends Document {
  media_id: string; // ID media dari Instagram Graph API
  ig_id: string; // Instagram Business Account ID
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  caption?: string;
  timestamp: Date;
  comments_count: number;
  like_count: number;
  permalink: string;
  user_id: Types.ObjectId | string;
  created_at: Date;
  updated_at: Date;
}

const InstagramMediaSchema = new Schema<IInstagramMedia>({
  media_id: { type: String, required: true, unique: true },
  ig_id: { type: String, required: true },
  media_type: {
    type: String,
    enum: ["IMAGE", "VIDEO", "CAROUSEL_ALBUM"],
    required: true,
  },
  media_url: { type: String, required: true },
  caption: { type: String },
  timestamp: { type: Date, required: true },
  comments_count: { type: Number, default: 0 },
  like_count: { type: Number, default: 0 },
  permalink: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const InstagramMedia = model<IInstagramMedia>(
  "InstagramMedia",
  InstagramMediaSchema
);

export default InstagramMedia;
