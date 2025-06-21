import { Schema, model, Document, Types } from "mongoose";

export interface IMemory extends Document {
  agentId: Types.ObjectId;
  userId?: Types.ObjectId;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

const Memory = model<IMemory>("Memory", MemorySchema);

export default Memory;
