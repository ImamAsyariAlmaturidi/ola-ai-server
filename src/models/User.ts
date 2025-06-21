import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  businessName?: string;
  phoneNumber?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    businessName: { type: String },
    phoneNumber: { type: String },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optional: hash password sebelum save
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const bcrypt = await import("bcryptjs");
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Optional: hilangkan password di response JSON
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = model<IUser>("User", UserSchema);

export default User;
