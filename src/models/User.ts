import { Schema, model, Document, Types } from "mongoose";

interface IUser extends Document {
  email: string;
  verified: boolean;
  facebook_pages: Types.ObjectId[] | null;
  facebookAccessToken?: string | null;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  facebookAccessToken: { type: String, default: null },
});

const User = model<IUser>("User", userSchema);

export default User;
