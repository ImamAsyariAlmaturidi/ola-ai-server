import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  verified: boolean;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
});

const User = model<IUser>("User", userSchema);

export default User;
