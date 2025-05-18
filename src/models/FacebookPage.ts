import { Schema, model, Types, Document } from "mongoose";

interface IFacebookPage extends Document {
  fb_user_id: string;
  page_id: string;
  page_name: string;
  page_token: string;
  ig_id: string | null;
  user_id: Types.ObjectId;
  is_selected: boolean;
  created_at: Date;
  updated_at: Date;
}

const facebookPageSchema = new Schema<IFacebookPage>({
  fb_user_id: { type: String, required: true },
  page_id: { type: String, required: true, unique: true },
  page_name: { type: String, required: true },
  page_token: { type: String, required: true },
  ig_id: { type: String, default: null },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  is_selected: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

facebookPageSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const FacebookPage = model<IFacebookPage>("FacebookPage", facebookPageSchema);

export default FacebookPage;
