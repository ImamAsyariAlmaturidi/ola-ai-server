import { Schema, model, Document, Types } from "mongoose";

export interface IPromptTemplate extends Document {
  agentId: Types.ObjectId;
  name: string;
  prompt: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromptTemplateSchema = new Schema<IPromptTemplate>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PromptTemplate = model<IPromptTemplate>(
  "PromptTemplate",
  PromptTemplateSchema
);

export default PromptTemplate;
