import { Schema, model, Document, Types } from "mongoose";

const USER_SEEDS = [
  "Aiden",
  "George",
  "Alexander",
  "Aidan",
  "Emery",
  "Eliza",
  "Jack",
  "Jameson",
  "Jessica",
  "Jade",
  "Adrian",
  "Jocelyn",
  "Katherine",
  "Kimberly",
  "Jude",
  "Kingston",
  "Liam",
  "Leah",
  "Andrea",
  "Amaya",
];

const USER_EXTERNAL_BG_COLORS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc"];
const INTERNAL_USER_SEED = "felix";
const INTERNAL_BG_COLOR = "ffdfbf";

export interface IInstagramComment extends Document {
  comment_id: string;
  media_id: string;
  text: string;
  username: string;
  user_id?: string;
  timestamp: Date;
  user_id_internal: Types.ObjectId | string;
  parent_comment_id?: string | null;
  created_at: Date;
  updated_at: Date;

  // Simpan ini biar bisa generate avatar_url
  avatar_seed?: string;
  avatar_bg_color?: string;
}

const InstagramCommentSchema = new Schema<IInstagramComment>({
  comment_id: { type: String, required: true, unique: true },
  media_id: { type: String, required: true, index: true },
  text: { type: String, required: true },
  username: { type: String, required: true },
  user_id: { type: String, required: true },
  timestamp: { type: Date, required: true },
  user_id_internal: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parent_comment_id: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  avatar_seed: { type: String },
  avatar_bg_color: { type: String },
});

const InstagramComment = model<IInstagramComment>(
  "InstagramComment",
  InstagramCommentSchema
);

export default InstagramComment;
