import { Types } from "mongoose";

// Base comment (termasuk untuk top-level & replies)
export interface InstagramComment {
  _id: string | Types.ObjectId;
  comment_id: string;
  media_id: string;
  text: string;
  username: string;
  user_id?: string;
  timestamp: Date;
  user_id_internal: string | Types.ObjectId;
  parent_comment_id: string | null;
  created_at: Date;
  updated_at: Date;

  // Tambahan virtual property (Dicebear avatar URL)
  avatar_seed?: string;
  avatar_bg_color?: string;
  avatar_url?: string; // <-- Ini virtual property
}

// Reply group hasil aggregate
export interface ReplyGroup {
  _id: string; // parent_comment_id
  replies: InstagramComment[];
}

// Untuk mapping reply
export type ReplyMap = Record<string, InstagramComment[]>;

// Comment yang sudah digabung dengan replies-nya
export interface InstagramCommentWithReplies extends InstagramComment {
  replies: InstagramComment[];
}
