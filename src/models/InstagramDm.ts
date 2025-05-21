import { Schema, model, Document, Types } from "mongoose";

export interface IInstagramDM extends Document {
  dm_id: string; // unique message id dari IG atau custom id
  sender_id: string; // IG user id pengirim
  receiver_id: string; // IG user id penerima
  message: string;
  timestamp: Date;
  read: boolean;
  user_id_internal: Types.ObjectId | string; // user internal pemilik akun
  created_at: Date;
  updated_at: Date;
}

const InstagramDMSchema = new Schema<IInstagramDM>({
  dm_id: { type: String, required: true, unique: true },
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true },
  read: { type: Boolean, default: false },
  user_id_internal: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const InstagramDM = model<IInstagramDM>("InstagramDM", InstagramDMSchema);

export default InstagramDM;
