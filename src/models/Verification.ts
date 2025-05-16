import { Schema, model, Document, Types } from "mongoose";

interface IVerification extends Document {
  userId: Types.ObjectId;
  code: string;
  type: string;
  expiredAt: Date;
  used: boolean;
}

const verificationSchema = new Schema<IVerification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true },
  type: { type: String, required: true },
  expiredAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

const Verification = model<IVerification>("Verification", verificationSchema);

export default Verification;
