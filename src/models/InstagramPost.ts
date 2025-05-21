import { Schema, model, Document, Types } from "mongoose";

export interface IInstagramPost extends Document {
  post_id: string;
  ig_id: string;
  media_ids: string[]; // array media_id
  caption?: string;
  timestamp: Date;
  user_id: Types.ObjectId | string;
  created_at: Date;
  updated_at: Date;
}

const InstagramPostSchema = new Schema<IInstagramPost>({
  post_id: { type: String, required: true, unique: true },
  ig_id: { type: String, required: true },
  media_ids: [{ type: String }],
  caption: { type: String },
  timestamp: { type: Date, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const InstagramPost = model<IInstagramPost>(
  "InstagramPost",
  InstagramPostSchema
);

export default InstagramPost;
