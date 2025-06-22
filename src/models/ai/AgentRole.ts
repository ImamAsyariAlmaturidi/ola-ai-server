import mongoose, { Document, Schema, model, Types } from "mongoose";

export interface IAgentRole extends Document {
  agentId: Types.ObjectId;
  name: string;
  personality: string;
  basePrompt: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AgentRoleSchema = new Schema<IAgentRole>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    name: { type: String, required: true },
    personality: { type: String, required: true },
    basePrompt: { type: String, required: true },
  },
  { timestamps: true }
);

const AgentRole = model<IAgentRole>("AgentRole", AgentRoleSchema);
export default AgentRole;
