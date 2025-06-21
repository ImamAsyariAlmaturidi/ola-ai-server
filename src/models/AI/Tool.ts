import { Schema, model, Document, Types } from "mongoose";

export interface IConfig {
  [key: string]: any; // bisa lo ubah sesuai struktur config spesifik kalau udah fix
}

export interface IAITool extends Document {
  agentId: Types.ObjectId;
  name: string;
  description?: string;
  config?: IConfig;
  createdAt: Date;
  updatedAt: Date;
}

const AIToolSchema = new Schema<IAITool>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    name: { type: String, required: true },
    description: { type: String },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const AITool = model<IAITool>("AITool", AIToolSchema);

export default AITool;
