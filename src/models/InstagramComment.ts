import { Schema, model, Document, Types } from "mongoose";

export interface IInstagramComment extends Document {
  comment_id: string; // ID comment dari IG API
  media_id: string;
  text: string;
  username: string;
  user_id?: string; // IG username atau user ID commenter (optional)
  timestamp: Date;
  user_id_internal: Types.ObjectId | string; // user internal yang punya data
  created_at: Date;
  updated_at: Date;
}

const InstagramCommentSchema = new Schema<IInstagramComment>({
  comment_id: { type: String, required: true, unique: true },
  media_id: { type: String, required: true, index: true },
  text: { type: String, required: true },
  username: { type: String, required: true },
  user_id: { type: String },
  timestamp: { type: Date, required: true },
  user_id_internal: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const InstagramComment = model<IInstagramComment>(
  "InstagramComment",
  InstagramCommentSchema
);

export default InstagramComment;
