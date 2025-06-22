import { Schema, model, Document, Types } from "mongoose";

export interface IFollowup extends Document {
  agentId: Types.ObjectId;
  message: string;
  delayInMinutes?: number;
  imageUrl?: string;
  handoffCondition?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FollowupSchema = new Schema<IFollowup>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    message: { type: String, required: true },
    delayInMinutes: { type: Number },
    imageUrl: { type: String },
    handoffCondition: { type: String },
  },
  { timestamps: true }
);

const Followup = model<IFollowup>("Followup", FollowupSchema);

export default Followup;
