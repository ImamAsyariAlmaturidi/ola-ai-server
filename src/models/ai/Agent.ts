import { Schema, model, Document, Types } from "mongoose";

export interface IAgentSettings {
  model?: string;
  aiHistoryLimit?: number;
  aiContextLimit?: number;
  aiMessageLimit?: number;
  delayMessageTime?: number;
  timezone?: string;
}

export interface IAgent extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  welcomeMessage?: string;
  transferConditions?: string;
  stopAfterHandoff?: boolean;
  labels?: string[];
  settings?: IAgentSettings;
  lastTrainedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    welcomeMessage: { type: String },
    transferConditions: { type: String },
    stopAfterHandoff: { type: Boolean, default: false },
    labels: { type: [String], default: [] },
    settings: {
      model: { type: String },
      aiHistoryLimit: { type: Number },
      aiContextLimit: { type: Number },
      aiMessageLimit: { type: Number },
      delayMessageTime: { type: Number },
      timezone: { type: String },
    },
    lastTrainedAt: { type: Date },
  },
  { timestamps: true }
);

const Agent = model<IAgent>("Agent", AgentSchema);

export default Agent;
